# Sim Returns Web App Spec

Status: Draft v0.2  
Date: 2026-03-15  
Target route: `wespiser.com/app/sim-returns`

## 1. Summary

Build a browser-based interactive simulator that uses the provided R script as the basis for the data source and overall Monte Carlo approach, but is designed first as a live, responsive web experience that runs entirely in the browser and can be deployed as a single JavaScript bundle on `wespiser.com/app/sim-returns`.

The app should let a visitor play with basic personal-finance strategy choices across both saving years and retirement years, then see the simulation update in real time as runs accumulate. Instead of a static result after one batch finishes, the UI should progressively show path lines, evolving percentile bands, and changing outcome distributions while the experiment is running.

The product goal is not strict `script.R` parity. The goal is to preserve the spirit of the model:

- bootstrap from historical annual S&P 500 total returns
- simulate many plausible market paths
- answer planning questions in terms of pessimistic, typical, and optimistic outcomes
- model decisions on an annual basis for clarity and simplicity
- keep the experience fast, visual, and fun to explore

## 2. Product Goal

Create a self-contained, embeddable web app that:

- uses the R model as the foundation, without being constrained to a static one-shot output
- is understandable to non-technical visitors
- feels polished enough to live on a public-facing personal site
- is enjoyable enough that users want to keep trying scenarios
- has no required backend dependency for core functionality
- can be embedded into an HTML page with a minimal one-line mount

## 3. Non-Goals

The MVP does not need to include:

- account creation or saved scenarios
- brokerage integrations
- tax modeling
- fees, expense ratios, or advisor fees
- multi-asset portfolio allocation
- live market data streaming
- financial advice or recommendation language
- brokerage account syncing

## 4. Core User Stories

1. As a visitor, I can adjust my savings rate, retirement start year, and retirement spending strategy.
2. As a visitor, I can see simulation lines appear and distributions update while the model is still running.
3. As a visitor, I can understand whether my current lifestyle is affordable in retirement under pessimistic, median, and optimistic outcomes.
4. As a visitor, I can see what a portfolio-percentage withdrawal rule, such as 4%, actually implies for yearly spending.
5. As a visitor, I can trust that the model is grounded in historical S&P 500 total-return data and understand the core assumptions.
6. As the site owner, I can deploy the app as one JavaScript asset without adding a backend service.

## 5. Functional Scope

### 5.1 Required Inputs

The MVP should expose these user-editable inputs:

- `Current portfolio`
- `Annual savings amount`
- `Retirement start year`
- `Years in retirement`
- `Retirement spending strategy` with exactly one selected mode:
  `fixed dollars` or `percent of portfolio`
- `Annual retirement spending amount` when fixed-dollars mode is selected
- `Annual inflation adjustment` when fixed-dollars mode is selected
- `Retirement withdrawal rate` when percent-of-portfolio mode is selected
- `Number of simulations`

Recommended supporting inputs for v1:

- `Current annual spending` as a convenience action to prefill the fixed-dollars retirement spending field

Fixed-dollars default behavior:

- if `Current annual spending` is provided, fixed-dollars mode should initialize the retirement spending target from that value
- otherwise, use the configured fixed-dollars default scenario value

Savings input rule:

- v1 should expose annual savings only in the UI
- no monthly savings input or override should be shown in v1

### 5.2 Required Actions

The MVP should support:

- automatic rerun after input changes with a short debounce
- manual `Run simulation`
- immediate `Stop / restart` behavior when inputs change mid-run
- `Reset to defaults`

### 5.3 Required Outputs

The MVP should display:

- a chart of simulated portfolio paths across both accumulation and retirement
- a 10th / 50th / 90th percentile band that updates during the run
- a live-updating, hover-driven distribution view for the currently selected year
- a set of summary values for retirement readiness and retirement sustainability
- yearly retirement spending outcomes for the selected withdrawal mode
- the total amount contributed before retirement
- a short explanation of the methodology
- the historical data source and coverage window

### 5.4 Required Summary Metrics

At minimum, show:

- portfolio value at retirement in pessimistic / median / optimistic cases
- ending portfolio value at the end of retirement in pessimistic / median / optimistic cases
- probability of not running out of money before the end of retirement
- median depletion year for failed plans, if applicable
- total dollars contributed before retirement
- if fixed-dollars mode is selected:
  whether the target spending path is sustained through retirement
- if percent-of-portfolio mode is selected:
  yearly spending at retirement start in pessimistic / median / optimistic cases

Recommended additional metrics for MVP:

- probability of finishing retirement above starting retirement balance
- percentile range at retirement date separate from end-of-retirement range
- median real spending power over retirement in fixed-dollars mode

### 5.5 Required Visualizations

The MVP should include:

- a primary line chart showing path evolution over time
- a hover-driven distribution of investment income for the currently hovered year
- a hover-driven distribution of retirement withdrawals for the currently hovered year
- a hover-driven distribution of account asset values for the currently hovered year
- visual distinction between accumulation years and retirement years
- markers or labels for retirement start and plan-failure events
- a spending panel that changes based on the selected retirement strategy

## 6. Simulation Model

The browser implementation should use the R script's approach as a foundation, but extend it into a richer in-browser simulation system with progressive updates and retirement-phase modeling.

### 6.1 Historical Data

Use annual S&P 500 total returns from Aswath Damodaran's historical returns table.

Source:

- `https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html`

Current data window observed during spec drafting:

- years covered: `1928-2025`
- source page updated date: `January 5, 2026`

Data packaging requirement:

- the S&P 500 total-return dataset should be downloaded once during development or build preparation
- the cleaned annual return series should live in the codebase as a canonical source file that is imported into the final bundle
- the browser app should sample from that bundled dataset directly
- the production app must not download the return history from the source site on each page load or each simulation run
- the manual refresh workflow should be documented in [data-refresh.md](/Users/adamwespiser/projects/sim-my-life/docs/data-refresh.md)

### 6.2 Sampling Method

For each simulated year:

1. Sample one historical annual return from the historical return set.
2. Sample with replacement.
3. Treat each sampled year as independent from other sampled years.

This is a bootstrap simulation based on historical annual returns. It is not a normal-distribution Monte Carlo model.

Possible later enhancement, not required for MVP:

- block bootstrap or regime-aware sampling to preserve short multi-year market structure

### 6.3 Growth Math

For each sampled annual return `r`:

1. Apply annual market growth:
   `balance = balance * (1 + r)`
2. During pre-retirement years, add annual savings:
   `balance = balance + annual_savings`
3. During retirement years, apply the chosen annual withdrawal rule
4. Record balance at the end of each simulated year

Timeline semantics:

- the current calendar year is `year 0`
- the selected retirement start year is the first year of retirement
- if the user selects `2030` as the retirement start year, the model assumes retirement begins on `January 1, 2030`
- that means `2030` uses withdrawal behavior, not contribution behavior
- all years before the retirement start year are accumulation years

Retirement spending timing for v1:

- withdrawals occur annually after growth
- if using fixed dollars, withdraw the planned annual spending for that year
- fixed-dollars spending can increase each year by the user-selected inflation adjustment
- if using percentage mode, withdraw `withdrawal_rate * current_balance`
- if balance falls to `<= 0`, mark the path as depleted and keep it at zero thereafter

Note:

- this intentionally departs from the R script's monthly mechanics in favor of a simpler annual planning model that is easier to explain and faster to compute

### 6.3.1 Hovered-Year Distribution Formulas

For a hovered year, the three required distributions should be derived from each simulated path using these exact yearly values:

- `investment income this year`
  the dollar gain or loss caused by market performance before contributions or withdrawals for that year
- formula:
  `investment_income = starting_balance_for_year * annual_return`

- `retirement withdrawals this year`
  the actual dollars withdrawn during that year after annual growth is applied
- for accumulation years:
  `retirement_withdrawals = 0`
- for fixed-dollars retirement years:
  `retirement_withdrawals = min(planned_annual_spending_for_year, balance_after_growth)`
- for percent-of-portfolio retirement years:
  `retirement_withdrawals = min(withdrawal_rate * balance_after_growth, balance_after_growth)`

- `account assets this year`
  the end-of-year portfolio balance after that year's growth and contribution or withdrawal activity
- formula:
  `account_assets = ending_balance_for_year`

Definitions used above:

- `starting_balance_for_year` is the balance at the start of the hovered year
- `balance_after_growth` is the balance immediately after applying the sampled annual return and before contribution or withdrawal activity
- `ending_balance_for_year` is the balance after the full annual step is complete

### 6.4 Retirement Strategy Modes

The retirement strategy must be mutually exclusive. The user chooses one mode at a time:

1. `Fixed dollars`
2. `Percent of portfolio`

Mode behavior:

- `Fixed dollars` answers: "Can I afford the life I want to live?"
- the user enters an annual spending target
- the user optionally applies an annual inflation adjustment so required spending rises over retirement
- success means the portfolio remains above zero through the full retirement horizon

- `Percent of portfolio` answers: "If I withdraw X% each year, what does that spending actually look like?"
- the user enters a withdrawal rate such as `4%`
- yearly spending is determined by portfolio size, so spending rises and falls with market outcomes
- the app should emphasize the implied spending distribution, not just portfolio survival

### 6.5 Simulation Defaults

Default values should feel realistic for a first interaction and can differ from the prototype.

Suggested defaults for the first design pass:

- current portfolio: `100000`
- annual savings amount: `23500`
- retirement start year: current year plus `20`
- years in retirement: `30`
- retirement strategy: `fixed dollars`
- retirement spending amount: `50000`
- annual inflation adjustment: `2.5%`
- withdrawal rate default for percentage mode: `4%`
- number of simulations: `1000`
- seed: internal only, derived from current Unix time in seconds at simulation start

### 6.6 Output Bands

For each display step, calculate:

- `p10`
- `p50`
- `p90`

The chart should include:

- a lightly drawn set of sample paths
- a filled `p10-p90` band
- a median path line
- periodic updates while simulations are still being computed

Important UX rule:

- the user should see the system "thinking" through accumulating path lines and changing distributions, not a frozen screen followed by one final render

### 6.7 Progressive Simulation Engine

The simulator should run in batches so results can update incrementally.

Recommended behavior:

1. Start rendering after the first small batch of completed paths.
2. Add more paths in batches.
3. Recompute percentile bands and summary metrics after each batch or every few batches.
4. Update the line chart and distribution chart during the run.
5. Allow current work to be canceled when inputs change.

Recommended implementation direction:

- run simulation in chunks
- limit the number of visible path lines for rendering performance
- keep a larger internal sample for percentile and success-rate calculations
- use a Web Worker if the main thread cannot stay responsive

Seed behavior:

- the seed should not be exposed in the normal user interface
- derive the seed from the current Unix timestamp in seconds at simulation start
- the resolved seed value should be logged so a run can be reproduced later

## 7. UX / Content Requirements

### 7.1 Layout

The page should be a single-screen-first experience with this general structure:

1. Intro / title block
2. Input controls
3. Live summary cards
4. Main simulation chart
5. Outcome distribution panel showing all three hover-driven yearly distributions at once
6. Methodology and source note

### 7.2 Tone

The site should feel clear, analytical, and playful enough to invite experimentation. It should avoid:

- hype language
- recommendation language
- "you should invest" framing

### 7.3 Visual Direction

The design should look intentional and editorial, not like a default SaaS dashboard.

Desired qualities:

- distinct typography
- strong visual hierarchy
- clean chart readability
- mobile-friendly controls
- subtle motion only where it helps comprehension
- visible feedback while simulations are running
- enough personality that changing inputs feels interactive rather than clerical

### 7.4 Copy Requirements

The app should explain, in plain language:

- that it samples from historical annual S&P 500 total returns
- that results are simulated, not guaranteed
- that savings and withdrawals are modeled annually
- that retirement outcomes depend heavily on spending assumptions
- that fixed-dollar retirement plans may require inflation adjustments
- that percentage-withdrawal plans produce variable yearly spending
- that this is for educational / illustrative use

## 8. Technical / Deployment Requirements

### 8.1 Bundle Requirement

The deliverable must be deployable as a single JavaScript bundle.

Implications:

- no required external CSS file
- no required backend API for core simulation
- no required runtime dependency on a third-party CDN
- historical return data should be embedded in the bundle for reliability
- any worker-based simulation must still be packaged inside the single delivered bundle

### 8.2 Integration Requirement

The bundle should be easy to mount on a page at `wespiser.com/app/sim-returns`.

Recommended integration pattern:

- one script include
- one mount element or custom element tag
- one-line embed after the script is loaded, preferably:
  `<sim-returns-app></sim-returns-app>`

Embed requirement:

- the app should expose a custom element so an HTML file can embed it with one line
- all required styles and runtime logic must be packaged in the single JavaScript bundle
- the host page should not need framework-specific bootstrapping code
- the app should render inside a Shadow DOM to isolate markup and styles from the host page
- assume embed means a simple HTML page that loads the bundle and includes the custom element hook
- the embed should work in lightweight generated HTML such as Markdown-to-HTML output, where the page may only add the script resource and the custom element tag

### 8.3 Demo Harness

The repo should include a local `demo.html` file for manual testing and iteration.

Requirements for `demo.html`:

- loads the built JavaScript bundle locally
- mounts the app using the one-line embed form
- works as a lightweight manual smoke-test page during development
- does not depend on the production site to verify behavior

### 8.4 Data Reliability

Runtime fetching from the Damodaran page should not be required for the app to work. The bundle should continue functioning even if:

- the source site is slow
- the source site is down
- the source site blocks browser-side cross-origin requests

Operational requirement:

- historical return data should be refreshed manually or via a separate build/update step, not at browser runtime

### 8.5 Browser Support

Target current evergreen browsers:

- current Chrome
- current Safari
- current Firefox
- current Edge

### 8.6 Charting Dependency

The app should use `uPlot` as the charting library for v1.

Reason for choosing `uPlot`:

- it aligns with the single-bundle constraint better than heavier charting libraries
- it is well-suited to fast line rendering and progressive updates
- it is a strong fit for the primary simulation chart, which is the most performance-sensitive visualization in the app

Dependency rule:

- prefer `uPlot` for the main path chart and related chart rendering needs
- do not introduce a second major charting library in v1 unless `uPlot` proves unable to support a required visualization within the size and performance budgets

### 8.7 CSS Strategy

The app should follow the CSS strategy documented in [css-strategy.md](/Users/adamwespiser/projects/sim-my-life/docs/css-strategy.md).

Required CSS rules for v1:

- use plain CSS inside the custom element's Shadow DOM
- do not use Tailwind, CSS-in-JS, Sass, or another styling framework in v1
- keep all required styles bundled with the JavaScript bundle
- define a small design-token layer using CSS custom properties
- expose only a minimal documented host-theming surface through custom properties on the custom element
- do not rely on host-page global styles for correct rendering

### 8.8 Bundling Tool

The app should use `Vite` for bundling in v1.

Bundling rules:

- use `Vite` as the primary build tool for local development and production bundling
- the final output must still satisfy the single-JavaScript-bundle requirement for the app
- do not introduce a framework runtime just because `Vite` is used as the bundler

## 9. Performance Requirements

The experience should remain responsive at default settings.

Suggested targets:

- first render should feel immediate
- first visible simulation output should appear in well under 500ms on a modern desktop
- default simulation should feel progressively complete within roughly 1 to 2 seconds on a modern desktop
- slower devices should still remain usable
- chart drawing should not attempt to render all 10,000 paths individually if that hurts performance

Implementation note for later:

- simulation count used for statistics can be larger than the number of paths rendered visually

## 10. Accessibility Requirements

The MVP should include:

- proper labels for all controls
- keyboard-accessible inputs and buttons
- readable color contrast
- text alternatives / visible descriptions for the chart's meaning
- no information conveyed by color alone

## 11. Logging And Debugging Requirements

The browser app must include clear, intentional logging for development and debugging.

Required logging behavior:

- log app startup and custom-element mount success
- log simulation start, cancellation, completion, and fatal errors
- log the active scenario inputs at simulation start
- log batch-progress updates at a reasonable cadence during progressive simulation
- log data-version information for the bundled historical return dataset

Logging constraints:

- logs should be structured and easy to scan in the browser console
- logs should use consistent prefixes such as `sim-returns:`
- logs should help isolate whether a problem is caused by data loading, simulation logic, rendering, or embed/mount behavior
- logs must not be so noisy that they become useless during normal debugging

Recommended implementation direction:

- centralize logging behind a small logger utility
- allow verbose logging to be toggled for development
- keep production logging minimal but preserve error and critical lifecycle logs

## 12. Testing Requirements

The TypeScript implementation must include automated tests.

Required test coverage areas:

- simulation engine correctness for annual accumulation and retirement flows
- retirement-year boundary behavior using the selected retirement start year
- fixed-dollars withdrawal behavior, including inflation-adjusted spending
- percent-of-portfolio withdrawal behavior
- depletion detection and probability-of-success calculations
- timestamp-based seed generation for normal user runs
- custom-element mount and basic render behavior
- Shadow DOM mount and style isolation behavior

Recommended testing layers:

- unit tests for pure simulation logic
- component or DOM tests for the embeddable custom element
- component snapshot tests at the DOM level by serializing Shadow DOM output after render
- one lightweight integration or smoke test using `demo.html` assumptions

Testing philosophy:

- the simulation logic should be testable separately from rendering
- browser rendering details do not need pixel-perfect tests
- high-value tests should focus on correctness of model behavior and embed reliability
- snapshot tests should catch structural regressions such as missing sections, mode-switching breakage, field visibility changes, and Shadow DOM markup drift

## 13. Proposed MVP Feature Set

This is the recommended v1 scope to build first:

- input form for current portfolio, annual savings, retirement timing, and withdrawal strategy
- deterministic bootstrap simulation in-browser
- progressive simulation batches with live visual updates
- summary cards for retirement-date and end-of-plan outcomes
- probability-of-success metric
- fixed-dollars retirement mode with inflation-adjusted spending target
- percent-of-portfolio retirement mode with implied yearly spending outputs
- responsive line/band chart
- live-updating outcome distribution view with:
  investment-income distribution, retirement-withdrawal distribution, and asset-value distribution for the hovered year
- short methodology text
- source attribution and coverage years
- single-bundle embed

## 14. Nice-to-Have Features After MVP

These should be treated as follow-up scope unless you explicitly want them in v1:

- shareable URL params for current inputs
- preset scenarios
- downloadable image of chart
- downloadable CSV of percentile bands
- social / playful scenario presets
- yearly contribution growth
- Social Security or pension income
- multiple historical datasets

## 15. Risks / Edge Cases

The implementation should account for:

- very large simulation counts causing slow renders
- very long horizons producing dense charts
- zero contribution / zero initial scenarios
- invalid input values
- negative or unrealistic manual inputs
- differences between R and JavaScript random number generators
- plans that fail early in retirement
- very high withdrawal rates creating misleadingly noisy results

Important note:

- exact path-by-path parity with R is not required if the RNG differs
- parity with the R script means preserving the return source and bootstrap logic, not reproducing the static output shape
- the UX should optimize for responsive exploration, not for reproducing an offline plotting workflow

## 16. Acceptance Criteria

The MVP is done when all of the following are true:

1. A visitor can open the page and run a simulation with no backend service.
2. The app can be shipped as a single JavaScript bundle.
3. The simulation methodology remains based on historical annual-return bootstrap sampling from the Damodaran dataset.
4. The app models both pre-retirement saving and retirement drawdown.
5. The app supports exactly one retirement strategy at a time: fixed dollars or percent of portfolio.
6. The visitor can change core inputs and see the model restart without a full page reload.
7. The app begins showing partial results while the simulation is still running.
8. The app shows sample paths, a percentile band, a median line, and an updating hover-driven distribution view.
9. The app shows retirement-date outcomes, end-of-retirement outcomes, and probability of plan survival.
10. In fixed-dollars mode, the app shows whether the spending target survives retirement under the selected inflation assumption.
11. In percent-of-portfolio mode, the app shows the implied yearly spending distribution.
12. The app is usable on desktop and mobile.
13. The app clearly attributes the data source and explains the method.
14. The simulation logic is annual rather than monthly.
15. The app can be embedded in an HTML page with a one-line custom-element mount.
16. The repo includes a working `demo.html` file for local manual testing.
17. The TypeScript implementation includes automated tests for the simulation logic and embed behavior.
18. The app uses a bundled local copy of the historical S&P 500 total-return data rather than fetching it at runtime.
19. The browser console exposes clear lifecycle and simulation logs for debugging.
20. The app mounts inside a Shadow DOM and can be embedded on a simple HTML page with only the bundle script and the custom element tag.
21. User-facing runs derive the seed from current Unix time in seconds and log the resolved seed.

## 17. Open Questions

No MVP-blocking open questions remain.

Resolved MVP decisions:

- fixed-dollars mode should initialize from `Current annual spending` when that convenience input is provided
- shareable URL state is out of scope for v1

## 18. Recommended Next Step

Before writing code, revise this draft into implementation-ready v0.3 by:

1. locking the retirement-phase inputs and outputs
2. choosing the TypeScript test stack and minimum test matrix
3. defining the one-time dataset refresh workflow and logging verbosity defaults
