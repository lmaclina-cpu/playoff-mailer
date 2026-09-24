"""Genera 5 variantes del email de novedades: una destacada y tres no destacadas.
Mismo sistema que el webinar elegido (home sp-*, plano, sin sombras).
Textos: los de la plantilla 'Una destacada y varias rápidas' de plantillas.js."""
import os
from generar_webinar import (AQUI, INK, GRIS, GRIS2, LINEA, SUAVE, OSCURO, F_HERO,
                             doc, fila, logo, boton, p, sep, pie, pie_claro, num, embebida,
                             imagen_sobre_imagen, px)

N = dict(
    pre='Un cambio protagonista, unas cuantas mejoras rápidas y alguna cosa más que merece la pena tener en el radar.',
    eyebrow='Novedades', mes='Septiembre 2026',
    t1='Lo nuevo de Playoff,', t2='en 2 minutos.',
    sub='Un cambio protagonista, unas cuantas mejoras rápidas y alguna cosa más que merece la pena tener en el radar.',
    cta='Ver las novedades', url='https://playoffinformatica.com/',
    dtag='La novedad del mes', dtit='Las nóminas ya forman parte de tu Time',
    dtxt='Sube el PDF del mes y Playoff reparte cada nómina a su trabajador. Cada persona se la descarga desde su acceso, sin pasar por administración. Incluido <b style="color:#0b0b0c;font-weight:500;">sin coste</b> para los clientes del módulo Time.',
    dcta='Ver cómo funciona', durl='https://playoffinformatica.com/',
    mk='Y además', m1='Mejoras pequeñas.', m2='Pero muy de agradecer.',
    items=[('Altas masivas desde Excel', 'Sube el listado de la temporada y avisamos de los duplicados antes de guardar nada.'),
           ('Avisos de impago automáticos', 'Cuando una remesa vuelve, el recibo queda marcado y sale el aviso al socio.'),
           ('Buscador en la ficha del socio', 'Encuentra un recibo o un documento sin bajar por toda la ficha.')],
    icta='Ver cómo funciona', iurl='https://playoffinformatica.com/',
    ptag='Playoff Time', p1='Tu equipo ficha.', p2='Tú lo ves claro.',
    ptxt='Control horario pensado para que registrar entradas, salidas y pausas no sea otra tarea más.',
    pcta='Conocer Playoff Time', purl='https://playoffinformatica.com/',
)

# capturas de ejemplo: en la app, cada novedad sube la suya
ENTORNO = embebida('capturas/entorno-calendario.png', 'image/png')
MINIS = [embebida(f'capturas/mini-{n}.png', 'image/png') for n in ('cabecera', 'evento', 'semana')]


# ---- piezas
def cabecera(align='left'):
    return (f'<p style="margin:0;color:{GRIS};font-size:15px;text-align:{align};">{N["eyebrow"]}{sep()}'
            f'<b style="color:{INK};font-weight:600;">{N["mes"]}</b></p>')


def titular(size=56, align='left', color=INK, em=GRIS2, t1=None, t2=None, tag='h1'):
    t1, t2 = t1 or N['t1'], t2 or N['t2']
    cls = 'h1' if tag == 'h1' else 'h2'
    return (f'<{tag} class="{cls}" style="margin:0;color:{color};font-size:{size}px;line-height:1.04;font-weight:400;'
            f'letter-spacing:-0.045em;text-align:{align};">{t1}<br><span style="color:{em};">{t2}</span></{tag}>')


def portada(align='left'):
    a = align
    return px(fila(f'''{cabecera(a)}<div style="height:18px;"></div>{titular(56, a)}
    <div style="height:22px;"></div>{p(N["sub"], m="0 auto" if a == "center" else "0", align=a, mw=470)}
    <div style="height:30px;"></div>{boton(N["cta"], N["url"], align=a)}''', '64px 40px 0'))


def etiqueta(t, fondo='#eaf2ff', color='#0058c4'):
    return f'<span style="display:inline-block;background:{fondo};color:{color};font-size:12px;font-weight:500;padding:4px 9px;border-radius:6px;">{t}</span>'


def enlace(t, url, color=INK):
    return f'<a href="{url}" style="color:{color};font-size:15px;font-weight:500;">{t} <span style="color:#006bed;">→</span></a>'


def h3(t, size=26, color=INK, align='left'):
    return f'<p style="margin:0;color:{color};font-size:{size}px;line-height:1.2;letter-spacing:-0.025em;text-align:{align};">{t}</p>'


def img(src, r=16, borde=True):
    b = f'border:1px solid {LINEA};' if borde else ''
    return f'<img src="{src}" width="600" alt="" style="width:100%;display:block;border-radius:{r}px;{b}">'


def destacada_texto(align='left', color=INK, gris=GRIS):
    return (f'{etiqueta(N["dtag"])}<div style="height:16px;"></div>{h3(N["dtit"], 34, color, align)}'
            f'<div style="height:14px;"></div>{p(N["dtxt"], gris, 17, align=align)}'
            f'<div style="height:20px;"></div><p style="margin:0;text-align:{align};">{enlace(N["dcta"], N["durl"], color)}</p>')


def bloque_ademas(align='left', size=40):
    return px(fila(f'''<p style="margin:0;color:{GRIS};font-size:15px;text-align:{align};">{N["mk"]}</p>
    <div style="height:12px;"></div>{titular(size, align, t1=N["m1"], t2=N["m2"], tag="h2")}''', '88px 40px 0'))


def promo_oscura():
    return fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{OSCURO}" style="background:{OSCURO};border-radius:28px;">
  <tr><td class="px" align="center" style="padding:56px 40px 58px;">
    <p style="margin:0;color:#9aa0aa;font-size:15px;">{N["ptag"]}</p>
    <div style="height:14px;"></div>{titular(40, "center", "#ffffff", "#9aa0aa", N["p1"], N["p2"], "h2")}
    <div style="height:16px;"></div>{p(N["ptxt"], "#9aa0aa", 16, "0 auto", "center", 420)}
    <div style="height:28px;"></div>{boton(N["pcta"], N["purl"], oscuro=False)}
  </td></tr></table>''', '88px 0 0')


def plano(html):
    return html.replace('box-shadow:0 6px 16px rgba(11,11,12,0.18);', '')


def salida(titulo, c, pie_html=None):
    return plano(doc(titulo, c + (pie_html if pie_html is not None else pie())).replace(
        '.solo-d{display:none!important}', '.solo-d{display:none!important}\n    .encima{padding:28px 14px 0!important}'))


# =============================================================== 1 · CLÁSICA
def v1():
    c = logo('left', '32px 40px 0').replace('<td align', '<td class="px" align', 1) + portada()
    c += imagen_sobre_imagen(F_HERO, ENTORNO)
    c += px(fila(destacada_texto(), '40px 40px 0'))
    c += bloque_ademas()
    filas = ''
    for (t, d), im in zip(N['items'], MINIS):
        filas += f'''<tr>
      <td class="col" width="200" valign="top" style="padding:28px 0;border-top:1px solid {LINEA};">{img(im, 12)}</td>
      <td class="col" valign="top" style="padding:28px 0 28px 28px;border-top:1px solid {LINEA};">
        {h3(t, 20)}<div style="height:8px;"></div>{p(d, size=16)}<div style="height:12px;"></div>{enlace(N["icta"], N["iurl"])}</td></tr>'''
    c += px(fila(f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">{filas}</table>', '36px 40px 0'))
    c += promo_oscura()
    return salida('Novedades · Clásica', c)


# =============================================================== 2 · DESTACADA OSCURA + 3 COLUMNAS
def v2():
    c = logo('center', '32px 0 0') + portada('center')
    c += fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{OSCURO}" style="background:{OSCURO};border-radius:28px;">
  <tr><td style="padding:40px 40px 0;" class="px">{img(ENTORNO, 12, False)}</td></tr>
  <tr><td class="px" style="padding:40px 44px 48px;">
    {etiqueta(N["dtag"], "rgba(255,255,255,0.1)", "#cfe0ff")}<div style="height:16px;"></div>{h3(N["dtit"], 34, "#ffffff")}
    <div style="height:14px;"></div>{p(N["dtxt"].replace("#0b0b0c", "#ffffff"), "#9aa0aa", 17)}
    <div style="height:20px;"></div>{enlace(N["dcta"], N["durl"], "#ffffff")}
  </td></tr></table>''', '56px 0 0')
    c += bloque_ademas('center')
    cols = ''
    for i, ((t, d), im) in enumerate(zip(N['items'], MINIS)):
        pad = '0 7px 0 0' if i == 0 else ('0 0 0 7px' if i == 2 else '0 3px')
        cols += f'''<td class="col" width="33%" valign="top" style="padding:{pad};">
      {img(im, 14)}<div style="height:18px;"></div>{h3(t, 18)}<div style="height:8px;"></div>{p(d, size=15)}
      <div style="height:12px;"></div>{enlace(N["icta"], N["iurl"])}<div class="solo-m" style="height:32px;"></div></td>'''
    c += px(fila(f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{cols}</tr></table>', '40px 0 0'))
    c += promo_oscura()
    return salida('Novedades · Destacada oscura', c)


# =============================================================== 3 · EDITORIAL A DOS COLUMNAS
def v3():
    c = logo('left', '32px 40px 0').replace('<td align', '<td class="px" align', 1) + portada()
    c += imagen_sobre_imagen(F_HERO, ENTORNO)
    c += px(fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="col" width="42%" valign="top" style="padding:0 20px 20px 0;">{etiqueta(N["dtag"])}<div style="height:16px;"></div>{h3(N["dtit"], 30)}</td>
      <td class="col" valign="top">{p(N["dtxt"])}<div style="height:18px;"></div>{enlace(N["dcta"], N["durl"])}</td></tr></table>''', '40px 40px 0'))
    lista = ''
    for i, (t, d) in enumerate(N['items'], 1):
        lista += f'''<tr><td width="52" valign="top" style="padding:22px 0;border-top:1px solid {LINEA};">{num(i, 32)}</td>
      <td valign="top" style="padding:22px 0;border-top:1px solid {LINEA};">{h3(t, 19)}<div style="height:6px;"></div>{p(d, size=16)}
      <div style="height:10px;"></div>{enlace(N["icta"], N["iurl"])}</td></tr>'''
    c += px(fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="col" width="34%" valign="top" style="padding:0 0 20px;"><p style="margin:0;color:{GRIS};font-size:15px;">{N["mk"]}</p><div style="height:10px;"></div>
        {titular(30, t1=N["m1"], t2=N["m2"], tag="h2")}</td>
      <td class="col" width="66%" valign="top"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">{lista}</table></td></tr></table>''', '88px 40px 0'))
    c += promo_oscura()
    return salida('Novedades · Editorial', c)


# =============================================================== 4 · BENTO
def v4():
    c = logo('left', '32px 40px 0').replace('<td align', '<td class="px" align', 1) + portada()
    c += fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{SUAVE}" style="background:{SUAVE};border-radius:28px;">
  <tr><td class="px" style="padding:44px 44px 32px;">{destacada_texto()}</td></tr>
  <tr><td class="encima" style="padding:0 44px;">{img(ENTORNO, 12, False).replace("border-radius:12px", "border-radius:12px 12px 0 0")}</td></tr></table>''', '56px 0 0')
    (t0, d0), (t1, d1), (t2, d2) = N['items']
    ancha = f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{SUAVE}" style="background:{SUAVE};border-radius:28px;"><tr>
      <td class="col" width="50%" valign="middle" style="padding:32px 16px 32px 32px;">{h3(t0, 22)}<div style="height:8px;"></div>{p(d0, size=15)}<div style="height:12px;"></div>{enlace(N["icta"], N["iurl"])}</td>
      <td class="col" width="50%" valign="middle" style="padding:24px 24px 24px 8px;">{img(MINIS[0], 14)}</td></tr></table>'''
    def media(t, d, im):
        return f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="{SUAVE}" style="background:{SUAVE};border-radius:28px;"><tr><td style="padding:24px 24px 30px;">
      {img(im, 14)}<div style="height:20px;"></div>{h3(t, 20)}<div style="height:8px;"></div>{p(d, size=15)}<div style="height:12px;"></div>{enlace(N["icta"], N["iurl"])}</td></tr></table>'''
    c += bloque_ademas()
    c += fila(ancha, '36px 0 0')
    c += fila(f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td class="col" width="50%" valign="top" style="padding:10px 5px 0 0;">{media(t1, d1, MINIS[1])}</td>
      <td class="col" width="50%" valign="top" style="padding:10px 0 0 5px;">{media(t2, d2, MINIS[2])}</td></tr></table>''')
    c += promo_oscura()
    return salida('Novedades · Bento', c)


# =============================================================== 5 · MINIMAL CENTRADO
def v5():
    c = logo('center', '40px 0 0')
    c += px(fila(f'''{cabecera("center")}<div style="height:22px;"></div>{titular(58, "center")}
    <div style="height:24px;"></div>{p(N["sub"], m="0 auto", align="center", mw=440)}''', '72px 40px 0'))
    c += fila(img(ENTORNO, 20, False), '56px 0 0')
    c += px(fila(destacada_texto('center'), '40px 60px 0'))
    c += fila(f'<div style="width:40px;height:1px;background:{LINEA};margin:0 auto;"></div>', '80px 0 0')
    c += bloque_ademas('center', 32).replace('88px 40px 0', '64px 40px 0')
    items = ''
    for t, d in N['items']:
        items += (f'<div style="height:40px;"></div>{h3(t, 20, align="center")}<div style="height:8px;"></div>'
                  f'{p(d, size=16, m="0 auto", align="center", mw=400)}<div style="height:12px;"></div>'
                  f'<p style="margin:0;text-align:center;">{enlace(N["icta"], N["iurl"])}</p>')
    c += px(fila(items, '0 40px'))
    c += fila(f'<div style="height:1px;background:{LINEA};"></div>', '80px 40px 0')
    c += px(fila(f'''<p style="margin:0;color:{GRIS};font-size:15px;text-align:center;">{N["ptag"]}</p><div style="height:14px;"></div>
      {titular(36, "center", t1=N["p1"], t2=N["p2"], tag="h2")}<div style="height:16px;"></div>{p(N["ptxt"], m="0 auto", align="center", mw=420, size=16)}
      <div style="height:26px;"></div>{boton(N["pcta"], N["purl"])}''', '72px 40px 0'))
    c += fila(f'<div style="height:1px;background:{LINEA};"></div>', '72px 40px 0')
    return salida('Novedades · Minimal', c, pie_claro())


if __name__ == '__main__':
    for n, fn in enumerate((v1, v2, v3, v4, v5), 1):
        with open(os.path.join(AQUI, f'novedades-v{n}.html'), 'w', encoding='utf-8') as f:
            f.write(fn())
    print('ok')
