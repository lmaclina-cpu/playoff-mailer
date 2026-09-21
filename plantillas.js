/* Playoff Mailer — las plantillas. Cada una declara sus campos y cómo se pinta. */
(function () {
  'use strict';
  var E = window.PM_EMAIL;
  var LOGO = 'https://img.mailinblue.com/2955928/images/content_library/original/6a55efa8fc35afde1ddd2864.jpg';

  var PRE = { k: 'preheader', label: 'Preheader', type: 'text', max: 110,
    help: 'La línea gris que acompaña al asunto en la bandeja de entrada.' };

  function marca(extra) {
    return {
      titulo: 'Cabecera y pie',
      campos: [
        { k: 'logoUrl', label: 'Logo (URL)', type: 'image', def: LOGO, help: 'Tiene que ser una URL pública: la biblioteca de la web o la de Brevo.' },
        { k: 'footerText', label: 'Texto del pie', type: 'textarea', rows: 2,
          def: 'Software de gestión para federaciones, clubes y academias.' },
        { k: 'footerLink', label: 'Enlace del pie', type: 'text', def: 'playoffinformatica.com' },
        { k: 'footerLinkUrl', label: 'URL de ese enlace', type: 'url', def: 'https://playoffinformatica.com/' },
        { k: 'legal', label: 'Línea legal', type: 'textarea', rows: 2,
          def: 'Recibes este correo porque formas parte de la comunidad Playoff. Playoff Informàtica, Girona.' }
      ].concat(extra || [])
    };
  }
  function datosWebinar() {
    return {
      titulo: 'Datos del webinar',
      campos: [
        { k: 'fecha', label: 'Fecha', type: 'date' },
        { k: 'hora', label: 'Hora', type: 'time', def: '16:00' },
        { k: 'duracion', label: 'Duración', type: 'text', max: 20, def: '60 minutos' },
        { k: 'formato', label: 'Formato', type: 'text', max: 24, def: 'Online y en directo' },
        { k: 'ponente', label: 'Ponente', type: 'text', max: 44, def: '' },
        { k: 'ponenteCargo', label: 'Cargo del ponente', type: 'text', max: 54, def: '' },
        { k: 'ponenteImg', label: 'Foto del ponente', type: 'image', galeria: 'ponentes', help: 'Elige una de las de siempre o sube otra. Se recorta en círculo, así que mejor de cara y centrada. Máximo 8 MB; la app la reduce y la pasa a JPG.' }
      ]
    };
  }
  var AYUDA_ENFASIS = 'Usa **dos asteriscos** para la palabra fuerte y *uno* para cursiva. El salto de línea se respeta.';

  var T = [];

  /* ==================== 1. WEBINAR · ANUNCIO CON PONENTE ==================== */
  T.push({
    id: 'webinar-ponente',
    familia: 'Webinars',
    nombre: 'Anuncio con ponente',
    tagline: 'El envío principal: fecha grande, titular con énfasis, foto del ponente y qué se verá.',
    grupos: [
      { titulo: 'Portada', campos: [
        PRE,
        { k: 'eyebrow', label: 'Etiqueta', type: 'text', max: 34, def: 'Webinar Playoff' },
        { k: 'titular', label: 'Titular', type: 'textarea', rows: 2, max: 90,
          def: 'Una hora para preparar\n*la temporada.*', help: AYUDA_ENFASIS },
        { k: 'subtitular', label: 'Frase de apoyo', type: 'textarea', rows: 3, max: 200,
          def: 'Una sesión práctica y directa para que salgas con las ideas claras y puedas aplicarlas desde el primer día.' },
        { k: 'ctaTexto', label: 'Botón', type: 'text', max: 22, def: 'Reservar plaza' },
        { k: 'ctaUrl', label: 'Enlace de inscripción', type: 'url', def: 'https://playoffinformatica.com/webinars/' }
      ] },
      datosWebinar(),
      { titulo: 'Qué veremos', campos: [
        { k: 'bloqueTitulo', label: 'Título del bloque', type: 'text', max: 60, def: '¿Qué veremos?' },
        { k: 'puntos', label: 'Puntos', type: 'lista', max: 6,
          item: [{ k: 't', label: 'Título', type: 'text', max: 54 }, { k: 'd', label: 'Explicación', type: 'textarea', rows: 2, max: 170 }],
          def: [
            { t: 'Altas y licencias', d: 'Del formulario de inscripción a la ficha del jugador, sin teclear nada dos veces.' },
            { t: 'Cuotas y remesas', d: 'Cobros domiciliados, impagos y recibos desde el mismo sitio.' },
            { t: 'Horarios e instalaciones', d: 'Pistas, equipos y entrenadores encajados sin solapes.' },
            { t: 'Preguntas en directo', d: 'Los últimos quince minutos son para tus dudas.' }
          ] }
      ] },
      { titulo: 'Cierre', campos: [
        { k: 'citaTexto', label: 'Frase destacada', type: 'textarea', rows: 2, max: 140,
          def: 'Si no puedes conectarte,\napúntate igual: enviamos la grabación.' },
        { k: 'citaAutor', label: 'Pie de la frase', type: 'text', max: 44, def: '' },
        { k: 'cierreTitulo', label: 'Titular final', type: 'textarea', rows: 2, max: 70, def: 'Nos vemos\n**en directo.**' },
        { k: 'cierreCta', label: 'Botón final', type: 'text', max: 22, def: 'Apuntarme' },
        { k: 'cierreUrl', label: 'Enlace', type: 'url', def: 'https://playoffinformatica.com/webinars/' }
      ] },
      marca()
    ],
    render: function (d) {
      var h = E.head(String(d.titular || 'Webinar Playoff').replace(/[*\n]/g, ' '), d.preheader || d.subtitular);
      h += E.logo(d, true);
      h += E.seccion(
        E.eyebrow(d.eyebrow) + E.gap(16) + E.dateline(d) + E.gap(14) + E.h1(d.titular) +
        (d.subtitular ? '<p class="lede">' + E.marca(d.subtitular) + '</p>' : '') +
        E.metarow(d) + E.gap(22) + E.btn(d.ctaTexto, d.ctaUrl) + E.ponente(d),
        { top: 30, bottom: 40, align: 'center', fondo: E.C.tintSoft });
      var pts = E.list(d, 'puntos');
      if (pts.length) {
        h += E.seccion(E.h2(d.bloqueTitulo, true) + E.gap(28) + E.rejilla(pts, true, true), { top: 40, bottom: 8, align: 'center' });
      }
      if (d.citaTexto) h += E.seccion(E.cita(d), { top: 18, bottom: 34 });
      h += E.separador();
      h += E.seccion(E.h2(d.cierreTitulo, true) + E.gap(20) + E.btn(d.cierreCta, d.cierreUrl, 'blue'),
        { top: 38, bottom: 40, align: 'center' });
      return h + E.pie(d) + E.cierre();
    }
  });

  /* ==================== 2. WEBINAR · AGENDA EN LISTA ==================== */
  T.push({
    id: 'webinar-agenda',
    familia: 'Webinars',
    nombre: 'Anuncio con agenda',
    tagline: 'Misma portada, pero la sesión desglosada en lista vertical con horas.',
    grupos: [
      { titulo: 'Portada', campos: [
        PRE,
        { k: 'eyebrow', label: 'Etiqueta', type: 'text', max: 34, def: 'Webinar Playoff' },
        { k: 'titular', label: 'Titular', type: 'textarea', rows: 2, max: 90,
          def: 'Cierra el mes\n**en una mañana.**', help: AYUDA_ENFASIS },
        { k: 'subtitular', label: 'Frase de apoyo', type: 'textarea', rows: 3, max: 200,
          def: 'Te enseñamos el circuito completo de cuotas, remesas e impagos con un caso real de una entidad de 400 socios.' },
        { k: 'ctaTexto', label: 'Botón', type: 'text', max: 22, def: 'Reservar plaza' },
        { k: 'ctaUrl', label: 'Enlace de inscripción', type: 'url', def: 'https://playoffinformatica.com/webinars/' }
      ] },
      datosWebinar(),
      { titulo: 'Agenda', campos: [
        { k: 'bloqueTitulo', label: 'Título del bloque', type: 'text', max: 60, def: 'La sesión,\n**minuto a minuto.**' },
        { k: 'puntos', label: 'Bloques de la sesión', type: 'lista', max: 7,
          item: [
            { k: 'tag', label: 'Minuto', type: 'text', max: 12 },
            { k: 't', label: 'Título', type: 'text', max: 60 },
            { k: 'd', label: 'Detalle', type: 'textarea', rows: 2, max: 170 }
          ],
          def: [
            { tag: '00:00', t: 'Cómo está montado el circuito', d: 'De la ficha del socio al recibo, con las decisiones que hay que tomar antes de empezar.' },
            { tag: '00:15', t: 'Generar la remesa del mes', d: 'Filtros, excepciones y el fichero para el banco.' },
            { tag: '00:35', t: 'Qué hacer con los impagos', d: 'Devoluciones, avisos automáticos y segundos intentos de cobro.' },
            { tag: '00:50', t: 'Preguntas en directo', d: 'Traemos las dudas que más nos llegan a soporte.' }
          ] }
      ] },
      { titulo: 'Cierre', campos: [
        { k: 'promoTag', label: 'Etiqueta de la banda', type: 'text', max: 26, def: 'No puedes ese día' },
        { k: 'promoTitulo', label: 'Titular de la banda', type: 'textarea', rows: 2, max: 70, def: 'Apúntate igual.\nTe mandamos la grabación.' },
        { k: 'promoTexto', label: 'Texto de la banda', type: 'textarea', rows: 2, max: 180,
          def: 'Todas las personas inscritas reciben el vídeo y el guion de la sesión al día siguiente.' },
        { k: 'promoCta', label: 'Botón de la banda', type: 'text', max: 22, def: 'Quiero la grabación' },
        { k: 'promoUrl', label: 'Enlace', type: 'url', def: 'https://playoffinformatica.com/webinars/' }
      ] },
      marca()
    ],
    render: function (d) {
      var h = E.head(String(d.titular || 'Webinar Playoff').replace(/[*\n]/g, ' '), d.preheader || d.subtitular);
      h += E.logo(d, true);
      h += E.seccion(
        E.eyebrow(d.eyebrow) + E.gap(16) + E.dateline(d) + E.gap(14) + E.h1(d.titular) +
        (d.subtitular ? '<p class="lede">' + E.marca(d.subtitular) + '</p>' : '') +
        E.metarow(d) + E.gap(22) + E.btn(d.ctaTexto, d.ctaUrl) + E.ponente(d),
        { top: 30, bottom: 40, align: 'center', fondo: E.C.tintSoft });
      var pts = E.list(d, 'puntos');
      if (pts.length) {
        var filas = pts.map(function (it, i) {
          return '<tr><td valign="top" width="72" style="padding:' + (i ? '18px' : '0') + ' 0 0;">' +
            (i ? '<div style="height:1px;background:' + E.C.line + ';margin-bottom:18px;font-size:0;">&nbsp;</div>' : '') +
            '<p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.06em;color:' + E.C.blue + ';">' + E.esc(it.tag || ('0' + (i + 1)).slice(-2)) + '</p></td>' +
            '<td valign="top" style="padding:' + (i ? '18px' : '0') + ' 0 0 18px;">' +
            (i ? '<div style="height:1px;background:' + E.C.line + ';margin-bottom:18px;font-size:0;">&nbsp;</div>' : '') +
            '<p style="margin:0 0 6px;font-size:15px;line-height:1.3;font-weight:800;color:' + E.C.ink + ';">' + E.esc(it.t || '') + '</p>' +
            (it.d ? '<p style="margin:0;font-size:12px;line-height:1.6;color:' + E.C.gray + ';">' + E.marca(it.d) + '</p>' : '') +
            '</td></tr>';
        }).join('');
        h += E.seccion(E.h2(d.bloqueTitulo) + E.gap(24) + '<table role="presentation" width="100%">' + filas + '</table>',
          { top: 42, bottom: 10 });
      }
      h += E.seccion(E.promo(d), { top: 36, bottom: 38 });
      return h + E.pie(d) + E.cierre();
    }
  });

  /* ==================== 3. WEBINAR · RECORDATORIO ==================== */
  T.push({
    id: 'webinar-recordatorio',
    familia: 'Webinars',
    nombre: 'Recordatorio',
    tagline: 'Corto y al grano, para el día antes o unas horas antes.',
    grupos: [
      { titulo: 'Mensaje', campos: [
        PRE,
        { k: 'eyebrow', label: 'Etiqueta', type: 'text', max: 34, def: 'Empieza mañana' },
        { k: 'titular', label: 'Titular', type: 'textarea', rows: 2, max: 70, def: 'Te guardamos\n**la plaza.**', help: AYUDA_ENFASIS },
        { k: 'texto', label: 'Texto', type: 'textarea', rows: 4,
          def: 'Mañana montamos el inicio de temporada en directo: altas, cuotas y horarios en una hora. Si no puedes conectarte, apúntate igual y te enviamos la grabación.' },
        { k: 'ctaTexto', label: 'Botón', type: 'text', max: 22, def: 'Entrar al webinar' },
        { k: 'ctaUrl', label: 'Enlace', type: 'url', def: 'https://playoffinformatica.com/webinars/' },
        { k: 'nota', label: 'Nota bajo el botón', type: 'text', max: 100, def: 'El enlace de acceso te llega por correo quince minutos antes.' }
      ] },
      datosWebinar(),
      marca()
    ],
    render: function (d) {
      var h = E.head(String(d.titular || 'Recordatorio').replace(/[*\n]/g, ' '), d.preheader || d.texto);
      h += E.logo(d, true);
      h += E.seccion(
        E.eyebrow(d.eyebrow) + E.gap(16) + E.dateline(d) + E.gap(14) + E.h1(d.titular) +
        E.metarow(d) + E.gap(22) + E.btn(d.ctaTexto, d.ctaUrl),
        { top: 30, bottom: 36, align: 'center', fondo: E.C.tintSoft });
      h += E.seccion('<p class="lede" style="margin-left:auto;margin-right:auto;">' + E.marca(d.texto) + '</p>' +
        (d.nota ? E.gap(16) + '<p class="meta" style="margin:0;">' + E.esc(d.nota) + '</p>' : ''),
        { top: 34, bottom: 38, align: 'center' });
      h += E.ponente(d) ? E.seccion(E.ponente(d), { top: 0, bottom: 34, align: 'center' }) : '';
      return h + E.pie(d) + E.cierre();
    }
  });

  /* ==================== 4. NOVEDADES · UNA DESTACADA ==================== */
  T.push({
    id: 'novedades-destacada',
    familia: 'Novedades',
    nombre: 'Una destacada y varias rápidas',
    tagline: 'El envío mensual: la novedad del mes en grande y el resto en rejilla.',
    grupos: [
      { titulo: 'Portada', campos: [
        PRE,
        { k: 'eyebrow', label: 'Etiqueta', type: 'text', max: 40, def: 'Novedades · Septiembre 2026' },
        { k: 'titular', label: 'Titular', type: 'textarea', rows: 2, max: 80,
          def: 'Lo nuevo de Playoff,\n**en 2 minutos.**', help: AYUDA_ENFASIS },
        { k: 'subtitular', label: 'Frase de apoyo', type: 'textarea', rows: 3, max: 200,
          def: 'Un cambio protagonista, unas cuantas mejoras rápidas y alguna cosa más que merece la pena tener en el radar.' },
        { k: 'ctaTexto', label: 'Botón', type: 'text', max: 24, def: 'Ver las novedades' },
        { k: 'ctaUrl', label: 'Enlace', type: 'url', def: 'https://playoffinformatica.com/' }
      ] },
      { titulo: 'La novedad del mes', campos: [
        { k: 'destTag', label: 'Etiqueta', type: 'text', max: 26, def: 'La novedad del mes' },
        { k: 'destTitulo', label: 'Titular', type: 'textarea', rows: 2, max: 80, def: 'Las nóminas ya forman parte de tu Time' },
        { k: 'destImg', label: 'Captura', type: 'image', help: 'Horizontal. Súbela desde el ordenador (máximo 8 MB): la app la reduce a 1400 px y la pasa a JPG para que el correo no engorde.' },
        { k: 'destTexto', label: 'Explicación', type: 'textarea', rows: 4,
          def: 'Sube el PDF del mes y Playoff reparte cada nómina a su trabajador. Cada persona se la descarga desde su acceso, sin pasar por administración. Incluido **sin coste** para los clientes del módulo Time.' },
        { k: 'destCta', label: 'Texto del enlace', type: 'text', max: 26, def: 'Ver cómo funciona' },
        { k: 'destUrl', label: 'URL', type: 'url', def: 'https://playoffinformatica.com/' }
      ] },
      { titulo: 'Y además', campos: [
        { k: 'masKicker', label: 'Antetítulo', type: 'text', max: 30, def: 'Y además' },
        { k: 'masTitulo', label: 'Titular del bloque', type: 'textarea', rows: 2, max: 80, def: 'Mejoras pequeñas.\n**Pero muy de agradecer.**' },
        { k: 'items', label: 'Mejoras', type: 'lista', max: 6,
          item: [
            { k: 't', label: 'Título', type: 'text', max: 54 },
            { k: 'd', label: 'Explicación', type: 'textarea', rows: 2, max: 170 },
            { k: 'img', label: 'Captura', type: 'image' },
            { k: 'cta', label: 'Texto del enlace', type: 'text', max: 24 },
            { k: 'ctaUrl', label: 'URL', type: 'url' }
          ],
          def: [
            { t: 'Altas masivas desde Excel', d: 'Sube el listado de la temporada y avisamos de los duplicados antes de guardar nada.' },
            { t: 'Avisos de impago automáticos', d: 'Cuando una remesa vuelve, el recibo queda marcado y sale el aviso al socio.' },
            { t: 'Buscador en la ficha del socio', d: 'Encuentra un recibo o un documento sin bajar por toda la ficha.' },
            { t: 'Exportar a Excel de verdad', d: 'Con las columnas que ves en pantalla, no con las de hace diez años.' }
          ] }
      ] },
      { titulo: 'Banda de producto', campos: [
        { k: 'promoTag', label: 'Etiqueta', type: 'text', max: 26, def: 'Playoff Time' },
        { k: 'promoTitulo', label: 'Titular', type: 'textarea', rows: 2, max: 60, def: 'Tu equipo ficha.\nTú lo ves claro.' },
        { k: 'promoTexto', label: 'Texto', type: 'textarea', rows: 2, max: 180,
          def: 'Control horario pensado para que registrar entradas, salidas y pausas no sea otra tarea más.' },
        { k: 'promoCta', label: 'Botón', type: 'text', max: 24, def: 'Conocer Playoff Time' },
        { k: 'promoUrl', label: 'Enlace', type: 'url', def: 'https://playoffinformatica.com/' }
      ] },
      { titulo: 'Blog', campos: [
        { k: 'blogKicker', label: 'Antetítulo', type: 'text', max: 30, def: 'Para seguir al día' },
        { k: 'blogTitulo', label: 'Titular', type: 'text', max: 40, def: 'Últimos del blog' },
        { k: 'blog', label: 'Artículos', type: 'lista', max: 4,
          item: [
            { k: 't', label: 'Titular', type: 'text', max: 80 },
            { k: 'd', label: 'Una línea', type: 'text', max: 120 },
            { k: 'ctaUrl', label: 'Enlace', type: 'url' }
          ],
          def: [
            { t: 'Checklist de inicio de temporada', d: '32 puntos para no dejarte nada en septiembre.', ctaUrl: 'https://playoffinformatica.com/blog/' },
            { t: 'Qué declara un club sin ánimo de lucro', d: 'Modelos, plazos y los errores más habituales.', ctaUrl: 'https://playoffinformatica.com/blog/' }
          ] }
      ] },
      marca()
    ],
    render: function (d) {
      var h = E.head(String(d.titular || 'Novedades Playoff').replace(/[*\n]/g, ' '), d.preheader || d.subtitular);
      h += E.logo(d, true);
      h += E.seccion(
        E.eyebrow(d.eyebrow) + E.gap(18) + E.h1(d.titular) +
        (d.subtitular ? '<p class="lede">' + E.marca(d.subtitular) + '</p>' : '') +
        E.gap(24) + E.btn(d.ctaTexto, d.ctaUrl),
        { top: 30, bottom: 40, align: 'center', fondo: E.C.tintSoft });
      h += E.seccion(E.tarjetaGrande({ tag: d.destTag, t: d.destTitulo, d: d.destTexto, img: d.destImg, cta: d.destCta, ctaUrl: d.destUrl }),
        { top: 36, bottom: 6 });
      var its = E.list(d, 'items');
      if (its.length) {
        h += E.seccion(E.kicker(d.masKicker) + E.gap(10) + E.h2(d.masTitulo), { top: 40, bottom: 24 });
        h += E.seccion(E.rejilla(its, false), { top: 0, bottom: 10 });
      }
      if (d.promoTitulo) h += E.seccion(E.promo(d), { top: 26, bottom: 32 });
      var blog = E.list(d, 'blog');
      if (blog.length) h += E.seccion(E.cajaBlog(d, blog), { top: 0, bottom: 38 });
      return h + E.pie(d) + E.cierre();
    }
  });

  /* ==================== 5. NOVEDADES · ALTERNADAS ==================== */
  T.push({
    id: 'novedades-alternadas',
    familia: 'Novedades',
    nombre: 'Tres novedades alternadas',
    tagline: 'Tres cambios del mismo peso, con captura a izquierda y derecha.',
    grupos: [
      { titulo: 'Portada', campos: [
        PRE,
        { k: 'eyebrow', label: 'Etiqueta', type: 'text', max: 40, def: 'Novedades · Septiembre 2026' },
        { k: 'titular', label: 'Titular', type: 'textarea', rows: 2, max: 80, def: 'Tres cosas nuevas\n**en tu plataforma.**', help: AYUDA_ENFASIS },
        { k: 'subtitular', label: 'Frase de apoyo', type: 'textarea', rows: 3, max: 200,
          def: 'Nada que tengas que instalar ni configurar: ya está en tu Playoff desde esta semana.' }
      ] },
      { titulo: 'Novedades', campos: [
        { k: 'items', label: 'Novedades', type: 'lista', max: 5,
          item: [
            { k: 'tag', label: 'Módulo', type: 'text', max: 22 },
            { k: 't', label: 'Titular', type: 'text', max: 60 },
            { k: 'd', label: 'Explicación', type: 'textarea', rows: 3, max: 230 },
            { k: 'img', label: 'Captura', type: 'image' },
            { k: 'cta', label: 'Texto del enlace', type: 'text', max: 24 },
            { k: 'ctaUrl', label: 'URL', type: 'url' }
          ],
          def: [
            { tag: 'Asociados', t: 'Altas masivas desde Excel', d: 'Sube el listado de la temporada y Playoff crea las fichas, avisando de los duplicados antes de guardar nada.', cta: 'Ver cómo funciona', ctaUrl: 'https://playoffinformatica.com/' },
            { tag: 'Time', t: 'Nóminas en el área del trabajador', d: 'Cada persona descarga sus nóminas desde su acceso, sin pedírtelas a ti por WhatsApp.', cta: 'Ver cómo funciona', ctaUrl: 'https://playoffinformatica.com/' },
            { tag: 'Cuotas', t: 'Avisos de impago automáticos', d: 'Cuando una remesa vuelve, el recibo queda marcado y sale el aviso al socio sin que tengas que revisarlo.', cta: 'Ver cómo funciona', ctaUrl: 'https://playoffinformatica.com/' }
          ] }
      ] },
      { titulo: 'Cierre', campos: [
        { k: 'cierreKicker', label: 'Antetítulo', type: 'text', max: 34, def: 'Más Playoff, menos vueltas' },
        { k: 'cierreTitulo', label: 'Titular', type: 'textarea', rows: 2, max: 70, def: 'Pequeños cambios.\n**Un día a día más fácil.**' },
        { k: 'cierreTexto', label: 'Texto', type: 'textarea', rows: 3, max: 220,
          def: 'Muchas de estas mejoras salen de vuestras llamadas a soporte. Si echas algo en falta, cuéntanoslo.' },
        { k: 'cierreCta', label: 'Botón', type: 'text', max: 24, def: 'Proponer una mejora' },
        { k: 'cierreUrl', label: 'Enlace', type: 'url', def: 'mailto:info@playoffinformatica.com?subject=Propuesta%20de%20mejora' }
      ] },
      marca()
    ],
    render: function (d) {
      var h = E.head(String(d.titular || 'Novedades Playoff').replace(/[*\n]/g, ' '), d.preheader || d.subtitular);
      h += E.logo(d, true);
      h += E.seccion(
        E.eyebrow(d.eyebrow) + E.gap(18) + E.h1(d.titular) +
        (d.subtitular ? '<p class="lede">' + E.marca(d.subtitular) + '</p>' : ''),
        { top: 30, bottom: 38, align: 'center', fondo: E.C.tintSoft });
      E.list(d, 'items').forEach(function (it, i) {
        h += E.seccion((i ? '<div style="height:1px;background:' + E.C.line + ';margin-bottom:30px;font-size:0;">&nbsp;</div>' : '') +
          E.fila(it, i % 2 === 1), { top: i ? 30 : 38, bottom: 0 });
      });
      h += E.seccion(E.kicker(d.cierreKicker) + E.gap(10) + E.h2(d.cierreTitulo, true) +
        (d.cierreTexto ? '<p class="lede">' + E.marca(d.cierreTexto) + '</p>' : '') +
        E.gap(22) + E.btn(d.cierreCta, d.cierreUrl, 'blue'),
        { top: 44, bottom: 40, align: 'center' });
      return h + E.pie(d) + E.cierre();
    }
  });

  /* ==================== 6. NOVEDADES · LANZAMIENTO ==================== */
  T.push({
    id: 'novedades-lanzamiento',
    familia: 'Novedades',
    nombre: 'Lanzamiento de una funcionalidad',
    tagline: 'Una sola novedad grande: qué es, qué aporta y cómo activarla.',
    grupos: [
      { titulo: 'Portada', campos: [
        PRE,
        { k: 'eyebrow', label: 'Etiqueta', type: 'text', max: 34, def: 'Nueva funcionalidad' },
        { k: 'titular', label: 'Titular', type: 'textarea', rows: 2, max: 80, def: 'Las nóminas ya forman\n**parte de tu Time.**', help: AYUDA_ENFASIS },
        { k: 'subtitular', label: 'Frase de apoyo', type: 'textarea', rows: 3, max: 200,
          def: 'Disponible desde hoy en tu plataforma, sin coste adicional para los clientes del módulo Time.' },
        { k: 'heroImg', label: 'Captura principal', type: 'image', help: 'Se coloca justo debajo del titular. Horizontal, máximo 8 MB: la app la optimiza al subirla.' },
        { k: 'ctaTexto', label: 'Botón', type: 'text', max: 22, def: 'Quiero activarlo' },
        { k: 'ctaUrl', label: 'Enlace', type: 'url', def: 'mailto:info@playoffinformatica.com?subject=Quiero%20activar%20la%20nueva%20funcionalidad' }
      ] },
      { titulo: 'Qué aporta', campos: [
        { k: 'bloqueTitulo', label: 'Título del bloque', type: 'textarea', rows: 2, max: 70, def: 'Todo tu personal,\n**en un solo lugar.**' },
        { k: 'items', label: 'Ventajas', type: 'lista', max: 4,
          item: [{ k: 't', label: 'Título', type: 'text', max: 54 }, { k: 'd', label: 'Explicación', type: 'textarea', rows: 2, max: 170 }],
          def: [
            { t: 'Gestión laboral completa', d: 'Contratos, nóminas y personal en la misma ficha que ya usas para el resto de la entidad.' },
            { t: 'Sube las nóminas de golpe', d: 'Arrastra el PDF del mes y Playoff reparte cada nómina a su trabajador.' },
            { t: 'Cada uno ve la suya', d: 'El trabajador entra a su área y se descarga las suyas sin pedírtelas.' },
            { t: 'Sin coste adicional', d: 'Incluido para todas las entidades que ya tienen el módulo Time.' }
          ] }
      ] },
      { titulo: 'Cierre', campos: [
        { k: 'promoTag', label: 'Etiqueta de la banda', type: 'text', max: 26, def: 'Lo activamos contigo' },
        { k: 'promoTitulo', label: 'Titular de la banda', type: 'textarea', rows: 2, max: 60, def: 'Sin configurar nada.\nLo dejamos listo.' },
        { k: 'promoTexto', label: 'Texto', type: 'textarea', rows: 2, max: 180,
          def: 'Escríbenos y tu técnico lo deja funcionando en tu plataforma. Media hora y a correr.' },
        { k: 'promoCta', label: 'Botón', type: 'text', max: 24, def: 'Hablar con mi técnico' },
        { k: 'promoUrl', label: 'Enlace', type: 'url', def: 'mailto:info@playoffinformatica.com' }
      ] },
      marca()
    ],
    render: function (d) {
      var h = E.head(String(d.titular || 'Nueva funcionalidad').replace(/[*\n]/g, ' '), d.preheader || d.subtitular);
      h += E.logo(d, true);
      h += E.seccion(
        E.eyebrow(d.eyebrow) + E.gap(18) + E.h1(d.titular) +
        (d.subtitular ? '<p class="lede">' + E.marca(d.subtitular) + '</p>' : '') +
        E.gap(24) + E.btn(d.ctaTexto, d.ctaUrl),
        { top: 30, bottom: 36, align: 'center', fondo: E.C.tintSoft });
      if (d.heroImg) {
        h += E.seccion('<img src="' + E.url(d.heroImg) + '" alt="" width="556" style="width:100%;height:auto;border-radius:18px;border:1px solid ' + E.C.lineSoft + ';">',
          { top: 30, bottom: 0 });
      }
      var its = E.list(d, 'items');
      if (its.length) h += E.seccion(E.h2(d.bloqueTitulo, true) + E.gap(28) + E.rejilla(its, true, true), { top: 40, bottom: 6, align: 'center' });
      h += E.seccion(E.promo(d), { top: 30, bottom: 38 });
      return h + E.pie(d) + E.cierre();
    }
  });

  /* ==================== 7. NEWSLETTER · EDITORIAL ==================== */
  T.push({
    id: 'newsletter-editorial',
    familia: 'Newsletter',
    nombre: 'Newsletter con tema principal',
    tagline: 'Un tema que abre, artículos secundarios y un recurso descargable al cierre.',
    grupos: [
      { titulo: 'Apertura', campos: [
        PRE,
        { k: 'eyebrow', label: 'Etiqueta', type: 'text', max: 40, def: 'La newsletter de Playoff · Nº 12' },
        { k: 'titular', label: 'Titular', type: 'textarea', rows: 2, max: 80, def: 'Septiembre,\n**el mes de todo a la vez.**', help: AYUDA_ENFASIS },
        { k: 'saludo', label: 'Entrada', type: 'textarea', rows: 4,
          def: 'Licencias, cuotas, horarios y un teléfono que no para. Este mes hemos escrito sobre cómo llegar a octubre sin haber perdido tres sábados por el camino.' }
      ] },
      { titulo: 'Tema principal', campos: [
        { k: 'destTag', label: 'Sección', type: 'text', max: 24, def: 'Inicio de temporada' },
        { k: 'destTitulo', label: 'Titular', type: 'textarea', rows: 2, max: 80, def: 'Checklist de inicio de temporada' },
        { k: 'destImg', label: 'Portada', type: 'image' },
        { k: 'destTexto', label: 'Entradilla', type: 'textarea', rows: 4,
          def: '32 puntos para no dejarte nada: desde revisar las licencias federativas hasta cerrar los horarios de instalaciones. Es el que usamos con las entidades que arrancan en septiembre.' },
        { k: 'destCta', label: 'Texto del enlace', type: 'text', max: 26, def: 'Leer el artículo' },
        { k: 'destUrl', label: 'Enlace', type: 'url', def: 'https://playoffinformatica.com/blog/' }
      ] },
      { titulo: 'También en el blog', campos: [
        { k: 'masKicker', label: 'Antetítulo', type: 'text', max: 30, def: 'También este mes' },
        { k: 'masTitulo', label: 'Titular del bloque', type: 'textarea', rows: 2, max: 70, def: 'Tres lecturas más.\n**Cortas, lo prometemos.**' },
        { k: 'items', label: 'Artículos', type: 'lista', max: 4,
          item: [
            { k: 'tag', label: 'Sección', type: 'text', max: 22 },
            { k: 't', label: 'Titular', type: 'text', max: 70 },
            { k: 'd', label: 'Resumen', type: 'textarea', rows: 2, max: 170 },
            { k: 'img', label: 'Portada', type: 'image' },
            { k: 'cta', label: 'Texto del enlace', type: 'text', max: 20 },
            { k: 'ctaUrl', label: 'URL', type: 'url' }
          ],
          def: [
            { tag: 'Fiscalidad', t: 'Qué declara un club sin ánimo de lucro', d: 'Modelos, plazos y los tres errores que más vemos en juntas nuevas.', cta: 'Leer', ctaUrl: 'https://playoffinformatica.com/blog/' },
            { tag: 'Registro horario', t: 'La reforma y los entrenadores a tiempo parcial', d: 'Qué hay que registrar y cómo se justifica ante una inspección.', cta: 'Leer', ctaUrl: 'https://playoffinformatica.com/blog/' }
          ] }
      ] },
      { titulo: 'Cierre', campos: [
        { k: 'promoTag', label: 'Etiqueta', type: 'text', max: 26, def: 'Descargable' },
        { k: 'promoTitulo', label: 'Titular', type: 'textarea', rows: 2, max: 60, def: 'La guía fiscal para\nentidades deportivas.' },
        { k: 'promoTexto', label: 'Texto', type: 'textarea', rows: 2, max: 180,
          def: 'Un PDF con el calendario fiscal del año y los modelos que toca presentar. Gratis y sin formularios raros.' },
        { k: 'promoCta', label: 'Botón', type: 'text', max: 24, def: 'Descargar la guía' },
        { k: 'promoUrl', label: 'Enlace', type: 'url', def: 'https://playoffinformatica.com/blog/' }
      ] },
      marca()
    ],
    render: function (d) {
      var h = E.head(String(d.titular || 'Newsletter Playoff').replace(/[*\n]/g, ' '), d.preheader || d.saludo);
      h += E.logo(d, true);
      h += E.seccion(
        E.eyebrow(d.eyebrow) + E.gap(18) + E.h1(d.titular) +
        (d.saludo ? '<p class="lede">' + E.marca(d.saludo) + '</p>' : ''),
        { top: 30, bottom: 36, align: 'center', fondo: E.C.tintSoft });
      h += E.seccion(E.tarjetaGrande({ tag: d.destTag, t: d.destTitulo, d: d.destTexto, img: d.destImg, cta: d.destCta, ctaUrl: d.destUrl }),
        { top: 34, bottom: 6 });
      var its = E.list(d, 'items');
      if (its.length) {
        h += E.seccion(E.kicker(d.masKicker) + E.gap(10) + E.h2(d.masTitulo), { top: 40, bottom: 24 });
        h += E.seccion(E.rejilla(its, false), { top: 0, bottom: 10 });
      }
      h += E.seccion(E.promo(d), { top: 28, bottom: 38 });
      return h + E.pie(d) + E.cierre();
    }
  });

  /* ==================== 8. NEWSLETTER · BREVE ==================== */
  T.push({
    id: 'newsletter-breve',
    familia: 'Newsletter',
    nombre: 'Newsletter breve',
    tagline: 'Solo titulares con enlace. Se lee en treinta segundos.',
    grupos: [
      { titulo: 'Cabecera', campos: [
        PRE,
        { k: 'eyebrow', label: 'Etiqueta', type: 'text', max: 40, def: 'Playoff en tres minutos' },
        { k: 'titular', label: 'Titular', type: 'textarea', rows: 2, max: 70, def: 'Lo que ha pasado\n**este mes.**', help: AYUDA_ENFASIS },
        { k: 'intro', label: 'Entrada', type: 'textarea', rows: 2, max: 160, def: 'Cuatro enlaces y te dejamos en paz hasta el mes que viene.' }
      ] },
      { titulo: 'Titulares', campos: [
        { k: 'items', label: 'Enlaces', type: 'lista', max: 7,
          item: [
            { k: 'tag', label: 'Sección', type: 'text', max: 22 },
            { k: 't', label: 'Titular', type: 'text', max: 80 },
            { k: 'd', label: 'Una línea', type: 'text', max: 130 },
            { k: 'ctaUrl', label: 'Enlace', type: 'url' }
          ],
          def: [
            { tag: 'Blog', t: 'Checklist de inicio de temporada', d: '32 puntos para no dejarte nada en septiembre.', ctaUrl: 'https://playoffinformatica.com/blog/' },
            { tag: 'Producto', t: 'Nóminas, ya disponible en Time', d: 'Incluido para todos los clientes del módulo.', ctaUrl: 'https://playoffinformatica.com/' },
            { tag: 'Webinar', t: 'Prepara la temporada sin perder un sábado', d: 'Una hora en directo, con grabación para los inscritos.', ctaUrl: 'https://playoffinformatica.com/webinars/' }
          ] }
      ] },
      { titulo: 'Cierre', campos: [
        { k: 'cierreTexto', label: 'Despedida', type: 'textarea', rows: 2, max: 180,
          def: 'Si algo de esto te sirve, reenvíalo a quien lleve la administración de tu entidad.' },
        { k: 'cierreCta', label: 'Botón', type: 'text', max: 24, def: 'Ver todo el blog' },
        { k: 'cierreUrl', label: 'Enlace', type: 'url', def: 'https://playoffinformatica.com/blog/' }
      ] },
      marca()
    ],
    render: function (d) {
      var h = E.head(String(d.titular || 'Newsletter Playoff').replace(/[*\n]/g, ' '), d.preheader || d.intro);
      h += E.logo(d, true);
      h += E.seccion(
        E.eyebrow(d.eyebrow) + E.gap(18) + E.h1(d.titular) +
        (d.intro ? '<p class="lede">' + E.marca(d.intro) + '</p>' : ''),
        { top: 30, bottom: 34, align: 'center', fondo: E.C.tintSoft });
      var its = E.list(d, 'items');
      if (its.length) {
        var filas = its.map(function (it, i) {
          return '<tr>' +
            '<td valign="top" width="42" style="padding:' + (i ? '20px' : '0') + ' 0 0;">' +
            (i ? '<div style="height:1px;background:' + E.C.line + ';margin-bottom:20px;font-size:0;">&nbsp;</div>' : '') +
            '<p style="margin:0;font-size:12px;font-weight:800;color:' + E.C.blue + ';">' + ('0' + (i + 1)).slice(-2) + '</p></td>' +
            '<td valign="top" style="padding:' + (i ? '20px' : '0') + ' 0 0;">' +
            (i ? '<div style="height:1px;background:' + E.C.line + ';margin-bottom:20px;font-size:0;">&nbsp;</div>' : '') +
            (it.tag ? '<p style="margin:0 0 6px;font-size:9px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:' + E.C.gray + ';">' + E.esc(it.tag) + '</p>' : '') +
            '<a href="' + E.url(it.ctaUrl) + '" style="font-size:16px;line-height:1.3;font-weight:800;color:' + E.C.ink + ';">' + E.esc(it.t || '') + '</a>' +
            (it.d ? '<p style="margin:6px 0 0;font-size:12px;line-height:1.55;color:' + E.C.gray + ';">' + E.esc(it.d) + '</p>' : '') +
            '</td></tr>';
        }).join('');
        h += E.seccion('<table role="presentation" width="100%">' + filas + '</table>', { top: 36, bottom: 0 });
      }
      h += E.seccion((d.cierreTexto ? '<p class="lede">' + E.marca(d.cierreTexto) + '</p>' + E.gap(20) : '') +
        E.btn(d.cierreCta, d.cierreUrl, 'ghost'), { top: 40, bottom: 40, align: 'center' });
      return h + E.pie(d) + E.cierre();
    }
  });

  /* ---------------- API ---------------- */
  var byId = {};
  T.forEach(function (t) { byId[t.id] = t; });
  function campos(t) {
    var out = [];
    t.grupos.forEach(function (g) { g.campos.forEach(function (c) { out.push(c); }); });
    return out;
  }
  function defaults(t) {
    var d = {};
    campos(t).forEach(function (c) {
      if (c.type === 'lista') d[c.k] = JSON.parse(JSON.stringify(c.def || []));
      else d[c.k] = c.def == null ? '' : c.def;
    });
    if (campos(t).some(function (c) { return c.k === 'fecha'; }) && !d.fecha) {
      var f = new Date(); f.setDate(f.getDate() + 14);
      d.fecha = f.getFullYear() + '-' + ('0' + (f.getMonth() + 1)).slice(-2) + '-' + ('0' + f.getDate()).slice(-2);
    }
    return d;
  }
  window.PM_PLANTILLAS = { lista: T, byId: byId, campos: campos, defaults: defaults };
})();
