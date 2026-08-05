# E2E Smoke Test Guide for AI Agents

Write E2E tests as a small smoke suite, not an exhaustive regression suite. Cover only the critical user journeys that prove the app can start, navigate, create local data, validate required fields, and recover from common user actions.

## Scope

Prioritise 3–6 high-value journeys:

- first launch / onboarding to home
- creating a record or draft through the primary flow
- required-field validation before completion
- editing or deleting a local draft
- key navigation paths users rely on every session
- one offline-safe path if the app supports offline use

Skip exhaustive combinations, visual styling checks, edge-case matrices, and backend behaviour unless explicitly requested.

## Server safety

Tests must not upload real test data to production or shared servers.

Use the safest available option, in this order:

1. keep records as local drafts and never press upload/submit actions
2. run offline or mock/block upload endpoints
3. use a dedicated test backend/account only if the repo already provides one
4. assert that no upload request was made when the journey must remain local

If a critical journey normally ends with upload, stop at the confirmation/validation point or intercept the request and verify the UI handles the mocked response.

## Test style

- Use real user-visible flows and accessible locators where possible.
- Keep each test independent and reset browser/app state between tests.
- Assert durable outcomes: visible page, saved local draft, validation message, navigation result.
- Avoid arbitrary sleeps; wait for specific UI state.
- Add comments matching the user journey steps.
- Prefer one clear smoke test over many brittle partial tests.

## Done criteria

A good E2E smoke suite gives fast confidence that the app’s main user journeys still work, without creating server data, depending on production state, or duplicating unit/integration coverage.
