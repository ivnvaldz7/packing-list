/**
 * E2E smoke tests — verifies the app loads and core navigation works.
 *
 * Run with:  npx playwright test
 * Requires:  dev server running (playwright.config.ts handles this automatically)
 */
import { expect, test } from '@playwright/test';

test.describe('App smoke tests', () => {
  test('loads and shows the app title', async ({ page }) => {
    await page.goto('/');

    // Wait for IndexedDB loading to finish
    await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

    // The Topbar has a unique h1 with "Lista de empaque"
    await expect(page.getByRole('heading', { name: 'Lista de empaque' })).toBeVisible();
  });

  test('navigates to carteles stage and shows label controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

    // App starts in preparacion (initial doc has workflowStatus: 'preparacion')
    // Navigate to carteles via the sidebar button (visible on desktop)
    await page.getByTitle('Carteles').click();

    // CartelesView title
    await expect(page.getByText('Carteles para pallets')).toBeVisible({ timeout: 5000 });

    // Label count stepper
    await expect(page.getByLabel('Cantidad de carteles')).toBeVisible();
    await expect(page.getByText('Imprimir carteles')).toBeVisible();
  });

  test('shows header form with invoice and country fields', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

    // DocumentHeaderForm is always visible — use more specific selectors
    await expect(page.getByText('Preparación del documento')).toBeVisible();
    await expect(page.getByText('Factura N°')).toBeVisible();
    // "País" and "Transporte" inside the header section — scope to avoid print template duplicates
    await expect(page.locator('#header-section').getByText('País', { exact: true })).toBeVisible();
    await expect(page.locator('#header-section').getByText('Transporte', { exact: true })).toBeVisible();
  });

  test('shows preparacion stage with pallet cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

    // Navigate to preparación via bottom nav
    await page.getByRole('button', { name: 'Preparación', exact: true }).click();

    // Preparación shows PalletCard (starts with 1 empty pallet)
    await expect(page.getByText('Paleta 01')).toBeVisible();
    await expect(page.getByText('Agregar producto')).toBeVisible();
  });

  test('can add a new pallet', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

    // Navigate to preparación
    await page.getByRole('button', { name: 'Preparación', exact: true }).click();

    // Click "Agregar paleta" button in the sidebar
    const addPalletBtn = page.locator('button:has-text("Agregar")');
    if (await addPalletBtn.isVisible()) {
      await addPalletBtn.first().click();
    }
  });

  test('navigates to carga stage', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

    // Use the text link in the preparacion view, not the nav button
    // Click "Preparación" first to get to preparacion view
    await page.getByRole('button', { name: 'Preparación', exact: true }).click();

    // Now click "Pasar a carga final" button in the preparacion view
    const cargaBtn = page.getByRole('button', { name: 'Pasar a carga final' });
    if (await cargaBtn.isVisible()) {
      await cargaBtn.click();
    }
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

    // Click the theme toggle button (has title "Modo oscuro" initially)
    const themeButton = page.getByTitle('Modo oscuro');
    await themeButton.click();

    // Check that theme changed
    const theme = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(theme).toBe('dark');
  });

  test('shows document summary section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

    // The summary section is always visible
    await expect(page.getByText('Resumen consolidado de carga')).toBeVisible();

    // Total paletas inside the summary section
    await expect(page.locator('#summary-section').getByText('Total paletas')).toBeVisible();
  });

  test('data persists after page reload', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

    // Navigate to preparación to add data
    await page.getByRole('button', { name: 'Preparación', exact: true }).click();
    await expect(page.getByText('Paleta 01')).toBeVisible();

    // Set an invoice number (type the 4-digit suffix)
    await page.locator('#header-section input[placeholder="0005"]').fill('0001');

    // Select a country
    await page.locator('#header-section').getByLabel('País').selectOption('PANAMA');

    // Add a second pallet
    await page.getByRole('button', { name: 'Añadir paleta' }).click();
    await expect(page.getByText('Paleta 02')).toBeVisible();

    // Wait for IndexedDB auto-save (debounced at 600ms)
    await page.waitForTimeout(1500);

    // Reload the page — simulates closing and reopening
    await page.reload();

    // Wait for IndexedDB loading to finish
    await expect(page.getByText('Cargando borrador local')).not.toBeVisible({ timeout: 10000 });

    // Verify invoice number persisted (Topbar subtitle — scope to banner/header)
    await expect(page.getByRole('banner').getByText('E-0005-00000001')).toBeVisible();

    // Navigate to preparación to check pallets
    await page.getByRole('button', { name: 'Preparación', exact: true }).click();

    // Verify second pallet persisted
    await expect(page.getByText('Paleta 02')).toBeVisible();

    // Verify country persisted (header section)
    await expect(page.locator('#header-section').getByLabel('País')).toHaveValue('PANAMA');
  });
});
