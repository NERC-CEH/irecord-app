import { test, expect } from './fixtures';
import { openOtherSurvey, selectSpecies, setLocation } from './utils';

test('Create a Plant List Survey', async ({ homePage }) => {
  // 1. Open the Plant List Survey.
  await openOtherSurvey(homePage, 'Plant List Survey');

  await expect(homePage.getByRole('button', { name: 'Finish' })).toBeVisible();

  // 2. Verify the form fields
  await expect(
    homePage.getByRole('link', { name: 'Square No location No site' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Vice County' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Recorders', exact: true })
  ).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'No. of recorders' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Time surveying' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('textbox', { name: 'Comment' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Add Species' })
  ).toBeVisible();
  await expect(homePage.getByText('No species added')).toBeVisible();

  // 3. Add Daisy.
  await homePage.getByRole('button', { name: 'Add Species' }).click();
  await selectSpecies(homePage, 'Daisy', /DaisyBellis perennisflower\./);

  // return to survey and verify Daisy is listed
  await homePage.getByRole('button', { name: 'Back' }).click();
  await expect(homePage.getByRole('link', { name: 'N/A Daisy' })).toBeVisible();

  // 4. Set location.
  await homePage
    .getByRole('link', { name: 'Square No location No site' })
    .click();
  await setLocation(homePage, 'TQ1234');
  await expect(homePage.getByText('Hyde Park')).toBeVisible();
  await expect(homePage.getByText('TQ 12 34')).toBeVisible();

  // 5. Add a recorder — list-style input: fill text then click the add button
  await homePage
    .getByRole('button', { name: 'Recorders', exact: true })
    .click();
  await homePage
    .locator('input[placeholder="Recorder name"]')
    .fill('Test Recorder');
  await homePage
    .locator('[id="attr-page-smpAttr:1018"]')
    .getByRole('main')
    .getByRole('button')
    .click();
  await homePage
    .locator('[id="attr-page-smpAttr:1018"]')
    .getByRole('button', { name: 'Back' })
    .click();

  await homePage.getByRole('button', { name: 'No. of recorders' }).click();
  const recorderCountPage = homePage.locator('[id="attr-page-smpAttr:992"]');
  await recorderCountPage.getByText('1', { exact: true }).click();
  await recorderCountPage.getByRole('button', { name: 'Back' }).click();

  await homePage.getByRole('button', { name: 'Time surveying' }).click();
  const timeSurveyingPage = homePage.locator('[id="attr-page-smpAttr:993"]');
  await timeSurveyingPage.getByText('30 to 59 mins', { exact: true }).click();

  // 6. Finish the survey and verify it appears in the Pending list
  await homePage.getByRole('button', { name: 'Finish' }).click();

  await expect(
    homePage.locator('#home-user-surveys').getByText('Plant List Survey')
  ).toBeVisible();
  await expect(
    homePage.locator('#home-user-surveys').getByText('Hyde Park')
  ).toBeVisible();
});
