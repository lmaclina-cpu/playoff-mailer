/* Playoff Mailer — sistema visual "web" de los emails.
   El de la home publicada de playoffinformatica.com (Webflow, clases sp-*): Inter con titulares
   en peso 400 muy apretados, negro, grises, tarjetas de 28 px y el azul solo como acento.
   Plano: sin sombras. Es el diseño aprobado en prototipos/webinar-final.html y
   prototipos/novedades-final.html; si se toca aquí, hay que mirar que siga igual que allí. */
(function () {
  'use strict';
  var E = window.PM_EMAIL;
  var esc = E.esc, url = E.url;

  var C = {
    ink: '#0b0b0c', gris: '#6b6e75', gris2: '#8b8e95', linea: '#e4e4e7',
    suave: '#f3f4f6', suave2: '#fafafa', oscuro: '#0e1116', negro: '#0b0b0c',
    azul: '#006bed', grisOscuro: '#9aa0aa', pieTexto: '#a1a4ab', pieLegal: '#6f727a'
  };
  var FONT = "Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  // Foto azul de la home: el fondo por defecto del bloque "imagen sobre imagen".
  var FONDO_DEF = 'https://cdn.prod.website-files.com/6a44d3d9ce03bc32d83be675/6aa907fd5bc8c9136ac2029b_home-hero.webp';

  /* Titulares: lo que va entre asteriscos (uno o dos) se pinta en gris, que es el énfasis
     de este diseño. El salto de línea se respeta. */
  function enfasis(s, gris) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<span style="color:' + gris + ';">$1</span>')
      .replace(/\*([^*\n]+)\*/g, '<span style="color:' + gris + ';">$1</span>')
      .replace(/\r?\n/g, '<br>');
  }
  // En los textos corridos, **x** es una palabra destacada en negro.
  function texto(s, fuerte) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<b style="color:' + (fuerte || C.ink) + ';font-weight:500;">$1</b>')
      .replace(/\r?\n/g, '<br>');
  }
  function lista(d, k) {
    var v = d[k];
    return Array.isArray(v) ? v.filter(function (i) { return i && (i.t || i.d || i.img); }) : [];
  }

  /* ---------------- documento ---------------- */
  function head(titulo, preheader, extraCss) {
    return '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<meta name="x-apple-disable-message-reformatting">\n' +
      '<title>' + esc(titulo) + '</title>\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">\n' +
      '<style>\n' +
      '  body{margin:0;padding:0;background:#ffffff;-webkit-text-size-adjust:100%}\n' +
      '  table{border-collapse:separate;border-spacing:0}\n' +
      '  img{border:0;display:block;max-width:100%;height:auto}\n' +
      '  a{text-decoration:none}\n' +
      '  @media (max-width:640px){\n' +
      '    .wrap{width:100%!important}\n' +
      '    .px{padding-left:22px!important;padding-right:22px!important}\n' +
      '    .h1{font-size:40px!important} .h2{font-size:30px!important}\n' +
      '    .col{display:block!important;box-sizing:border-box!important;width:100%!important;padding-left:0!important;padding-right:0!important}\n' +
      '    .encima{padding:28px 14px 0!important}\n' +
      '    .alto{height:auto!important}\n' +
      (extraCss || '') +
      '  }\n</style>\n</head>\n' +
      '<body style="margin:0;padding:0;background:#ffffff;">\n' +
      '<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">' + esc(preheader || '') + '</div>\n' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;">\n' +
      '<tr><td align="center" style="padding:0 10px;">\n' +
      '<table role="presentation" class="wrap" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;font-family:' + FONT + ';">\n';
  }
  function cierre() { return '</table>\n</td></tr></table>\n</body>\n</html>\n'; }

  /* Una fila de la tabla principal. px: margen lateral que en el móvil se reduce. */
  function fila(html, pad, conPx) {
    return '<tr><td' + (conPx ? ' class="px"' : '') + ' style="padding:' + (pad || '0') + ';">' + html + '</td></tr>\n';
  }
  function hueco(h) { return '<div style="height:' + h + 'px;line-height:' + h + 'px;font-size:0;">&nbsp;</div>'; }
  function sep(color) { return '<span style="color:' + (color || C.linea) + ';padding:0 8px;">|</span>'; }

  /* ---------------- piezas ---------------- */
  function logo(d, align) {
    var centro = align === 'center';
    return fila('<img src="' + url(d.logoUrl) + '" width="104" alt="Playoff" style="width:104px;' + (centro ? 'margin:0 auto;' : '') + '">',
      centro ? '32px 0 0' : '32px 40px 0', !centro).replace('<td', '<td align="' + (centro ? 'center' : 'left') + '"');
  }
  function antetitulo(a, b, align) {
    if (!a && !b) return '';
    return '<p style="margin:0;color:' + C.gris + ';font-size:15px;line-height:1.4;text-align:' + align + ';">' +
      esc(a || '') + (a && b ? sep() : '') + (b ? '<b style="color:' + C.ink + ';font-weight:600;">' + esc(b) + '</b>' : '') + '</p>';
  }
  function h1(t, align, size) {
    return '<h1 class="h1" style="margin:0;color:' + C.ink + ';font-size:' + (size || 56) + 'px;line-height:1.02;font-weight:400;' +
      'letter-spacing:-0.045em;text-align:' + align + ';">' + enfasis(t, C.gris2) + '</h1>';
  }
  function h2(t, align, size, color, gris) {
    return '<h2 class="h2" style="margin:0;color:' + (color || C.ink) + ';font-size:' + (size || 40) + 'px;line-height:1.08;font-weight:400;' +
      'letter-spacing:-0.04em;text-align:' + align + ';">' + enfasis(t, gris || C.gris2) + '</h2>';
  }
  function h3(t, size, color, align) {
    return '<p style="margin:0;color:' + (color || C.ink) + ';font-size:' + size + 'px;line-height:1.2;letter-spacing:-0.025em;text-align:' + (align || 'left') + ';">' + esc(t) + '</p>';
  }
  function parrafo(t, o) {
    o = o || {};
    return '<p style="margin:' + (o.m || '0') + ';' + (o.mw ? 'max-width:' + o.mw + 'px;' : '') + 'color:' + (o.color || C.gris) +
      ';font-size:' + (o.size || 17) + 'px;line-height:1.55;text-align:' + (o.align || 'left') + ';">' + texto(t, o.fuerte) + '</p>';
  }
  function boton(t, u, o) {
    if (!t) return '';
    o = o || {};
    var bg = o.claro ? '#ffffff' : (o.azul ? C.azul : C.negro);
    var fg = o.claro ? C.ink : '#ffffff';
    var alto = o.azul ? 40 : 48;
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:' + (o.align === 'center' ? '0 auto' : '0') + ';"><tr><td>' +
      '<a href="' + url(u) + '" style="display:inline-block;background:' + bg + ';color:' + fg + ';font-size:' + (o.azul ? 14 : 15) + 'px;font-weight:500;' +
      'line-height:' + alto + 'px;height:' + alto + 'px;padding:0 ' + (o.azul ? 18 : 26) + 'px;border-radius:999px;white-space:nowrap;">' + esc(t) + '</a>' +
      '</td></tr></table>';
  }
  function enlaceAzul(t, u) {
    return t ? '<a href="' + url(u) + '" style="color:' + C.azul + ';font-size:15px;font-weight:500;">' + esc(t) + '</a>' : '';
  }
  function etiqueta(t) {
    return t ? '<span style="display:inline-block;background:#eaf2ff;color:#0058c4;font-size:12px;font-weight:500;padding:4px 9px;border-radius:6px;">' + esc(t) + '</span>' : '';
  }
  function num(i) {
    return '<div style="width:32px;height:32px;line-height:32px;text-align:center;border-radius:999px;background:' + C.azul +
      ';color:#ffffff;font-size:13px;font-weight:600;">' + i + '</div>';
  }

  /* Dos imágenes: la de fondo a sangre (esquinas de 28 px) y la del entorno encima,
     apoyada en el borde de abajo. background-image para Gmail y Apple; VML para Outlook. */
  function imagenSobreImagen(fondo, encima) {
    var f = url(fondo || FONDO_DEF);
    var arriba = encima
      ? '<img src="' + url(encima) + '" width="560" alt="" style="width:100%;display:block;border-radius:12px 12px 0 0;">'
      : (E.enVista()
        ? '<div style="height:300px;border:2px dashed rgba(255,255,255,.7);border-bottom:0;border-radius:12px 12px 0 0;background:rgba(255,255,255,.14);' +
          'display:flex;align-items:center;justify-content:center;font-family:' + FONT + ';font-size:15px;color:#ffffff;">&#128444;&#65039;&nbsp; Falta la imagen del entorno</div>'
        : hueco(300));
    return fila('<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
      '<td background="' + f + '" bgcolor="#1d5fd6" valign="bottom" style="background-color:#1d5fd6;background-image:url(\'' + f + '\');' +
      'background-size:cover;background-position:50% 50%;border-radius:28px;">' +
      '<!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;height:420px;">' +
      '<v:fill type="frame" src="' + f + '" color="#1d5fd6"/><v:textbox inset="0,0,0,0"><![endif]-->' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="encima" style="padding:52px 40px 0;">' + arriba + '</td></tr></table>' +
      '<!--[if gte mso 9]></v:textbox></v:rect><![endif]-->' +
      '</td></tr></table>', '48px 0 0');
  }

  function pie(d) {
    return fila('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="' + C.negro + '" style="background:' + C.negro + ';border-radius:28px;">' +
      '<tr><td class="px" style="padding:40px 40px 32px;">' +
      (d.footerText ? '<p style="margin:0;max-width:340px;color:' + C.pieTexto + ';font-size:15px;line-height:1.55;">' + texto(d.footerText, '#ffffff') + '</p>' : '') +
      '<p style="margin:16px 0 0;"><a href="' + url(d.footerLinkUrl) + '" style="color:#ffffff;font-size:14px;font-weight:600;">' + esc(d.footerLink || 'playoffinformatica.com') + '</a></p>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #1f2329;"><tr>' +
      '<td style="padding-top:18px;color:' + C.pieLegal + ';font-size:13px;line-height:1.55;">' + esc(d.legal || '') +
      '<br><a href="{{ unsubscribe }}" style="color:' + C.pieLegal + ';text-decoration:underline;">Darse de baja</a></td></tr></table>' +
      '</td></tr></table>', '10px 0 28px');
  }

  function tarjetaOscura(interior) {
    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="' + C.oscuro + '" style="background:' + C.oscuro + ';border-radius:28px;">' +
      '<tr><td class="px" align="center" style="padding:52px 40px 56px;">' + interior + '</td></tr></table>';
  }

  window.PM_SAAS = {
    C: C, FONDO_DEF: FONDO_DEF, enfasis: enfasis, texto: texto, lista: lista,
    head: head, cierre: cierre, fila: fila, hueco: hueco, sep: sep,
    logo: logo, antetitulo: antetitulo, h1: h1, h2: h2, h3: h3, parrafo: parrafo,
    boton: boton, enlaceAzul: enlaceAzul, etiqueta: etiqueta, num: num,
    imagenSobreImagen: imagenSobreImagen, pie: pie, tarjetaOscura: tarjetaOscura
  };
})();
