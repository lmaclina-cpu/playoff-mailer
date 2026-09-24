# Prototipos de email

## Webinar: diseño elegido ✅

**`webinar-final.html`** es el diseño aprobado para la plantilla de webinar de la app.
Se genera con `python3 generar_webinar.py` (función `vfinal`). Las `webinar-v1…v5`
fueron las variantes de exploración; no hay que usarlas.

### Sistema de diseño
El de la **home publicada** de la web en Webflow (clases `sp-*`), no el antiguo (`pf-*`):

- Tipografía **Inter**. Titulares en peso **400** con el tracking muy apretado (−0.045em en el H1).
  Lo que va en énfasis del titular se pinta en gris `#8b8e95`.
- Colores: texto `#0b0b0c`, gris de texto `#6b6e75`, líneas `#e4e4e7`, fondo suave `#f3f4f6`,
  tarjeta oscura `#0e1116`, pie `#0b0b0c`. El azul `#006bed` solo en detalles (números de la lista).
- Botones en píldora negra de 48 px (blanca sobre fondo oscuro).
- **Plano: sin sombras en nada.**

### Orden de bloques
1. Logo a la izquierda.
2. Portada alineada a la izquierda: etiqueta | fecha · hora, titular, frase de apoyo y botón.
3. **Imagen sobre imagen**: foto de fondo a sangre (esquinas de 28 px) y, encima, la imagen
   del entorno tal cual se sube, apoyada en el borde de abajo. El email no le dibuja ventana
   ni marco: solo le redondea las esquinas de arriba.
4. Fila Fecha · Hora · Duración entre dos líneas finas.
5. "¿Qué veremos?" a dos columnas: título a la izquierda y lista numerada a la derecha.
6. Ponente: foto redonda de **96 px** con el nombre y el cargo centrados en vertical;
   duración y formato a la derecha.
7. Frase destacada alineada a la izquierda.
8. Cierre en tarjeta oscura sin foto: titular y botón blanco.
9. Pie oscuro.

### Campos nuevos para la app
- **Imagen de fondo**: por defecto, la foto azul de la home.
- **Imagen del entorno**: la captura que representa el tema del webinar. Unos 1200 px de ancho.
- Los textos son los de la plantilla `webinar-ponente` de `plantillas.js`; no cambian.

### En la app ✅
Ya está en la app como **"Webinar · diseño web"** (`webinar-web` en `plantillas.js`), con el
motor visual en `templates-saas.js`. Novedades, como **"Novedades · diseño web"** (`novedades-web`).

### Pendiente
- Las fotos tienen que ir en JPG/PNG en el envío real: Outlook de escritorio no muestra WebP.
- Hacer un envío de prueba desde Brevo (Gmail, Apple Mail y Outlook) antes de usarla.

## Novedades: diseño elegido ✅

**`novedades-final.html`**, generado con `python3 generar_novedades.py` (función `vfinal`).
Las `novedades-v1…v5` fueron exploración. Mismo sistema que el webinar: plano y sin sombras.

### Orden de bloques
1. Logo centrado.
2. Portada centrada: Novedades | mes, titular y frase. **Sin botón**: no hay página de novedades a la que llevar.
3. **Destacada** en tarjeta gris `#f3f4f6` (esquinas de 28 px): etiqueta, titular, texto,
   botón azul y la captura apoyada en el borde de abajo de la tarjeta.
4. "Y además" + titular centrado.
5. **Tres mejoras en tres columnas** (se apilan en el móvil): imagen, título, texto y enlace azul.
   **Las tres imágenes tienen el mismo tamaño**: proporción 4:3. En la app se recortan a 4:3
   al subirlas, para que no descuadre aunque se suban capturas distintas.
6. Banda oscura de Playoff Time y pie oscuro.

Textos: los de la plantilla `novedades-destacada` de `plantillas.js`. El bloque del blog
no está en este diseño.

**"Saber más de este módulo"** en azul Playoff `#006bed`:
- En la destacada, como botón (píldora azul de 40 px).
- En las tres mejoras, **sin píldora**: solo el texto en azul, enlazado.
No hay enlaces "Ver cómo funciona". En escritorio, el texto de cada mejora tiene alto fijo
para que los tres enlaces queden alineados.
