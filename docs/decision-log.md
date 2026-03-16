# Decision Log

This document captures product and technical decisions made during planning so implementation does not have to reconstruct them from chat history.

## Product Direction

- Do not maintain strict `script.R` parity.
- Use the R script as the basis for the dataset and general Monte Carlo approach only.
- The app should run entirely in the browser and feel live, not produce a static post-run result.
- The app should be fun to play with and realistic enough for personal-finance exploration.
- The core planning questions are:
  - can I afford my current lifestyle in retirement?
  - if I use a fixed withdrawal rate like `4%`, what does that actually mean for yearly spending?

## Simulation Model

- Use an annual model, not a monthly model.
- Keep the simulation simple and easy to explain on an annual basis.
- Treat the current calendar year as `year 0`.
- Use an explicit `Retirement start year`.
- If a user selects a retirement year like `2030`, retirement starts on `January 1, 2030`.
- The retirement start year uses withdrawals, not contributions.
- Use historical S&P 500 total returns as the basis for bootstrap sampling.
- Do not fetch return data at runtime.

## Retirement Modes

- Support exactly two retirement strategies, mutually exclusive:
  - `fixed dollars`
  - `percent of portfolio`
- Fixed-dollars mode includes inflation adjustment and is in scope for v1.
- Percent-of-portfolio mode should show what yearly spending looks like under that rule.

## Inputs And UX Scope

- Annual savings only in the UI.
- No monthly savings UI or monthly override in v1.
- Seed should be invisible to users.
- Reproducibility is not a user-facing goal.
- Runs should use current Unix time in seconds internally for seed resolution.
- If `Current annual spending` is provided, fixed-dollars mode should initialize from that value.
- Shareable URL state is out of scope for v1.

## Outputs And Visualization

- Show results progressively while simulation batches are running.
- Render sample path lines live.
- Update percentile and distribution outputs during the run.
- Do not surface best/worst sampled runs.
- Show all three distribution views at once.
- The distributions are driven by mouse hover on the chart for the hovered year.
- The three hover-driven distributions are:
  - distribution of investment income this year
  - distribution of retirement withdrawals this year
  - distribution of assets in the account this year

## Embedding And Delivery

- The app must be embeddable in HTML with one line.
- The embed model is a simple HTML page that loads the JS bundle and inserts the custom element.
- It should work in Markdown-to-HTML generated pages.
- The app should render inside Shadow DOM.
- Include a `demo.html` file for local and manual testing.
- The project docs live under `docs/*`.
- Use `Vite` for bundling in v1.

## Data Handling

- Download the S&P 500 total-return dataset once.
- Store it in code as the canonical bundled dataset.
- Sample from that bundled dataset in the app.
- Do not download the dataset on each page load or simulation run.

## Observability

- Clear browser console logging is required.
- Logging should make debugging fast and help isolate issues.

## Testing And Process

- Include TypeScript tests.
- Include DOM-level component snapshot tests by serializing Shadow DOM output.
- Snapshot tests should catch:
  - missing sections
  - mode-switching regressions
  - form field visibility changes
  - structural breakage from refactors
- Every task should follow failing-test-first TDD:
  - write a test
  - confirm it fails
  - implement the smallest change
  - make the test pass

## Charting

- Use `uPlot` for charting in v1.
- Do not introduce another charting library in v1 unless `uPlot` proves insufficient.

## CSS And Styling

- Use the documented CSS strategy.
- Use plain CSS inside Shadow DOM.
- Do not use Tailwind, CSS-in-JS, Sass, or similar frameworks in v1.
- Use a small design-token system with CSS custom properties.
- Expose only a minimal host-theming surface.

## Docs And Architecture

- Maintain a module-boundaries architecture doc.
- Treat the architecture doc as the source of truth for module boundaries.
- Reference both the architecture doc and this decision log from the agent instructions.
