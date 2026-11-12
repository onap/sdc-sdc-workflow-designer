# Frontend tests

Use **Node 10.17.0** and **Yarn 1.19.1**, matching `frontend-maven-plugin`.
The frontend `.nvmrc` selects that Node version when using `nvm use`.
Run these commands from `sdc-workflow-designer-ui/src/main/frontend`:

```sh
yarn install --frozen-lockfile
yarn test                    # full suite, at most two workers
yarn test inputOutput        # focused tests by filename
yarn test-dev                # watch mode
yarn test-build              # CI: serial tests, coverage, enforced thresholds
yarn test-coverage           # coverage with up to two workers
```

Coverage commands print a summary and write `coverage/lcov-report/index.html`,
`coverage/lcov.info`, `coverage/coverage-final.json`, and
`coverage/coverage-summary.json`. Open the HTML report with your browser;
no platform-specific browser command runs automatically.

From the repository root, `mvn test -pl sdc-workflow-designer-ui` installs the
pinned runtime, installs the locked dependencies, builds webpack, and runs
`test-build`. Do not use `fast-build` or `skipTests` to validate these changes.
The GitHub frontend verification also treats test failures as failures;
dependency and image audit results remain supplementary.

## Coverage policy

All runtime JavaScript, JSX and TypeScript under `src/` count, including files
never imported by a test. Only the build-time i18next scanner configuration is
excluded. Thresholds are enforced by Jest:

| Scope | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| Remaining application code | 90% | 85% | 90% | 90% |
| REST request helper | 100% | 95% | 100% | 100% |
| Input/output name validation | 100% | 100% | 100% | 100% |

Jest evaluates explicitly named files separately from its global threshold.
Use `yarn test <pattern>` for focused development: running coverage for a small
subset still applies the complete application gates and can intentionally fail.
Do not lower thresholds or exclude application code to make a test pass.

## Writing tests

Tests anywhere under `src/` are discovered from `__tests__/` directories or
`*.test.js`, `*.spec.js` (also JSX, MJS and TS). Keep fixtures and reusable helpers
outside `__tests__/`; every matching file must contain tests.

- jsdom, local/session storage mocks and the React 16 Enzyme adapter are configured
  centrally. Jest clears call histories and restores spies between tests. Use
  `beforeEach` for spies that every test needs.
- Assert user-visible DOM, resulting Redux state, request payloads or BPMN data.
  Use literal expected values. Prefer interactions to broad snapshots.
- `testSetup/createTestStore.js` supplies a fresh real reducer/store with optional
  saga middleware. Cancel its returned task in `afterEach`. Lifecycle tests use
  the real root saga and mocked API boundaries; API tests mock Axios instead.
- Use fake timers for debounce/notifications and drain API promises with
  `flushPromises`. Enable fake timers after any `jest.resetAllMocks`, and restore
  real timers during cleanup. Unmount React trees and remove test DOM/listeners.
- BPMN tests use real moddle objects, property entries, command handlers, event
  buses and rules. Mock browser SVG/import/export boundaries only where jsdom
  lacks browser layout/rendering. The tree suite documents its jsdom 11 SVG
  class-selector adapter. These tests do not replace browser rendering checks.
- `.bpmn` imports contain real XML, matching webpack's raw loader. Published BPMN
  ES modules are transformed through Babel; TypeScript plugin messaging is
  compiled with the existing TypeScript dependency and mapped to original source
  for coverage. This is runtime testing, not TypeScript type checking.
- For a bugfix, first reproduce the failure with a regression test; retain that
  test with the fix. When reviewing coverage, check that removing the state
  change, request argument, validation or event handler would fail an assertion.

This suite requires no running backend, database, Docker or external network.
It covers component and application integration behavior. Deployed browser/SVG
layout and backend REST compatibility still require their respective integration
checks.
