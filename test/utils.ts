import { expect, type Locator, type Page } from '@playwright/test';

async function lockAttribute(target: Locator) {
  const row = target.locator(
    'xpath=ancestor::ion-item-sliding[contains(@class,"menu-attr-item-lock")]'
  );
  await row.evaluate(element =>
    (
      element as HTMLElement & {
        open: (side: 'end') => Promise<void>;
      }
    ).open('end')
  );
  await row.locator('ion-item-option').click();
  await expect(row).toHaveClass(/locked/);
}

export async function openDefaultSurvey(page: Page) {
  await page.locator('ion-tab-bar').getByRole('button').click();
  await page.locator('text=Add a record without a photo').click();
  await expect(
    page.getByRole('searchbox', { name: 'search text' })
  ).toBeVisible();
}

export async function openOtherSurvey(page: Page, name: string) {
  await page.locator('ion-tab-bar').getByRole('button').click();
  await page.locator('text=Show other surveys').click();
  await expect(
    page.getByRole('dialog', { name: 'Other recording options' })
  ).toBeVisible();
  await page.getByRole('button', { name }).click();
}

export async function selectSpecies(
  page: Page,
  search: string,
  result: RegExp
) {
  await page.getByRole('searchbox', { name: 'search text' }).fill(search);
  await page.getByRole('listitem').filter({ hasText: result }).first().click();
}

export async function setLocation(page: Page, gridRef: string) {
  const locationPage = page.locator('#model-location').last();
  const locationInput = locationPage.locator('input[placeholder="Location"]');
  await locationInput.pressSequentially(gridRef, { delay: 500 });
  await expect(locationInput).toHaveValue(gridRef);
  await page.waitForTimeout(500); // wait for ionInput's debounce to persist
  await locationPage
    .locator('input[placeholder="Site name eg nearby village"]')
    .fill('Hyde Park');
  await locationPage.getByRole('button', { name: 'Back' }).click();
}

export async function setRecorder(page: Page) {
  await page.getByRole('button', { name: 'Recorder' }).click();
  await page
    .locator('input[placeholder="Recorder name"]')
    .fill('Test Recorder');
  await page
    .locator('[id="attr-page-smpAttr:127"]')
    .getByRole('button', { name: 'Back' })
    .click();
}

export async function setStage(page: Page, record: Locator, stage: string) {
  await record.getByRole('button', { name: /Stage/ }).click();
  await page.getByRole('option', { name: stage }).click();
}

export async function lockBirdAttributes(page: Page, record: Locator) {
  await setStage(page, record, 'Adult');
  await record.getByRole('textbox', { name: 'Comment' }).fill('locked');
  await lockAttribute(record.getByRole('button', { name: /Adult.*Stage/i }));
  await lockAttribute(record.getByRole('textbox', { name: 'Comment' }));
}

export async function expectBirdLocks(record: Locator) {
  await expect(
    record.getByRole('button', { name: /Adult.*Stage/i })
  ).toBeVisible();
  await expect(record.getByRole('textbox', { name: 'Comment' })).toHaveValue(
    'locked'
  );
}

export async function checkTaxaLockSwitch(page: Page, record: Locator) {
  await record.getByRole('link', { name: /Robin Erithacus rubecula/ }).click();
  await selectSpecies(page, 'Daisy', /^Daisy/);
  await expect(
    record.getByRole('button', { name: /Adult.*Stage/i })
  ).not.toBeVisible();

  await setStage(page, record, 'Flowering');
  await lockAttribute(
    record.getByRole('button', { name: /Flowering.*Stage/i })
  );
  await record.getByRole('link', { name: /Daisy Bellis perennis/ }).click();
  await selectSpecies(page, 'Robin', /^RobinErithacus rubeculabird$/);

  await expectBirdLocks(record);
  await expect(
    record.getByRole('button', { name: /Flowering.*Stage/i })
  ).not.toBeVisible();
}
