(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', (m) => console.log('console', m.type(), m.text()));
  page.on('pageerror', (e) => console.log('pageerror', e.message));

  const resp = await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
  console.log('status', resp && resp.status());
  await page.waitForTimeout(2000);

  const body = await page.$eval('body', (el) => el.innerText.slice(0, 400));
  console.log('bodyText', JSON.stringify(body));

  const html = await page.content();
  console.log('containsDashboard', html.includes('Dashboard'));

  await page.screenshot({ path: 'playwright-admin.png', fullPage: true });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
