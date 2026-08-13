import { Locator } from '@playwright/test';
import { test, expect } from './fixtures';

async function pan(
  locator: Locator,
  deltaX?: number,
  deltaY?: number,
  steps?: number
) {
  const { centerX, centerY } = await locator.evaluate((target: HTMLElement) => {
    const bounds = target.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    return { centerX, centerY };
  });

  // Providing only clientX and clientY as the app only cares about those.
  const touches = [
    {
      identifier: 0,
      clientX: centerX,
      clientY: centerY,
    },
  ];
  await locator.dispatchEvent('touchstart', {
    touches,
    changedTouches: touches,
    targetTouches: touches,
  });

  steps = steps ?? 5;
  deltaX = deltaX ?? 0;
  deltaY = deltaY ?? 0;
  for (let i = 1; i <= steps; i++) {
    const touches = [
      {
        identifier: 0,
        clientX: centerX + (deltaX * i) / steps,
        clientY: centerY + (deltaY * i) / steps,
      },
    ];
    await locator.dispatchEvent('touchmove', {
      touches,
      changedTouches: touches,
      targetTouches: touches,
    });
  }

  await locator.dispatchEvent('touchend');
}

test.describe('Default survey', () => {
  test('Navigate back from species search without selecting cancels record creation', async ({
    homePage,
  }) => {
    // 1. Click the central button and select 'Add a record without a photo'
    await homePage.locator('ion-tab-bar').getByRole('button').click();
    await homePage.locator('text=Add a record without a photo').click();
    await expect(
      homePage.getByRole('searchbox', { name: 'search text' })
    ).toBeVisible();

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

    // 3. Type 'Robin' in the search box
    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('Robin');
    await expect(
      homePage.getByText('Erithacus rubecula').first()
    ).toBeVisible();

    // 4. Click on 'Robin / Erithacus rubecula' in the results
    await homePage
      .getByRole('listitem')
      .filter({ hasText: /^RobinErithacus rubeculabird$/ })
      .click();
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

    // 6. Type a site name and a grid reference in the location picker
    const locationInput = homePage.locator('input[placeholder="Location"]');
    await locationInput.pressSequentially('TQ12', { delay: 300 }); // 6-char ref gives browser time to process ionInput events
    await expect(locationInput).toHaveValue('TQ12');
    // wait for ionInput's 300ms debounce to fire and persist the location before navigating away
    await homePage.waitForTimeout(500);

    await homePage
      .locator('input[placeholder="Site name eg nearby village"]')
      .fill('Hyde Park');

    // 7. Click 'Back' to return to the record form
    await homePage
      .locator('#model-location')
      .getByRole('button', { name: 'Back' })
      .click();
    await expect(homePage.getByText('Hyde Park')).toBeVisible();
    await homePage.getByRole('button', { name: 'Finish' }).click();
    await expect(homePage.getByText('Pending')).toBeVisible();
    await expect(homePage.getByText('Robin')).toBeVisible();
    await expect(homePage.getByText('Hyde Park')).toBeVisible();
  });

  test('Attempt to finish a record without providing a location', async ({
    homePage,
  }) => {
    // 1. Click the central action button and select 'Add a record without a photo'
    await homePage.locator('ion-tab-bar').getByRole('button').click();
    await homePage.locator('text=Add a record without a photo').click();
    await expect(
      homePage.getByRole('searchbox', { name: 'search text' })
    ).toBeVisible();

    // 2. Search for and select 'Badger'
    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('Badger');
    await homePage
      .getByRole('listitem')
      .filter({ hasText: /^BadgerMeles melesmammal$/ })
      .click();
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
    await homePage.locator('ion-tab-bar').getByRole('button').click();
    await homePage.locator('text=Add a record without a photo').click();
    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('Robin');
    await homePage
      .getByRole('listitem')
      .filter({ hasText: /^RobinErithacus rubeculabird$/ })
      .click();
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
    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('Blackbird');
    await homePage
      .getByRole('listitem')
      .filter({ hasText: /^BlackbirdTurdus merulabird$/ })
      .click();

    // expect: record form shows updated species
    await expect(
      homePage.getByRole('link', { name: /Blackbird Turdus merula/ })
    ).toBeVisible();
  });

  test('Search species by scientific name shortcut', async ({ homePage }) => {
    // 1. Open a new default record species search page
    await homePage.locator('ion-tab-bar').getByRole('button').click();
    await homePage.locator('text=Add a record without a photo').click();
    await expect(
      homePage.getByRole('searchbox', { name: 'search text' })
    ).toBeVisible();

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
    await homePage.locator('ion-tab-bar').getByRole('button').click();
    await homePage.locator('text=Add a record without a photo').click();
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
    await homePage.locator('ion-tab-bar').getByRole('button').click();
    await homePage.locator('text=Add a record without a photo').click();
    await expect(
      homePage.getByRole('searchbox', { name: 'search text' })
    ).toBeVisible();

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
    // start a default survey
    await homePage.locator('ion-tab-bar').getByRole('button').click();
    await homePage.locator('text=Add a record without a photo').click();

    // select Blackbird for species — two list items match, use first exact one
    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('Blackbird');
    await expect(homePage.getByText('Turdus merula').first()).toBeVisible();
    await homePage
      .getByRole('listitem')
      .filter({ hasText: /^BlackbirdTurdus merulabird$/ })
      .first()
      .click();

    // enter a location and name using the location picker
    await homePage.getByRole('link', { name: /Location/ }).click();
    const locationInput = homePage.locator(
      '#model-location input[placeholder="Location"]'
    );
    await locationInput.pressSequentially('TQ12', { delay: 300 }); // needs to be slow enough to trigger the auto-formatting
    await expect(locationInput).toHaveValue('TQ12');
    // wait for ionInput's 300ms debounce to fire and persist the location before navigating away
    await homePage.waitForTimeout(500);
    await homePage
      .locator('input[placeholder="Site name eg nearby village"]')
      .fill('Hyde Park');
    await homePage
      .locator('#model-location')
      .getByRole('button', { name: 'Back' })
      .click();
    await expect(homePage.getByText('Hyde Park')).toBeVisible();

    // enter stage
    await homePage.getByRole('button', { name: /Stage/ }).click();
    await homePage.getByRole('option', { name: 'Adult' }).click();

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

    // LOCKING
    // open the record again
    await homePage.locator('ion-item-sliding').tap();

    // lock Comment attr here
    await pan(homePage.getByRole('textbox', { name: 'Comment' }), -200);
    await homePage
      .locator('.menu-attr-item-lock', { hasText: /Comment/ })
      .locator('ion-item-option')
      .tap();

    // lock bird stage here
    await pan(homePage.getByRole('button', { name: /Stage/ }), -200);
    await homePage
      .locator('.menu-attr-item-lock', { hasText: /Stage/ })
      .locator('ion-item-option')
      .tap();

    await homePage.getByRole('button', { name: 'Back' }).click();

    await homePage.locator('ion-tab-bar').getByRole('button').click();
    await homePage.locator('text=Add a record without a photo').click();

    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('Robin');

    await homePage
      .getByRole('listitem')
      .filter({ hasText: /^Robin/ })
      .first()
      .click();

    await expect(
      homePage.getByRole('textbox', { name: 'Comment' })
    ).toHaveValue('test');

    await expect(
      homePage.getByRole('button', { name: /Adult.*Stage/i })
    ).toBeVisible();

    await homePage.getByRole('button', { name: 'Back' }).first().click();

    await homePage.locator('ion-tab-bar').getByRole('button').click();
    await homePage.locator('text=Add a record without a photo').click();

    await homePage
      .getByRole('searchbox', { name: 'search text' })
      .fill('Daisy');

    await homePage
      .getByRole('listitem')
      .filter({ hasText: /^Daisy/ })
      .first()
      .click();

    await expect(
      homePage.getByRole('textbox', { name: 'Comment' })
    ).toHaveValue('test');

    await expect(
      homePage.getByRole('button', { name: /Adult.*Stage/i })
    ).not.toBeVisible();
  });
});

test('Create a Species List Survey', async ({ homePage }) => {
  // 1. Click the central action button → 'Show other surveys' → 'Species List Survey'
  await homePage.locator('ion-tab-bar').getByRole('button').click();
  await homePage.locator('text=Show other surveys').click();

  await expect(
    homePage.getByRole('dialog', { name: 'Other recording options' })
  ).toBeVisible();

  await homePage.getByRole('button', { name: 'Species List Survey' }).click();
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

  // 3. Add Blue Tit
  await homePage.getByRole('button', { name: 'Add Species' }).click();
  await homePage
    .getByRole('searchbox', { name: 'search text' })
    .fill('Blue Tit');
  await homePage.getByText('Blue Tit').first().waitFor({ state: 'visible' });
  await homePage
    .getByRole('listitem')
    .filter({ hasText: /^Blue TitCyanistes caeruleusbird$/ })
    .click();

  // 4. Add Great Tit while still in species search
  await homePage
    .getByRole('searchbox', { name: 'search text' })
    .fill('Great Tit');
  await homePage.getByText('Great Tit').first().waitFor({ state: 'visible' });
  await homePage
    .getByRole('listitem')
    .filter({ hasText: /^Great TitParus majorbird$/ })
    .click();

  // return to survey and verify both species are listed
  await homePage.getByRole('button', { name: 'Back' }).click();
  await expect(homePage.getByRole('link', { name: /Blue Tit/ })).toBeVisible();
  await expect(homePage.getByRole('link', { name: /Great Tit/ })).toBeVisible();

  // 5. Set location — grid reference triggers auto-formatting, needs slow input
  await homePage.getByRole('link', { name: /Location/ }).click();
  const speciesListLocationInput = homePage.locator(
    'input[placeholder="Location"]'
  );
  await speciesListLocationInput.pressSequentially('TQ12', { delay: 500 }); // 6-char ref gives browser time to process ionInput events
  await expect(speciesListLocationInput).toHaveValue('TQ12');
  // wait for ionInput's 300ms debounce to fire and persist the location before navigating away
  await homePage.waitForTimeout(500);
  await homePage
    .locator('input[placeholder="Site name eg nearby village"]')
    .fill('Hyde Park');
  await homePage
    .locator('#location-page-header')
    .getByRole('button', { name: 'Back' })
    .click();
  // wait for the location link to show the grid ref — confirms ionInput handler ran and location was saved
  await expect(homePage.getByRole('link', { name: /TQ/ })).toBeVisible();

  // 6. Set recorder name
  await homePage.getByRole('button', { name: 'Recorder' }).click();
  await homePage
    .locator('input[placeholder="Recorder name"]')
    .fill('Test Recorder');
  await homePage
    .locator('[id="attr-page-smpAttr:127"]')
    .getByRole('button', { name: 'Back' })
    .click();

  // 7. Finish the survey and verify it appears in the Pending list
  await homePage.getByRole('button', { name: 'Finish' }).click();

  await expect(
    homePage.locator('#home-user-surveys').getByText('Species List Survey')
  ).toBeVisible();
  await expect(
    homePage.locator('#home-user-surveys').getByText('Hyde Park')
  ).toBeVisible();
});

test('Create a Plant List Survey', async ({ homePage }) => {
  // 1. Click the central action button → 'Show other surveys' → 'Plant List Survey'
  await homePage.locator('ion-tab-bar').getByRole('button').click();
  await homePage.locator('text=Show other surveys').click();
  await homePage.getByRole('button', { name: 'Plant List Survey' }).click();

  await expect(homePage.getByRole('button', { name: 'Finish' })).toBeVisible();

  // 2. Verify the form fields
  await expect(
    homePage.getByRole('link', { name: 'Square No location No site' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Vice County' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Recorders' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('textbox', { name: 'Comment' })
  ).toBeVisible();
  await expect(
    homePage.getByRole('button', { name: 'Add Species' })
  ).toBeVisible();
  await expect(homePage.getByText('No species added')).toBeVisible();

  // 3. Add Daisy
  await homePage.getByRole('button', { name: 'Add Species' }).click();
  await homePage.getByRole('searchbox', { name: 'search text' }).fill('Daisy');
  await homePage
    .getByText('Bellis perennis')
    .first()
    .waitFor({ state: 'visible' });
  await homePage
    .getByRole('listitem')
    .filter({ hasText: 'DaisyBellis perennisflower.' })
    .click();

  // return to survey and verify Daisy is listed
  await homePage.getByRole('button', { name: 'Back' }).click();
  await expect(homePage.getByRole('link', { name: 'N/A Daisy' })).toBeVisible();

  // 4. Set location — grid reference + site name
  await homePage
    .getByRole('link', { name: 'Square No location No site' })
    .click();
  const plantListLocationInput = homePage.locator(
    'input[placeholder="Location"]'
  );
  await plantListLocationInput.pressSequentially('TQ1234', { delay: 500 });
  await expect(plantListLocationInput).toHaveValue('TQ1234');
  // wait for ionInput's 300ms debounce to fire and persist the location before navigating away
  await homePage.waitForTimeout(500);
  await homePage
    .locator('input[placeholder="Site name eg nearby village"]')
    .fill('Hyde Park');
  await homePage.getByRole('button', { name: 'Back' }).click();
  await expect(homePage.getByText('Hyde Park')).toBeVisible();

  // 5. Add a recorder — list-style input: fill text then click the add button
  await homePage.getByRole('button', { name: 'Recorders' }).click();
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

  // 6. Finish the survey and verify it appears in the Pending list
  await homePage.getByRole('button', { name: 'Finish' }).click();

  await expect(
    homePage.locator('#home-user-surveys').getByText('Plant List Survey')
  ).toBeVisible();
  await expect(
    homePage.locator('#home-user-surveys').getByText('Hyde Park')
  ).toBeVisible();
});

test('Create a Moth List Survey', async ({ homePage }) => {
  // 1. Click the central action button → 'Show other surveys' → 'Moth List Survey'
  await homePage.locator('ion-tab-bar').getByRole('button').click();
  await homePage.locator('text=Show other surveys').click();
  await homePage.getByRole('button', { name: 'Moth List Survey' }).click();

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

  // 3. Set location — grid reference + site name
  await homePage
    .getByRole('link', { name: 'Location No location No site' })
    .click();
  const mothListLocationInput = homePage.locator(
    'input[placeholder="Location"]'
  );
  await mothListLocationInput.pressSequentially('TQ12', { delay: 500 }); // 6-char ref gives browser time to process ionInput events
  await expect(mothListLocationInput).toHaveValue('TQ12');
  // wait for ionInput's 300ms debounce to fire and persist the location before navigating away
  await homePage.waitForTimeout(500);
  await homePage
    .locator('input[placeholder="Site name eg nearby village"]')
    .fill('Hyde Park');
  await homePage
    .locator('#location-page-header')
    .getByRole('button', { name: 'Back' })
    .click();
  // wait for the location link to show the grid ref — confirms ionInput handler ran and location was saved
  await expect(homePage.getByRole('link', { name: /TQ/ })).toBeVisible({
    timeout: 15000,
  });

  // 4. Set date — moth survey has no default date
  await homePage.getByRole('button', { name: /^\d{2}\/\d{2}\/\d{2}$/ }).click();
  await homePage.keyboard.press('Escape');

  // 5. Set recorder name
  await homePage.getByRole('button', { name: 'Recorder' }).click();
  await homePage
    .locator('input[placeholder="Recorder name"]')
    .fill('Test Recorder');
  await homePage
    .locator('[id="attr-page-smpAttr:127"]')
    .getByRole('button', { name: 'Back' })
    .click();

  // 6. Set trapping method
  await homePage.getByRole('button', { name: 'Method' }).click();
  await homePage.getByText('Light trapping').click();

  // 7. Add Garden Tiger moth species
  await homePage.getByRole('button', { name: 'Add Species' }).click();
  await homePage
    .getByRole('searchbox', { name: 'search text' })
    .fill('Garden Tiger');
  await homePage
    .getByText('Garden Tiger')
    .first()
    .waitFor({ state: 'visible' });
  await homePage
    .getByRole('listitem')
    .filter({ hasText: /^Garden TigerArctia cajamoth$/ })
    .click();

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
