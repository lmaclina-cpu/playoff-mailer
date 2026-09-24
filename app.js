/* Playoff Mailer — interfaz. Habla con el servidor local en /api/*. */
(function () {
  'use strict';
  var P = window.PM_PLANTILLAS, E = window.PM_EMAIL;
  var $ = function (id) { return document.getElementById(id); };

  var S = { plantilla: null, datos: {}, id: null, nombre: '', asunto: '', movil: false, abiertos: {} };
  var timerPrev = null, timerSave = null;
  var sucio = false;   // hay cambios que todavia no han llegado al servidor

  /* ============ servidor local ============ */
  function token(valor) {
    try {
      if (valor === undefined) return localStorage.getItem('pm_token') || '';
      if (valor === null) localStorage.removeItem('pm_token');
      else localStorage.setItem('pm_token', valor);
    } catch (e) { /* navegador sin almacenamiento: la sesion dura lo que la pestaña */ }
    return valor || '';
  }
  var tokenMemoria = '';

  function api(path, body) {
    var opts = { headers: { 'Content-Type': 'application/json', 'X-Sesion': token() || tokenMemoria } };
    if (body !== undefined) { opts.method = 'POST'; opts.body = JSON.stringify(body); }
    return fetch('/api/' + path, opts).then(function (r) {
      return r.text().then(function (t) {
        var j = {};
        try { j = t ? JSON.parse(t) : {}; } catch (e) { j = { error: t.slice(0, 300) }; }
        if (r.status === 401) { pantallaAcceso(); throw new Error('Tienes que entrar otra vez.'); }
        if (!r.ok) throw new Error(j.error || ('Error ' + r.status));
        return j;
      });
    });
  }

  /* ============ utilidades ============ */
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  /* vista=true: para mirarlo en la app, con recuadros donde falta una imagen.
     Sin vista: el HTML limpio que va a Brevo o al archivo. */
  function pintarPlantilla(t, datos, vista) {
    window.PM_VISTA = !!vista;
    try { return t.render(datos); } finally { window.PM_VISTA = false; }
  }
  function html(vista) { return S.plantilla ? pintarPlantilla(S.plantilla, S.datos, vista) : ''; }
  function hoyISO() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function primeraLinea(s) { return String(s || '').split('\n')[0].trim(); }

  /* ============ galería ============ */
  function renderGaleria() {
    var cont = $('galeria'); cont.textContent = '';
    var familias = [];
    P.lista.forEach(function (t) { if (familias.indexOf(t.familia) < 0) familias.push(t.familia); });
    familias.forEach(function (fam) {
      var tpls = P.lista.filter(function (t) { return t.familia === fam; });
      var sec = el('div', 'fam');
      var head = el('div', 'fam-head');
      head.appendChild(el('h2', null, fam));
      head.appendChild(el('span', null, tpls.length + (tpls.length === 1 ? ' plantilla' : ' plantillas')));
      sec.appendChild(head);
      var grid = el('div', 'cards');
      tpls.forEach(function (t) {
        var card = el('div', 'card');
        var thumb = el('div', 'thumb');
        var f = document.createElement('iframe');
        f.setAttribute('title', 'Previsualización de ' + t.nombre);
        f.setAttribute('tabindex', '-1');
        f.srcdoc = pintarPlantilla(t, P.defaults(t), true);
        thumb.appendChild(f);
        card.appendChild(thumb);
        var body = el('div', 'card-body');
        var h3 = el('h3', null, t.nombre);
        if (t.nuevo) h3.appendChild(el('span', 'badge-nuevo', 'Nuevo'));
        body.appendChild(h3);
        body.appendChild(el('p', null, t.tagline));
        var b = el('button', 'btn btn-primary', 'Usar esta plantilla');
        b.addEventListener('click', function () { abrir(t.id, null, null, null); });
        body.appendChild(b);
        card.appendChild(body);
        grid.appendChild(card);
      });
      sec.appendChild(grid);
      cont.appendChild(sec);
    });
  }

  function fechaCorta(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(iso || ''));
    if (!m) return '';
    var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return (+m[3]) + ' ' + meses[+m[2] - 1] + ' · ' + m[4] + ':' + m[5];
  }

  function renderBorradores() {
    var cont = $('drafts'); cont.textContent = '';
    api('borradores').then(function (r) {
      var items = r.borradores || [];
      if (r.aviso) {
        var av = el('div', 'note note-warn', r.aviso);
        av.style.marginTop = '20px';
        cont.appendChild(av);
      }
      if (!items.length) return;
      var enviados = items.filter(function (it) { return it.brevo; }).length;
      var head = el('div', 'fam-head');
      head.appendChild(el('h2', null, 'Tus envíos'));
      head.appendChild(el('span', null, items.length + (items.length === 1 ? ' guardado' : ' guardados') +
        (enviados ? ' · ' + enviados + ' en Brevo' : '')));
      cont.appendChild(head);
      var grid = el('div', 'cards');
      items.forEach(function (it) {
        var t = P.byId[it.plantillaId];
        var card = el('div', 'card');
        var thumb = el('div', 'thumb');
        if (t && it.datos) {
          var f = document.createElement('iframe');
          f.setAttribute('title', 'Previsualización de ' + (it.nombre || 'un envío'));
          f.setAttribute('tabindex', '-1');
          var datos = Object.assign(P.defaults(t), it.datos);
          f.srcdoc = pintarPlantilla(t, datos, true).replace(/(src|background)="\/(?!\/)/g, '$1="' + location.origin + '/');
          thumb.appendChild(f);
        }
        var estado = el('span', 'estado ' + (it.brevo ? 'estado-ok' : 'estado-borrador'),
          it.brevo ? '✓ En Brevo' : 'Borrador');
        if (it.brevo) {
          estado.title = (it.brevo.tipo === 'plantilla' ? 'Guardado como plantilla' : 'Campaña creada') +
            ' el ' + fechaCorta(it.brevo.fecha) + (it.brevo.por ? ' por ' + it.brevo.por.split('@')[0] : '');
        }
        thumb.appendChild(estado);
        card.appendChild(thumb);
        var body = el('div', 'card-body');
        body.appendChild(el('h3', null, it.nombre || '(sin nombre)'));
        var quienLo = (it.editado_por || it.autor || '').split('@')[0];
        body.appendChild(el('p', null, (t ? t.nombre : (it.plantillaId || '')) + ' · ' + fechaCorta(it.guardado) + (quienLo ? ' · ' + quienLo : '')));
        if (it.brevo) {
          body.appendChild(el('p', 'enviado-linea', (it.brevo.tipo === 'plantilla' ? 'Guardado como plantilla en Brevo' : 'Mandado a Brevo') +
            ' el ' + fechaCorta(it.brevo.fecha)));
        }
        var acciones = el('div', 'card-acciones');
        var ab = el('button', 'btn btn-primary btn-sm', 'Abrir');
        ab.addEventListener('click', function () {
          api('borradores/' + encodeURIComponent(it.id)).then(function (d) {
            abrir(d.plantillaId, d.datos, d.id, d.nombre, d.asunto);
          }).catch(aviso);
        });
        acciones.appendChild(ab);
        var dup = el('button', 'btn btn-sm', 'Duplicar');
        dup.addEventListener('click', function () {
          api('borradores/' + encodeURIComponent(it.id)).then(function (d) {
            abrir(d.plantillaId, d.datos, null, (d.nombre || '') + ' (copia)', d.asunto);
          }).catch(aviso);
        });
        acciones.appendChild(dup);
        var bo = el('button', 'btn btn-sm btn-ghost', 'Borrar');
        bo.addEventListener('click', function () {
          confirmar('Borrar “' + (it.nombre || 'este envío') + '”?', 'Se borra solo de esta app. Lo que ya esté en Brevo no se toca.', function () {
            api('borradores/' + encodeURIComponent(it.id) + '/borrar', {}).then(renderBorradores).catch(aviso);
          });
        });
        acciones.appendChild(bo);
        body.appendChild(acciones);
        card.appendChild(body);
        grid.appendChild(card);
      });
      cont.appendChild(grid);
    }).catch(function () { /* sin servidor: la galería sigue funcionando */ });
  }


  /* ============ editor ============ */
  function abrir(plantillaId, datos, id, nombre, asunto) {
    var t = P.byId[plantillaId];
    if (!t) return;
    S.plantilla = t;
    S.datos = datos ? JSON.parse(JSON.stringify(datos)) : P.defaults(t);
    S.id = id || null;
    S.nombre = nombre || (t.nombre + ' · ' + hoyISO());
    S.asunto = asunto || primeraLinea(S.datos.titular || S.datos.destTitulo || t.nombre).replace(/\n/g, ' ');
    S.abiertos = {};
    sucio = false;
    t.grupos.forEach(function (g, i) { S.abiertos[g.titulo] = i < 3; });
    vista('editor');
    renderCampos();
    pintarPreview();
  }

  function vista(cual) {
    var enEditor = cual === 'editor';
    mostrarSolo(enEditor ? 'editor' : 'galeria');
    barra(enEditor);
    crumb(enEditor);
    if (!enEditor) { renderBorradores(); window.scrollTo(0, 0); }
  }

  function crumb(enEditor) {
    var c = $('crumb'); c.textContent = '';
    if (!enEditor) { c.appendChild(el('span', null, 'Plantillas')); return; }
    c.appendChild(el('span', null, S.plantilla.familia));
    c.appendChild(el('span', null, '›'));
    var inp = document.createElement('input');
    inp.type = 'text'; inp.id = 'nombre-envio'; inp.value = S.nombre;
    inp.setAttribute('aria-label', 'Nombre de este envío');
    inp.style.cssText = 'width:min(300px,42vw); font-weight:600; padding:5px 9px;';
    inp.addEventListener('input', function () { S.nombre = inp.value; guardarPronto(); });
    c.appendChild(inp);
  }

  function barra(enEditor) {
    var b = $('bar-actions'); b.textContent = '';
    function add(txt, cls, fn) { var x = el('button', 'btn ' + (cls || ''), txt); x.addEventListener('click', fn); b.appendChild(x); return x; }
    if (!enEditor) {
      var quien = el('div', 'quien');
      quien.appendChild(el('strong', null, YO));
      b.appendChild(quien);
      add('Subida de imágenes', 'btn-ghost', function () { modalWeb(null); });
      add('Conexión con Brevo', 'btn-ghost', function () { modalBrevoAjustes(null); });
      add('Salir', 'btn-ghost', salir);
      return;
    }
    add('Plantillas', 'btn-ghost', salirDelEditor);
    add('Guardar', '', function () { guardar(true); });
    add('Ver el HTML', 'btn-ghost', modalHtml);
    add('Mandar a Brevo', 'btn-primary', modalEnviar);
  }

  function salirDelEditor() {
    if (!sucio) { sucio = false; vista('galeria'); return; }
    var m = modal('Tienes cambios sin guardar');
    m.body.appendChild(el('div', null,
      'Los cambios de “' + (S.nombre || 'este envío') + '” todavía no están guardados. ¿Qué hago?'));
    var cancelar = el('button', 'btn btn-ghost', 'Seguir editando');
    cancelar.addEventListener('click', m.cerrar);
    var salir = el('button', 'btn', 'Salir sin guardar');
    salir.addEventListener('click', function () { sucio = false; m.cerrar(); vista('galeria'); });
    var guardarYSalir = el('button', 'btn btn-primary', 'Guardar y salir');
    guardarYSalir.addEventListener('click', function () {
      guardarYSalir.disabled = true; guardarYSalir.textContent = 'Guardando…';
      guardar(false).then(function () { m.cerrar(); vista('galeria'); }).catch(function (e) {
        guardarYSalir.disabled = false; guardarYSalir.textContent = 'Guardar y salir';
        m.body.appendChild(el('div', 'note note-err', 'No he podido guardarlo: ' + e.message));
      });
    });
    m.foot.appendChild(cancelar);
    m.foot.appendChild(salir);
    m.foot.appendChild(guardarYSalir);
  }

  // Cerrar la pestaña o recargar con cambios a medias: aviso del navegador.
  window.addEventListener('beforeunload', function (ev) {
    if (!sucio) return;
    ev.preventDefault();
    ev.returnValue = '';
  });

  $('ir-inicio').addEventListener('click', function () {
    if ($('vista-editor').hidden) return;
    salirDelEditor();
  });

  /* ---- campos ---- */
  function renderCampos() {
    var cont = $('campos'); cont.textContent = '';
    S.plantilla.grupos.forEach(function (g) {
      var fs = document.createElement('fieldset');
      var lg = document.createElement('legend');
      var btn = el('button', 'grp-btn');
      btn.type = 'button';
      btn.appendChild(el('span', null, g.titulo));
      var chev = el('span', 'chev', S.abiertos[g.titulo] ? '–' : '+');
      btn.appendChild(chev);
      var body = el('div', 'grp-body');
      body.hidden = !S.abiertos[g.titulo];
      btn.setAttribute('aria-expanded', String(!!S.abiertos[g.titulo]));
      btn.addEventListener('click', function () {
        S.abiertos[g.titulo] = !S.abiertos[g.titulo];
        body.hidden = !S.abiertos[g.titulo];
        chev.textContent = S.abiertos[g.titulo] ? '–' : '+';
        btn.setAttribute('aria-expanded', String(!!S.abiertos[g.titulo]));
      });
      lg.appendChild(btn);
      fs.appendChild(lg);
      g.campos.forEach(function (c) { body.appendChild(campo(c)); });
      fs.appendChild(body);
      cont.appendChild(fs);
    });
  }

  /* ---- control de imagen: URL, biblioteca, subida y fotos fijas ---- */
  var MAX_MB = 8;

  function controlImagen(valorInicial, alCambiar, opciones) {
    var o = opciones || {};
    var caja = el('div');
    var fila = el('div', 'img-field');
    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'https://…';
    input.value = valorInicial || '';
    if (o.id) input.id = o.id;
    fila.appendChild(input);

    var bBuscar = el('button', 'btn btn-sm', 'Biblioteca');
    bBuscar.type = 'button';
    bBuscar.title = 'Elegir una imagen que ya está en la web';
    fila.appendChild(bBuscar);

    var bSubir = el('button', 'btn btn-sm', 'Subir');
    bSubir.type = 'button';
    bSubir.title = 'Subir una imagen desde este ordenador';
    fila.appendChild(bSubir);
    caja.appendChild(fila);

    var estado = el('div', 'help');
    caja.appendChild(estado);
    var mini = el('div', 'img-preview');
    caja.appendChild(mini);

    function fijar(v) {
      input.value = v;
      alCambiar(v);
      pintarMini();
    }
    function pintarMini() {
      mini.textContent = '';
      var v = String(input.value || '').trim();
      if (!v) {
        mini.hidden = false;
        mini.className = 'img-vacia';
        mini.textContent = 'Todavía no hay imagen: súbela o pega su dirección';
        return;
      }
      mini.className = 'img-preview';
      mini.hidden = false;
      var im = document.createElement('img');
      im.src = v; im.alt = '';
      im.onerror = function () {
        mini.textContent = '';
        mini.appendChild(el('div', 'note note-warn', 'Esta dirección no carga. En el correo tampoco se vería.'));
      };
      mini.appendChild(im);
    }
    input.addEventListener('input', function () { alCambiar(input.value); pintarMini(); });
    bBuscar.addEventListener('click', function () { modalMedios(fijar); });
    bSubir.addEventListener('click', function () { elegirArchivo(fijar, estado, o.proporcion); });
    pintarMini();

    if (o.galeria === 'ponentes') caja.appendChild(tiraPonentes(fijar, estado));
    return caja;
  }

  function elegirArchivo(fijar, estado, proporcion) {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/jpeg,image/png,image/webp';
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      if (f.size > MAX_MB * 1024 * 1024) {
        estado.textContent = 'Ese archivo pesa ' + (f.size / 1048576).toFixed(1) + ' MB y el límite son ' + MAX_MB + ' MB.';
        estado.className = 'help';
        return;
      }
      estado.className = 'help';
      estado.textContent = 'Subiendo a la biblioteca de la web…';
      var fr = new FileReader();
      fr.onload = function () {
        api('subir', { nombre: f.name, datos: String(fr.result), proporcion: proporcion || '' }).then(function (r) {
          fijar(r.url);
          estado.textContent = (proporcion ? 'Recortada a ' + proporcion + ', subida' : 'Subida') +
            ' y optimizada: ' + r.original_kb + ' KB → ' + r.kb + ' KB.';
        }).catch(function (e) {
          estado.textContent = '';
          if (/configurado la subida/.test(e.message)) {
            modalWeb(function () { estado.textContent = 'Vuelve a darle a Subir.'; });
          } else {
            estado.textContent = 'No se ha podido subir: ' + e.message;
          }
        });
      };
      fr.readAsDataURL(f);
    });
    inp.click();
  }

  function tiraPonentes(fijar, estado) {
    var caja = el('div');
    caja.style.cssText = 'margin-top:10px;';
    var t = el('div', 'help', 'O las de siempre:');
    caja.appendChild(t);
    var tira = el('div');
    tira.style.cssText = 'display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;';
    caja.appendChild(tira);
    api('ponentes').then(function (r) {
      if (!(r.items || []).length) {
        t.textContent = 'Para tener fotos fijas aquí, deja los archivos en la carpeta ponentes/ de la app.';
        return;
      }
      r.items.forEach(function (it) {
        var b = el('button');
        b.type = 'button';
        b.title = it.titulo + (it.url ? '' : ' · se publicará en la web al elegirla');
        b.style.cssText = 'padding:0; border:1px solid var(--line-strong); background:var(--surface2); border-radius:50%; width:52px; height:52px; overflow:hidden; cursor:pointer;';
        var im = document.createElement('img');
        im.src = it.thumb;
        im.alt = it.titulo;
        im.style.cssText = 'width:100%; height:100%; object-fit:cover; object-position:top center; display:block;';
        b.appendChild(im);
        b.addEventListener('click', function () {
          if (it.url) { fijar(it.url); estado.textContent = 'Foto de ' + it.titulo + '.'; return; }
          estado.textContent = 'Publicando la foto en la web…';
          api('ponentes/publicar', { archivo: it.archivo }).then(function (res) {
            it.url = res.url;
            fijar(res.url);
            estado.textContent = 'Lista: ' + it.titulo + ' ya tiene dirección pública.';
          }).catch(function (e) {
            estado.textContent = '';
            if (/configurado la subida/.test(e.message)) modalWeb(function () { estado.textContent = 'Vuelve a tocar la foto.'; });
            else estado.textContent = 'No se ha podido publicar: ' + e.message;
          });
        });
        tira.appendChild(b);
      });
    }).catch(function () { t.textContent = ''; });
    return caja;
  }

  function campo(c) {
    if (c.type === 'lista') return campoLista(c);
    var wrap = el('div', 'field');
    var lab = document.createElement('label');
    lab.setAttribute('for', 'f-' + c.k);
    lab.appendChild(el('span', null, c.label));
    var cnt = null;
    if (c.max) { cnt = el('span', 'count'); lab.appendChild(cnt); }
    wrap.appendChild(lab);

    if (c.type === 'image') {
      wrap.appendChild(controlImagen(S.datos[c.k], function (v) { S.datos[c.k] = v; cambio(); },
        { id: 'f-' + c.k, galeria: c.galeria, proporcion: c.proporcion }));
      if (c.help) wrap.appendChild(el('div', 'help', c.help));
      return wrap;
    }

    var input;
    if (c.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = c.rows || 3;
    } else {
      input = document.createElement('input');
      input.type = c.type === 'date' ? 'date' : c.type === 'time' ? 'time' : c.type === 'url' ? 'url' : 'text';
    }
    input.id = 'f-' + c.k;
    input.value = S.datos[c.k] == null ? '' : S.datos[c.k];
    function sync() {
      S.datos[c.k] = input.value;
      if (cnt) {
        cnt.textContent = input.value.length + '/' + c.max;
        cnt.classList.toggle('over', input.value.length > c.max);
      }
      cambio();
    }
    input.addEventListener('input', sync);
    wrap.appendChild(input);
    if (cnt) { cnt.textContent = String(input.value.length) + '/' + c.max; cnt.classList.toggle('over', input.value.length > c.max); }
    if (c.help) wrap.appendChild(el('div', 'help', c.help));
    return wrap;
  }

  function campoLista(c) {
    var wrap = el('div', 'field');
    var lab = document.createElement('label');
    lab.textContent = c.label;
    wrap.appendChild(lab);
    var host = el('div');
    host.style.cssText = 'display:flex; flex-direction:column; gap:10px;';
    wrap.appendChild(host);

    function pintar() {
      host.textContent = '';
      var arr = S.datos[c.k] || (S.datos[c.k] = []);
      arr.forEach(function (item, idx) {
        var box = el('div', 'rep');
        var head = el('div', 'rep-head');
        head.appendChild(el('span', 'n', ('0' + (idx + 1)).slice(-2)));
        var tools = el('div', 'rep-tools');
        function tool(sym, titulo, fn, off) {
          var b = el('button', 'icon-btn', sym);
          b.type = 'button'; b.title = titulo; b.setAttribute('aria-label', titulo);
          b.disabled = !!off;
          b.addEventListener('click', fn);
          tools.appendChild(b);
        }
        tool('↑', 'Subir en la lista', function () { arr.splice(idx - 1, 0, arr.splice(idx, 1)[0]); pintar(); cambio(); }, idx === 0);
        tool('↓', 'Bajar en la lista', function () { arr.splice(idx + 1, 0, arr.splice(idx, 1)[0]); pintar(); cambio(); }, idx === arr.length - 1);
        tool('✕', 'Quitar', function () { arr.splice(idx, 1); pintar(); cambio(); });
        head.appendChild(tools);
        box.appendChild(head);
        c.item.forEach(function (sub) {
          var f = el('div', 'field');
          var l = document.createElement('label');
          l.textContent = sub.label;
          var cnt = null;
          if (sub.max) { cnt = el('span', 'count'); l.appendChild(cnt); }
          f.appendChild(l);
          if (sub.type === 'image') {
            f.appendChild(controlImagen(item[sub.k], function (v) { item[sub.k] = v; cambio(); },
              { galeria: sub.galeria, proporcion: sub.proporcion }));
            if (sub.help) f.appendChild(el('div', 'help', sub.help));
            box.appendChild(f);
            return;
          }
          var inp;
          if (sub.type === 'textarea') { inp = document.createElement('textarea'); inp.rows = sub.rows || 2; }
          else { inp = document.createElement('input'); inp.type = 'text'; }
          inp.value = item[sub.k] == null ? '' : item[sub.k];
          inp.addEventListener('input', function () {
            item[sub.k] = inp.value;
            if (cnt) { cnt.textContent = inp.value.length + '/' + sub.max; cnt.classList.toggle('over', inp.value.length > sub.max); }
            cambio();
          });
          f.appendChild(inp);
          if (cnt) { cnt.textContent = inp.value.length + '/' + sub.max; }
          box.appendChild(f);
        });
        host.appendChild(box);
      });
      var add = el('button', 'btn btn-sm', '+ Añadir');
      add.type = 'button';
      add.disabled = arr.length >= (c.max || 99);
      add.addEventListener('click', function () {
        var nuevo = {};
        c.item.forEach(function (s) { nuevo[s.k] = s.def == null ? '' : s.def; });
        arr.push(nuevo); pintar(); cambio();
      });
      host.appendChild(add);
    }
    pintar();
    return wrap;
  }

  /* ---- vista previa ---- */
  function cambio() {
    sucio = true;
    clearTimeout(timerPrev);
    timerPrev = setTimeout(pintarPreview, 260);
    guardarPronto();
  }
  function pintarPreview() {
    var f = $('preview');
    if (!f || !S.plantilla) return;
    function ajustar() {
      try {
        var doc = f.contentDocument;
        var alto = doc && doc.body ? Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight) : 0;
        f.style.height = (alto > 0 ? alto + 24 : 1400) + 'px';
      } catch (e) { f.style.height = '1400px'; }
    }
    f.onload = ajustar;
    // Solo para la previa: las rutas que empiezan por / se resuelven contra el servidor local.
    // El HTML que se manda a Brevo no se toca.
    f.srcdoc = html(true).replace(/(src|background)="\/(?!\/)/g, '$1="' + location.origin + '/');
    // Las imagenes llegan despues de onload y cambian el alto.
    setTimeout(ajustar, 120);
    setTimeout(ajustar, 600);
    setTimeout(ajustar, 1800);
  }
  $('btn-ancho').addEventListener('click', function () {
    S.movil = !S.movil;
    $('frame').classList.toggle('movil', S.movil);
    this.textContent = S.movil ? 'Ver en escritorio' : 'Ver en móvil';
    $('lienzo-label').textContent = S.movil ? 'móvil · 390 px' : 'escritorio · correo de 640 px';
    setTimeout(pintarPreview, 30);
  });
  $('tab-editar').addEventListener('click', function () { modo('editar'); });
  $('tab-ver').addEventListener('click', function () { modo('ver'); });
  function modo(m) {
    var ed = $('vista-editor');
    ed.classList.toggle('m-editar', m === 'editar');
    ed.classList.toggle('m-ver', m === 'ver');
    $('tab-editar').setAttribute('aria-pressed', String(m === 'editar'));
    $('tab-ver').setAttribute('aria-pressed', String(m === 'ver'));
  }

  /* ---- guardado ---- */
  function guardarPronto() {
    clearTimeout(timerSave);
    timerSave = setTimeout(function () { guardar(false); }, 1400);
  }
  // Los guardados van en fila: si se piden dos a la vez (p. ej. al mandar a Brevo),
  // el segundo espera al primero y ya usa su id, así no se duplica el envío.
  var colaGuardar = Promise.resolve();
  function guardar(avisar) {
    if (!S.plantilla) return Promise.resolve();
    colaGuardar = colaGuardar.then(function () {
      return api('borradores/guardar', {
        id: S.id, nombre: S.nombre, plantillaId: S.plantilla.id, asunto: S.asunto, datos: S.datos
      }).then(function (r) {
        S.id = r.id;
        sucio = false;
        if (avisar) toast('Guardado');
      }).catch(function (e) {
        if (avisar) aviso(e);
      });
    });
    return colaGuardar;
  }

  /* ============ modales ============ */
  function modal(titulo, ancho) {
    var back = el('div', 'modal');
    var card = el('div', 'modal-card' + (ancho ? ' ancho' : ''));
    var head = el('div', 'modal-head');
    head.appendChild(el('h2', null, titulo));
    var x = el('button', 'btn btn-sm btn-ghost', 'Cerrar');
    x.addEventListener('click', cerrar);
    head.appendChild(x);
    var body = el('div', 'modal-body');
    var foot = el('div', 'modal-foot');
    card.appendChild(head); card.appendChild(body); card.appendChild(foot);
    back.appendChild(card);
    back.addEventListener('click', function (ev) { if (ev.target === back) cerrar(); });
    document.addEventListener('keydown', esc);
    function esc(ev) { if (ev.key === 'Escape') cerrar(); }
    function cerrar() { document.removeEventListener('keydown', esc); back.remove(); }
    $('modales').appendChild(back);
    return { body: body, foot: foot, cerrar: cerrar, card: card };
  }
  function toast(txt) {
    var t = el('div', null, txt);
    t.style.cssText = 'position:fixed; left:50%; transform:translateX(-50%); bottom:24px; z-index:90; background:var(--ink); color:var(--bg); padding:9px 16px; border-radius:999px; font-size:13px; font-weight:600; box-shadow:var(--shadow);';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }
  function aviso(e) {
    var m = modal('Algo ha fallado');
    m.body.appendChild(el('div', 'note note-err', String(e && e.message ? e.message : e)));
    var ok = el('button', 'btn', 'Entendido');
    ok.addEventListener('click', m.cerrar);
    m.foot.appendChild(ok);
  }
  function confirmar(titulo, texto, fn) {
    var m = modal(titulo);
    m.body.appendChild(el('div', null, texto));
    var no = el('button', 'btn btn-ghost', 'Cancelar');
    no.addEventListener('click', m.cerrar);
    var si = el('button', 'btn btn-primary', 'Sí, borrar');
    si.addEventListener('click', function () { m.cerrar(); fn(); });
    m.foot.appendChild(no); m.foot.appendChild(si);
  }

  /* ---- HTML ---- */
  function modalHtml() {
    var m = modal('El HTML de este envío', true);
    var code = html();
    m.body.appendChild(el('div', 'note note-info', 'Solo lo necesitas si quieres pegarlo a mano en Brevo. Con el botón “Mandar a Brevo” no hace falta.'));
    var pre = el('pre', 'html-out', code);
    m.body.appendChild(pre);
    var cp = el('button', 'btn', 'Copiar al portapapeles');
    cp.addEventListener('click', function () {
      navigator.clipboard.writeText(code).then(function () { cp.textContent = 'Copiado'; }, function () {
        var r = document.createRange(); r.selectNodeContents(pre);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        cp.textContent = 'Selecciónalo y copia';
      });
    });
    var dl = el('button', 'btn btn-ghost', 'Guardar como archivo');
    dl.addEventListener('click', function () {
      api('exportar', { nombre: S.nombre, html: code }).then(function (r) {
        toast('Guardado en ' + r.ruta);
      }).catch(aviso);
    });
    m.foot.appendChild(dl); m.foot.appendChild(cp);
  }

  /* ---- biblioteca de imágenes ---- */
  function modalMedios(alElegir) {
    var m = modal('Imágenes de la web de Playoff', true);
    m.body.appendChild(el('div', 'note note-info', 'Son las imágenes de la biblioteca de medios de playoffinformatica.com. Su URL es pública, así que se ven en cualquier correo. Si la foto que quieres no está aquí, súbela primero a la web o a Brevo y pega su URL a mano.'));
    var buscador = el('div');
    buscador.style.cssText = 'display:flex; gap:6px;';
    var q = document.createElement('input');
    q.type = 'text'; q.placeholder = 'Buscar por nombre: nóminas, webinar, equipo…';
    buscador.appendChild(q);
    var go = el('button', 'btn', 'Buscar');
    buscador.appendChild(go);
    m.body.appendChild(buscador);
    var grid = el('div', 'media-grid');
    m.body.appendChild(grid);
    var estado = el('div', 'help', '');
    m.body.appendChild(estado);

    function buscar() {
      grid.textContent = '';
      estado.textContent = 'Buscando…';
      api('medios?q=' + encodeURIComponent(q.value)).then(function (r) {
        estado.textContent = (r.items || []).length ? '' : 'No hay imágenes con ese nombre.';
        (r.items || []).forEach(function (it) {
          var b = el('button', 'media-item');
          b.type = 'button';
          var im = document.createElement('img');
          im.src = it.thumb || it.url; im.alt = it.titulo || '';
          im.loading = 'lazy';
          b.appendChild(im);
          b.appendChild(el('span', null, it.titulo || it.url.split('/').pop()));
          b.addEventListener('click', function () { alElegir(it.url); m.cerrar(); });
          grid.appendChild(b);
        });
      }).catch(function (e) { estado.textContent = 'No he podido leer la biblioteca: ' + e.message; });
    }
    go.addEventListener('click', buscar);
    q.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); buscar(); } });
    buscar();
  }

  /* ---- Biblioteca de imágenes de la web ---- */
  function modalWeb(alConectar) {
    var m = modal('Subir imágenes a la web');
    var info = el('div', 'note note-info');
    info.innerHTML = 'Para que una foto se vea en el correo tiene que estar publicada en algún sitio. La app las sube a la <strong>biblioteca de medios de playoffinformatica.com</strong>. Necesita tu usuario y una <strong>contraseña de aplicación</strong> (no la de entrar a WordPress): en WordPress, <code>Usuarios → Perfil → Contraseñas de aplicación</code>, creas una llamada por ejemplo “Playoff Mailer”. Se guarda solo en este ordenador.';
    m.body.appendChild(info);

    function campoTxt(id, label, tipo, ph) {
      var f = el('div', 'field');
      var l = document.createElement('label'); l.textContent = label; l.setAttribute('for', id);
      var i = document.createElement('input'); i.type = tipo; i.id = id; i.autocomplete = 'off';
      if (ph) i.placeholder = ph;
      f.appendChild(l); f.appendChild(i);
      m.body.appendChild(f);
      return i;
    }
    var iUser = campoTxt('wp-user', 'Usuario de WordPress', 'text', '');
    var iPass = campoTxt('wp-pass', 'Contraseña de aplicación', 'password', 'xxxx xxxx xxxx xxxx');
    var res = el('div');
    m.body.appendChild(res);

    var b = el('button', 'btn btn-primary', 'Guardar');
    api('web/estado').then(function (r) {
      if (r.fijado) {
        res.appendChild(el('div', 'note note-ok', 'Esto lo configura el administrador en el servidor: las imágenes ya se suben solas.'));
        iUser.parentNode.hidden = true;
        iPass.parentNode.hidden = true;
        b.hidden = true;
        return;
      }
      if (r.supabase) {
        res.appendChild(el('div', 'note note-ok', 'No hace falta configurar nada: las imágenes que subas se guardan en el almacén del equipo (Supabase).'));
        info.hidden = true;
        iUser.parentNode.hidden = true;
        iPass.parentNode.hidden = true;
        b.hidden = true;
        return;
      }
      if (r.brevo_imagenes && !r.conectado) {
        res.appendChild(el('div', 'note note-ok', 'No hace falta configurar nada: las imágenes que subas van a la biblioteca de Brevo. ' +
          'Solo si prefieres que vayan a la web de Playoff, rellena esto.'));
      }
      if (r.conectado) {
        res.appendChild(el('div', 'note note-ok', 'Ya configurada con el usuario ' + r.usuario + '. Si rellenas los campos, la sustituyes.'));
        iUser.value = r.usuario;
      }
    }).catch(function () {});
    b.addEventListener('click', function () {
      if (!iUser.value.trim() || !iPass.value.trim()) {
        res.textContent = '';
        res.appendChild(el('div', 'note note-warn', 'Rellena el usuario y la contraseña de aplicación.'));
        return;
      }
      b.disabled = true; b.textContent = 'Comprobando…';
      api('web/credenciales', { usuario: iUser.value.trim(), clave: iPass.value.trim() }).then(function (r) {
        res.textContent = '';
        res.appendChild(el('div', 'note note-ok', 'Listo, conectada como ' + (r.nombre || iUser.value) + '.'));
        iPass.value = '';
        b.disabled = false; b.textContent = 'Guardar';
        if (alConectar) setTimeout(function () { m.cerrar(); alConectar(); }, 700);
      }).catch(function (e) {
        res.textContent = '';
        res.appendChild(el('div', 'note note-err', 'La web no las acepta: ' + e.message));
        b.disabled = false; b.textContent = 'Guardar';
      });
    });
    m.foot.appendChild(b);
  }

  /* ---- Brevo: ajustes ---- */
  function modalBrevoAjustes(alConectar) {
    var m = modal('Conexión con Brevo');
    var info = el('div', 'note note-info');
    info.innerHTML = 'La clave se guarda <strong>en este ordenador</strong> (en tu carpeta de usuario), no en internet, y la app solo la usa para crear borradores. Crea una clave nueva en Brevo: <code>Ajustes → SMTP y API → Claves API</code>. Si algún día quieres cortar el acceso, bórrala allí.';
    m.body.appendChild(info);
    var f = el('div', 'field');
    var l = document.createElement('label'); l.textContent = 'Clave API de Brevo'; l.setAttribute('for', 'brevo-key');
    var i = document.createElement('input'); i.type = 'password'; i.id = 'brevo-key'; i.placeholder = 'xkeysib-…';
    i.autocomplete = 'off';
    f.appendChild(l); f.appendChild(i);
    m.body.appendChild(f);
    var res = el('div');
    m.body.appendChild(res);
    var guardar = el('button', 'btn btn-primary', 'Conectar');

    api('brevo/estado').then(function (r) {
      res.textContent = '';
      if (r.fijado) {
        res.appendChild(el('div', 'note note-ok', 'La clave la pone el administrador en el servidor, así que aquí no hay nada que tocar.'));
        f.hidden = true;
        guardar.hidden = true;
        return;
      }
      if (r.conectado) {
        res.appendChild(el('div', 'note note-ok', 'Conectada' + (r.cuenta ? ' a la cuenta de ' + r.cuenta : '') + '. Si pegas otra clave, sustituye a la actual.'));
      }
    }).catch(function () {});

    guardar.addEventListener('click', function () {
      if (!i.value.trim()) { res.textContent = ''; res.appendChild(el('div', 'note note-warn', 'Pega primero la clave.')); return; }
      guardar.disabled = true; guardar.textContent = 'Comprobando…';
      api('brevo/clave', { clave: i.value.trim() }).then(function (r) {
        res.textContent = '';
        res.appendChild(el('div', 'note note-ok', 'Listo, conectada a ' + (r.cuenta || 'tu cuenta de Brevo') + '.'));
        i.value = '';
        guardar.disabled = false; guardar.textContent = 'Conectar';
        if (alConectar) setTimeout(function () { m.cerrar(); alConectar(); }, 700);
      }).catch(function (e) {
        res.textContent = '';
        res.appendChild(el('div', 'note note-err', 'Brevo no la acepta: ' + e.message));
        guardar.disabled = false; guardar.textContent = 'Conectar';
      });
    });
    m.foot.appendChild(guardar);
  }

  /* ---- Brevo: crear el borrador ---- */
  function modalEnviar() {
    api('brevo/estado').then(function (r) {
      if (!r.conectado) { modalBrevoAjustes(modalEnviar); return; }
      pintarEnviar();
    }).catch(function () { modalBrevoAjustes(modalEnviar); });
  }

  function revisiones() {
    var out = [];
    var code = html();
    if (!S.asunto || !S.asunto.trim()) out.push('Falta el asunto.');
    var imgs = (code.match(/src="([^"]*)"/g) || []).map(function (s) { return s.slice(5, -1); });
    if (imgs.some(function (u) { return u === '#' || !u; })) out.push('Hay una imagen sin URL: en el correo saldría un hueco.');
    if (imgs.some(function (u) { return /^http:\/\//i.test(u); })) out.push('Alguna imagen usa http en vez de https: muchos correos la bloquean.');
    if (imgs.some(function (u) { return u && !/^https:\/\//i.test(u) && u !== '#'; })) out.push('Alguna imagen no tiene dirección pública todavía: súbela con el botón Subir, o en el correo saldrá rota.');
    P.campos(S.plantilla).forEach(function (c) {
      if (c.requerida && !String(S.datos[c.k] || '').trim()) out.push('Falta «' + c.label + '»: sin ella ese bloque sale vacío.');
    });
    var fondos = (code.match(/background="([^"]*)"/g) || []).map(function (s) { return s.slice(12, -1); });
    if (imgs.concat(fondos).some(function (u) { return /\.webp(\?|$)/i.test(u); })) {
      out.push('Hay alguna imagen en WebP: Outlook de escritorio no la muestra. Mejor súbela otra vez con el botón Subir, que la pasa a JPG.');
    }
    var vacios = (code.match(/href="#"/g) || []).length;
    if (vacios) out.push(vacios + (vacios === 1 ? ' enlace está' : ' enlaces están') + ' sin rellenar.');
    return out;
  }

  function pintarEnviar() {
    var m = modal('Mandar a Brevo');
    m.body.appendChild(el('div', 'note note-info', 'Se crea la campaña <strong>en borrador</strong>. No se envía nada: en Brevo terminas de elegir lista, asunto y hora, y le das a enviar tú.'));
    var rev = revisiones();
    if (rev.length) {
      var w = el('div', 'note note-warn');
      w.appendChild(el('div', null, 'Antes de seguir, ojo con esto:'));
      var ul = document.createElement('ul');
      ul.style.cssText = 'margin:6px 0 0; padding-left:18px;';
      rev.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
      w.appendChild(ul);
      m.body.appendChild(w);
    }
    function campoTexto(id, label, valor, help) {
      var f = el('div', 'field');
      var l = document.createElement('label'); l.textContent = label; l.setAttribute('for', id);
      var i = document.createElement('input'); i.type = 'text'; i.id = id; i.value = valor || '';
      f.appendChild(l); f.appendChild(i);
      if (help) f.appendChild(el('div', 'help', help));
      m.body.appendChild(f);
      return i;
    }
    var iNombre = campoTexto('br-nombre', 'Nombre de la campaña en Brevo', S.nombre, 'Interno, solo lo ves tú en la lista de campañas.');
    var iAsunto = campoTexto('br-asunto', 'Asunto', S.asunto, 'Lo puedes cambiar luego en Brevo.');

    var fRem = el('div', 'field');
    var lRem = document.createElement('label'); lRem.textContent = 'Remitente'; lRem.setAttribute('for', 'br-rem');
    var sRem = document.createElement('select'); sRem.id = 'br-rem';
    fRem.appendChild(lRem); fRem.appendChild(sRem);
    m.body.appendChild(fRem);

    var fLis = el('div', 'field');
    var lLis = document.createElement('label'); lLis.textContent = 'Lista de destinatarios'; lLis.setAttribute('for', 'br-lista');
    var sLis = document.createElement('select'); sLis.id = 'br-lista';
    fLis.appendChild(lLis); fLis.appendChild(sLis);
    fLis.appendChild(el('div', 'help', 'Brevo necesita una lista para crear la campaña. La puedes cambiar allí antes de enviar.'));
    m.body.appendChild(fLis);

    var estado = el('div');
    m.body.appendChild(estado);

    var bPlantilla = el('button', 'btn btn-ghost', 'Guardar como plantilla');
    var bCrear = el('button', 'btn btn-primary', 'Crear el borrador');
    bCrear.disabled = true; bPlantilla.disabled = true;
    m.foot.appendChild(bPlantilla); m.foot.appendChild(bCrear);

    estado.appendChild(el('div', 'help', 'Leyendo tus remitentes y listas de Brevo…'));
    api('brevo/opciones').then(function (r) {
      estado.textContent = '';
      (r.senders || []).forEach(function (s) {
        var o = document.createElement('option');
        o.value = s.email; o.textContent = (s.name ? s.name + ' · ' : '') + s.email;
        o.dataset.nombre = s.name || '';
        sRem.appendChild(o);
      });
      (r.lists || []).forEach(function (L) {
        var o = document.createElement('option');
        o.value = String(L.id);
        o.textContent = L.name + (L.totalSubscribers != null ? ' (' + L.totalSubscribers + ')' : '');
        sLis.appendChild(o);
      });
      if (!sRem.options.length) estado.appendChild(el('div', 'note note-warn', 'Tu cuenta no devuelve remitentes. Crea uno en Brevo (Ajustes → Remitentes) y vuelve.'));
      if (!sLis.options.length) estado.appendChild(el('div', 'note note-warn', 'No hay listas de contactos en la cuenta.'));
      bCrear.disabled = !sRem.options.length || !sLis.options.length;
      bPlantilla.disabled = !sRem.options.length;
    }).catch(function (e) {
      estado.textContent = '';
      estado.appendChild(el('div', 'note note-err', 'No he podido leer los datos de Brevo: ' + e.message));
    });

    function remitente() {
      var o = sRem.options[sRem.selectedIndex];
      return { email: o.value, name: o.dataset.nombre || o.value };
    }
    function marcarEnviado(tipo, idBrevo) {
      // Se guarda primero para tener id, y luego se apunta en el borrador que ya está en Brevo.
      return guardar(false).then(function () {
        if (!S.id) return;
        return api('borradores/' + encodeURIComponent(S.id) + '/enviado', { tipo: tipo, id: idBrevo });
      }).catch(function () { /* si falla, el envío a Brevo ya está hecho */ });
    }
    function exito(titulo, detalle) {
      m.cerrar();
      var k = modal(titulo);
      k.body.appendChild(el('div', 'note note-ok', detalle));
      k.body.appendChild(el('div', null, 'Abre Brevo, revisa el asunto y la lista, y envíalo cuando quieras.'));
      var ir = document.createElement('a');
      ir.href = 'https://app.brevo.com/'; ir.target = '_blank'; ir.rel = 'noopener';
      ir.className = 'btn btn-primary'; ir.textContent = 'Abrir Brevo';
      k.foot.appendChild(ir);
    }

    bCrear.addEventListener('click', function () {
      bCrear.disabled = true; bCrear.textContent = 'Creando…';
      S.nombre = iNombre.value; S.asunto = iAsunto.value;
      guardar(false);
      api('brevo/campana', {
        nombre: iNombre.value, asunto: iAsunto.value, html: html(),
        remitente: remitente(), listId: Number(sLis.value)
      }).then(function (r) {
        marcarEnviado('campana', r.id);
        exito('Borrador creado en Brevo', 'La campaña “' + iNombre.value + '” está en Brevo como borrador (id ' + r.id + ').');
      }).catch(function (e) {
        bCrear.disabled = false; bCrear.textContent = 'Crear el borrador';
        estado.textContent = '';
        estado.appendChild(el('div', 'note note-err', 'Brevo ha rechazado la campaña: ' + e.message));
      });
    });

    bPlantilla.addEventListener('click', function () {
      bPlantilla.disabled = true; bPlantilla.textContent = 'Guardando…';
      api('brevo/plantilla', {
        nombre: iNombre.value, asunto: iAsunto.value, html: html(), remitente: remitente()
      }).then(function (r) {
        marcarEnviado('plantilla', r.id);
        exito('Plantilla guardada en Brevo', 'Ya está en tu biblioteca de plantillas (id ' + r.id + ').');
      }).catch(function (e) {
        bPlantilla.disabled = false; bPlantilla.textContent = 'Guardar como plantilla';
        estado.textContent = '';
        estado.appendChild(el('div', 'note note-err', 'Brevo ha rechazado la plantilla: ' + e.message));
      });
    });
  }

  /* ============ acceso ============ */
  function mostrarSolo(cual) {
    $('vista-acceso').hidden = cual !== 'acceso';
    $('vista-galeria').hidden = cual !== 'galeria';
    $('vista-editor').hidden = cual !== 'editor';
    document.querySelector('.topbar').hidden = cual === 'acceso';
    $('tabs').hidden = cual !== 'editor';
  }

  function pantallaAcceso(mensaje) {
    mostrarSolo('acceso');
    var host = $('acceso-paso');
    host.textContent = '';
    api('sesion').then(function (r) {
      if (!r.brevo) { pasoBrevo(host, r); return; }
      pasoCorreo(host, r, mensaje);
    }).catch(function () { pasoCorreo(host, { dominio: 'playoffinformatica.com' }, mensaje); });
  }

  function cabecera(host, titulo, sub) {
    var h = document.createElement('h1');
    h.textContent = titulo;
    host.appendChild(h);
    var p = el('p', 'sub', sub);
    host.appendChild(p);
  }

  function pasoBrevo(host, info) {
    cabecera(host, 'Primero, conecta Brevo',
      'La app te manda el código de acceso por correo, y para eso necesita la clave de Brevo. Se guarda solo en este ordenador.');
    var f = el('div', 'field');
    var l = document.createElement('label'); l.textContent = 'Clave API de Brevo'; l.setAttribute('for', 'ac-key');
    var i = document.createElement('input'); i.type = 'password'; i.id = 'ac-key'; i.placeholder = 'xkeysib-…'; i.autocomplete = 'off';
    f.appendChild(l); f.appendChild(i);
    host.appendChild(f);
    var res = el('div');
    host.appendChild(res);
    var b = el('button', 'btn btn-primary', 'Conectar Brevo');
    b.addEventListener('click', function () {
      if (!i.value.trim()) return;
      b.disabled = true; b.textContent = 'Comprobando…';
      api('brevo/clave', { clave: i.value.trim() }).then(function () {
        pantallaAcceso();
      }).catch(function (e) {
        res.textContent = '';
        res.appendChild(el('div', 'note note-err', 'Brevo no la acepta: ' + e.message));
        b.disabled = false; b.textContent = 'Conectar Brevo';
      });
    });
    host.appendChild(b);
  }

  function pasoCorreo(host, info, mensaje) {
    cabecera(host, 'Entra con tu correo de Playoff',
      'Te mandamos un código de seis cifras. Solo valen los correos @' + (info.dominio || 'playoffinformatica.com') + '.');
    if (mensaje) host.appendChild(el('div', 'note note-warn', mensaje));
    var f = el('div', 'field');
    var l = document.createElement('label'); l.textContent = 'Tu correo'; l.setAttribute('for', 'ac-correo');
    var i = document.createElement('input'); i.type = 'email'; i.id = 'ac-correo';
    i.placeholder = 'nombre@' + (info.dominio || 'playoffinformatica.com');
    i.autocomplete = 'username';
    try { i.value = localStorage.getItem('pm_correo') || ''; } catch (e) {}
    f.appendChild(l); f.appendChild(i);
    host.appendChild(f);
    var res = el('div');
    host.appendChild(res);
    var b = el('button', 'btn btn-primary', 'Enviarme el código');
    function pedir() {
      var correo = i.value.trim().toLowerCase();
      if (!correo) return;
      b.disabled = true; b.textContent = 'Enviando…';
      res.textContent = '';
      api('sesion/codigo', { correo: correo }).then(function (r) {
        try { localStorage.setItem('pm_correo', correo); } catch (e) {}
        pasoCodigo(host, info, correo, r.minutos);
      }).catch(function (e) {
        res.appendChild(el('div', 'note note-err', e.message));
        b.disabled = false; b.textContent = 'Enviarme el código';
      });
    }
    i.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); pedir(); } });
    b.addEventListener('click', pedir);
    host.appendChild(b);
  }

  function pasoCodigo(host, info, correo, minutos) {
    host.textContent = '';
    cabecera(host, 'Mira tu correo', 'Hemos enviado un código a ' + correo + '. Caduca en ' + (minutos || 10) + ' minutos.');
    var f = el('div', 'field');
    var l = document.createElement('label'); l.textContent = 'Código'; l.setAttribute('for', 'ac-codigo');
    var i = document.createElement('input');
    i.type = 'text'; i.id = 'ac-codigo'; i.className = 'codigo-input';
    i.inputMode = 'numeric'; i.maxLength = 6; i.autocomplete = 'one-time-code'; i.placeholder = '······';
    f.appendChild(l); f.appendChild(i);
    host.appendChild(f);
    var res = el('div');
    host.appendChild(res);
    var b = el('button', 'btn btn-primary', 'Entrar');
    function entrar() {
      var codigo = i.value.trim();
      if (codigo.length < 6) return;
      b.disabled = true; b.textContent = 'Comprobando…';
      res.textContent = '';
      api('sesion/verificar', { correo: correo, codigo: codigo }).then(function (r) {
        token(r.token);
        tokenMemoria = r.token;
        arrancar(r.correo);
      }).catch(function (e) {
        res.appendChild(el('div', 'note note-err', e.message));
        b.disabled = false; b.textContent = 'Entrar';
        i.value = ''; i.focus();
      });
    }
    i.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); entrar(); } });
    i.addEventListener('input', function () { if (i.value.length === 6) entrar(); });
    b.addEventListener('click', entrar);
    host.appendChild(b);
    var pie = el('div', 'acceso-pie');
    pie.appendChild(el('span', null, '¿No te llega? '));
    var otro = el('button', null, 'Prueba con otro correo');
    otro.addEventListener('click', function () { pantallaAcceso(); });
    pie.appendChild(otro);
    host.appendChild(pie);
    setTimeout(function () { i.focus(); }, 60);
  }

  function salir() {
    api('sesion/salir', {}).catch(function () {});
    token(null);
    tokenMemoria = '';
    pantallaAcceso('Has salido.');
  }

  /* ============ arranque ============ */
  var YO = '';
  function arrancar(correo) {
    YO = correo || '';
    renderGaleria();
    vista('galeria');
  }

  api('sesion').then(function (r) {
    if (r.dentro) arrancar(r.correo);
    else pantallaAcceso();
  }).catch(function () { pantallaAcceso(); });
})();
