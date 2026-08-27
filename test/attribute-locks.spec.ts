import { test } from './fixtures';
import {
  checkTaxaLockSwitch,
  expectBirdLocks,
  lockBirdAttributes,
  openDefaultSurvey,
  openOtherSurvey,
  selectSpecies,
} from './utils';

test.describe('Attribute locks', () => {
  test('Default survey switches taxa-specific locks', async ({ homePage }) => {
    // Create a bird record and lock common and bird-specific attributes.
    await openDefaultSurvey(homePage);
    await selectSpecies(homePage, 'Blackbird', /^BlackbirdTurdus merulabird$/);
    const record = homePage.locator('#survey-default-edit').last();
    await lockBirdAttributes(homePage, record);

    // A new bird inherits both locks.
    await homePage.getByRole('button', { name: 'Back' }).first().click();
    await openDefaultSurvey(homePage);
    await selectSpecies(homePage, 'Robin', /^RobinErithacus rubeculabird$/);
    await expectBirdLocks(record);
    await homePage.getByRole('button', { name: 'OK, got it' }).click();

    // Taxa-specific values and locks are replaced when the group changes.
    await checkTaxaLockSwitch(homePage, record);
  });

  test('Species List Survey switches taxa-specific locks', async ({
    homePage,
  }) => {
    // Create a list and add a bird.
    await openOtherSurvey(homePage, 'Species List Survey');
    await homePage.getByRole('button', { name: 'Add Species' }).click();
    await selectSpecies(homePage, 'Blackbird', /^BlackbirdTurdus merulabird$/);
    await homePage.getByRole('button', { name: 'Back' }).click();
    await homePage.getByRole('link', { name: /Blackbird/ }).click();

    const occurrence = homePage.locator('#survey-default-edit').last();
    await lockBirdAttributes(homePage, occurrence);

    // Another bird in the list inherits both locks.
    await occurrence.getByRole('button', { name: 'Back' }).click();
    await homePage.getByRole('button', { name: 'Add Species' }).click();
    await selectSpecies(homePage, 'Robin', /^RobinErithacus rubeculabird$/);
    await homePage.getByRole('button', { name: 'Back' }).click();
    await homePage.getByRole('link', { name: /Robin/ }).click();
    await expectBirdLocks(occurrence);

    // Taxa-specific values and locks are replaced when the group changes.
    await checkTaxaLockSwitch(homePage, occurrence);
  });
});
