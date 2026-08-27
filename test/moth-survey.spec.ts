import { test, expect } from './fixtures';
import {
  openOtherSurvey,
  selectSpecies,
  setLocation,
  setRecorder,
} from './utils';

test('Create a Moth List Survey', async ({ homePage }) => {
  // 1. Open the Moth List Survey.
  await openOtherSurvey(homePage, 'Moth List Survey');

  await expect(homePage.getByRole('button', { name: 'Finish' })).toBeVisible();

  // 2. Verify the form fields
  await expect(
    homePage.getByRole('link', { name: 'Location No location No site' })
  ).toBeVisible();
  await expect(homePage.getByRole('button', { name: 'Method' })).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Recorder' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('textbox', { name: 'Comment' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Add Species' })
  ).toBeVisible();

  // 3. Set location.
  await homePage
    .getByRole('link', { name: 'Location No location No site' })
    .click();
  await setLocation(homePage, 'TQ12');
  // wait for the location link to show the grid ref — confirms ionInput handler ran and location was saved
  await expect(homePage.getByRole('link', { name: /TQ/ })).toBeVisible({
    timeout: 15000,
  });

  // 4. Set date — moth survey has no default date
  await homePage.getByRole('button', { name: /^\d{2}\/\d{2}\/\d{2}$/ }).click();
  await homePage.keyboard.press('Escape');

  // 5. Set recorder name.
  await setRecorder(homePage);

  // 6. Set trapping method
  await homePage.getByRole('button', { name: 'Method' }).click();
  await homePage.getByText('Light trapping').click();

  // 7. Add Garden Tiger moth species.
  await homePage.getByRole('button', { name: 'Add Species' }).click();
  await selectSpecies(
    homePage,
    'Garden Tiger',
    /^Garden TigerArctia cajamoth$/
  );

  // return to survey and verify species is listed
  await homePage.getByRole('button', { name: 'Back' }).click();
  await expect(
    homePage.getByRole('link', { name: /Garden Tiger/ })
  ).toBeVisible();

  // 8. Set Stage for Garden Tiger — required field for moth occurrences
  await homePage.getByRole('link', { name: /Garden Tiger/ }).click();
  await homePage.getByRole('button', { name: 'Stage' }).click();
  await homePage.getByText('Adult').click();
  await homePage
    .locator('#survey-default-edit')
    .getByRole('button', { name: 'Back' })
    .click();

  // 9. Finish the survey and verify it appears in the Pending list
  await homePage.getByRole('button', { name: 'Finish' }).click();

  await expect(
    homePage.locator('#home-user-surveys').getByText('Moth List Survey')
  ).toBeVisible();
  await expect(
    homePage.locator('#home-user-surveys').getByText('Hyde Park')
  ).toBeVisible();
});
