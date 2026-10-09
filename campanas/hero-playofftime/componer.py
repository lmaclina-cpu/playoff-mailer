"""Monta el hero de Playoff Time: la foto de fondo y, encima, las tres pantallas en ventanas de liquid glass.

El cristal se hace con la propia foto: se desenfoca lo que queda detrás de cada ventana, se aclara un
poco y se le pone el borde de luz. Por eso hay que componerlo sobre la foto definitiva y no vale un PNG
genérico.

Uso:
    python3 componer.py fondo.jpg            → hero.jpg (1184 px de ancho, el email lo muestra a 592)
    python3 componer.py                      → hero-provisional.jpg, sobre un fondo de prueba

Las pantallas salen de ventanas.html con `node capturar.js`. Para moverlas, se toca VENTANAS.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps

# El hero mide 1184 px de ancho (el email lo muestra a 592). La foto va dentro con un margen blanco
# alrededor, y las ventanas sobresalen por ese margen: se salen de la foto, no se cortan con ella.
ANCHO = 1184
MARGEN = 72
FOTO_W = ANCHO - 2 * MARGEN
FOTO_H = round(FOTO_W * 896 / 1216)   # proporción de la foto de la oficina (1216 × 896)
ALTO = FOTO_H + 2 * MARGEN

# (pantalla, x, y, ancho de la pantalla) en píxeles del hero. Pensado para la foto del chico con el portátil:
# su cara y las manos en el teclado quedan libres; las ventanas tapan techo, ventanas y la silla.
VENTANAS = [
    ('registro.png', 22, 120, 268),
    ('descargar.png', 884, 22, 246),
    ('departamento.png', 852, ALTO - 30 - 317, 280),
]

MARCO = 14          # grosor del cristal alrededor de la pantalla
RADIO_PANTALLA = 44  # el border-radius de .card (22 px) a 2x
DESENFOQUE = 26
BLANCO = 0.30       # cuánto se aclara el cristal


def cubrir(img, w, h):
    """Escala y recorta la foto para que llene el hero sin deformarse."""
    s = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    x, y = (img.width - w) // 2, (img.height - h) // 2
    return img.crop((x, y, x + w, y + h))


def fondo_provisional():
    y, x = np.mgrid[0:ALTO, 0:ANCHO].astype(float)
    a = np.array([142, 197, 252]); b = np.array([243, 214, 196])
    t = ((x / ANCHO) * 0.6 + (y / ALTO) * 0.4)[..., None]
    img = Image.fromarray((a * (1 - t) + b * t).astype('uint8'))
    d = ImageDraw.Draw(img)
    for cx, cy, r, c in [(590, 420, 230, (40, 70, 120)), (300, 650, 160, (250, 170, 120)), (980, 330, 140, (60, 120, 220))]:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=c)
    return img.filter(ImageFilter.GaussianBlur(90))


def mascara_redonda(w, h, r):
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    return m


def ventana(hero, pantalla, x, y, ancho):
    pant = Image.open(pantalla).convert('RGBA')
    f = ancho / pant.width
    pant = pant.resize((ancho, round(pant.height * f)), Image.LANCZOS)
    w, h = ancho + 2 * MARCO, pant.height + 2 * MARCO
    r = round(RADIO_PANTALLA * f) + MARCO
    forma = mascara_redonda(w, h, r)

    # Sombra suave para despegarla de la foto.
    sombra = Image.new('L', hero.size, 0)
    sombra.paste(forma, (x, y + 8))
    sombra = sombra.filter(ImageFilter.GaussianBlur(12)).point(lambda v: v * 0.16)
    hero.paste(Image.new('RGB', hero.size, (10, 20, 40)), (0, 0), sombra)

    # Cristal: lo de detrás, desenfocado, más claro y algo más saturado.
    m = DESENFOQUE * 3
    # Se amplía con blanco para que el cristal que sobresale no recoja negro de fuera del lienzo.
    zona = ImageOps.expand(hero, m, fill=(255, 255, 255)).crop((x, y, x + w + 2 * m, y + h + 2 * m))
    zona = zona.filter(ImageFilter.GaussianBlur(DESENFOQUE))
    zona = ImageEnhance.Color(zona.crop((m, m, m + w, m + h))).enhance(1.2)
    cristal = Image.blend(zona, Image.new('RGB', (w, h), (255, 255, 255)), BLANCO).convert('RGBA')

    # Brillo en diagonal desde arriba a la izquierda.
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    brillo = np.clip(1 - (xx / w * 0.5 + yy / h * 0.9), 0, 1) ** 2 * 70
    luz = Image.new('RGBA', (w, h), (255, 255, 255, 0))
    luz.putalpha(Image.fromarray(brillo.astype('uint8')))
    cristal = Image.alpha_composite(cristal, luz)

    # Borde de luz: más blanco arriba, casi nada abajo.
    borde = Image.new('L', (w, h), 0)
    ImageDraw.Draw(borde).rounded_rectangle((0, 0, w - 1, h - 1), r, outline=255, width=2)
    degradado = (np.linspace(230, 70, h)[:, None] * np.ones((1, w))) / 255
    borde = Image.fromarray((np.array(borde) * degradado).astype('uint8'))
    linea = Image.new('RGBA', (w, h), (255, 255, 255, 0))
    linea.putalpha(borde)
    cristal = Image.alpha_composite(cristal, linea)

    cristal.alpha_composite(pant, (MARCO, MARCO))
    hero.paste(cristal.convert('RGB'), (x, y), forma)


def main():
    if len(sys.argv) > 1:
        foto, salida = cubrir(Image.open(sys.argv[1]).convert('RGB'), FOTO_W, FOTO_H), 'hero.jpg'
    else:
        foto, salida = cubrir(fondo_provisional(), FOTO_W, FOTO_H), 'hero-provisional.jpg'
    # La foto, con las esquinas redondeadas como el resto de fotos del email, sobre el blanco de la tarjeta.
    hero = Image.new('RGB', (ANCHO, ALTO), (255, 255, 255))
    hero.paste(foto, (MARGEN, MARGEN), mascara_redonda(FOTO_W, FOTO_H, 40))
    for v in VENTANAS:
        ventana(hero, *v)
    hero.save(salida, quality=86, optimize=True, progressive=True)
    print(salida)


if __name__ == '__main__':
    main()
