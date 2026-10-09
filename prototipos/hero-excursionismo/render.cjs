// node render.cjs  ->  hero.jpg (1184×828)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:592,height:414},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/hero.html');await p.waitForTimeout(400);
await p.screenshot({path:__dirname+'/hero.png'});await b.close();})();
