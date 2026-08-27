import { test, expect } from './fixtures';
import {
  openDefaultSurvey,
  selectSpecies,
  setLocation,
  setStage,
} from './utils';

test.describe('Default survey', () => {
  test('Navigate back from species search without selecting cancels record creation', async ({
    homePage,
  }) => {
    // 1. Click the central button and select 'Add a record without a photo'
    await openDefaultSurvey(homePage);

    // 2. Click Back without selecting a species
    await homePage.locator('text=Back').click();

    // expect: home screen visible, no new draft in the Pending list
    await expect(homePage.locator('ion-tab-bar')).toBeVisible();
    await expect(
      homePage.getByText('You have no finished surveys.')
    ).toBeVisible();
  });

  test('Create a default record without a photo (happy path)', async ({
    homePage,
  }) => {
    // 1. On the Home screen, click the central action button in the tab bar
    await homePage.locator('ion-tab-bar').getByRole('button').click();
    await expect(
      homePage.getByText('Add a record without a photo')
    ).toBeVisible();
    await expect(
      homePage.getByText('Take a new photo of the species')
    ).toBeVisible();
    await expect(
      homePage.getByText('Select multiple photos to add to a single record')
    ).toBeVisible();
    await expect(homePage.getByText('Show other surveys')).toBeVisible();

    // 2. Click 'Add a record without a photo'
    await homePage.locator('text=Add a record without a photo').click();
    await expect(
      homePage.getByRole('searchbox', { name: 'search text' })
    ).toBeVisible();

    // 3. Search for and select Robin
    await selectSpecies(homePage, 'Robin', /^RobinErithacus rubeculabird$/);
    await expect(homePage.getByText('Record', { exact: true })).toBeVisible();
    await expect(
      homePage.getByRole('button', { name: 'Finish' })
    ).toBeVisible();
    await expect(
      homePage.getByRole('link', { name: /Robin Erithacus rubecula/ })
    ).toBeVisible();
    await expect(homePage.getByText('No location')).toBeVisible();
    await expect(homePage.getByText('Today')).toBeVisible();

    // 5. Click on 'Location' to open the location picker
    await homePage
      .getByRole('link', { name: 'Location No location No site' })
      .click();
    await expect(
      homePage.getByRole('button', { name: 'past locations' })
    ).toBeVisible();

    // 6. Set a site name and grid reference, then return to the record.
    await setLocation(homePage, 'TQ12');
    await expect(homePage.getByText('Hyde Park')).toBeVisible();
    await homePage.getByRole('button', { name: 'Finish' }).click();
    await expect(homePage.getByText('Pending')).toBeVisible();
    await expect(homePage.getByText('Robin')).toBeVisible();
    await expect(homePage.getByText('Hyde Park')).toBeVisible();
  });

  test('Attempt to finish a record without providing a location', async ({
    homePage,
  }) => {
    // 1. Start a default survey and select Badger
    await openDefaultSurvey(homePage);
    await selectSpecies(homePage, 'Badger', /^BadgerMeles melesmammal$/);
    await expect(homePage.getByText('No location')).toBeVisible();
    await expect(homePage.getByText('No site name')).toBeVisible();

    // 3. Without setting a location, click 'Finish'
    await homePage.getByRole('button', { name: 'Finish' }).click();
    await expect(
      homePage.getByRole('alertdialog', { name: 'Survey incomplete' })
    ).toBeVisible();
    await expect(
      homePage.getByRole('heading', { name: 'Survey incomplete' })
    ).toBeVisible();
    await expect(homePage.getByText('Location name is missing')).toBeVisible();

    // 4. Click 'Got it' to dismiss the dialog
    await homePage.getByRole('button', { name: 'Got it' }).click();
    await expect(
      homePage.getByRole('button', { name: 'Finish' })
    ).toBeVisible();
  });

  test('Change the species on an existing draft record', async ({
    homePage,
  }) => {
    // 1. Create a draft record with Robin
    await openDefaultSurvey(homePage);
    await selectSpecies(homePage, 'Robin', /^RobinErithacus rubeculabird$/);
    await expect(
      homePage.getByRole('link', { name: /Robin Erithacus rubecula/ })
    ).toBeVisible();

    // 2. Click on the species row to open the taxon search page
    await homePage
      .getByRole('link', { name: /Robin Erithacus rubecula/ })
      .click();
    await expect(
      homePage.getByRole('searchbox', { name: 'search text' })
    ).toBeVisible();

    // 3. Search for and select Blackbird
    await selectSpecies(homePage, 'Blackbird', /^BlackbirdTurdus merulabird$/);

    // expect: record form shows updated species
    await expect(
      homePage.getByRole('link', { name: /Blackbird Turdus merula/ })
    ).toBeVisible();
  });

  test('Search species by scientific name shortcut', async ({ homePage }) => {
    // 1. Open a new default record species search page
    await openDefaultSurvey(homePage);

    // 2. Type 'bellis p' (genus space species-initial shortcut)
    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('bellis p');
    await expect(homePage.getByText('Bellis perennis')).toBeVisible();
    await expect(homePage.getByText('Daisy')).toBeVisible();

    // 3. Type 'beper' (2 letters of genus + 3 of species shortcut)
    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('beper');
    await expect(homePage.getByText('Bellis perennis')).toBeVisible();
    await expect(homePage.getByText('Daisy')).toBeVisible();
  });

  test('Filter species search by name type', async ({ homePage }) => {
    // 1. Open a new default record species search page and click Filters
    await openDefaultSurvey(homePage);
    await homePage.getByRole('button', { name: 'Filters' }).click();
    await expect(
      homePage.getByRole('radio', { name: 'Default' })
    ).toBeChecked();

    // 2. Select 'Common only' — clicking the text label works around the overlay
    await homePage.locator('text=Common only').click();
    await expect(
      homePage.getByRole('radio', { name: 'Common only' })
    ).toBeChecked();

    // 3. Close and search by common name — scientific names hidden from results
    await homePage.getByRole('button', { name: 'Close' }).click();
    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('Robin');
    await expect(
      homePage.getByRole('listitem').filter({ hasText: 'Robin' }).first()
    ).toBeVisible();

    // in Common only mode the scientific name is not shown in result rows
    await expect(homePage.getByText('Erithacus rubecula')).not.toBeVisible();

    // 4. Re-open Filters and select 'Scientific only'
    await homePage.getByRole('button', { name: /Filters/ }).click();
    await homePage.locator('text=Scientific only').click();
    await expect(
      homePage.getByRole('radio', { name: 'Scientific only' })
    ).toBeChecked();

    // close and search by scientific name — results match on scientific name
    await homePage.getByRole('button', { name: 'Close' }).click();
    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('Turdus merula');
    await expect(
      homePage
        .getByRole('listitem')
        .filter({ hasText: 'Turdus merula' })
        .first()
    ).toBeVisible();
  });

  test('Filter species search by taxon group', async ({ homePage }) => {
    // 1. Open a new default record species search page
    await openDefaultSurvey(homePage);

    // 2. Click the Filters button
    await homePage.getByRole('button', { name: 'Filters' }).click();
    await expect(homePage.getByRole('dialog')).toBeVisible();
    await expect(
      homePage.getByRole('heading', { name: 'Names:' })
    ).toBeVisible();
    await expect(
      homePage.getByRole('heading', { name: 'Taxon groups:' })
    ).toBeVisible();

    // 3. Check the Birds checkbox — overlay div intercepts pointer events, force required
    await homePage
      .getByRole('checkbox', { name: 'Birds' })
      .click({ force: true });
    await expect(
      homePage.getByRole('checkbox', { name: 'Birds' })
    ).toBeChecked();

    // 4. Close the Filters dialog and search for 'Robin'
    await homePage.getByRole('button', { name: 'Close' }).click();
    await expect(
      homePage.getByRole('button', { name: 'Filters (1)' })
    ).toBeVisible();

    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('Robin');
    await expect(
      homePage.getByText('Erithacus rubecula').first()
    ).toBeVisible();

    // only bird results should appear
    await expect(
      homePage
        .getByRole('listitem')
        .filter({ hasText: /^RobinErithacus rubeculabird$/ })
    ).toBeVisible();
    await expect(
      homePage.getByRole('listitem').filter({ hasText: 'plant' })
    ).not.toBeVisible();
    await expect(
      homePage.getByRole('listitem').filter({ hasText: 'insect' })
    ).not.toBeVisible();
  });

  test('Fill all record attributes and finish', async ({ homePage }) => {
    // Start a default survey with Blackbird.
    await openDefaultSurvey(homePage);
    await selectSpecies(homePage, 'Blackbird', /^BlackbirdTurdus merulabird$/);

    // enter a location and name using the location picker
    await homePage.getByRole('link', { name: /Location/ }).click();
    await setLocation(homePage, 'TQ12');
    await expect(homePage.getByText('Hyde Park')).toBeVisible();

    // enter stage
    const record = homePage.locator('#survey-default-edit').last();
    await setStage(homePage, record, 'Adult');

    // enter "test" in the comment field
    await homePage.getByRole('textbox', { name: 'Comment' }).fill('test');

    // enter "2-5" in the abundance field
    await homePage.getByRole('button', { name: /Abundance/ }).click();
    await homePage.locator('label', { hasText: '2-5' }).tap();

    // dismiss "Tip: Locks for data entry" dialog shown when returning to the record
    await homePage.getByRole('button', { name: 'OK, got it' }).click();

    // enter "Female" in the sex field
    await homePage.getByRole('button', { name: /Sex/ }).click();
    await homePage.getByRole('option', { name: 'Female' }).click();

    // enter "Permanent territory" in the breeding field
    await homePage.getByRole('button', { name: /Breeding/ }).click();
    await homePage.locator('label', { hasText: 'Permanent territory' }).tap();

    // finish the record
    await homePage.getByRole('button', { name: 'Finish' }).click();

    // check the home screen pending list shows the record
    await expect(homePage.getByText('Pending')).toBeVisible();
    await expect(homePage.getByText('Blackbird')).toBeVisible();
    await expect(homePage.getByText('Hyde Park')).toBeVisible();
    await expect(homePage.getByText('2-5', { exact: true })).toBeVisible();
    await expect(homePage.getByText('Adult', { exact: true })).toBeVisible();
  });
});
