import { test, expect } from './fixtures';
import {
  openOtherSurvey,
  selectSpecies,
  setLocation,
  setRecorder,
} from './utils';

test('Create a Species List Survey', async ({ homePage }) => {
  // 1. Open the Species List Survey.
  await openOtherSurvey(homePage, 'Species List Survey');
  await expect(homePage.getByRole('button', { name: 'Finish' })).toBeVisible();

  // 2. Verify the form contains the expected fields
  await expect(homePage.getByRole('link', { name: /Location/ })).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Recorder' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('textbox', { name: 'Comment' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Add Species' })
  ).toBeVisible();
  await expect(homePage.getByText('No species added')).toBeVisible();

  // 3. Add Blue Tit and Great Tit.
  await homePage.getByRole('button', { name: 'Add Species' }).click();
  await selectSpecies(
    homePage,
    'Blue Tit',
    /^Blue TitCyanistes caeruleusbird$/
  );

  const blueTitResult = homePage
    .getByRole('listitem')
    .filter({ hasText: /^Blue TitCyanistes caeruleusbird$/ });
  await homePage.getByRole('searchbox', { name: 'search text' }).fill('Blue Tit');
  await expect(blueTitResult).toHaveClass(/recorded/);

  await selectSpecies(homePage, 'Great Tit', /^Great TitParus majorbird$/);

  // return to survey and verify both species are listed
  await homePage.getByRole('button', { name: 'Back' }).click();
  await expect(homePage.getByRole('link', { name: /Blue Tit/ })).toBeVisible();
  await expect(homePage.getByRole('link', { name: /Great Tit/ })).toBeVisible();

  // 5. Set location.
  await homePage.getByRole('link', { name: /Location/ }).click();
  await setLocation(homePage, 'TQ12');
  // wait for the location link to show the grid ref — confirms ionInput handler ran and location was saved
  await expect(homePage.getByRole('link', { name: /TQ/ })).toBeVisible();

  // 6. Set recorder name.
  await setRecorder(homePage);

  // 7. Finish the survey and verify it appears in the Pending list
  await homePage.getByRole('button', { name: 'Finish' }).click();

  await expect(
    homePage.locator('#home-user-surveys').getByText('Species List Survey')
  ).toBeVisible();
  await expect(
    homePage.locator('#home-user-surveys').getByText('Hyde Park')
  ).toBeVisible();
});
