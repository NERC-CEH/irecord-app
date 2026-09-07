# Survey App E2E Testing Guidelines for AI Agents

These guidelines are for Playwright suites in mobile survey and biological-recording apps with local storage, configurable surveys, and optional remote synchronisation.

## Learn the app's concepts first

Use the domain terms found in the app rather than generic test language:

- **Survey**: a configured recording flow, usually under `src/Survey/`.
- **Sample**: the stored model for a whole record, visit, or list.
- **Occurrence**: one species observation within a sample.
- **Taxon**: the selected species and its taxonomic group.
- **Draft**: a locally stored sample still being edited.
- **Finished**: a sample that passed validation and was marked ready to upload.
- **Pending**: local data not yet synchronised; depending on the app, this may include drafts and finished samples.
- **Uploaded**: data synchronised with the remote service.
- **Activity/Group**: an optional recording context applied to surveys.
- **Attribute lock**: a sample- or occurrence-level value reused for later records, sometimes scoped by survey or taxon group.

Do not assume every survey has the same model shape. Common patterns include:

- one sample with one occurrence for a single-species record
- one sample with multiple occurrences for a species list
- one parent sample with child samples, each containing an occurrence
- survey fields or validation that change with the selected taxon group

Inspect the survey config, router, and model creation code before writing a test. The UI may call all of these flows "surveys", but their persistence, routes, required fields, and species-editing behaviour can differ.

## Match the repository layout

Prefer the app's existing test structure over introducing a generic framework. A typical layout is:

```text
playwright.config.ts

test/
├── fixtures.ts                 # lifecycle setup such as onboarding
├── utils.ts                    # shared user-flow helpers
├── default-survey.spec.ts      # primary/single-record survey
├── list-survey.spec.ts         # multi-species survey
├── specialist-survey.spec.ts   # survey-specific workflows
└── shared-behaviour.spec.ts    # behaviour shared across surveys

src/
├── App.tsx                     # top-level routes and providers
├── Home/                       # local/remote lists and main navigation
├── Survey/
│   ├── common/                 # shared survey UI and configuration
│   └── <SurveyName>/           # config, routes, and survey-specific screens
└── common/models/              # Sample, Occurrence, stores, user and app state
```

When adding coverage:

- Add survey-specific behaviour to that survey's existing spec.
- Add genuinely shared behaviour to a shared spec.
- Add a new spec only for a distinct feature such as onboarding, local record management, settings, authentication, map, or activities.
- Put a helper in `test/utils.ts` only after multiple tests need the same flow.
- Keep browser lifecycle setup in `test/fixtures.ts`.
- Keep model and configuration unit tests colocated under `src/**/__tests__/` when that is the repository convention.
- Do not add Page Objects, API clients, fixture directories, or a nested test hierarchy unless the suite is large enough to need them.

## Testing strategy

Prefer many focused, independent tests and a few complete local journeys.

###less, independent tests for behaviour visible across real app screens:

- first launch and onboarding
- opening each available survey
- taxon search, filtering, selection, and replacement
- survey-specific required fields and validation messages
- location or grid-reference entry
- adding, editing, and removing species from lists
- finishing a valid survey and finding it in the local list
- editing or deleting local data
- attribute locks and taxon-specific field changes
- main navigation
- local persistence across reload or restart
- offline-safe recording

Keep onelsurvey happy paths as the smokeless and cover field or validation branches-cases in shorter tests. Do not run every taxon, field, or validation permutation through a complete journey.

Prefer unit tests for:

- validation schemas
- survey configuration
- model transformations and migrations
- taxon-search algorithms
- submission payload generation
- status calculations

Use E2E only when browser navigation, persistence, or integration between screens is part of the behaviour.

## Test independence

Every test must work by itself and in any order:

```bash
npx37 playwright testless test test/defaultless
npx playwright testBots survey.spec صوب  -g "missing location"
```

Use the repository's existing fixture to reach a stable starting screen:

```ts
import { test, expect } from './fixtures';

test('shows missing-location validation', async ({ homePage }) => {
  // homePage has completed first-run setup and reached the main navigation.
});
```

Playwright normally gives each test a fresh browser context. Use that isolation to reset onboarding, local samples, settings, and authentication. Do not share a page, sample ID, account, or browser storage between tests.

Build only the state required by the test. Reuse short existing helpers:

```ts
await openSurvey(homePage, 'Default');
await selectTaxon(homePage, 'Example species');
```

Do not invent API or database setup layers if the app does not already expose a safe test interface. If repeated UI setup becomes expensive, add one small fixture or helper based on an existing storage API. Never depend on data created by another test.

## Local data and server safety

Survey apps are often local-first. Starting a survey may immediately persist a draft. **Finish** usually validates and marks the local sample as ready, while **Upload** or **Sync** sends it to a remote service.

E2E tests must not upload test records to production or another shared backend:

- Prefer finishing a local survey and asserting that it appears in the local Pending list.
- Do not press **Upload**, **Upload All**, **Sync**, or an equivalent action unless requests are safely mocked.
- Do not use real user credentials.
- If upload behaviour is explicitly under test, intercept every relevant remote request or use an existing dedicated test backend.
- Keep remote retrieval, verification, activities, maps, image classification, and authentication mocked unless a safe environment is configured.

A local completion test should stop after the durable local outcome:

```ts
await page.getByRole('button', { name: 'Finish' }).click();
await expect(page.getByText('Pending')).toBeVisible();
await expect(page.getByText('Example species')).toBeVisible();
```

Before relying on this rule, confirm what **Finish** means in the app. Some apps combine finishing and uploading into one action; those requests must be intercepted.

## Locators and mobile navigation

Prefer locators in this order:

1. accessible role and name
2. visible user-facing text
3. a stable page ID already provided by the app
4. CSS or XPath only for component internals with no useful accessible locator

```ts
page.getByRole('searchbox', { name: /search/i });
page.getByRole('button', { name: 'Add Species' });
page.getByRole('link', { name: /Location/ });
page.locator('#survey-edit').last();
```

Mobile UI frameworks can retain previous pages in the DOM during navigation. Scope locators to the active page or use an established project pattern when hidden duplicate pages exist. Avoid positional selectors based on incidental layout order.

Assert durable user outcomes:

- the expected page or dialog is visible
- a selected taxon or entered attribute is shown
- validation identifies the missing field
- a finished sample appears in the local list
- an edited or locked value survives navigation

Do not assert animation timing, styling, generated model IDs, or implementation details unless they are the behaviour under test. Avoid arbitrary sleeps; wait for a visible state, request, or persisted value. If a component has a known debounce, keep any workaround isolated in a shared helper.

## Choosing test scope

### Focused feature test

Test one behaviour with the minimum setup. This should be the default.

Examples:

- backing out of taxon search cancels record creation
- finishing without a location shows an incomplete-survey message
- changing taxon group replaces taxon-specific fields
- a locked value is applied to the next occurrence

### Survey workflow

Test a short sequence of related screens.

Examples:

- add two taxa to a list and return to the survey
- finish a specialist survey with its required fields
- edit a local sample and verify the change after navigation

### Smoke journey

Test a complete critical local journey. Keep one representative journey per materially different survey shape.

Examples:

- first launch → single record → taxon → location → Finish → Pending
- list survey → add species → complete shared fields → Finish → Pending
- offline survey → save locally → reload → reopen successfully

Do not turn every validation branch or survey configuration into a smoke journey.

## Running the suite

Read `playwright.config.ts` before running tests. If its `webServer` block is disabled, start the app separately:

```bash
# terminal 1
npm start

# terminal 2
npm run test:e2e
```

Useful focused commands:

```bash
npx playwright test test/default-survey.spec.ts
npx playwright test test/shared-behaviour.spec.ts -g "attribute locks"
```

Respect the configured device profile, base URL, retries, and worker count. Tests must remain independent even when CI currently runs serially.

## Decision checklist

Before adding an E2E test, ask:

1. Which domain concept is under test: onboarding, survey, sample, occurrence, taxon, lock, local status, or upload status?
2. Is the behaviour specific to one survey or shared by several?
3. What model shape does that survey use?
4. Is browser interaction necessary, or would a colocated unit test be clearer?
5. Can an existing fixture or helper provide the setup?
6. Can the test run alone in a fresh browser context?
7. Does the flow avoid real remote data mutation?
8. Is the assertion a visible, durable user outcome?

Default to the shortest independent test that proves the behaviour.