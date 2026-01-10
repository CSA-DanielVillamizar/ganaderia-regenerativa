const { chromium } = require('playwright');
const fs = require('fs/promises');

const BASE_URL = 'http://localhost:3000';
const FARM_ID = 'cmk8oe5zm0002114tgxic313l';

(async () => {
  await fs.mkdir('playwright-output', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const log = (label, detail = '') => console.log(`[E2E] ${label}${detail ? ' -> ' + detail : ''}`);

  try {
    // Login
    log('Navegando a login');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    log('Login ok');

    // Intercept to observe loading spinner
    await page.route('**/decision-today', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });

    // Success path
    log('Abriendo Decision Today válida');
    await page.goto(`${BASE_URL}/farms/${FARM_ID}/decision-today`);
    await page.waitForSelector('text=Cargando...', { timeout: 5000 });
    await page.waitForSelector('text=Decisión de Hoy', { timeout: 15000 });
    await page.waitForSelector('text=Confianza', { timeout: 5000 });
    await page.waitForSelector('text=Checklist de acciones', { timeout: 5000 });
    const cta = await page.getByRole('button', { name: 'Ir' }).first();
    log('Página renderizada con confidence/explainability/checklist');
    await page.screenshot({ path: 'playwright-output/decision-success.png', fullPage: true });

    // CTA navigation and back
    const beforeUrl = page.url();
    await cta.click();
    await page.waitForNavigation({ timeout: 10000 });
    const afterUrl = page.url();
    log('CTA navegó', afterUrl);
    await page.goBack();
    await page.waitForSelector('text=Decisión de Hoy', { timeout: 10000 });
    await page.screenshot({ path: 'playwright-output/decision-return.png', fullPage: true });
    log('Regreso y recarga ok');

    // Error path with invalid farm id to capture traceId
    log('Abriendo Decision Today inválida (error esperado)');
    await page.goto(`${BASE_URL}/farms/invalid-id/decision-today`);
    await page.waitForSelector('text=TraceId', { timeout: 10000 });
    await page.screenshot({ path: 'playwright-output/decision-error.png', fullPage: true });
    log('Error state capturado con traceId');
  } catch (error) {
    console.error('[E2E] Error durante prueba:', error);
    await page.screenshot({ path: 'playwright-output/decision-failure.png', fullPage: true }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
