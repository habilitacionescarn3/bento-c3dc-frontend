# Cohort Analyzer tests

Jest tests for the Cohort Analyzer module. Layout mirrors feature areas so new coverage is easy to add.

## Structure

```
__tests__/
  ../testSupport/       # Shared mocks and render helpers (outside __tests__ so Jest does not run them as suites)
  test-entry-point/     # CohortAnalyzer.js page shell: handlers, effects, wiring (mocked children)
  unit/                 # Pure functions, reducers, hooks utilities
    utils/
    store/
    config/
    vennDiagram/
    components/
    CohortAnalyzerUtil/
    HistogramPanel/
    downloads/
    controllers/
    customCheckbox/
    styling/
    CreateNewCohortButton/
    CohortAnalyzerTableSection/

**30 test suites** total under `__tests__/`.
```

## Commands

```bash
# All Cohort Analyzer tests with coverage (quiet output — no known third-party console noise)
npm run test:cohort-analyzer

# Watch mode (full project test runner)
npm run test:watch -- --testPathPattern=CohortAnalyzer/__tests__
```

Test runs use Jest `--silent` plus `config/jest/setupTests.js` so Material-UI, React Router, and similar warnings are not printed. Unexpected errors still fail tests.

## Adding tests

1. **Pure logic** — add `unit/<area>/<module>.test.js` and import the function directly.
2. **Page logic** — prefer `cohortAnalyzerPageLogic.js` for testable branches from `CohortAnalyzer.js`.
3. **Page entry point** — add or extend `test-entry-point/` with mocks in `testSupport/cohortAnalyzerMocks.js` (wiring and effects on `CohortAnalyzer.js`, not child UI).
4. **Redux** — test reducers/actions under `unit/store/`.

## Coverage goals

| Area | Target | Status |
|------|--------|--------|
| `cohortAnalyzerPageLogic.js` | 100% functions | Covered |
| `utils/cohortAnalyzerChartPreview.js` | 100% | Covered |
| `CohortAnalyzerUtil.js` | 100% statements | Covered |
| `store/` actions, reducers, DnD helpers | High / 100% functions | Covered |
| `CohortAnalyzer.js` | Page handlers + effects | ~94% lines (`test-entry-point/`) |
| Large UI (Histogram, ChartVenn, ChartArea) | On change | Add `unit/` or `test-entry-point/` per feature |

Run `npm run test:cohort-analyzer` for the full report.
