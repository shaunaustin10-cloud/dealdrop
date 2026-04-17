const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 600 });
  await page.goto('file:///workspaces/dealdrop/lotclear_logo.html', { waitUntil: 'networkidle0' });
  const element = await page.$('.logo-container');
  await element.screenshot({ path: 'lotclear_logo_final.png' });
  await browser.close();
})();
