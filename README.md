# Playoff Mailer

App de escritorio para montar los emails de Playoff sin pelearse con el editor de
Brevo: eliges una plantilla, cambias textos, fotos y enlaces, y la app crea la
campaña **en borrador** en Brevo para terminar allí el envío.

Ocho plantillas en tres familias —webinars, novedades y newsletter— con el diseño
cerrado y probado para cliente de correo. Funciona en macOS con el Python que ya
trae el sistema: no hay nada que instalar.

![Playoff](https://img.shields.io/badge/uso-interno%20Playoff-006BED)

## Abrirla

Doble clic en **`Playoff Mailer.command`**. Si lo has descargado de GitHub y el
Mac no te deja abrirlo, dale permiso una vez desde la Terminal:
`chmod +x "Playoff Mailer.command"`. Se abre una ventana negra de Terminal
(no la cierres mientras trabajas) y la app se abre sola en el navegador.
Para cerrar: cierra la ventana negra.

La primera vez, macOS puede decir que no puede abrirlo por ser de un desarrollador
no identificado: clic derecho sobre el archivo → *Abrir* → *Abrir*.

## Dos maneras de usarla

**En el ordenador de cada uno**: doble clic en el lanzador, como se explica arriba.
Cada persona con su clave y sus envíos.

**Como web del equipo** (recomendado si sois varios): desplegada en Render, con un
enlace que abre cualquiera. La configuración la pone el administrador una sola vez
y los envíos guardados son comunes (viven en Supabase). Ver *Ponerla en internet*.

## Entrar

La app pide un correo **@playoffinformatica.com** y te manda un código de seis
cifras a ese buzón. El código caduca a los 10 minutos y tienes 5 intentos.
La sesión dura 30 días en ese ordenador; con **Salir** se cierra al momento.

El código se envía con Brevo, así que la primera vez que abras la app te pedirá
la clave de Brevo antes de poder entrar. El correo sale desde el primer remitente
verificado que tengas en la cuenta.

Cada persona se instala la app en su ordenador. Los envíos guardan quién los creó
y ese nombre aparece en la lista de la portada.

## Conectar Brevo (solo la primera vez)

1. En Brevo: **Ajustes → SMTP y API → Claves API** → crea una clave nueva.
2. En la app: la pantalla de entrada te la pide la primera vez. Después se cambia
   desde el botón **Conexión con Brevo** de la portada.

La clave se guarda en tu ordenador, en `~/.playoff-mailer/config.json`.
No viaja a ningún sitio más que a Brevo. Si quieres cortar el acceso, borra la
clave desde Brevo.

## El día a día

1. Elige plantilla.
2. Cambia los textos. En los titulares, `**así**` pone una palabra en negrita y
   `*así*` en cursiva: es lo que da el contraste de los titulares.
3. Las fotos, tres maneras:
   - **Biblioteca**: elige una que ya esté en la web.
   - **Subir**: coge una del ordenador, la publica en la biblioteca de la web y
     pone su dirección. Máximo 8 MB; la app la reduce a 1400 px de ancho y la pasa
     a JPG (a PNG si viene recortada, para no perder la transparencia).
   - Pegar una dirección a mano, por ejemplo de la biblioteca de Brevo.

   En las plantillas de webinar, el campo *Foto del ponente* tiene además las
   **caras de siempre** debajo: un clic y se pone. La primera vez que usas una, se
   publica sola en la web y ya se queda guardada para las próximas.
4. **Mandar a Brevo** → eliges remitente y lista → se crea la campaña en borrador.
   No se envía nada: el asunto definitivo, la lista y la hora los terminas en Brevo.

Los envíos se guardan solos en `~/.playoff-mailer/borradores/` y salen en la
portada de la app para reutilizarlos el mes siguiente, con el nombre de quien los
creó.

## Qué guarda la app en tu ordenador

Todo vive en `~/.playoff-mailer/`: la clave de Brevo y las credenciales de la web
en `config.json`, tu sesión en `sesion.json` y los envíos en `borradores/`.
Nada de esto sale de tu ordenador salvo las llamadas a Brevo y a la web.

## Subir imágenes: configurarlo una vez

Botón **Subida de imágenes** en la portada. Pide tu usuario de WordPress y una
**contraseña de aplicación** (no la de entrar): en WordPress, *Usuarios → Perfil →
Contraseñas de aplicación*, creas una llamada "Playoff Mailer". Se guarda en
`~/.playoff-mailer/config.json`, en este ordenador.

Sin esto, los botones *Subir* y las caras de siempre te pedirán configurarlo. Si
prefieres no darlo, puedes seguir subiendo las fotos a Brevo a mano y pegar la URL.

Para cambiar las caras fijas: deja o quita archivos en la carpeta `ponentes/`. El
nombre del archivo es el que se ve al pasar el ratón, así que `paula-lopez.png` se
lee mejor que `ponente-1.webp`.

## Por qué las imágenes no van incrustadas

Las plantillas originales llevaban las fotos en base64 dentro del HTML y pesaban
3 MB. Gmail corta los correos a partir de ~102 KB (sale el "ver mensaje completo"
y se pierde el final, seguimiento incluido) y descarta las imágenes incrustadas.
Con URL pública, cada envío pesa unos 10 KB.

## Ponerla en internet (Render + Supabase)

Todo gratis. **Render** tiene la app en marcha; **Supabase** guarda los envíos del
equipo y las imágenes de los correos (el disco de Render se borra en cada reinicio,
por eso hace falta). No depende de WordPress.

**1. Supabase (una vez, 5 minutos)**
1. En [supabase.com](https://supabase.com), crea una cuenta y un proyecto nuevo
   (región: Europa). Guarda la contraseña de la base de datos, aunque la app no la usa.
2. **SQL Editor → New query**: pega el contenido de `supabase.sql` y dale a **Run**.
   Crea la tabla de envíos y el almacén público `imagenes`.
3. **Project Settings → API** (o *API Keys*): copia
   - la **Project URL** (`https://xxxx.supabase.co`) → será `SUPABASE_URL`;
   - la clave **secreta** (`service_role` o `sb_secret_…`) → será `SUPABASE_KEY`.
   Esa clave es como una contraseña: solo va en Render, nunca en el código ni en un chat.

**2. Render**
1. En [render.com](https://render.com), entra con la cuenta de GitHub.
2. **New → Blueprint**, elige el repositorio `playoff-mailer`. Render lee
   `render.yaml` y monta el servicio solo.
3. Rellena las variables: `BREVO_KEY`, `SUPABASE_URL` y `SUPABASE_KEY`.
   `SECRETO_SESION` la genera Render sola.
4. Deploy. El enlace queda tipo `playoff-mailer.onrender.com`.

A partir de ahí, quien tenga correo `@playoffinformatica.com` entra con su código.
Las claves quedan en el servidor: la app no las pide a nadie.

**3. Que Supabase no se duerma (recomendado)**
El plan gratis de Supabase pausa el proyecto tras una semana sin uso. En GitHub,
**Settings → Secrets and variables → Actions → New repository secret**, crea
`SUPABASE_URL` y `SUPABASE_KEY` (los mismos valores). El archivo
`.github/workflows/supabase-despierto.yml` le hace una consulta al día y lo mantiene activo.

**Cambios después de publicarla**: cada vez que se sube un cambio a la rama `main`
de GitHub, Render vuelve a desplegar la app solo, en un par de minutos. No hay que
tocar nada en Render.

**Del plan gratis de Render**: el servicio se duerme tras 15 minutos sin uso, así
que la primera visita del día tarda medio minuto en cargar. Las siguientes van
normales. Los envíos y las imágenes no se pierden: están en Supabase.

## Ficheros

- `index.html`, `app.js` — la interfaz.
- `templates.js` — el sistema visual de los emails (colores, tipos, bloques).
- `plantillas.js` — las 8 plantillas: qué campos tiene cada una y cómo se pinta.
- `servidor.py` — el servidor: sirve la app, guarda los envíos y habla con Brevo
  y con WordPress. El mismo archivo vale en el Mac y en el hosting.
- `requirements.txt`, `render.yaml` — lo que necesita Render para desplegarla.
- `wordpress-snippet.php` — el tipo de contenido donde se guardan los envíos.
- `ponentes/` — las fotos fijas que salen en el selector de webinars.
- `ref/` — las plantillas originales del zip, como referencia.

Para añadir una plantilla nueva o cambiar un bloque, se toca `plantillas.js`.
