/* Playoff Mailer — sistema visual de los emails.
   Basado en las plantillas de Laura (Inter, 640px, h1 con énfasis, botón negro,
   eyebrow azul) con algo más de aire y jerarquía. Tablas + clases, como los envíos actuales. */
(function () {
  'use strict';

  var C = {
    blue: '#006BED', blueInk: '#0B1220', ink: '#111827', inkMid: '#4B5563',
    gray: '#737B8A', grayLight: '#A3A9B3',
    line: '#EDF0F4', lineSoft: '#E7EBF1',
    tint: '#EAF3FF', tintSoft: '#F6FAFF', paper: '#FFFFFF',
    outer: '#F1F1F1', foot: '#F5F5F6', black: '#050505'
  };
  var FF = 'Inter,Arial,Helvetica,sans-serif';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // **negrita** y *cursiva*: el énfasis tipográfico que define estos titulares.
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

  /* ---------------- documento ---------------- */
  function head(titulo, preheader) {
    return '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<meta name="x-apple-disable-message-reformatting">\n' +
      '<title>' + esc(titulo) + '</title>\n<style>\n' +
      '  *{box-sizing:border-box}\n' +
      '  html,body{margin:0;padding:0;background:' + C.outer + '}\n' +
      '  body{font-family:' + FF + ';color:' + C.ink + ';-webkit-font-smoothing:antialiased}\n' +
      '  table{border-collapse:collapse;border-spacing:0}\n' +
      '  img{display:block;border:0;max-width:100%;height:auto}\n' +
      '  a{text-decoration:none;color:inherit}\n' +
      '  .page{width:100%;padding:24px 0;background:' + C.outer + '}\n' +
      '  .mail{width:640px;max-width:640px;margin:0 auto;background:' + C.paper + '}\n' +
      '  .px{padding-left:42px;padding-right:42px}\n' +
      '  .eyebrow{font-size:10px;line-height:1.3;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:' + C.blue + '}\n' +
      '  .kicker{font-size:10px;line-height:1.3;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:' + C.gray + ';margin:0}\n' +
      '  h1{font-size:44px;line-height:1.03;letter-spacing:-2.1px;font-weight:600;margin:0;color:' + C.ink + '}\n' +
      '  h1 em{font-style:italic;font-weight:700}\n' +
      '  h1 strong{font-weight:800}\n' +
      '  .h2{font-size:30px;line-height:1.08;letter-spacing:-1.2px;font-weight:600;margin:0;color:' + C.ink + '}\n' +
      '  .h2 strong{font-weight:800}\n' +
      '  .h2 em{font-style:italic;font-weight:700}\n' +
      '  .lede{font-size:13px;line-height:1.6;color:' + C.gray + ';margin:14px auto 0;max-width:470px}\n' +
      '  .copy{font-size:12.5px;line-height:1.62;color:' + C.gray + ';margin:0}\n' +
      '  .btn{display:inline-block;background:' + C.black + ';color:#fff;border-radius:999px;padding:13px 22px 12px;font-size:10px;line-height:1;font-weight:800;text-transform:uppercase;letter-spacing:.04em}\n' +
      '  .btn-blue{background:' + C.blue + ';color:#fff}\n' +
      '  .btn-ghost{background:transparent;color:' + C.ink + ';border:1px solid ' + C.lineSoft + '}\n' +
      '  .link{font-size:11px;font-weight:800;color:' + C.blue + ';letter-spacing:.01em}\n' +
      '  .pill{display:inline-block;background:' + C.tint + ';color:' + C.blue + ';border-radius:999px;padding:5px 11px;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}\n' +
      '  .dateline{font-size:21px;line-height:1.1;letter-spacing:-.45px;font-weight:800;color:' + C.blue + ';margin:0}\n' +
      '  .dateline span{color:' + C.blueInk + '}\n' +
      '  .meta{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:' + C.gray + '}\n' +
      '  .card{border:1px solid ' + C.lineSoft + ';border-radius:20px;overflow:hidden;background:' + C.paper + '}\n' +
      '  .card-body{padding:22px 24px 24px}\n' +
      '  .num{width:42px;height:42px;border-radius:50%;background:' + C.tint + ';color:' + C.blue + ';font-size:12px;line-height:42px;text-align:center;font-weight:800;letter-spacing:.04em}\n' +
      '  .rule{height:3px;width:44px;background:' + C.blue + ';font-size:0;line-height:0}\n' +
      '  .divider{height:1px;background:' + C.line + ';font-size:0;line-height:0}\n' +
      '  .soft{background:' + C.tintSoft + '}\n' +
      '  .footer{background:' + C.foot + ';text-align:center;padding:34px 24px 40px;color:' + C.gray + '}\n' +
      '  .footer-links{font-size:9px;letter-spacing:.08em;text-transform:uppercase;margin-top:14px}\n' +
      '  .footer-links a{padding:0 7px;color:' + C.gray + '}\n' +
      '  .legal{font-size:8.5px;line-height:1.6;color:' + C.grayLight + ';margin-top:14px}\n' +
      '  @media only screen and (max-width:660px){\n' +
      '    .page{padding:0}\n    .mail{width:100%!important}\n' +
      '    .px{padding-left:22px!important;padding-right:22px!important}\n' +
      '    h1{font-size:34px!important;letter-spacing:-1.4px!important}\n' +
      '    .h2{font-size:25px!important;letter-spacing:-.9px!important}\n' +
      '    .stack td{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important}\n' +
      '    .gap{height:14px!important}\n' +
      '  }\n</style>\n</head>\n<body>\n' +
      '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' + esc(preheader || '') + '</div>\n' +
      '<table role="presentation" class="page" width="100%"><tr><td align="center">\n' +
      '<table role="presentation" class="mail" width="640">\n';
  }
  function cierre() { return '</table>\n</td></tr></table>\n</body>\n</html>\n'; }

  /* ---------------- bloques ---------------- */
  function logo(d, centrado) {
    return '<tr><td class="px" style="padding-top:28px;padding-bottom:6px;text-align:' + (centrado ? 'center' : 'left') + ';">' +
      '<img src="' + url(d.logoUrl) + '" alt="Playoff" width="118" style="width:118px;max-width:118px;height:auto;' + (centrado ? 'margin:0 auto;' : '') + 'display:block;">' +
      '</td></tr>\n';
  }
  function eyebrow(t) { return t ? '<span class="eyebrow">' + esc(t) + '</span>' : ''; }
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
      : variante === 'ghost' ? 'background:transparent;color:' + C.ink + ';border:1px solid ' + C.lineSoft + ';'
      : variante === 'white' ? 'background:#fff;color:' + C.blue + ';'
      : 'background:' + C.black + ';color:#fff;';
    return '<a href="' + url(href) + '" class="' + cls + '" style="display:inline-block;' + estilo +
      'border-radius:999px;padding:13px 22px 12px;font-family:' + FF + ';font-size:10px;line-height:1;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">' +
      esc(texto) + '</a>';
  }
  function link(texto, href) {
    return texto ? '<a href="' + url(href) + '" class="link" style="font-size:11px;font-weight:800;color:' + C.blue + ';">' + esc(texto) + ' &rarr;</a>' : '';
  }
  function pill(t) { return t ? '<span class="pill">' + esc(t) + '</span>' : ''; }

  /* Fecha del webinar: cifra grande azul + fila de metadatos */
  function dateline(d) {
    var f = fechaCorta(d.fecha);
    if (!f && !d.hora) return '';
    return '<p class="dateline">' + esc(f) + (d.hora ? ' <span>·</span> ' + esc(d.hora) + ' h' : '') + '</p>';
  }
  function metarow(d) {
    var trozos = [];
    if (d.duracion) trozos.push(d.duracion);
    if (d.formato) trozos.push(d.formato);
    if (d.ponente) trozos.push(d.ponente);
    if (!trozos.length) return '';
    return '<p class="meta" style="margin:12px 0 0;">' + trozos.map(esc).join(' &nbsp;·&nbsp; ') + '</p>';
  }

  /* El ponente: la figura recortada sobre un halo azul, como en la plantilla v4.
     Nada de recortes en circulo: estas fotos son de cuerpo entero y con transparencia. */
  function ponente(d) {
    if (!d.ponenteImg) return '';
    var halo = 'radial-gradient(circle at 50% 36%, rgba(0,107,237,.17) 0, rgba(0,107,237,.06) 42%, rgba(255,255,255,0) 70%)';
    return '<table role="presentation" width="100%"><tr>' +
      '<td align="center" style="padding-top:18px;background-color:' + C.tintSoft + ';background-image:' + halo + ';">' +
      '<img src="' + url(d.ponenteImg) + '" alt="' + esc(d.ponente || 'Ponente') + '" width="300" ' +
      'style="width:300px;max-width:78%;height:auto;display:block;margin:0 auto;">' +
      '</td></tr>' +
      (d.ponente ? '<tr><td align="center" style="padding-top:14px;">' +
        '<p style="margin:0;font-size:14px;font-weight:800;color:' + C.ink + ';">' + esc(d.ponente) + '</p>' +
        (d.ponenteCargo ? '<p style="margin:5px 0 0;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:' + C.gray + ';">' + esc(d.ponenteCargo) + '</p>' : '') +
        '</td></tr>' : '') +
      '</table>';
  }

  /* Rejilla de 2 columnas numeradas */
  function rejilla(items, numerada, centrada) {
    if (!items.length) return '';
    var filas = '';
    for (var i = 0; i < items.length; i += 2) {
      var a = items[i], b = items[i + 1];
      filas += '<tr>' + celda(a, i, 'padding:0 14px 26px 0;') +
        (b ? celda(b, i + 1, 'padding:0 0 26px 14px;') : '<td width="50%"></td>') + '</tr>';
    }
    function celda(it, idx, pad) {
      return '<td width="50%" valign="top" style="' + pad + 'text-align:' + (centrada ? 'center' : 'left') + ';">' +
        (numerada ? '<div class="num" style="width:42px;height:42px;border-radius:50%;background:' + C.tint + ';color:' + C.blue + ';font-size:12px;line-height:42px;text-align:center;font-weight:800;' + (centrada ? 'margin:0 auto;' : '') + '">' + ('0' + (idx + 1)).slice(-2) + '</div>' + gap(12) : '') +
        (it.img ? '<img src="' + url(it.img) + '" alt="" width="240" style="width:100%;max-width:240px;height:auto;border-radius:14px;border:1px solid ' + C.lineSoft + ';">' + gap(12) : '') +
        '<p style="margin:0 0 7px;font-size:14px;line-height:1.25;font-weight:800;color:' + C.ink + ';">' + esc(it.t || '') + '</p>' +
        (it.d ? '<p style="margin:0' + (centrada ? ' auto' : '') + ';font-size:11.5px;line-height:1.55;color:' + C.gray + ';max-width:230px;">' + marca(it.d) + '</p>' : '') +
        (it.cta ? gap(10) + link(it.cta, it.ctaUrl) : '') +
        '</td>';
    }
    return '<table role="presentation" width="100%" class="stack">' + filas + '</table>';
  }

  /* Tarjeta grande: captura arriba, texto debajo */
  function tarjetaGrande(it) {
    return '<table role="presentation" width="100%" class="card" style="border:1px solid ' + C.lineSoft + ';border-radius:20px;background:' + C.paper + ';">' +
      (it.img ? '<tr><td style="padding:0;"><img src="' + url(it.img) + '" alt="" width="638" style="width:100%;height:auto;display:block;border-radius:20px 20px 0 0;"></td></tr>' : '') +
      '<tr><td style="padding:22px 24px 24px;">' +
      (it.tag ? pill(it.tag) + gap(13) : '') +
      '<p style="margin:0;font-size:22px;line-height:1.18;letter-spacing:-.6px;font-weight:800;color:' + C.ink + ';">' + nl(it.t || '') + '</p>' +
      (it.d ? gap(10) + '<p style="margin:0;font-size:12.5px;line-height:1.62;color:' + C.gray + ';">' + marca(it.d) + '</p>' : '') +
      (it.cta ? gap(16) + link(it.cta, it.ctaUrl) : '') +
      '</td></tr></table>';
  }

  /* Fila alternada: imagen a un lado, texto al otro */
  function fila(it, invertida) {
    var img = it.img
      ? '<td width="42%" valign="middle" class="gapcol" style="padding:0 ' + (invertida ? '0 0 18px' : '18px 0 0') + ';">' +
        '<img src="' + url(it.img) + '" alt="" width="240" style="width:100%;height:auto;border-radius:16px;border:1px solid ' + C.lineSoft + ';"></td>'
      : '';
    var txt = '<td valign="middle">' +
      (it.tag ? pill(it.tag) + gap(12) : '') +
      '<p style="margin:0 0 8px;font-size:17px;line-height:1.25;font-weight:800;color:' + C.ink + ';">' + esc(it.t || '') + '</p>' +
      (it.d ? '<p style="margin:0;font-size:12px;line-height:1.6;color:' + C.gray + ';">' + marca(it.d) + '</p>' : '') +
      (it.cta ? gap(12) + link(it.cta, it.ctaUrl) : '') +
      '</td>';
    return '<table role="presentation" width="100%" class="stack"><tr>' +
      (invertida ? txt + img : img + txt) + '</tr></table>';
  }

  /* Banda azul de promoción */
  function promo(d) {
    if (!d.promoTitulo) return '';
    return '<table role="presentation" width="100%" style="background:' + C.blue + ';border-radius:22px;"><tr>' +
      '<td style="padding:30px 32px;">' +
      (d.promoTag ? '<p style="margin:0 0 12px;font-size:9px;letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:#BFDCFF;">' + esc(d.promoTag) + '</p>' : '') +
      '<p style="margin:0;font-size:24px;line-height:1.12;letter-spacing:-.8px;font-weight:800;color:#fff;">' + nl(d.promoTitulo) + '</p>' +
      (d.promoTexto ? '<p style="margin:12px 0 0;font-size:12.5px;line-height:1.6;color:#DCEBFF;max-width:400px;">' + marca(d.promoTexto) + '</p>' : '') +
      (d.promoCta ? gap(18) + btn(d.promoCta, d.promoUrl, 'white') : '') +
      '</td></tr></table>';
  }

  /* Cita destacada */
  function cita(d) {
    if (!d.citaTexto) return '';
    return '<table role="presentation" width="100%"><tr><td align="center" style="padding:0 20px;">' +
      '<p style="margin:0;font-size:40px;line-height:.7;color:' + C.blue + ';font-weight:700;">&ldquo;</p>' +
      '<p style="margin:14px 0 0;font-size:23px;line-height:1.22;letter-spacing:-.7px;color:#4867A8;font-weight:600;max-width:460px;">' + nl(d.citaTexto) + '</p>' +
      (d.citaAutor ? '<p style="margin:14px 0 0;font-size:10px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:' + C.gray + ';">' + esc(d.citaAutor) + '</p>' : '') +
      '</td></tr></table>';
  }

  /* Caja de enlaces al blog */
  function cajaBlog(d, items) {
    if (!items.length) return '';
    var filas = items.map(function (it, i) {
      return '<tr><td style="padding:' + (i ? '14px' : '0') + ' 0 0;">' +
        (i ? '<div style="height:1px;background:' + C.line + ';font-size:0;line-height:0;margin-bottom:14px;">&nbsp;</div>' : '') +
        '<a href="' + url(it.ctaUrl) + '" style="font-size:13.5px;line-height:1.35;font-weight:800;color:' + C.ink + ';">' + esc(it.t || '') + '</a>' +
        (it.d ? '<p style="margin:5px 0 0;font-size:11.5px;line-height:1.5;color:' + C.gray + ';">' + esc(it.d) + '</p>' : '') +
        '</td></tr>';
    }).join('');
    return '<table role="presentation" width="100%" style="background:' + C.tintSoft + ';border:1px solid ' + C.lineSoft + ';border-radius:20px;"><tr><td style="padding:26px 28px;">' +
      kicker(d.blogKicker || 'Para seguir al día') + gap(8) +
      '<p style="margin:0 0 18px;font-size:19px;line-height:1.2;letter-spacing:-.5px;font-weight:800;color:' + C.ink + ';">' + esc(d.blogTitulo || 'Últimos del blog') + '</p>' +
      '<table role="presentation" width="100%">' + filas + '</table>' +
      '</td></tr></table>';
  }

  function pie(d) {
    return '<tr><td class="footer" style="background:' + C.foot + ';text-align:center;padding:34px 24px 40px;">' +
      '<img src="' + url(d.logoUrl) + '" alt="Playoff" width="96" style="width:96px;height:auto;margin:0 auto 14px;display:block;opacity:.72;">' +
      '<p style="margin:0;font-size:11px;line-height:1.6;color:' + C.gray + ';">' + marca(d.footerText || '') + '</p>' +
      '<p class="footer-links" style="font-size:9px;letter-spacing:.08em;text-transform:uppercase;margin-top:14px;color:' + C.gray + ';">' +
      '<a href="' + url(d.footerLinkUrl) + '" style="padding:0 7px;color:' + C.gray + ';">' + esc(d.footerLink || 'playoffinformatica.com') + '</a>' +
      '<a href="{{ unsubscribe }}" style="padding:0 7px;color:' + C.gray + ';">Darse de baja</a>' +
      '</p>' +
      '<p class="legal" style="font-size:8.5px;line-height:1.6;color:' + C.grayLight + ';margin-top:14px;">' + esc(d.legal || '') + '</p>' +
      '</td></tr>\n';
  }

  /* fila de la tabla principal */
  function seccion(contenido, opciones) {
    var o = opciones || {};
    return '<tr><td class="px' + (o.clase ? ' ' + o.clase : '') + '" style="padding-top:' + (o.top == null ? 34 : o.top) + 'px;padding-bottom:' + (o.bottom == null ? 0 : o.bottom) + 'px;' +
      (o.align ? 'text-align:' + o.align + ';' : '') + (o.fondo ? 'background:' + o.fondo + ';' : '') + '">' + contenido + '</td></tr>\n';
  }
  function separador() { return '<tr><td class="px"><div class="divider" style="height:1px;background:' + C.line + ';font-size:0;line-height:0;">&nbsp;</div></td></tr>\n'; }

  window.PM_EMAIL = {
    C: C, FF: FF, esc: esc, marca: marca, nl: nl, url: url, list: list,
    fechaCorta: fechaCorta, fechaDia: fechaDia,
    head: head, cierre: cierre, logo: logo, eyebrow: eyebrow, kicker: kicker,
    h1: h1, h2: h2, lede: lede, copy: copy, gap: gap, btn: btn, link: link, pill: pill,
    dateline: dateline, metarow: metarow, ponente: ponente, rejilla: rejilla,
    tarjetaGrande: tarjetaGrande, fila: fila, promo: promo, cita: cita, cajaBlog: cajaBlog,
    pie: pie, seccion: seccion, separador: separador
  };
})();
