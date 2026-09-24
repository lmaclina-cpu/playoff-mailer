/* Playoff Mailer — sistema visual de las plantillas "de siempre".
   Mantiene los mismos bloques y la misma API que antes (E.h1, E.rejilla, E.promo…), pero
   con el diseño de la web nueva, el mismo de templates-saas.js: Inter con titulares en peso
   400 muy apretados, negro, grises, tarjetas planas de 28 px y el azul solo como acento.
   Sin degradados ni sombras. Tablas + estilos en línea, como los envíos actuales. */
(function () {
  'use strict';

  // Nombres de siempre (las plantillas los usan en línea) con los colores nuevos.
  var C = {
    blue: '#006bed', blueInk: '#0b0b0c', ink: '#0b0b0c', inkMid: '#55585f',
    gray: '#6b6e75', grayLight: '#8b8e95',
    line: '#e4e4e7', lineSoft: '#e4e4e7',
    tint: '#eaf2ff', tintSoft: '#f3f4f6', paper: '#ffffff',
    outer: '#ffffff', foot: '#0b0b0c', black: '#0b0b0c',
    suave: '#f3f4f6', oscuro: '#0e1116', grisOscuro: '#9aa0aa'
  };
  var FF = "Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // **negrita** y *cursiva*. En los titulares (h1, h2) salen en gris: el énfasis del diseño nuevo.
  function marca(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  }
  function nl(s) { return marca(s).replace(/\r?\n/g, '<br>'); }
  function url(u) {
    var v = String(u || '').trim();
    if (!v) return '#';
    if (/^(https?:|mailto:|tel:|#|\/|\{\{)/i.test(v)) return esc(v);
    return esc('https://' + v);
  }
  function list(d, k) {
    var v = d[k];
    return Array.isArray(v) ? v.filter(function (i) { return i && (i.t || i.d || i.img); }) : [];
  }
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  function fecha(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim());
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  function fechaCorta(iso) { var d = fecha(iso); return d ? d.getDate() + ' ' + MESES[d.getMonth()] : ''; }
  function fechaDia(iso) {
    var d = fecha(iso);
    if (!d) return '';
    var t = DIAS[d.getDay()];
    return t.charAt(0).toUpperCase() + t.slice(1) + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
  }

  /* Hueco de imagen: en la vista previa de la app, un recuadro que avisa de que falta.
     En el correo que se manda no sale nada (la app pone PM_VISTA solo mientras previsualiza). */
  function enVista() { return !!(typeof window !== 'undefined' && window.PM_VISTA); }
  function falta(alto, texto, redondeo) {
    if (!enVista()) return '';
    return '<div style="height:' + (alto || 180) + 'px;border:2px dashed #d4d4d8;border-radius:' + (redondeo == null ? 16 : redondeo) + 'px;' +
      'background:#fafafa;display:flex;align-items:center;justify-content:center;text-align:center;' +
      'font-family:' + FF + ';font-size:14px;line-height:1.4;color:#8b8e95;padding:0 12px;">' +
      '<span>&#128444;&#65039;&nbsp; ' + esc(texto || 'Falta la imagen') + '</span></div>';
  }

  /* ---------------- documento ---------------- */
  function head(titulo, preheader) {
    return '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<meta name="x-apple-disable-message-reformatting">\n' +
      '<title>' + esc(titulo) + '</title>\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">\n<style>\n' +
      '  *{box-sizing:border-box}\n' +
      '  html,body{margin:0;padding:0;background:#ffffff}\n' +
      '  body{font-family:' + FF + ';color:' + C.ink + ';-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%}\n' +
      '  table{border-collapse:separate;border-spacing:0}\n' +
      '  img{display:block;border:0;max-width:100%;height:auto}\n' +
      '  a{text-decoration:none;color:inherit}\n' +
      '  .page{width:100%;padding:0;background:#ffffff}\n' +
      '  .mail{width:640px;max-width:640px;margin:0 auto;background:#ffffff}\n' +
      '  .px{padding-left:40px;padding-right:40px}\n' +
      '  .eyebrow{font-size:15px;line-height:1.4;color:' + C.gray + '}\n' +
      '  .kicker{font-size:15px;line-height:1.4;color:' + C.gray + ';margin:0}\n' +
      '  h1{font-size:52px;line-height:1.02;letter-spacing:-.045em;font-weight:400;margin:0;color:' + C.ink + '}\n' +
      '  h1 em,h1 strong{font-style:normal;font-weight:400;color:' + C.grayLight + '}\n' +
      '  .h2{font-size:38px;line-height:1.08;letter-spacing:-.04em;font-weight:400;margin:0;color:' + C.ink + '}\n' +
      '  .h2 em,.h2 strong{font-style:normal;font-weight:400;color:' + C.grayLight + '}\n' +
      '  .lede{font-size:17px;line-height:1.55;color:' + C.gray + ';margin:20px auto 0;max-width:480px}\n' +
      '  .lede strong{color:' + C.ink + ';font-weight:500}\n' +
      '  .copy{font-size:16px;line-height:1.6;color:' + C.gray + ';margin:0}\n' +
      '  .btn{display:inline-block;background:' + C.black + ';color:#fff;border-radius:999px;padding:0 26px;height:48px;line-height:48px;font-size:15px;font-weight:500;white-space:nowrap}\n' +
      '  .btn-blue{background:' + C.blue + ';color:#fff}\n' +
      '  .btn-ghost{background:#fff;color:' + C.ink + ';border:1px solid ' + C.line + '}\n' +
      '  .link{font-size:15px;font-weight:500;color:' + C.blue + '}\n' +
      '  .pill{display:inline-block;background:' + C.tint + ';color:#0058c4;border-radius:6px;padding:4px 9px;font-size:12px;font-weight:500}\n' +
      '  .dateline{font-size:15px;line-height:1.4;font-weight:600;color:' + C.ink + ';margin:0}\n' +
      '  .dateline span{color:' + C.line + ';font-weight:400}\n' +
      '  .meta{font-size:13px;color:' + C.grayLight + '}\n' +
      '  .divider{height:1px;background:' + C.line + ';font-size:0;line-height:0}\n' +
      '  @media only screen and (max-width:660px){\n' +
      '    .mail{width:100%!important}\n' +
      '    .px{padding-left:22px!important;padding-right:22px!important}\n' +
      '    h1{font-size:40px!important}\n' +
      '    .h2{font-size:30px!important}\n' +
      '    .stack td{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important}\n' +
      '    .gap{height:14px!important}\n' +
      '  }\n</style>\n</head>\n<body>\n' +
      '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' + esc(preheader || '') + '</div>\n' +
      '<table role="presentation" class="page" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff"><tr><td align="center" style="padding:0 10px;">\n' +
      '<table role="presentation" class="mail" width="640" cellpadding="0" cellspacing="0" style="font-family:' + FF + ';">\n';
  }
  function cierre() { return '</table>\n</td></tr></table>\n</body>\n</html>\n'; }

  /* ---------------- bloques ---------------- */
  function logo(d, centrado) {
    return '<tr><td class="px" style="padding-top:32px;padding-bottom:0;text-align:' + (centrado ? 'center' : 'left') + ';">' +
      '<img src="' + url(d.logoUrl) + '" alt="Playoff" width="104" style="width:104px;max-width:104px;height:auto;' + (centrado ? 'margin:0 auto;' : '') + 'display:block;">' +
      '</td></tr>\n';
  }
  function eyebrow(t) { return t ? '<p class="eyebrow" style="margin:0;font-size:15px;color:' + C.gray + ';">' + esc(t) + '</p>' : ''; }
  function kicker(t) { return t ? '<p class="kicker">' + esc(t) + '</p>' : ''; }
  function h1(t) { return '<h1>' + nl(t) + '</h1>'; }
  function h2(t, centro) { return '<p class="h2"' + (centro ? ' style="text-align:center"' : '') + '>' + nl(t) + '</p>'; }
  function lede(t, centro) {
    return t ? '<p class="lede"' + (centro ? '' : ' style="margin-left:0"') + '>' + marca(t) + '</p>' : '';
  }
  function copy(t) { return t ? '<p class="copy">' + nl(t) + '</p>' : ''; }
  function gap(h) { return '<div style="height:' + h + 'px;font-size:0;line-height:0">&nbsp;</div>'; }
  function btn(texto, href, variante) {
    if (!texto) return '';
    var cls = 'btn' + (variante === 'blue' ? ' btn-blue' : variante === 'ghost' ? ' btn-ghost' : '');
    var estilo = variante === 'blue' ? 'background:' + C.blue + ';color:#fff;'
      : variante === 'ghost' ? 'background:#fff;color:' + C.ink + ';border:1px solid ' + C.line + ';'
      : variante === 'white' ? 'background:#fff;color:' + C.ink + ';'
      : 'background:' + C.black + ';color:#fff;';
    return '<a href="' + url(href) + '" class="' + cls + '" style="display:inline-block;' + estilo +
      'border-radius:999px;padding:0 26px;height:48px;line-height:48px;font-family:' + FF + ';font-size:15px;font-weight:500;white-space:nowrap;">' +
      esc(texto) + '</a>';
  }
  function link(texto, href) {
    return texto ? '<a href="' + url(href) + '" class="link" style="font-size:15px;font-weight:500;color:' + C.blue + ';">' + esc(texto) + '</a>' : '';
  }
  function pill(t) { return t ? '<span class="pill">' + esc(t) + '</span>' : ''; }

  /* Fecha del webinar: en negrita, como el "Webinar Playoff | 8 octubre · 16:00 h" del diseño nuevo */
  function dateline(d) {
    var f = fechaCorta(d.fecha);
    if (!f && !d.hora) return '';
    return '<p class="dateline">' + esc(f) + (f && d.hora ? ' · ' : '') + (d.hora ? esc(d.hora) + ' h' : '') + '</p>';
  }
  function metarow(d) {
    var trozos = [];
    if (d.duracion) trozos.push(d.duracion);
    if (d.formato) trozos.push(d.formato);
    if (d.ponente) trozos.push(d.ponente);
    if (!trozos.length) return '';
    return '<p class="meta" style="margin:16px 0 0;font-size:13px;color:' + C.grayLight + ';">' +
      trozos.map(esc).join(' <span style="color:' + C.line + ';padding:0 6px;">|</span> ') + '</p>';
  }

  /* El ponente: la figura recortada sobre una tarjeta gris, con nombre y cargo debajo. */
  function ponente(d) {
    var foto = d.ponenteImg
      ? '<img src="' + url(d.ponenteImg) + '" alt="' + esc(d.ponente || 'Ponente') + '" width="260" ' +
        'style="width:260px;max-width:70%;height:auto;display:block;margin:0 auto;">'
      : (enVista() ? '<div style="padding:0 40px 28px;">' + falta(200, 'Falta la foto del ponente') + '</div>' : '');
    if (!foto && !d.ponente) return '';
    return gap(36) + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="' + C.suave + '" style="background:' + C.suave + ';border-radius:28px;">' +
      (foto ? '<tr><td align="center" style="padding:28px 0 0;">' + foto + '</td></tr>' : '') +
      '</table>' +
      (d.ponente ? '<p style="margin:16px 0 0;font-size:20px;letter-spacing:-.01em;color:' + C.ink + ';text-align:center;">' + esc(d.ponente) + '</p>' +
        (d.ponenteCargo ? '<p style="margin:4px 0 0;font-size:15px;color:' + C.gray + ';text-align:center;">' + esc(d.ponenteCargo) + '</p>' : '') : '');
  }

  /* Rejilla de 2 columnas: numerada (círculo azul) o con imagen arriba. */
  function rejilla(items, numerada, centrada) {
    if (!items.length) return '';
    var filas = '';
    for (var i = 0; i < items.length; i += 2) {
      var a = items[i], b = items[i + 1];
      filas += '<tr>' + celda(a, i, 'padding:0 5px 10px 0;') +
        (b ? celda(b, i + 1, 'padding:0 0 10px 5px;') : '<td width="50%"></td>') + '</tr>';
    }
    function celda(it, idx, pad) {
      var al = centrada ? 'center' : 'left';
      var imagen = it.img
        ? '<img src="' + url(it.img) + '" alt="" width="260" style="width:100%;height:auto;border-radius:14px;border:1px solid ' + C.line + ';">' + gap(16)
        : (!numerada && enVista() ? falta(150, 'Falta la imagen', 14) + gap(16) : '');
      return '<td width="50%" valign="top" style="' + pad + '">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#fafafa" style="background:#fafafa;border-radius:20px;"><tr>' +
        '<td style="padding:24px 24px 26px;text-align:' + al + ';">' +
        (numerada ? '<div style="width:36px;height:36px;border-radius:999px;background:' + C.blue + ';color:#fff;font-size:14px;line-height:36px;text-align:center;font-weight:600;' +
          (centrada ? 'margin:0 auto;' : '') + '">' + (idx + 1) + '</div>' + gap(16) : '') +
        imagen +
        '<p style="margin:0;font-size:19px;line-height:1.3;letter-spacing:-.02em;color:' + C.ink + ';">' + esc(it.t || '') + '</p>' +
        (it.d ? '<p style="margin:8px 0 0;font-size:15px;line-height:1.55;color:' + C.gray + ';">' + marca(it.d) + '</p>' : '') +
        (it.cta ? gap(12) + link(it.cta, it.ctaUrl) : '') +
        '</td></tr></table></td>';
    }
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack">' + filas + '</table>';
  }

  /* Tarjeta grande: tarjeta gris con el texto arriba y la captura apoyada en el borde de abajo. */
  function tarjetaGrande(it) {
    var imagen = it.img
      ? '<tr><td style="padding:0 40px;"><img src="' + url(it.img) + '" alt="" width="560" style="width:100%;height:auto;display:block;border-radius:12px 12px 0 0;"></td></tr>'
      : (enVista() ? '<tr><td style="padding:0 40px 32px;">' + falta(220, 'Falta la captura') + '</td></tr>' : '');
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="' + C.suave + '" style="background:' + C.suave + ';border-radius:28px;">' +
      '<tr><td style="padding:40px 40px ' + (imagen ? 30 : 40) + 'px;">' +
      (it.tag ? pill(it.tag) + gap(16) : '') +
      '<p style="margin:0;font-size:32px;line-height:1.15;letter-spacing:-.03em;color:' + C.ink + ';">' + nl(it.t || '') + '</p>' +
      (it.d ? gap(14) + '<p style="margin:0;font-size:17px;line-height:1.55;color:' + C.gray + ';">' + marca(it.d) + '</p>' : '') +
      (it.cta ? gap(20) + btn(it.cta, it.ctaUrl, 'blue') : '') +
      '</td></tr>' + imagen + '</table>';
  }

  /* Fila alternada: imagen a un lado, texto al otro */
  function fila(it, invertida) {
    var dentro = it.img
      ? '<img src="' + url(it.img) + '" alt="" width="260" style="width:100%;height:auto;border-radius:20px;border:1px solid ' + C.line + ';">'
      : falta(190, 'Falta la captura', 20);
    var img = dentro
      ? '<td width="46%" valign="middle" style="padding:0 ' + (invertida ? '0 0 16px' : '16px 0 0') + ';">' + dentro + '</td>'
      : '';
    var txt = '<td valign="middle">' +
      (it.tag ? pill(it.tag) + gap(14) : '') +
      '<p style="margin:0;font-size:26px;line-height:1.2;letter-spacing:-.025em;color:' + C.ink + ';">' + esc(it.t || '') + '</p>' +
      (it.d ? '<p style="margin:10px 0 0;font-size:16px;line-height:1.6;color:' + C.gray + ';">' + marca(it.d) + '</p>' : '') +
      (it.cta ? gap(14) + link(it.cta, it.ctaUrl) : '') +
      '</td>';
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack"><tr>' +
      (invertida ? txt + img : img + txt) + '</tr></table>';
  }

  /* Banda de promoción: tarjeta oscura, titular en blanco con el énfasis en gris y botón blanco */
  function promo(d) {
    if (!d.promoTitulo) return '';
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="' + C.oscuro + '" style="background:' + C.oscuro + ';border-radius:28px;"><tr>' +
      '<td align="center" style="padding:52px 40px 56px;">' +
      (d.promoTag ? '<p style="margin:0 0 14px;font-size:15px;color:' + C.grisOscuro + ';">' + esc(d.promoTag) + '</p>' : '') +
      '<p style="margin:0;font-size:38px;line-height:1.08;letter-spacing:-.04em;color:#fff;">' +
      nl(d.promoTitulo).replace(/<(strong|em)>/g, '<span style="color:' + C.grisOscuro + ';">').replace(/<\/(strong|em)>/g, '</span>') + '</p>' +
      (d.promoTexto ? '<p style="margin:16px auto 0;font-size:16px;line-height:1.55;color:' + C.grisOscuro + ';max-width:420px;">' + marca(d.promoTexto) + '</p>' : '') +
      (d.promoCta ? gap(28) + btn(d.promoCta, d.promoUrl, 'white') : '') +
      '</td></tr></table>';
  }

  /* Cita destacada: frase grande, lo destacado en gris */
  function cita(d) {
    if (!d.citaTexto) return '';
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 10px;">' +
      '<p style="margin:0;font-size:28px;line-height:1.3;letter-spacing:-.025em;color:' + C.ink + ';">' +
      nl(d.citaTexto).replace(/<(strong|em)>/g, '<span style="color:' + C.grayLight + ';">').replace(/<\/(strong|em)>/g, '</span>') + '</p>' +
      (d.citaAutor ? '<p style="margin:14px 0 0;font-size:15px;color:' + C.gray + ';">' + esc(d.citaAutor) + '</p>' : '') +
      '</td></tr></table>';
  }

  /* Caja de enlaces al blog: tarjeta gris con los titulares separados por líneas */
  function cajaBlog(d, items) {
    if (!items.length) return '';
    var filas = items.map(function (it, i) {
      return '<tr><td style="padding:18px 0;' + (i ? 'border-top:1px solid ' + C.line + ';' : '') + '">' +
        '<a href="' + url(it.ctaUrl) + '" style="font-size:19px;line-height:1.35;letter-spacing:-.02em;color:' + C.ink + ';">' + esc(it.t || '') + '</a>' +
        (it.d ? '<p style="margin:6px 0 0;font-size:15px;line-height:1.5;color:' + C.gray + ';">' + esc(it.d) + '</p>' : '') +
        '</td></tr>';
    }).join('');
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="' + C.suave + '" style="background:' + C.suave + ';border-radius:28px;"><tr><td style="padding:36px 40px 22px;">' +
      kicker(d.blogKicker || 'Para seguir al día') + gap(10) +
      '<p style="margin:0 0 6px;font-size:30px;line-height:1.1;letter-spacing:-.035em;color:' + C.ink + ';">' + esc(d.blogTitulo || 'Últimos del blog') + '</p>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + filas + '</table>' +
      '</td></tr></table>';
  }

  /* Pie oscuro, igual que en las plantillas de diseño web */
  function pie(d) {
    return '<tr><td style="padding:56px 0 28px;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="' + C.foot + '" style="background:' + C.foot + ';border-radius:28px;">' +
      '<tr><td class="px" style="padding:40px 40px 32px;">' +
      (d.footerText ? '<p style="margin:0;max-width:340px;color:#a1a4ab;font-size:15px;line-height:1.55;">' + marca(d.footerText) + '</p>' : '') +
      '<p style="margin:16px 0 0;"><a href="' + url(d.footerLinkUrl) + '" style="color:#ffffff;font-size:14px;font-weight:600;">' + esc(d.footerLink || 'playoffinformatica.com') + '</a></p>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #1f2329;"><tr>' +
      '<td style="padding-top:18px;color:#6f727a;font-size:13px;line-height:1.55;">' + esc(d.legal || '') +
      '<br><a href="{{ unsubscribe }}" style="color:#6f727a;text-decoration:underline;">Darse de baja</a></td></tr></table>' +
      '</td></tr></table></td></tr>\n';
  }

  /* Sin degradados: los fondos "hero" y "suave" de antes ahora son blanco. */
  function fondoDe(nombre) {
    if (!nombre || nombre === 'hero' || nombre === 'suave') return '';
    return 'background:' + nombre + ';';
  }

  function seccion(contenido, opciones) {
    var o = opciones || {};
    // Un poco más de aire que antes: el diseño nuevo respira más.
    var top = o.top == null ? 40 : Math.round(o.top * 1.35);
    var bottom = o.bottom == null ? 0 : Math.round(o.bottom * 1.2);
    return '<tr><td class="px' + (o.clase ? ' ' + o.clase : '') + '" style="padding-top:' + top + 'px;padding-bottom:' + bottom + 'px;' +
      (o.align ? 'text-align:' + o.align + ';' : '') + fondoDe(o.fondo) + '">' + contenido + '</td></tr>\n';
  }
  function separador() { return '<tr><td class="px" style="padding-top:24px;"><div class="divider" style="height:1px;background:' + C.line + ';font-size:0;line-height:0;">&nbsp;</div></td></tr>\n'; }

  window.PM_EMAIL = {
    C: C, FF: FF, esc: esc, marca: marca, nl: nl, url: url, list: list,
    fechaCorta: fechaCorta, fechaDia: fechaDia, enVista: enVista, falta: falta,
    head: head, cierre: cierre, logo: logo, eyebrow: eyebrow, kicker: kicker,
    h1: h1, h2: h2, lede: lede, copy: copy, gap: gap, btn: btn, link: link, pill: pill,
    dateline: dateline, metarow: metarow, ponente: ponente, rejilla: rejilla,
    tarjetaGrande: tarjetaGrande, fila: fila, promo: promo, cita: cita, cajaBlog: cajaBlog,
    pie: pie, seccion: seccion, separador: separador
  };
})();
