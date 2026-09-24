#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Playoff Mailer — servidor local.

Sirve la app en el navegador, guarda los envios en ~/.playoff-mailer/
y habla con la API de Brevo. La clave de Brevo se queda en este ordenador.
"""
import http.server
import json
import mimetypes
import os
import re
import socket
import base64
import hashlib
import hmac
import secrets
import socketserver
import ssl
import sys
import threading
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import uuid
import webbrowser

AQUI = os.path.dirname(os.path.abspath(__file__))
# En Render (y en cualquier hosting) mandan las variables de entorno; en el Mac, la carpeta del usuario.
EN_SERVIDOR = bool(os.environ.get('PORT'))
CASA = os.environ.get('PLAYOFF_MAILER_DATOS') or os.path.join(os.path.expanduser('~'), '.playoff-mailer')
BORRADORES = os.path.join(CASA, 'borradores')
CONFIG = os.path.join(CASA, 'config.json')
SALIDA = os.path.join(CASA, 'html')
WP = 'https://playoffinformatica.com/wp-json/wp/v2/media'
WP_BASE = 'https://playoffinformatica.com/wp-json/wp/v2'
PONENTES = os.path.join(AQUI, 'ponentes')
# Imagenes que se publican desde la propia app cuando esta en internet (Render):
# Brevo las copia a su biblioteca desde aqui. En Render la direccion llega sola.
PUBLICAS = os.path.join(CASA, 'publicas')
URL_PUBLICA = (os.environ.get('URL_PUBLICA') or os.environ.get('RENDER_EXTERNAL_URL') or '').rstrip('/')
# Lo unico que se sirve sin sesion: la app y las fotos de ponentes.
ESTATICOS = ('index.html', 'app.js', 'templates.js', 'templates-saas.js', 'plantillas.js')
MAX_SUBIDA = 8 * 1024 * 1024      # lo que aceptamos del disco
ANCHO_MAX = 1400                  # ancho al que reducimos antes de publicar
ANCHO_MAX_ALFA = 760              # las figuras recortadas no necesitan tanto
AVISO_PESO = 600 * 1024           # a partir de aqui recomprimimos
BREVO = 'https://api.brevo.com/v3'
PUERTO_BASE = 8787
DOMINIO = os.environ.get('DOMINIO_CORREO', 'playoffinformatica.com')
DIAS_SESION = 30
CODIGO_MINUTOS = 10
MAX_INTENTOS = 5
# rutas que se pueden tocar sin haber entrado
ABIERTAS = ('sesion', 'sesion/codigo', 'sesion/verificar', 'sesion/salir', 'brevo/estado')
_codigos = {}   # correo -> {'codigo', 'expira', 'intentos'}

for d in (CASA, BORRADORES, SALIDA, PUBLICAS):
    os.makedirs(d, exist_ok=True)


# ---------------------------------------------------------------- config
def leer_config():
    """Las variables de entorno mandan sobre el archivo: en el servidor la clave
    de Brevo y las credenciales de la web se ponen desde el panel, no desde la app."""
    datos = {}
    try:
        with open(CONFIG, 'r', encoding='utf-8') as f:
            datos = json.load(f)
    except Exception:
        datos = {}
    for clave, variable in (('brevo_key', 'BREVO_KEY'), ('wp_usuario', 'WP_USUARIO'),
                            ('wp_clave', 'WP_CLAVE')):
        if os.environ.get(variable):
            datos[clave] = os.environ[variable]
    if os.environ.get('BREVO_CUENTA'):
        datos['brevo_cuenta'] = os.environ['BREVO_CUENTA']
    return datos


def config_fijada(clave):
    """True si ese ajuste viene del entorno: la app no debe dejar cambiarlo."""
    return bool(os.environ.get({'brevo_key': 'BREVO_KEY', 'wp_usuario': 'WP_USUARIO',
                                'wp_clave': 'WP_CLAVE'}.get(clave, '')))


def escribir_config(cfg):
    tmp = CONFIG + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    os.replace(tmp, CONFIG)
    try:
        os.chmod(CONFIG, 0o600)
    except Exception:
        pass


# ---------------------------------------------------------------- http cliente
def pedir(url, metodo='GET', cabeceras=None, cuerpo=None, timeout=25):
    datos = None
    if cuerpo is not None:
        datos = json.dumps(cuerpo).encode('utf-8')
    req = urllib.request.Request(url, data=datos, method=metodo)
    req.add_header('Accept', 'application/json')
    req.add_header('User-Agent', 'PlayoffMailer/1.0')
    if datos is not None:
        req.add_header('Content-Type', 'application/json')
    for k, v in (cabeceras or {}).items():
        req.add_header(k, v)
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            texto = r.read().decode('utf-8', 'replace')
            return r.status, (json.loads(texto) if texto.strip() else {})
    except urllib.error.HTTPError as e:
        texto = e.read().decode('utf-8', 'replace')
        try:
            cuerpo_err = json.loads(texto)
        except Exception:
            cuerpo_err = {'message': texto[:400]}
        return e.code, cuerpo_err
    except urllib.error.URLError as e:
        raise RuntimeError('sin conexion con %s (%s)' % (urllib.parse.urlparse(url).netloc, e.reason))


def brevo(ruta, metodo='GET', cuerpo=None):
    cfg = leer_config()
    clave = cfg.get('brevo_key')
    if not clave:
        raise RuntimeError('todavia no has conectado la clave de Brevo')
    estado, datos = pedir(BREVO + ruta, metodo, {'api-key': clave}, cuerpo)
    if estado >= 400:
        msg = datos.get('message') or datos.get('error') or ('error %s' % estado)
        if isinstance(datos.get('message'), dict):
            msg = json.dumps(datos['message'], ensure_ascii=False)
        raise RuntimeError(traducir_brevo(msg, datos.get('code'), estado))
    return datos


def traducir_brevo(mensaje, codigo, estado):
    """Los errores de Brevo llegan en ingles y muy escuetos; que digan que hacer."""
    m = (mensaje or '').lower()
    donde = 'en el servidor (variable BREVO_KEY)' if EN_SERVIDOR else 'en Conexion con Brevo'
    if 'key not found' in m or codigo == 'unauthorized' or estado == 401:
        return ('Brevo no reconoce la clave configurada %s. Comprueba que es una '
                'clave de API (empieza por xkeysib-, no por xsmtpsib-), que esta '
                'entera y que sigue existiendo en Brevo.' % donde)
    if estado == 403:
        return ('Brevo acepta la clave pero no le deja hacer esto. Revisa los permisos '
                'de la clave en Ajustes -> SMTP y API.')
    if 'sender' in m and ('not valid' in m or 'not found' in m):
        return ('El remitente no esta verificado en Brevo. Verificalo en '
                'Ajustes -> Remitentes y vuelve a intentarlo.')
    if estado == 429:
        return 'Brevo esta limitando las peticiones. Espera un minuto y prueba otra vez.'
    return mensaje


# ---------------------------------------------------------------- sesion
def secreto():
    """Con que se firman las sesiones. En el servidor, variable de entorno;
    en local, una que se genera sola la primera vez. Cambiarla echa a todo el mundo."""
    de_entorno = os.environ.get('SECRETO_SESION')
    if de_entorno:
        return de_entorno.encode('utf-8')
    cfg = leer_config()
    if not cfg.get('secreto'):
        cfg['secreto'] = secrets.token_urlsafe(32)
        escribir_config(cfg)
    return cfg['secreto'].encode('utf-8')


def crear_token(correo):
    """Token firmado: no hace falta guardar nada, asi valen varias personas a la vez."""
    caduca = int(time.time()) + DIAS_SESION * 86400
    cuerpo = '%s|%d' % (correo, caduca)
    firma = hmac.new(secreto(), cuerpo.encode('utf-8'), hashlib.sha256).hexdigest()
    crudo = (cuerpo + '|' + firma).encode('utf-8')
    return base64.urlsafe_b64encode(crudo).decode('ascii')


def quien_es(token):
    """Devuelve el correo si el token esta bien firmado y no ha caducado."""
    if not token:
        return None
    try:
        crudo = base64.urlsafe_b64decode(token.encode('ascii')).decode('utf-8')
        correo, caduca, firma = crudo.rsplit('|', 2)
    except Exception:
        return None
    esperada = hmac.new(secreto(), ('%s|%s' % (correo, caduca)).encode('utf-8'),
                        hashlib.sha256).hexdigest()
    if not hmac.compare_digest(esperada, firma):
        return None
    try:
        if time.time() > float(caduca):
            return None
    except Exception:
        return None
    return correo


def correo_valido(correo):
    correo = (correo or '').strip().lower()
    if not re.fullmatch(r"[a-z0-9._%+-]+@" + re.escape(DOMINIO), correo):
        raise RuntimeError('tiene que ser un correo @%s' % DOMINIO)
    return correo


def remitente_para_codigos():
    """El primer remitente verificado de la cuenta de Brevo."""
    senders = brevo('/senders').get('senders') or []
    if not senders:
        raise RuntimeError('tu cuenta de Brevo no tiene ningun remitente verificado, '
                           'asi que no puedo enviarte el codigo')
    s0 = senders[0]
    return {'name': s0.get('name') or 'Playoff Mailer', 'email': s0.get('email')}


def enviar_codigo(correo, codigo):
    rem = remitente_para_codigos()
    html = (
        '<div style="font-family:Inter,Arial,Helvetica,sans-serif;background:#F1F1F1;padding:28px;">'
        '<table role="presentation" width="100%" style="max-width:460px;margin:0 auto;background:#fff;border-radius:18px;">'
        '<tr><td style="padding:32px 34px;">'
        '<p style="margin:0;font-size:10px;letter-spacing:.12em;text-transform:uppercase;'
        'font-weight:800;color:#006BED;">Playoff Mailer</p>'
        '<p style="margin:14px 0 0;font-size:24px;line-height:1.2;letter-spacing:-.8px;'
        'font-weight:700;color:#111827;">Tu codigo de acceso</p>'
        '<p style="margin:22px 0;font-size:34px;letter-spacing:8px;font-weight:800;color:#111827;">'
        + codigo + '</p>'
        '<p style="margin:0;font-size:12.5px;line-height:1.6;color:#737B8A;">Caduca en '
        + str(CODIGO_MINUTOS) + ' minutos. Si no has sido tu, ignora este correo.</p>'
        '</td></tr></table></div>')
    brevo('/smtp/email', 'POST', {
        'sender': rem,
        'to': [{'email': correo}],
        'subject': 'Codigo de acceso a Playoff Mailer: ' + codigo,
        'htmlContent': html,
    })


# ---------------------------------------------------------------- wordpress
def wp_cabeceras():
    """Basic auth con las credenciales que haya guardado la usuaria."""
    cfg = leer_config()
    usuario = cfg.get('wp_usuario')
    clave = cfg.get('wp_clave')
    if not usuario or not clave:
        raise RuntimeError('todavia no has configurado la subida de imagenes a la web')
    import base64 as _b64
    par = ('%s:%s' % (usuario, clave)).encode('utf-8')
    return {'Authorization': 'Basic ' + _b64.b64encode(par).decode('ascii')}


def pedir_binario(url, datos, cabeceras, timeout=60):
    req = urllib.request.Request(url, data=datos, method='POST')
    req.add_header('User-Agent', 'PlayoffMailer/1.0')
    for k, v in cabeceras.items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ssl.create_default_context()) as r:
            texto = r.read().decode('utf-8', 'replace')
            return r.status, (json.loads(texto) if texto.strip() else {})
    except urllib.error.HTTPError as e:
        texto = e.read().decode('utf-8', 'replace')
        try:
            cuerpo = json.loads(texto)
        except Exception:
            cuerpo = {'message': texto[:300]}
        return e.code, cuerpo
    except urllib.error.URLError as e:
        raise RuntimeError('sin conexion con la web (%s)' % e.reason)


def _pillow():
    try:
        from PIL import Image
        return Image
    except Exception:
        return None


def leer_proporcion(texto):
    """'4:3' -> 4/3. None si no viene o no se entiende."""
    m = re.fullmatch(r'\s*(\d{1,2})\s*[:x/]\s*(\d{1,2})\s*', str(texto or ''))
    if not m or not int(m.group(1)) or not int(m.group(2)):
        return None
    return int(m.group(1)) / float(int(m.group(2)))


def recortar_centro(im, proporcion):
    """Recorta desde el centro a esa proporcion (ancho/alto) sin deformar."""
    if not proporcion:
        return im
    ancho, alto = im.size
    if ancho / float(alto) > proporcion:
        nuevo = max(1, round(alto * proporcion))
        x = (ancho - nuevo) // 2
        return im.crop((x, 0, x + nuevo, alto))
    nuevo = max(1, round(ancho / proporcion))
    y = (alto - nuevo) // 2
    return im.crop((0, y, ancho, y + nuevo))


def optimizar(origen, proporcion=None):
    """Deja la imagen lista para correo y la reduce de ancho.
    JPG en general; PNG si tiene transparencia, para no perderla.
    Si llega una proporcion (4:3), la recorta antes desde el centro.
    Usa Pillow si esta (servidor) y si no sips, que viene con macOS."""
    base = slug(os.path.splitext(os.path.basename(origen))[0])
    Image = _pillow()
    if Image is not None:
        with Image.open(origen) as im:
            im = recortar_centro(im, proporcion)
            alfa = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
            ancho = ANCHO_MAX_ALFA if alfa else ANCHO_MAX
            if im.width > ancho:
                alto = max(1, round(im.height * ancho / im.width))
                im = im.resize((ancho, alto), Image.LANCZOS)
            destino = os.path.join(SALIDA, base + ('.png' if alfa else '.jpg'))
            if alfa:
                im.convert('RGBA').save(destino, 'PNG', optimize=True)
            else:
                im.convert('RGB').save(destino, 'JPEG', quality=82, optimize=True,
                                       progressive=True)
        with open(destino, 'rb') as f:
            return f.read(), os.path.basename(destino), ('image/png' if alfa else 'image/jpeg')

    # sin Pillow: macOS
    import subprocess
    alfa = False
    try:
        r = subprocess.run(['/usr/bin/sips', '-g', 'hasAlpha', origen],
                           capture_output=True, timeout=20, text=True)
        alfa = 'yes' in r.stdout
    except Exception:
        alfa = False
    formato = 'png' if alfa else 'jpeg'
    extension = 'png' if alfa else 'jpg'
    ancho = ANCHO_MAX_ALFA if alfa else ANCHO_MAX
    destino = os.path.join(SALIDA, base + '.' + extension)
    try:
        if proporcion:
            r = subprocess.run(['/usr/bin/sips', '-g', 'pixelWidth', '-g', 'pixelHeight', origen],
                               capture_output=True, timeout=20, text=True)
            w = int(re.search(r'pixelWidth: (\d+)', r.stdout).group(1))
            h = int(re.search(r'pixelHeight: (\d+)', r.stdout).group(1))
            if w / float(h) > proporcion:
                w = max(1, round(h * proporcion))
            else:
                h = max(1, round(w / proporcion))
            subprocess.run(['/usr/bin/sips', '-c', str(h), str(w), origen],
                           check=True, capture_output=True, timeout=60)
        subprocess.run(['/usr/bin/sips', '-s', 'format', formato, '-Z', str(ancho),
                        origen, '--out', destino],
                       check=True, capture_output=True, timeout=60)
    except Exception:
        with open(origen, 'rb') as f:
            datos = f.read()
        ext = os.path.splitext(origen)[1].lower().lstrip('.') or 'jpg'
        tipo = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
                'gif': 'image/gif', 'webp': 'image/webp'}.get(ext, 'image/jpeg')
        return datos, base + '.' + ext, tipo
    with open(destino, 'rb') as f:
        return f.read(), os.path.basename(destino), ('image/png' if alfa else 'image/jpeg')


def subir_a_wp(datos, nombre, tipo):
    cab = wp_cabeceras()
    cab['Content-Type'] = tipo
    cab['Content-Disposition'] = 'attachment; filename="%s"' % nombre
    cab['Accept'] = 'application/json'
    estado, cuerpo = pedir_binario(WP, datos, cab)
    if estado >= 400:
        raise RuntimeError(cuerpo.get('message') or ('la web ha respondido %s' % estado))
    url_publica = cuerpo.get('source_url')
    if not url_publica:
        raise RuntimeError('la web no ha devuelto la direccion de la imagen')
    return url_publica


def subir_a_brevo(datos, nombre):
    """Publica la imagen en esta misma app y le pide a Brevo que la copie a su
    biblioteca (img.mailinblue.com), que es donde se queda para siempre."""
    base, ext = os.path.splitext(nombre)
    final = '%s-%s%s' % (slug(base)[:40] or 'imagen', uuid.uuid4().hex[:10], ext.lower() or '.jpg')
    with open(os.path.join(PUBLICAS, final), 'wb') as f:
        f.write(datos)
    temporal = URL_PUBLICA + '/img/' + urllib.parse.quote(final)
    r = brevo('/emailCampaigns/images', 'POST', {'imageUrl': temporal, 'name': final})
    url_brevo = (r or {}).get('url') or (r or {}).get('imageUrl')
    if not url_brevo:
        raise RuntimeError('Brevo no ha devuelto la direccion de la imagen')
    return url_brevo


def subir_imagen(datos, nombre, tipo):
    """A la web de Playoff si hay credenciales de WordPress; si no y la app esta en
    internet, a la biblioteca de Brevo con la clave que ya tiene."""
    cfg = leer_config()
    if cfg.get('wp_usuario') and cfg.get('wp_clave'):
        return subir_a_wp(datos, nombre, tipo)
    if URL_PUBLICA and cfg.get('brevo_key'):
        return subir_a_brevo(datos, nombre)
    raise RuntimeError('todavia no has configurado la subida de imagenes a la web')


# ---------------------------------------------------------------- almacen de envios
# En el servidor el disco se borra en cada reinicio, asi que los envios viven en
# WordPress, en un tipo de contenido privado (pm_envio). Si no esta disponible,
# se usa el disco y la app avisa de que puede perderlos.
TIPO_WP = 'pm_envio'
_wp_disponible = None


def wp_almacen_listo():
    """Mira una vez si el tipo de contenido existe y podemos escribir en el."""
    global _wp_disponible
    if _wp_disponible is not None:
        return _wp_disponible
    try:
        cab = wp_cabeceras()
    except Exception:
        _wp_disponible = False
        return False
    try:
        estado, _ = pedir(WP_BASE + '/' + TIPO_WP + '?per_page=1&context=edit', 'GET', cab)
        _wp_disponible = (estado < 400)
    except Exception:
        _wp_disponible = False
    return _wp_disponible


def wp_listar():
    cab = wp_cabeceras()
    estado, datos = pedir(WP_BASE + '/' + TIPO_WP +
                          '?per_page=60&status=private&context=edit&orderby=modified&order=desc', 'GET', cab)
    if estado >= 400 or not isinstance(datos, list):
        raise RuntimeError('no he podido leer los envios guardados')
    salida = []
    for p in datos:
        try:
            doc = json.loads((p.get('content') or {}).get('raw') or '{}')
        except Exception:
            doc = {}
        salida.append({'id': 'wp-%s' % p.get('id'),
                       'nombre': doc.get('nombre') or (p.get('title') or {}).get('raw') or '',
                       'plantillaId': doc.get('plantillaId'),
                       'guardado': doc.get('guardado') or (p.get('modified') or ''),
                       'autor': doc.get('autor') or '',
                       'editado_por': doc.get('editado_por') or ''})
    return salida


def wp_leer(bid):
    cab = wp_cabeceras()
    estado, p = pedir(WP_BASE + '/' + TIPO_WP + '/' + bid[3:] + '?context=edit', 'GET', cab)
    if estado >= 400:
        raise RuntimeError('ese envio ya no esta')
    doc = json.loads((p.get('content') or {}).get('raw') or '{}')
    doc['id'] = bid
    return doc


def wp_guardar(bid, doc):
    cab = wp_cabeceras()
    cuerpo = {'title': doc.get('nombre') or 'Envio', 'status': 'private',
              'content': json.dumps(doc, ensure_ascii=False)}
    if bid and bid.startswith('wp-'):
        estado, p = pedir(WP_BASE + '/' + TIPO_WP + '/' + bid[3:], 'POST', cab, cuerpo)
    else:
        estado, p = pedir(WP_BASE + '/' + TIPO_WP, 'POST', cab, cuerpo)
    if estado >= 400:
        raise RuntimeError((p or {}).get('message') or 'no he podido guardar el envio')
    return 'wp-%s' % p.get('id')


def wp_borrar(bid):
    cab = wp_cabeceras()
    pedir(WP_BASE + '/' + TIPO_WP + '/' + bid[3:] + '?force=true', 'DELETE', cab)
    return True


# ---------------------------------------------------------------- borradores
def slug(texto):
    t = unicodedata.normalize('NFKD', texto or '').encode('ascii', 'ignore').decode()
    t = re.sub(r'[^a-zA-Z0-9]+', '-', t).strip('-').lower()
    return t[:60] or 'envio'


def ruta_borrador(bid):
    if not re.fullmatch(r'[a-zA-Z0-9\-]{1,80}', bid or ''):
        raise RuntimeError('identificador no valido')
    return os.path.join(BORRADORES, bid + '.json')


def listar_borradores():
    out = []
    for nombre in os.listdir(BORRADORES):
        if not nombre.endswith('.json'):
            continue
        try:
            with open(os.path.join(BORRADORES, nombre), 'r', encoding='utf-8') as f:
                d = json.load(f)
            out.append({'id': d.get('id'), 'nombre': d.get('nombre'),
                        'plantillaId': d.get('plantillaId'), 'guardado': d.get('guardado'),
                        'autor': d.get('autor') or '', 'editado_por': d.get('editado_por') or ''})
        except Exception:
            continue
    out.sort(key=lambda x: x.get('guardado') or '', reverse=True)
    return out


# ---------------------------------------------------------------- api
def api(ruta, consulta, cuerpo, metodo, correo=None):
    # --- entrar y salir
    if ruta == 'sesion' and metodo == 'GET':
        cfg = leer_config()
        return {'dentro': bool(correo), 'correo': correo or '', 'dominio': DOMINIO,
                'brevo': bool(cfg.get('brevo_key'))}

    if ruta == 'sesion/codigo' and metodo == 'POST':
        destino = correo_valido(cuerpo.get('correo'))
        codigo = '%06d' % secrets.randbelow(1000000)
        enviar_codigo(destino, codigo)
        _codigos[destino] = {'codigo': codigo, 'expira': time.time() + CODIGO_MINUTOS * 60,
                             'intentos': 0}
        return {'enviado': True, 'minutos': CODIGO_MINUTOS}

    if ruta == 'sesion/verificar' and metodo == 'POST':
        destino = correo_valido(cuerpo.get('correo'))
        entrada = (cuerpo.get('codigo') or '').strip()
        guardado = _codigos.get(destino)
        if not guardado:
            raise RuntimeError('pide un codigo nuevo')
        if time.time() > guardado['expira']:
            _codigos.pop(destino, None)
            raise RuntimeError('el codigo ha caducado, pide otro')
        guardado['intentos'] += 1
        if guardado['intentos'] > MAX_INTENTOS:
            _codigos.pop(destino, None)
            raise RuntimeError('demasiados intentos, pide un codigo nuevo')
        if not secrets.compare_digest(guardado['codigo'], entrada):
            raise RuntimeError('ese codigo no es')
        _codigos.pop(destino, None)
        return {'ok': True, 'token': crear_token(destino), 'correo': destino}

    if ruta == 'sesion/salir' and metodo == 'POST':
        # El token va firmado y sin estado: quien sale lo borra de su navegador.
        return {'ok': True}

    # --- borradores
    if ruta == 'borradores' and metodo == 'GET':
        if wp_almacen_listo():
            return {'borradores': wp_listar(), 'almacen': 'web'}
        return {'borradores': listar_borradores(), 'almacen': 'disco',
                'aviso': ('Los envios se estan guardando en el disco de este servidor y se '
                          'pierden cuando se reinicia.') if EN_SERVIDOR else ''}

    if ruta == 'borradores/guardar' and metodo == 'POST':
        bid = cuerpo.get('id') or (slug(cuerpo.get('nombre')) + '-' + uuid.uuid4().hex[:6])
        if str(bid).startswith('wp-') and not wp_almacen_listo():
            bid = slug(cuerpo.get('nombre')) + '-' + uuid.uuid4().hex[:6]
        previo = {}
        if str(cuerpo.get('id') or '').startswith('wp-'):
            try:
                previo = wp_leer(cuerpo['id'])
            except Exception:
                previo = {}
        elif os.path.exists(ruta_borrador(bid)):
            try:
                with open(ruta_borrador(bid), 'r', encoding='utf-8') as f:
                    previo = json.load(f)
            except Exception:
                previo = {}
        doc = {'id': bid, 'nombre': cuerpo.get('nombre') or '', 'plantillaId': cuerpo.get('plantillaId'),
               'asunto': cuerpo.get('asunto') or '', 'datos': cuerpo.get('datos') or {},
               'autor': previo.get('autor') or correo or '',
               'editado_por': correo or '',
               'guardado': time.strftime('%Y-%m-%dT%H:%M:%S')}
        if wp_almacen_listo():
            return {'id': wp_guardar(cuerpo.get('id'), doc)}
        with open(ruta_borrador(bid), 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
        return {'id': bid}

    m = re.fullmatch(r'borradores/([^/]+)/borrar', ruta)
    if m and metodo == 'POST':
        cual = urllib.parse.unquote(m.group(1))
        if cual.startswith('wp-'):
            wp_borrar(cual)
            return {'ok': True}
        p = ruta_borrador(cual)
        if os.path.exists(p):
            os.remove(p)
        return {'ok': True}

    m = re.fullmatch(r'borradores/([^/]+)', ruta)
    if m and metodo == 'GET':
        cual = urllib.parse.unquote(m.group(1))
        if cual.startswith('wp-'):
            return wp_leer(cual)
        with open(ruta_borrador(cual), 'r', encoding='utf-8') as f:
            return json.load(f)

    # --- biblioteca de imagenes de la web
    if ruta == 'medios' and metodo == 'GET':
        q = (consulta.get('q') or [''])[0]
        params = {'media_type': 'image', 'per_page': '30', 'orderby': 'date', 'order': 'desc',
                  '_fields': 'id,title,source_url,media_details'}
        if q.strip():
            params['search'] = q.strip()
        estado, datos = pedir(WP + '?' + urllib.parse.urlencode(params))
        if estado >= 400 or not isinstance(datos, list):
            raise RuntimeError('la web no ha devuelto imagenes (error %s)' % estado)
        items = []
        for it in datos:
            url = it.get('source_url')
            if not url:
                continue
            thumb = url
            try:
                tamanos = (it.get('media_details') or {}).get('sizes') or {}
                for nombre_t in ('medium', 'thumbnail', 'medium_large'):
                    if nombre_t in tamanos and tamanos[nombre_t].get('source_url'):
                        thumb = tamanos[nombre_t]['source_url']
                        break
            except Exception:
                pass
            titulo = ((it.get('title') or {}).get('rendered') or '').strip()
            titulo = re.sub(r'<[^>]+>', '', titulo)
            items.append({'url': url, 'thumb': thumb, 'titulo': titulo})
        return {'items': items}

    # --- brevo
    if ruta == 'brevo/estado' and metodo == 'GET':
        cfg = leer_config()
        if not cfg.get('brevo_key'):
            return {'conectado': False, 'fijado': False}
        return {'conectado': True, 'cuenta': cfg.get('brevo_cuenta') or '',
                'fijado': config_fijada('brevo_key')}

    if ruta == 'brevo/clave' and metodo == 'POST':
        if config_fijada('brevo_key'):
            raise RuntimeError('la clave de Brevo la pone el administrador en el servidor')
        clave = (cuerpo.get('clave') or '').strip()
        if not clave:
            raise RuntimeError('clave vacia')
        estado, datos = pedir(BREVO + '/account', 'GET', {'api-key': clave})
        if estado >= 400:
            raise RuntimeError(datos.get('message') or ('error %s' % estado))
        cuenta = datos.get('companyName') or datos.get('email') or 'tu cuenta'
        cfg = leer_config()
        cfg['brevo_key'] = clave
        cfg['brevo_cuenta'] = cuenta
        escribir_config(cfg)
        return {'ok': True, 'cuenta': cuenta}

    if ruta == 'brevo/opciones' and metodo == 'GET':
        senders = brevo('/senders').get('senders') or []
        listas = brevo('/contacts/lists?limit=50&offset=0').get('lists') or []
        return {
            'senders': [{'name': s.get('name'), 'email': s.get('email')} for s in senders],
            'lists': [{'id': L.get('id'), 'name': L.get('name'),
                       'totalSubscribers': L.get('totalSubscribers')} for L in listas],
        }

    if ruta == 'brevo/campana' and metodo == 'POST':
        rem = cuerpo.get('remitente') or {}
        payload = {
            'name': cuerpo.get('nombre') or 'Envio Playoff',
            'subject': cuerpo.get('asunto') or '',
            'sender': {'name': rem.get('name') or '', 'email': rem.get('email') or ''},
            'type': 'classic',
            'htmlContent': cuerpo.get('html') or '',
            'recipients': {'listIds': [int(cuerpo.get('listId'))]},
            'inlineImageActivation': False,
        }
        r = brevo('/emailCampaigns', 'POST', payload)
        return {'id': r.get('id')}

    if ruta == 'brevo/plantilla' and metodo == 'POST':
        rem = cuerpo.get('remitente') or {}
        payload = {
            'templateName': cuerpo.get('nombre') or 'Plantilla Playoff',
            'subject': cuerpo.get('asunto') or '',
            'sender': {'name': rem.get('name') or '', 'email': rem.get('email') or ''},
            'htmlContent': cuerpo.get('html') or '',
            'isActive': True,
        }
        r = brevo('/smtp/templates', 'POST', payload)
        return {'id': r.get('id')}

    # --- subida de imagenes y galeria de ponentes
    if ruta == 'web/estado' and metodo == 'GET':
        cfg = leer_config()
        return {'conectado': bool(cfg.get('wp_usuario') and cfg.get('wp_clave')),
                'brevo_imagenes': bool(URL_PUBLICA and cfg.get('brevo_key')),
                'usuario': cfg.get('wp_usuario') or '',
                'fijado': config_fijada('wp_usuario'),
                'almacen': 'web' if wp_almacen_listo() else 'disco'}

    if ruta == 'web/credenciales' and metodo == 'POST':
        if config_fijada('wp_usuario'):
            raise RuntimeError('estas credenciales las pone el administrador en el servidor')
        usuario = (cuerpo.get('usuario') or '').strip()
        clave = (cuerpo.get('clave') or '').strip()
        if not usuario or not clave:
            raise RuntimeError('faltan el usuario o la contrasena de aplicacion')
        cfg = leer_config()
        anterior = (cfg.get('wp_usuario'), cfg.get('wp_clave'))
        cfg['wp_usuario'], cfg['wp_clave'] = usuario, clave
        escribir_config(cfg)
        try:
            estado, datos = pedir(WP_BASE + '/users/me?context=edit', 'GET', wp_cabeceras())
        except Exception as e:
            cfg['wp_usuario'], cfg['wp_clave'] = anterior
            escribir_config(cfg)
            raise
        if estado >= 400:
            cfg['wp_usuario'], cfg['wp_clave'] = anterior
            escribir_config(cfg)
            raise RuntimeError(datos.get('message') or 'la web no acepta esas credenciales')
        return {'ok': True, 'nombre': datos.get('name') or usuario}

    if ruta == 'subir' and metodo == 'POST':
        import base64 as _b64
        nombre = cuerpo.get('nombre') or 'imagen.jpg'
        crudo = cuerpo.get('datos') or ''
        if ',' in crudo[:80]:
            crudo = crudo.split(',', 1)[1]
        try:
            binario = _b64.b64decode(crudo)
        except Exception:
            raise RuntimeError('no he podido leer el archivo')
        if not binario:
            raise RuntimeError('el archivo esta vacio')
        if len(binario) > MAX_SUBIDA:
            raise RuntimeError('el archivo pesa %.1f MB y el limite son %d MB'
                               % (len(binario) / 1048576.0, MAX_SUBIDA // 1048576))
        temporal = os.path.join(SALIDA, 'subida-' + slug(os.path.splitext(nombre)[0]) +
                                os.path.splitext(nombre)[1].lower())
        with open(temporal, 'wb') as f:
            f.write(binario)
        datos_img, nombre_final, tipo = optimizar(temporal, leer_proporcion(cuerpo.get('proporcion')))
        try:
            os.remove(temporal)
        except Exception:
            pass
        url_publica = subir_imagen(datos_img, nombre_final, tipo)
        return {'url': url_publica, 'kb': round(len(datos_img) / 1024.0, 1),
                'original_kb': round(len(binario) / 1024.0, 1)}

    if ruta == 'ponentes' and metodo == 'GET':
        cfg = leer_config()
        publicadas = cfg.get('ponentes_urls') or {}
        salida = []
        if os.path.isdir(PONENTES):
            for nombre in sorted(os.listdir(PONENTES)):
                if nombre.startswith('.') or not re.search(r'\.(jpe?g|png|webp)$', nombre, re.I):
                    continue
                salida.append({
                    'archivo': nombre,
                    'thumb': '/ponentes/' + urllib.parse.quote(nombre),
                    'titulo': os.path.splitext(nombre)[0].replace('-', ' ').strip(),
                    'url': publicadas.get(nombre) or '',
                })
        return {'items': salida}

    if ruta == 'ponentes/publicar' and metodo == 'POST':
        nombre = cuerpo.get('archivo') or ''
        if not re.fullmatch(r'[^/\\]{1,120}', nombre):
            raise RuntimeError('nombre de archivo no valido')
        origen = os.path.join(PONENTES, nombre)
        if not os.path.isfile(origen):
            raise RuntimeError('esa foto ya no esta en la carpeta ponentes')
        cfg = leer_config()
        publicadas = cfg.get('ponentes_urls') or {}
        if publicadas.get(nombre):
            return {'url': publicadas[nombre], 'reutilizada': True}
        datos_img, nombre_final, tipo = optimizar(origen)
        url_publica = subir_imagen(datos_img, nombre_final, tipo)
        publicadas[nombre] = url_publica
        cfg['ponentes_urls'] = publicadas
        escribir_config(cfg)
        return {'url': url_publica, 'reutilizada': False}

    # --- exportar html a un archivo
    if ruta == 'exportar' and metodo == 'POST':
        nombre = slug(cuerpo.get('nombre')) + '.html'
        destino = os.path.join(SALIDA, nombre)
        with open(destino, 'w', encoding='utf-8') as f:
            f.write(cuerpo.get('html') or '')
        return {'ruta': destino}

    raise RuntimeError('ruta desconocida: %s' % ruta)


# ---------------------------------------------------------------- servidor
class Handler(http.server.BaseHTTPRequestHandler):
    server_version = 'PlayoffMailer'

    def log_message(self, formato, *args):
        if '/api/' in (args[0] if args else ''):
            sys.stderr.write('  %s\n' % (formato % args))

    def _json(self, estado, datos):
        cuerpo = json.dumps(datos, ensure_ascii=False).encode('utf-8')
        self.send_response(estado)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(cuerpo)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(cuerpo)

    def _estatico(self, camino):
        if camino in ('', '/'):
            camino = '/index.html'
        limpio = os.path.normpath(urllib.parse.unquote(camino).lstrip('/'))
        if limpio.startswith('..') or os.path.isabs(limpio):
            self._json(404, {'error': 'no encontrado'})
            return
        # Solo la app, las fotos de ponentes y las imagenes publicadas para Brevo.
        # Nada mas: ni el codigo del servidor ni la carpeta .git.
        carpeta, archivo = os.path.split(limpio)
        if carpeta == '' and archivo in ESTATICOS:
            destino = os.path.join(AQUI, archivo)
        elif carpeta == 'ponentes' and re.search(r'\.(jpe?g|png|webp)$', archivo, re.I):
            destino = os.path.join(PONENTES, archivo)
        elif carpeta == 'img' and re.fullmatch(r'[\w.-]+\.(jpe?g|png|webp|gif)', archivo, re.I):
            destino = os.path.join(PUBLICAS, archivo)
        else:
            destino = ''
        if not destino or not os.path.isfile(destino):
            self._json(404, {'error': 'no encontrado'})
            return
        tipo = mimetypes.guess_type(destino)[0] or 'application/octet-stream'
        with open(destino, 'rb') as f:
            datos = f.read()
        self.send_response(200)
        self.send_header('Content-Type', tipo + ('; charset=utf-8' if tipo.startswith('text/') or 'javascript' in tipo else ''))
        self.send_header('Content-Length', str(len(datos)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(datos)

    def _ruta_api(self):
        partes = urllib.parse.urlparse(self.path)
        return partes.path[len('/api/'):].strip('/'), urllib.parse.parse_qs(partes.query)

    def _correo(self):
        return quien_es(self.headers.get('X-Sesion'))

    def _puede(self, ruta, correo):
        if correo or ruta in ABIERTAS:
            return True
        # la clave de Brevo se puede poner sin sesion solo la primera vez:
        # sin ella no hay forma de enviar el codigo de acceso.
        if ruta == 'brevo/clave' and not leer_config().get('brevo_key'):
            return True
        return False

    def do_GET(self):
        if self.path.startswith('/api/'):
            ruta, consulta = self._ruta_api()
            correo = self._correo()
            if not self._puede(ruta, correo):
                self._json(401, {'error': 'sesion'})
                return
            try:
                self._json(200, api(ruta, consulta, {}, 'GET', correo))
            except Exception as e:
                self._json(400, {'error': str(e)})
            return
        self._estatico(urllib.parse.urlparse(self.path).path)

    def do_POST(self):
        if not self.path.startswith('/api/'):
            self._json(404, {'error': 'no encontrado'})
            return
        largo = int(self.headers.get('Content-Length') or 0)
        crudo = self.rfile.read(largo) if largo else b''
        try:
            cuerpo = json.loads(crudo.decode('utf-8')) if crudo else {}
        except Exception:
            cuerpo = {}
        ruta, consulta = self._ruta_api()
        correo = self._correo()
        if not self._puede(ruta, correo):
            self._json(401, {'error': 'sesion'})
            return
        try:
            self._json(200, api(ruta, consulta, cuerpo, 'POST', correo))
        except Exception as e:
            self._json(400, {'error': str(e)})


class Servidor(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def puerto_libre():
    for p in range(PUERTO_BASE, PUERTO_BASE + 20):
        with socket.socket() as s:
            try:
                s.bind(('127.0.0.1', p))
                return p
            except OSError:
                continue
    raise SystemExit('no hay puertos libres')


def main():
    if EN_SERVIDOR:
        puerto = int(os.environ['PORT'])
        srv = Servidor(('0.0.0.0', puerto), Handler)
        print('Playoff Mailer escuchando en el puerto %d' % puerto)
        srv.serve_forever()
        return
    abrir = '--no-abrir' not in sys.argv
    puerto = puerto_libre()
    url = 'http://127.0.0.1:%d/' % puerto
    srv = Servidor(('127.0.0.1', puerto), Handler)
    print('')
    print('  Playoff Mailer en marcha')
    print('  %s' % url)
    print('  Tus envios se guardan en %s' % BORRADORES)
    print('  Para cerrar: Control+C, o cierra esta ventana.')
    print('')
    if abrir:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\n  Cerrado.\n')


if __name__ == '__main__':
    main()
