"""Genera las 5 variantes del webinar con el sistema de la home (clases sp-*).
Textos: los de la plantilla 'Anuncio con ponente' de plantillas.js, sin inventar copy."""
import os

AQUI = os.path.dirname(os.path.abspath(__file__))

# ---- tokens de la home (sp-*)
INK, GRIS, GRIS2, GRIS3 = '#0b0b0c', '#6b6e75', '#8b8e95', '#55585f'
LINEA, SUAVE, SUAVE2 = '#e4e4e7', '#f3f4f6', '#fafafa'
OSCURO, NEGRO, AZUL = '#0e1116', '#0b0b0c', '#006bed'
FONT = "Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

LOGO = 'https://img.mailinblue.com/2955928/images/content_library/original/6a55efa8fc35afde1ddd2864.jpg'
CDN = 'https://cdn.prod.website-files.com/6a44d3d9ce03bc32d83be675/'
F_HERO = CDN + '6aa907fd5bc8c9136ac2029b_home-hero.webp'
F_CIERRE = CDN + '6aa907fc29f9ffd7198edd89_home-cierre.webp'
F_GRADA = CDN + '6aa907fd5bc8c9136ac20275_home-grada.webp'
PONENTE_IMG = '../ponentes/marian-1.webp'

# ---- textos de la plantilla
D = dict(
    pre='Una sesión práctica y directa para que salgas con las ideas claras y puedas aplicarlas desde el primer día.',
    eyebrow='Webinar Playoff',
    t1='Una hora para preparar', t2='la temporada.',
    sub='Una sesión práctica y directa para que salgas con las ideas claras y puedas aplicarlas desde el primer día.',
    cta='Reservar plaza', url='https://playoffinformatica.com/webinars/',
    dia='8', mes='octubre', mes3='OCT', hora='16:00 h', dur='60 minutos', formato='Online y en directo',
    ponente='Marian', cargo='Cargo del ponente',
    bloque='¿Qué veremos?',
    puntos=[('Altas y licencias', 'Del formulario de inscripción a la ficha del jugador, sin teclear nada dos veces.'),
            ('Cuotas y remesas', 'Cobros domiciliados, impagos y recibos desde el mismo sitio.'),
            ('Horarios e instalaciones', 'Pistas, equipos y entrenadores encajados sin solapes.'),
            ('Preguntas en directo', 'Los últimos quince minutos son para tus dudas.')],
    cita1='Si no puedes conectarte,', cita2='apúntate igual: enviamos la grabación.',
    c1='Nos vemos', c2='en directo.', ccta='Apuntarme',
    pie='Software de gestión para federaciones, clubes y academias.',
    link='playoffinformatica.com', linkurl='https://playoffinformatica.com/',
    legal='Recibes este correo porque formas parte de la comunidad Playoff. Playoff Informàtica, Girona.',
)


# ---- piezas
def doc(titulo, cuerpo, fondo='#ffffff'):
    return f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting"><title>{titulo}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  body{{margin:0;padding:0;background:{fondo};-webkit-text-size-adjust:100%}}
  table{{border-collapse:separate;border-spacing:0}}
  img{{border:0;display:block;max-width:100%;height:auto}}
  a{{text-decoration:none}}
  @media (max-width:640px){{
    .wrap{{width:100%!important}}
    .px{{padding-left:22px!important;padding-right:22px!important}}
    .h1{{font-size:40px!important}} .h2{{font-size:30px!important}} .xl{{font-size:72px!important}}
    .col{{display:block!important;box-sizing:border-box!important;width:100%!important;padding-left:0!important;padding-right:0!important}}
    .pad-m{{padding:24px 22px!important}}
    .solo-d{{display:none!important}}
  }}
</style></head>
<body style="margin:0;padding:0;background:{fondo};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{D['pre']}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{fondo}" style="background:{fondo};">
<tr><td align="center" style="padding:0 10px;">
<table role="presentation" class="wrap" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;font-family:{FONT};">
{cuerpo}
</table></td></tr></table></body></html>
'''


def fila(html, pad='0'):
    return f'<tr><td style="padding:{pad};">{html}</td></tr>\n'


def logo(align='center', pad='28px 0 0'):
    return f'<tr><td align="{align}" style="padding:{pad};"><img src="{LOGO}" width="104" alt="Playoff" style="width:104px;{"margin:0 auto;" if align == "center" else ""}"></td></tr>\n'


def boton(texto, url, oscuro=True, align='center'):
    bg, fg = (NEGRO, '#ffffff') if oscuro else ('#ffffff', INK)
    sombra = 'box-shadow:0 6px 16px rgba(11,11,12,0.18);' if oscuro else ''
    m = '0 auto' if align == 'center' else '0'
    return (f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:{m};"><tr><td>'
            f'<a href="{url}" style="display:inline-block;background:{bg};color:{fg};font-size:15px;font-weight:500;'
            f'line-height:48px;height:48px;padding:0 26px;border-radius:999px;white-space:nowrap;{sombra}">{texto}</a>'
            f'</td></tr></table>')


def h1(size=54, color=INK, em=GRIS2, align='center'):
    return (f'<h1 class="h1" style="margin:0;color:{color};font-size:{size}px;line-height:1.02;font-weight:400;'
            f'letter-spacing:-0.045em;text-align:{align};">{D["t1"]}<br><span style="color:{em};">{D["t2"]}</span></h1>')


def p(texto, color=GRIS, size=17, m='0', align='left', mw=''):
    mw = f'max-width:{mw}px;' if mw else ''
    return f'<p style="margin:{m};{mw}color:{color};font-size:{size}px;line-height:1.55;text-align:{align};">{texto}</p>'


def sep(c=LINEA):
    return f'<span style="color:{c};padding:0 8px;">|</span>'


def img(src, r=28, bg=SUAVE, extra=''):
    return f'<img src="{src}" width="640" alt="" style="width:100%;border-radius:{r}px;background:{bg};{extra}">'


def cita(color=INK, em=GRIS2, size=26, align='center'):
    return (f'<p style="margin:0;color:{color};font-size:{size}px;line-height:1.3;font-weight:400;letter-spacing:-0.025em;'
            f'text-align:{align};">{D["cita1"]}<br><span style="color:{em};">{D["cita2"]}</span></p>')


def cierre_oscuro(con_foto=True):
    foto = f'<tr><td style="padding:10px 10px 0;">{img(F_CIERRE, 20, "#1a1e25")}</td></tr>' if con_foto else ''
    return fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{OSCURO}" style="background:{OSCURO};border-radius:28px;">
  {foto}
  <tr><td class="px" align="center" style="padding:48px 40px 54px;">
    <h2 class="h2" style="margin:0;color:#ffffff;font-size:40px;line-height:1.08;font-weight:400;letter-spacing:-0.04em;">{D["c1"]}<br><span style="color:#9aa0aa;">{D["c2"]}</span></h2>
    <div style="height:28px;"></div>{boton(D["ccta"], D["url"], oscuro=False)}
  </td></tr></table>''', '0')


def pie(pad='10px 0 28px'):
    return fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{NEGRO}" style="background:{NEGRO};border-radius:28px;">
  <tr><td class="px" style="padding:40px 40px 32px;">
    <p style="margin:0;max-width:340px;color:#a1a4ab;font-size:15px;line-height:1.55;">{D["pie"]}</p>
    <p style="margin:16px 0 0;"><a href="{D["linkurl"]}" style="color:#ffffff;font-size:14px;font-weight:600;">{D["link"]}</a></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #1f2329;"><tr>
      <td style="padding-top:18px;color:#6f727a;font-size:13px;line-height:1.55;">{D["legal"]}</td></tr></table>
  </td></tr></table>''', pad)


def pie_claro():
    """Pie sin caja: texto pequeño centrado sobre blanco."""
    return fila(f'''<p style="margin:0;color:{GRIS};font-size:14px;line-height:1.55;text-align:center;">{D["pie"]}</p>
    <p style="margin:10px 0 0;text-align:center;"><a href="{D["linkurl"]}" style="color:{INK};font-size:14px;font-weight:500;">{D["link"]}</a></p>
    <p style="margin:22px auto 0;max-width:420px;color:{GRIS2};font-size:12px;line-height:1.55;text-align:center;">{D["legal"]}</p>''',
                '56px 30px 40px')


def num(i, size=40):
    return (f'<div style="width:{size}px;height:{size}px;line-height:{size}px;text-align:center;border-radius:999px;'
            f'background:{AZUL};color:#ffffff;font-size:{int(size * .4)}px;font-weight:600;">{i}</div>')


def puntos_lista(pad='0', nums=True):
    filas = ''
    for i, (t, d) in enumerate(D['puntos'], 1):
        izq = f'<td width="56" valign="top" style="padding:22px 0;border-top:1px solid {LINEA};">{num(i, 32)}</td>' if nums else ''
        filas += f'''<tr>{izq}<td valign="top" style="padding:22px 0;border-top:1px solid {LINEA};">
      <p style="margin:3px 0 0;color:{INK};font-size:19px;line-height:1.35;letter-spacing:-0.02em;">{t}</p>
      <p style="margin:6px 0 0;color:{GRIS};font-size:16px;line-height:1.6;">{d}</p></td></tr>'''
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:{pad};">{filas}</table>'


def puntos_rejilla(bg=SUAVE2):
    celdas = []
    for i, (t, d) in enumerate(D['puntos'], 1):
        celdas.append(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{bg}" style="background:{bg};border-radius:20px;"><tr><td style="padding:26px 26px 28px;">
      {num(i)}<p style="margin:18px 0 0;color:{INK};font-size:20px;line-height:1.35;letter-spacing:-0.02em;">{t}</p>
      <p style="margin:8px 0 0;color:{GRIS};font-size:15px;line-height:1.55;">{d}</p></td></tr></table>''')
    return f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td class="col" width="50%" valign="top" style="padding:0 5px 10px 0;">{celdas[0]}</td><td class="col" width="50%" valign="top" style="padding:0 0 10px 5px;">{celdas[1]}</td></tr>
  <tr><td class="col" width="50%" valign="top" style="padding:0 5px 10px 0;">{celdas[2]}</td><td class="col" width="50%" valign="top" style="padding:0 0 10px 5px;">{celdas[3]}</td></tr></table>'''


def ponente_linea(color=INK, sub=GRIS, circulo=SUAVE, tam=52):
    nombre = 16 if tam < 80 else 20
    return f'''<table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td width="{tam + 8}" valign="middle"><div style="width:{tam}px;height:{tam}px;border-radius:999px;background:{circulo};overflow:hidden;"><img src="{PONENTE_IMG}" width="{tam}" alt="{D["ponente"]}" style="width:{tam}px;margin-top:{round(tam * .08)}px;"></div></td>
    <td valign="middle" style="padding-left:{8 if tam < 80 else 14}px;"><p style="margin:0;color:{color};font-size:{nombre}px;font-weight:500;letter-spacing:-0.01em;">{D["ponente"]}</p>
      <p style="margin:3px 0 0;color:{sub};font-size:{14 if tam < 80 else 15}px;">{D["cargo"]}</p></td></tr></table>'''


def h2(texto, size=40, align='center', color=INK):
    return (f'<h2 class="h2" style="margin:0;color:{color};font-size:{size}px;line-height:1.08;font-weight:400;'
            f'letter-spacing:-0.04em;text-align:{align};">{texto}</h2>')


def metas(align='center', color=GRIS2, linea=LINEA, solo_formato=False):
    txt = D["formato"] if solo_formato else f'{D["dur"]}{sep(linea)}{D["formato"]}'
    return f'<p style="margin:0;color:{color};font-size:13px;text-align:{align};">{txt}</p>'


# =============================================================== 1 · EDITORIAL
def v1():
    c = logo('left', '32px 40px 0')
    c += fila(f'''<p style="margin:0;color:{GRIS};font-size:15px;">{D["eyebrow"]}{sep()}<b style="color:{INK};font-weight:600;">{D["dia"]} {D["mes"]} · {D["hora"]}</b></p>
    <div style="height:18px;"></div>{h1(56, align="left")}
    <div style="height:22px;"></div>{p(D["sub"], mw=480)}
    <div style="height:30px;"></div>{boton(D["cta"], D["url"], align="left")}''', '64px 40px 0').replace('<td style', '<td class="px" style', 1)
    c += fila(img(F_HERO), '48px 0 0')
    c += fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="col" width="34%" valign="top" style="padding:0 0 20px;">{h2(D["bloque"], 30, "left")}</td>
      <td class="col" width="66%" valign="top">{puntos_lista()}</td></tr></table>''', '64px 40px 0').replace('<td style', '<td class="px" style', 1)
    c += fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid {LINEA};"><tr>
      <td class="col" valign="middle" style="padding:28px 0 0;">{ponente_linea()}</td>
      <td class="col" valign="middle" align="right" style="padding:28px 0 0;">{metas("right")}</td></tr></table>''', '8px 40px 0').replace('<td style', '<td class="px" style', 1)
    c += fila(cita(align='left', size=30), '72px 40px 72px').replace('<td style', '<td class="px" style', 1)
    c += cierre_oscuro(False)
    c += pie()
    return doc('Webinar · Editorial', c)


# =============================================================== 2 · FOTO PROTAGONISTA
def v2():
    hero = f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{OSCURO}" style="background:{OSCURO};border-radius:28px;">
  <tr><td style="padding:10px 10px 0;">{img(F_HERO, 20, "#1a1e25")}</td></tr>
  <tr><td class="px" align="center" style="padding:44px 40px 50px;">
    <p style="margin:0;color:#9aa0aa;font-size:15px;">{D["eyebrow"]}{sep("#2a2f37")}<b style="color:#ffffff;font-weight:600;">{D["dia"]} {D["mes"]} · {D["hora"]}</b></p>
    <div style="height:18px;"></div>{h1(52, "#ffffff", "#9aa0aa")}
    <div style="height:20px;"></div>{p(D["sub"], "#9aa0aa", 17, "0 auto", "center", 460)}
    <div style="height:30px;"></div>{boton(D["cta"], D["url"], oscuro=False)}
    <div style="height:18px;"></div>{metas(color="#6f727a", linea="#2a2f37")}
  </td></tr></table>'''
    c = logo('center', '28px 0 24px') + fila(hero)
    c += fila(h2(D["bloque"], 44), '80px 30px 36px')
    c += fila(puntos_rejilla())
    c += fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid {LINEA};border-bottom:1px solid {LINEA};"><tr>
      <td class="pad-m" style="padding:28px 8px;">{ponente_linea()}</td></tr></table>''', '40px 0 0')
    c += fila(cita(), '64px 30px 64px')
    c += fila(boton(D["ccta"], D["url"]), '0 0 8px')
    c += pie('56px 0 28px')
    return doc('Webinar · Foto protagonista', c)


# =============================================================== 3 · INVITACIÓN (fecha grande)
def v3():
    fecha = f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{SUAVE}" style="background:{SUAVE};border-radius:28px;"><tr>
    <td class="col pad-m" width="210" valign="middle" align="center" style="padding:40px 10px 40px 30px;">
      <table role="presentation" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;border-radius:22px;box-shadow:0 1px 3px rgba(11,11,12,0.08);margin:0 auto;"><tr><td align="center" style="padding:0 0 18px;width:160px;">
        <div style="background:{AZUL};color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.08em;padding:9px 0;border-radius:22px 22px 0 0;">{D["mes3"]}</div>
        <div class="xl" style="color:{INK};font-size:84px;line-height:1;font-weight:400;letter-spacing:-0.045em;padding-top:14px;">{D["dia"]}</div>
        <div style="color:{GRIS};font-size:14px;margin-top:6px;">{D["hora"]}</div>
      </td></tr></table>
    </td>
    <td class="col pad-m" valign="middle" style="padding:40px 40px 40px 20px;">
      <p style="margin:0;color:{GRIS};font-size:15px;">{D["eyebrow"]}</p>
      <div style="height:14px;"></div>{h1(40, align="left")}
      <div style="height:16px;"></div>{p(D["sub"], size=16)}
    </td></tr>
    <tr><td colspan="2" class="pad-m" style="padding:0 30px 34px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid {LINEA};"><tr>
        <td valign="middle" style="padding-top:24px;">{metas("left", GRIS)}</td>
        <td valign="middle" align="right" style="padding-top:24px;">{boton(D["cta"], D["url"], align="right")}</td></tr></table>
    </td></tr></table>'''
    c = logo('center', '28px 0 24px') + fila(fecha)
    c += fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="col" width="50%" valign="top" style="padding:10px 5px 0 0;">{img(F_GRADA, 28)}</td>
      <td class="col" width="50%" valign="top" style="padding:10px 0 0 5px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{SUAVE}" style="background:{SUAVE};border-radius:28px;"><tr>
          <td style="padding:28px 28px 0;"><p style="margin:0;color:{GRIS};font-size:15px;">Presenta</p>
            <p style="margin:6px 0 0;color:{INK};font-size:26px;letter-spacing:-0.025em;">{D["ponente"]}</p>
            <p style="margin:4px 0 0;color:{GRIS};font-size:14px;">{D["cargo"]}</p></td></tr>
          <tr><td align="right" style="padding:0 20px 0 0;"><img src="{PONENTE_IMG}" width="150" alt="{D["ponente"]}" style="width:150px;margin-left:auto;"></td></tr></table>
      </td></tr></table>''')
    c += fila(h2(D["bloque"], 44), '80px 30px 20px')
    c += fila(puntos_lista(), '0 40px').replace('<td style', '<td class="px" style', 1)
    c += fila(cita(), '64px 30px 64px')
    c += cierre_oscuro(False) + pie()
    return doc('Webinar · Invitación', c)


# =============================================================== 4 · PONENTE PROTAGONISTA
def v4():
    hero = f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{SUAVE}" style="background:{SUAVE};border-radius:28px;"><tr>
    <td class="col pad-m" valign="middle" style="padding:48px 10px 48px 40px;">
      <p style="margin:0;color:{GRIS};font-size:15px;">{D["eyebrow"]}</p>
      <p style="margin:4px 0 0;color:{INK};font-size:15px;font-weight:600;">{D["dia"]} {D["mes"]} · {D["hora"]}</p>
      <div style="height:20px;"></div>{h1(44, align="left")}
      <div style="height:18px;"></div>{p(D["sub"], size=16)}
      <div style="height:26px;"></div>{boton(D["cta"], D["url"], align="left")}
    </td>
    <td class="col" width="240" valign="bottom" align="right" style="padding:40px 24px 0 0;">
      <img src="{PONENTE_IMG}" width="230" alt="{D["ponente"]}" style="width:230px;margin-left:auto;">
    </td></tr></table>'''
    c = logo('left', '28px 10px 20px') + fila(hero)
    c += fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="col" valign="middle" style="padding:18px 10px 0;"><p style="margin:0;color:{INK};font-size:16px;font-weight:500;">{D["ponente"]} <span style="color:{GRIS};font-weight:400;">· {D["cargo"]}</span></p></td>
      <td class="col" valign="middle" align="right" style="padding:18px 10px 0;">{metas("right")}</td></tr></table>''')
    c += fila(h2(D["bloque"], 44), '88px 30px 36px')
    c += fila(puntos_rejilla(SUAVE))
    c += fila(cita(), '64px 30px 72px')
    c += cierre_oscuro(True) + pie()
    return doc('Webinar · Ponente protagonista', c)


# =============================================================== 5 · MINIMAL
def v5():
    c = logo('center', '40px 0 0')
    c += fila(f'''<p style="margin:0;color:{GRIS};font-size:15px;text-align:center;">{D["eyebrow"]}</p>
    <div style="height:22px;"></div>{h1(58)}
    <div style="height:24px;"></div>{p(D["sub"], m="0 auto", align="center", mw=440)}''', '72px 40px 0').replace('<td style', '<td class="px" style', 1)
    # fila de datos
    datos = ''
    for k, v in (('Fecha', f'{D["dia"]} {D["mes"]}'), ('Hora', D['hora']), ('Duración', D['dur'])):
        datos += f'''<td class="col" width="33%" align="center" valign="top" style="padding:22px 6px;">
        <p style="margin:0;color:{GRIS2};font-size:13px;">{k}</p><p style="margin:6px 0 0;color:{INK};font-size:22px;letter-spacing:-0.02em;">{v}</p></td>'''
    c += fila(f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid {LINEA};border-bottom:1px solid {LINEA};"><tr>{datos}</tr></table>', '48px 40px 0').replace('<td style', '<td class="px" style', 1)
    c += fila(boton(D["cta"], D["url"]) + f'<div style="height:16px;"></div>{metas(solo_formato=True)}', '40px 0 0')
    c += fila(h2(D["bloque"], 32), '96px 40px 12px').replace('<td style', '<td class="px" style', 1)
    lista = ''
    for t, d in D['puntos']:
        lista += (f'<p style="margin:26px 0 0;text-align:center;color:{INK};font-size:19px;letter-spacing:-0.02em;">{t}</p>'
                  f'<p style="margin:6px auto 0;max-width:400px;text-align:center;color:{GRIS};font-size:16px;line-height:1.6;">{d}</p>')
    c += fila(lista, '0 40px').replace('<td style', '<td class="px" style', 1)
    c += fila(f'<div style="width:40px;height:1px;background:{LINEA};margin:0 auto;"></div>', '72px 0 0')
    c += fila(f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td>{ponente_linea()}</td></tr></table>', '40px 0 0')
    c += fila(cita(size=24), '72px 40px 0').replace('<td style', '<td class="px" style', 1)
    c += fila(h2(f'{D["c1"]}<br><span style="color:{GRIS2};">{D["c2"]}</span>', 40), '72px 30px 28px')
    c += fila(boton(D["ccta"], D["url"]))
    c += fila(f'<div style="height:1px;background:{LINEA};"></div>', '72px 40px 0')
    c += pie_claro()
    return doc('Webinar · Minimal', c)


# =============================================================== FINAL · combinación elegida
def ponente_embebido():
    """En la maqueta la foto va incrustada para que se vea al abrir el HTML suelto.
    En la app se sube a la web y se usa su URL pública, como ahora."""
    import base64
    with open(os.path.join(AQUI, '..', 'ponentes', 'marian-1.webp'), 'rb') as fh:
        return 'data:image/webp;base64,' + base64.b64encode(fh.read()).decode('ascii')


def foto_con_tarjeta(fondo, superpuesta):
    """Foto de fondo a sangre con una tarjeta blanca encima que lleva otra foto.
    background-image para Gmail/Apple, VML para Outlook de escritorio."""
    return fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td background="{fondo}" bgcolor="#1d5fd6" valign="bottom"
      style="background-color:#1d5fd6;background-image:url('{fondo}');background-size:cover;background-position:50% 50%;border-radius:28px;">
  <!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;height:440px;"><v:fill type="frame" src="{fondo}" color="#1d5fd6"/><v:textbox inset="0,0,0,0"><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="tarjeta-sup" align="right" style="padding:150px 28px 28px 200px;">
        <table role="presentation" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;border-radius:22px;box-shadow:0 24px 60px rgba(11,11,12,0.22);"><tr>
          <td style="padding:8px;"><img src="{superpuesta}" width="396" alt="" style="width:396px;border-radius:16px;background:{SUAVE};"></td>
        </tr></table>
      </td></tr></table>
  <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
  </td></tr></table>''', '48px 0 0')


def embebida(ruta, tipo):
    import base64
    with open(os.path.join(AQUI, ruta), 'rb') as fh:
        return f'data:{tipo};base64,' + base64.b64encode(fh.read()).decode('ascii')


def foto_con_ventana(fondo, captura):
    """Foto de fondo con una ventana de la plataforma encima (como .sp-win de la home):
    barra azul con los tres puntos y la captura dentro, apoyada en el borde de abajo."""
    puntos = ''.join(f'<span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:rgba(255,255,255,0.35);margin-right:5px;"></span>' for _ in range(3))
    return fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td background="{fondo}" bgcolor="#1d5fd6" valign="bottom"
      style="background-color:#1d5fd6;background-image:url('{fondo}');background-size:cover;background-position:50% 50%;border-radius:28px;overflow:hidden;">
  <!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;height:420px;"><v:fill type="frame" src="{fondo}" color="#1d5fd6"/><v:textbox inset="0,0,0,0"><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="ventana" style="padding:52px 40px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f6f9" style="background:#f4f6f9;border-radius:14px 14px 0 0;box-shadow:0 24px 60px rgba(11,11,12,0.22);">
          <tr><td bgcolor="#0a6cf0" style="background:#0a6cf0;border-radius:14px 14px 0 0;padding:7px 12px 6px;line-height:8px;font-size:0;">{puntos}</td></tr>
          <tr><td style="padding:10px 10px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;border-radius:10px 10px 0 0;"><tr>
              <td style="padding:10px 10px 0;"><img src="{captura}" width="520" alt="" style="width:100%;display:block;"></td></tr></table>
          </td></tr>
        </table>
      </td></tr></table>
  <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
  </td></tr></table>''', '48px 0 0')


def imagen_sobre_imagen(fondo, encima):
    """Dos imágenes: la de fondo (a sangre, esquinas redondeadas) y la del entorno encima,
    apoyada en el borde de abajo. La de encima se sube tal cual; el email no le dibuja nada."""
    return fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td background="{fondo}" bgcolor="#1d5fd6" valign="bottom"
      style="background-color:#1d5fd6;background-image:url('{fondo}');background-size:cover;background-position:50% 50%;border-radius:28px;">
  <!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;height:420px;"><v:fill type="frame" src="{fondo}" color="#1d5fd6"/><v:textbox inset="0,0,0,0"><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="encima" style="padding:52px 40px 0;">
        <img src="{encima}" width="560" alt="" style="width:100%;display:block;border-radius:12px 12px 0 0;">
      </td></tr></table>
  <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
  </td></tr></table>''', '48px 0 0')


def px(html):
    return html.replace('<td style', '<td class="px" style', 1)


def vfinal():
    c = logo('left', '32px 40px 0').replace('<td align', '<td class="px" align', 1)
    # 1 · portada (variante 1)
    c += px(fila(f'''<p style="margin:0;color:{GRIS};font-size:15px;">{D["eyebrow"]}{sep()}<b style="color:{INK};font-weight:600;">{D["dia"]} {D["mes"]} · {D["hora"]}</b></p>
    <div style="height:18px;"></div>{h1(56, align="left")}
    <div style="height:22px;"></div>{p(D["sub"], mw=480)}
    <div style="height:30px;"></div>{boton(D["cta"], D["url"], align="left")}''', '64px 40px 0'))
    # 2 · imagen del entorno encima de la foto azul
    c += imagen_sobre_imagen(F_HERO, embebida('capturas/entorno-calendario.jpg', 'image/jpeg'))
    # 3 · fila de datos (variante 5)
    datos = ''
    for k, v in (('Fecha', f'{D["dia"]} {D["mes"]}'), ('Hora', D['hora']), ('Duración', D['dur'])):
        datos += f'''<td width="33%" align="center" valign="top" style="padding:22px 4px;">
        <p style="margin:0;color:{GRIS2};font-size:13px;">{k}</p><p style="margin:6px 0 0;color:{INK};font-size:22px;letter-spacing:-0.02em;white-space:nowrap;">{v}</p></td>'''
    c += px(fila(f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid {LINEA};border-bottom:1px solid {LINEA};"><tr>{datos}</tr></table>', '48px 40px 0'))
    # 4 · qué veremos + ponente (variante 1)
    c += px(fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="col" width="34%" valign="top" style="padding:0 0 20px;">{h2(D["bloque"], 30, "left")}</td>
      <td class="col" width="66%" valign="top">{puntos_lista()}</td></tr></table>''', '64px 40px 0'))
    ponente = ponente_linea(tam=96).replace(PONENTE_IMG, ponente_embebido())
    c += px(fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid {LINEA};"><tr>
      <td class="col" valign="middle" style="padding:28px 0 0;">{ponente}</td>
      <td class="col" valign="middle" align="right" style="padding:28px 0 0;">{metas("right")}</td></tr></table>''', '8px 40px 0'))
    # 5 · frase, cierre oscuro sin foto y pie
    c += px(fila(cita(align='left', size=30), '72px 40px 72px'))
    c += cierre_oscuro(False) + pie()
    html = doc('Webinar · Final', c)
    # diseño plano: sin sombras en ningún elemento
    html = html.replace('box-shadow:0 6px 16px rgba(11,11,12,0.18);', '')
    return html.replace('.solo-d{display:none!important}',
                        '.solo-d{display:none!important}\n    .encima{padding:28px 14px 0!important}')


if __name__ == '__main__':
    for n, fn in enumerate((v1, v2, v3, v4, v5), 1):
        with open(os.path.join(AQUI, f'webinar-v{n}.html'), 'w', encoding='utf-8') as f:
            f.write(fn())
    with open(os.path.join(AQUI, 'webinar-final.html'), 'w', encoding='utf-8') as f:
        f.write(vfinal())
    print('ok')
