# Implementation Plan

Source documents:

- [spec.md](/Users/adamwespiser/projects/sim-my-life/docs/spec.md)
- [system-understanding-summary.md](/Users/adamwespiser/projects/sim-my-life/docs/system-understanding-summary.md)
- [css-strategy.md](/Users/adamwespiser/projects/sim-my-life/docs/css-strategy.md)

Purpose:

- break the work into small, verifiable phases
- make each task executable by an autonomous coding agent
- require each task to produce observable output such as files, tests, or visible features

## Completed Tasks

- `P0.1` completed
- `P0.2` completed
- `P0.3` completed
- `P0.4` completed

## Execution Rule

Every implementation task in this plan should follow a failing-test-first workflow.

Required workflow for each task:

1. Write or update a test that captures the intended behavior before implementation.
2. Run the test and confirm it fails for the expected reason.
3. Implement the smallest code change needed to make the test pass.
4. Re-run the relevant tests and confirm they pass.
5. Only then move to the next task.

Why this rule matters here:

- it makes each task concrete before code is written
- it reduces ambiguity for autonomous coding agents
- it turns vague implementation work into explicit passing behaviors
- it creates a better debugging trail when a task regresses later

## Planning Assumptions

- v1 remains limited to annual savings input only.
- v1 keeps runtime data local to the bundle and does not fetch returns data in the browser.
- v1 uses Shadow DOM and a custom element as the only embed contract.
- v1 does not surface best/worst runs.
- shareable URL state remains out of scope unless `docs/spec.md` is updated.
- `uPlot` is the selected charting library for v1.
- `Vite` is the selected bundler for v1.

## Performance And Bundle Budgets

- target bundle size: <= 150 KB gzip for the shipped app bundle
- hard bundle ceiling: <= 200 KB gzip for the shipped app bundle
- target first visible simulation output: <= 500 ms on a modern desktop at default settings
- target progressive completion for the default scenario: <= 2 seconds on a modern desktop
- any dependency that materially threatens the bundle budget should be rejected unless it replaces more code than it adds

## Phase 0: Lock Remaining Product Decisions

Goal:

- remove the last ambiguities that would otherwise cause rework during implementation

| ID | Task | Observable Output | Verification |
| --- | --- | --- | --- |
| P0.1 | Persist the architecture design into a repo doc so module boundaries are no longer only in chat context. | `docs/architecture.md` | File exists and matches the current spec and summary. |
| P0.2 | Update `docs/spec.md` to define the exact hovered-year formulas for `investment income`, `retirement withdrawals`, and `account assets`. | Updated `docs/spec.md` | Spec has explicit formulas or definitions for all three hover distributions. |
| P0.3 | Resolve the remaining open product choices: fixed-dollars default behavior and whether shareable URL state is out of scope for MVP. | Updated `docs/spec.md` with no MVP-blocking open questions | Read-through confirms MVP behavior is fully specified. |
| P0.4 | Persist the CSS architecture into a repo doc so styling structure, token scope, and host-page guarantees are fixed before UI implementation. | `docs/css-strategy.md` | File exists and aligns with the current spec. |

## Phase 1: Project Foundation

Goal:

- create a minimal TypeScript project that can build one bundle, run tests, and load a demo page

| ID | Task | Observable Output | Verification |
| --- | --- | --- | --- |
| P1.1 | Create project manifest and scripts for build, test, and local verification. | `package.json` with working scripts | `npm run build` and `npm test` execute successfully. |
| P1.2 | Add TypeScript configuration and source/test directory structure. | `tsconfig.json`, source folders, test folders | TypeScript compiler runs with no missing-config errors. |
| P1.3 | Add minimal linting and formatting configuration for TypeScript, tests, and docs-facing source files. | Lint/format config files and `package.json` scripts | `npm run lint` and `npm run format:check` execute successfully. |
| P1.4 | Add `Vite` configuration that outputs a single browser bundle for the app entrypoint. | `vite.config.*` and bundle output path | Build produces exactly one app JS bundle in `dist/`. |
| P1.5 | Add a bundle-size check that measures the built artifact and fails the build if it exceeds the agreed gzip budget. | Size-check script and `package.json` script | `npm run size` reports bundle size and fails above the hard ceiling. |
| P1.6 | Add test-runner configuration for unit tests, DOM/custom-element tests, and DOM snapshot tests for Shadow DOM output. | Test config file | A placeholder unit test and a placeholder DOM-level snapshot test pass locally. |
| P1.7 | Wire `demo.html` to the expected bundle location and confirm it uses the one-line embed contract. | Updated `demo.html` and build output path agreement | Opening `demo.html` after a build loads the bundle without path errors. |
| P1.8 | Add `uPlot` as the charting dependency and verify it fits within the initial bundle budget baseline. | Lockfile changes and dependency note in docs | Build and size-check pass with `uPlot` included. |

## Phase 1.5: Styling Foundation

Goal:

- lock the CSS architecture before component UI work begins

| ID | Task | Observable Output | Verification |
| --- | --- | --- | --- |
| P1.9 | Define the host-facing design tokens and documented theming surface from `docs/css-strategy.md`. | Token definitions file and docs reference | Type-check or build passes, and the documented token list exists in code. |
| P1.10 | Implement the Shadow DOM base stylesheet with local reset/base rules and `:host` sizing guarantees. | Base stylesheet module | DOM snapshot test confirms the component renders with internal base styles and default `:host` behavior. |
| P1.11 | Add a test fixture demonstrating host-level CSS variable overrides without relying on host structural CSS. | Theme fixture or DOM test | Test confirms custom properties can change theme values without breaking Shadow DOM structure. |

## Phase 2: Data And Domain Foundations

Goal:

- establish the canonical data source and the typed scenario model before simulation logic is written

| ID | Task | Observable Output | Verification |
| --- | --- | --- | --- |
| P2.1 | Add the canonical historical returns source file and dataset metadata to the source tree. | Data module file and metadata export | A test confirms the dataset loads from code with no network access. |
| P2.2 | Add data integrity tests for coverage window, record count, and metadata version. | Dataset tests | Tests verify expected years and non-empty values. |
| P2.3 | Add a documented manual data-refresh workflow or update utility outside runtime code. | Refresh doc or script plus docs reference | A reviewer can see how the dataset would be updated without touching runtime fetch logic. |
| P2.4 | Define TypeScript types for scenarios, retirement modes, yearly path points, and batch results. | Domain type files | Type-check passes and tests can import the types. |
| P2.5 | Add input normalization and validation rules for all numeric inputs and year boundaries. | Validation module and tests | Tests cover valid input, invalid input, and normalized defaults. |
| P2.6 | Add a default-scenario module that resolves the current calendar year and MVP defaults from the spec. | Defaults module and tests | Tests confirm retirement start year equals current year plus the configured offset. |

## Phase 3: Core Simulation Engine

Goal:

- implement the pure annual Monte Carlo model as isolated, testable logic

| ID | Task | Observable Output | Verification |
| --- | --- | --- | --- |
| P3.1 | Add a reproducible RNG utility and seed resolver that uses Unix time seconds for normal user runs. | RNG module and seed tests | Tests verify seed resolution and deterministic output for a fixed seed. |
| P3.2 | Implement annual accumulation-year math with contributions applied only before retirement starts. | Simulation core function for accumulation years | Tests verify balances for simple one-path scenarios. |
| P3.3 | Implement retirement boundary semantics so the selected retirement start year uses withdrawals, not contributions. | Retirement boundary logic and tests | Tests cover the `Jan 1 retirement year` rule explicitly. |
| P3.4 | Implement fixed-dollars retirement withdrawals with annual inflation adjustment. | Fixed-dollars strategy module and tests | Tests verify spending growth and depletion behavior. |
| P3.5 | Implement percent-of-portfolio retirement withdrawals. | Percent strategy module and tests | Tests verify yearly withdrawal amounts change with balance. |
| P3.6 | Implement depletion handling so balances stop at zero after failure. | Depletion logic and tests | Tests verify zero-floor behavior across later years. |
| P3.7 | Implement single-path end-to-end simulation over accumulation plus retirement using injected or mocked returns. | Single-path integration function and tests | Tests verify path length, year labeling, retirement transition, and expected balances for a controlled return sequence. |
| P3.8 | Implement multi-path simulation over accumulation plus retirement using bootstrapped annual returns. | Multi-path simulation function and tests | Tests verify path generation count, bootstrapped sampling behavior, and expected output structure for deterministic seeds. |

## Phase 4: Metrics And Hover Distributions

Goal:

- derive the planning outputs needed by the UI from raw path results

| ID | Task | Observable Output | Verification |
| --- | --- | --- | --- |
| P4.1 | Implement percentile summary calculations for each modeled year. | Metrics module and percentile tests | Tests verify `p10`, `p50`, and `p90` on known sample inputs. |
| P4.2 | Implement retirement summary metrics: retirement-date balances, end-of-plan balances, survival probability, median depletion year, and total contributions. | Summary metrics module and tests | Tests verify each metric on fixture path sets. |
| P4.3 | Implement percent-of-portfolio spending summaries including median retirement income and p10 income after 10 years. | Spending-summary module and tests | Tests verify the reported outputs for controlled fixtures. |
| P4.4 | Implement hovered-year distribution data for investment income, withdrawals, and asset values. | Hover-distribution module and tests | Tests verify the three distributions change when the hovered year changes. |
| P4.5 | Define typed UI data contracts for summary cards, chart series, hover state, and the three distribution views. | UI contract type definitions and fixture examples | Type-check passes and fixture tests validate the contract shapes. |
| P4.6 | Implement a view-model adapter that converts simulation outputs and derived metrics into the typed UI contracts. | View-model module and tests | Tests verify stable output shapes and correct mapping into the defined UI contracts. |

## Phase 5: Progressive Execution And Logging

Goal:

- make the model feel live in the browser and debuggable during development

| ID | Task | Observable Output | Verification |
| --- | --- | --- | --- |
| P5.1 | Implement a batch-based simulation runner that emits partial results as paths complete. | Runner module and progress events | Tests verify partial batches are emitted before final completion. |
| P5.2 | Add cancellation and restart behavior for input changes during an active run. | Runner cancellation API and tests | Tests verify canceled runs stop emitting stale updates. |
| P5.3 | Add a structured browser logger with a consistent prefix and configurable verbosity. | Logger module | Console output shows startup, run start, progress, completion, and error logs. |
| P5.4 | Integrate seed resolution and dataset metadata into startup and run logs. | Logged seed and data-version messages | Manual console inspection confirms both values appear. |
| P5.5 | Add a measurable performance harness for default-scenario timing in development. | Timing helper or benchmark script plus docs note | A reviewer can run one command and see startup-to-first-update and startup-to-complete timings. |
| P5.6 | Evaluate whether main-thread batching meets the defined responsiveness targets; if not, add a worker-backed runner behind the same interface. | Performance note in docs and optional worker adapter | Build still produces one bundle, and measured timings meet the stated budgets. |

## Phase 6: Embed Shell And Static UI

Goal:

- establish the embeddable app shell and basic visible layout before advanced rendering

| ID | Task | Observable Output | Verification |
| --- | --- | --- | --- |
| P6.1 | Implement the `<sim-returns-app>` custom element and mount it inside Shadow DOM. | Custom element entrypoint | DOM test confirms the element mounts and uses Shadow DOM. |
| P6.2 | Add the static layout sections from the spec: intro, controls, summary area, chart area, distributions, methodology. | Visible app shell | Manual inspection in `demo.html` shows all required sections. |
| P6.3 | Apply token-driven shell and layout styling for the static app structure. | Styled shell using the shared token system | DOM snapshot test confirms the shell structure and class/state hooks remain stable. |
| P6.4 | Add mode-aware form controls for fixed-dollars vs percent-of-portfolio retirement strategies. | Interactive controls in the custom element | DOM tests verify the correct fields show for each mode. |
| P6.5 | Add state-aware form styling for visible/hidden fields, validation feedback, and reset behavior. | Validation messages and styled field states | DOM snapshot tests verify field visibility and invalid states for each mode. |
| P6.6 | Connect manual run and debounced auto-rerun behavior to the runner lifecycle. | UI-triggered runs with visible loading/progress state | Manual testing shows reruns happen without page reloads. |

## Phase 7: Visualization And Interaction

Goal:

- render the actual planning experience described by the spec

| ID | Task | Observable Output | Verification |
| --- | --- | --- | --- |
| P7.1 | Render a minimal primary path chart shell with axes or coordinate space and a single sample-path layer. | First visible chart in the app | Manual verification in `demo.html` shows a plotted sample path. |
| P7.2 | Add the percentile band layer to the primary chart. | Chart with percentile band | Manual verification shows the band aligned with the plotted years. |
| P7.3 | Add the median line layer to the primary chart. | Chart with median overlay | Manual verification shows the median rendered over the band. |
| P7.4 | Add the retirement boundary marker and accumulation/retirement visual distinction. | Chart with retirement boundary treatment | Manual verification shows the retirement transition clearly. |
| P7.5 | Add progressive chart updates as new batches arrive. | Live chart motion during runs | Manual testing shows the chart updates before final completion. |
| P7.6 | Add hover interaction on the chart to select a modeled year. | Hover state in chart/UI | DOM or integration test verifies hovered year changes application state. |
| P7.7 | Render the three hover-driven distributions at once for the selected year. | Three visible distribution views | Manual testing confirms all three update when hover changes. |
| P7.8 | Add mode-aware spending panels and summary cards for fixed-dollars and percent-of-portfolio outputs. | Summary cards and spending panel | Manual testing confirms the displayed metrics change with retirement mode. |
| P7.9 | Add failure markers or equivalent visual treatment for depleted paths and failed-plan states. | Failure-state visualization in chart/distributions | Manual verification shows failure states clearly without cluttering the chart. |

## Phase 8: Testing, Hardening, And Release Readiness

Goal:

- prove the app is correct enough to ship and safe to embed

| ID | Task | Observable Output | Verification |
| --- | --- | --- | --- |
| P8.1 | Expand unit tests to cover edge cases: zero balances, high withdrawal rates, invalid years, and depleted portfolios. | Additional unit tests | Test suite passes with edge-case coverage in place. |
| P8.2 | Add DOM/custom-element tests for embed lifecycle, Shadow DOM isolation, and mode switching. | UI integration tests | Tests confirm the component behaves correctly when embedded. |
| P8.3 | Add component snapshot tests that serialize Shadow DOM output after render. | Snapshot test files and stored snapshots | Snapshot tests catch missing sections, mode-switching regressions, form field visibility changes, and structural markup breakage. |
| P8.4 | Add a lightweight smoke test around `demo.html` assumptions. | Smoke test or documented harness check | The harness proves the bundle and custom element load together correctly. |
| P8.5 | Verify the build output remains a single JavaScript bundle with embedded data and styles and stays within the defined size budget. | Build artifact check and size-check output | Build inspection confirms no runtime data fetch, no extra required assets beyond `demo.html`, and a passing size check. |
| P8.6 | Run a manual browser-console verification pass for required logs and failure handling. | Documented verification notes | Reviewer can confirm the expected logs appear during startup, run progress, cancellation, and errors. |
| P8.7 | Record the measured default-scenario performance against the defined timing budgets. | Performance verification note in docs | Reviewer can see whether first visible update and progressive completion meet the budget. |
| P8.8 | Add a final DOM snapshot or theme-contract test proving documented host theming overrides still work. | Theme snapshot test | Test confirms the host-facing CSS token surface remains stable. |
| P8.9 | Write final usage documentation for local development, test execution, build output, embed usage, and size-budget checks. | `README` or docs update | A reviewer can build, test, size-check, and embed the app from the written instructions alone. |

## Definition Of Done

The implementation plan is complete when:

- all phase tasks have observable outputs
- each implementation task was driven by a failing test written before the code change
- `docs/spec.md` has no MVP-blocking ambiguity
- the build produces a single embeddable JavaScript bundle
- the build passes the configured bundle-size check
- `demo.html` loads the app locally
- automated tests cover simulation logic and embed behavior
- linting and formatting checks run successfully in the project scripts
- measured performance meets the defined default-scenario timing budgets
- the shipped app satisfies the acceptance criteria in [spec.md](/Users/adamwespiser/projects/sim-my-life/docs/spec.md)
