// Pinta un envío con las plantillas de la app. Uso: node pintar.js envio.json salida.html [--vista]
const fs = require('fs'), path = require('path'), vm = require('vm');
const repo = path.join(__dirname, '..');
global.window = { PM_VISTA: process.argv.includes('--vista') };
for (const f of ['templates.js', 'templates-saas.js', 'plantillas.js'])
  vm.runInThisContext(fs.readFileSync(path.join(repo, f), 'utf8'), { filename: f });
const env = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const P = window.PM_PLANTILLAS, t = P.byId[env.plantillaId];
const d = Object.assign(P.defaults(t), env.datos);
// Límites de la plantilla: avisar si algo se pasa.
P.campos(t).forEach(c => { if (c.max && typeof d[c.k] === 'string' && d[c.k].length > c.max) console.log('Se pasa:', c.k, d[c.k].length, '/', c.max); });
fs.writeFileSync(process.argv[3], t.render(d));
console.log('ok', process.argv[3], fs.statSync(process.argv[3]).size, 'bytes');
