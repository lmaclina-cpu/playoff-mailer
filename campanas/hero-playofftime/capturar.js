// Fotografía cada pantalla de ventanas.html a 2x, con fondo transparente.
// Uso: node capturar.js   →   registro.png, descargar.png, departamento.png
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'ventanas.html'));
  await p.waitForTimeout(300);
  for (const id of ['registro', 'descargar', 'departamento']) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, id + '.png'), omitBackground: true });
    console.log(id + '.png');
  }
  await b.close();
})();
