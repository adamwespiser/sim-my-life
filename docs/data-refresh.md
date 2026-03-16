# Historical Data Refresh Workflow

This app does not fetch historical return data at runtime.

The canonical dataset lives in [src/data/historical-returns.ts](/Users/adamwespiser/projects/sim-my-life/src/data/historical-returns.ts) and must be updated manually or through a separate prep step before shipping.

## Refresh Steps

1. Download the source page:
   `https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html`
2. Extract the annual S&P 500 total-return series from the source table.
3. Update the records in [src/data/historical-returns.ts](/Users/adamwespiser/projects/sim-my-life/src/data/historical-returns.ts).
4. Update dataset metadata in the same file:
   coverage years, `sourceUpdatedAt`, and `version`.
5. Run verification:
   - `npm test`
   - `npm run typecheck`
   - `npm run format:check`
6. Confirm the dataset integrity tests still pass before committing.

## Rules

- Do not add browser-side fetching for the return history.
- Do not leave the metadata version unchanged when the dataset contents change.
- Treat the data module as the only canonical runtime source for historical returns.
