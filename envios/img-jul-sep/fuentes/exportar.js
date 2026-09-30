const { chromium } = require('playwright');
const dir = __dirname, salida = require('path').join(__dirname, '..');
const piezas = [['reenviar',1200,720],['segmenta',800,600],['plazas',800,600],['reserva',800,600],['ausencias',800,600],['documentos',800,600],['envios',800,600],['ausencias-destacada',860,600],['reenviar-col',800,600]];
(async () => {
  const b = await chromium.launch();
  for (const [n, w, h] of piezas) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: n === 'ausencias-destacada' ? 1.4 : 1 });
    await p.goto('file://' + dir + '/' + n + '.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
    await p.screenshot({ path: salida + '/' + n + '.jpg', type: 'jpeg', quality: 90 });
    await p.close();
  }
  await b.close();
})();
