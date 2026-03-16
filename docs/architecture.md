# Architecture And Module Boundaries

Source documents:

- [spec.md](/Users/adamwespiser/projects/sim-my-life/docs/spec.md)
- [system-understanding-summary.md](/Users/adamwespiser/projects/sim-my-life/docs/system-understanding-summary.md)
- [css-strategy.md](/Users/adamwespiser/projects/sim-my-life/docs/css-strategy.md)
- [implementation-plan.md](/Users/adamwespiser/projects/sim-my-life/docs/implementation-plan.md)

Context note:

- there is no repo-local `AGENTS.md` file currently present under this workspace
- this document follows the active AGENTS instructions from the session and translates them into concrete module boundaries for implementation

## Goals

- define clear module boundaries before implementation starts
- minimize hidden coupling between simulation, rendering, and embed logic
- make each module small enough for test-first agent execution
- keep the design compatible with a single JS bundle, Shadow DOM embedding, and strict bundle-size goals

## Architectural Principles

- prefer pure modules over stateful ones wherever possible
- isolate simulation logic from UI and DOM concerns
- keep rendering concerns separate from data derivation concerns
- make every major boundary typed and testable
- avoid hidden global state
- make host-page integration flow only through the custom element boundary
- treat styling as a dedicated subsystem, not incidental UI code

## Top-Level Module Map

The system is divided into these top-level areas:

1. `data`
2. `domain`
3. `simulation`
4. `metrics`
5. `view-model`
6. `ui`
7. `styling`
8. `platform`
9. `testing`

## 1. Data

Purpose:

- provide bundled historical return data and metadata

Modules:

- `historical-returns`
- `data-version`

Responsibilities:

- store the canonical annual S&P 500 total return series
- expose dataset coverage years and source/update metadata
- avoid all runtime network access

Allowed dependencies:

- no dependency on UI, metrics, or simulation runner code

Used by:

- `simulation`
- `platform/logging`

Boundary rule:

- this module exports static data and metadata only
- it must not contain simulation logic

## 2. Domain

Purpose:

- define shared types, validated inputs, defaults, and scenario semantics

Modules:

- `types`
- `scenario-validation`
- `scenario-defaults`
- `timeline-semantics`

Responsibilities:

- define scenario types, retirement modes, yearly result types, and UI contract primitives
- normalize and validate raw user input
- resolve defaults such as retirement start year relative to current year
- encode domain rules such as “retirement start year begins on January 1 and uses withdrawals”

Allowed dependencies:

- may depend on standard library only
- may consume current date/time through an injected helper, not hidden global logic

Used by:

- `simulation`
- `metrics`
- `ui`
- `view-model`

Boundary rule:

- domain modules define rules and shapes, not rendering or simulation orchestration

## 3. Simulation

Purpose:

- execute annual-path Monte Carlo logic

Modules:

- `rng`
- `seed-resolution`
- `path-simulation`
- `strategy-fixed-dollars`
- `strategy-percent-of-portfolio`
- `batch-runner`
- optional `worker-runner-adapter`

Responsibilities:

- resolve the runtime seed from Unix time seconds
- generate bootstrapped annual return samples
- simulate one path and many paths
- apply accumulation, retirement, inflation-adjusted fixed withdrawals, percentage withdrawals, and depletion behavior
- emit progressive batch results
- support cancellation/restart semantics

Allowed dependencies:

- `data`
- `domain`
- `platform/logging` only through a narrow interface if needed

Used by:

- `metrics`
- `ui` through runner/controller interfaces

Boundary rule:

- simulation modules must not import DOM, Shadow DOM, CSS, or charting code
- batch orchestration should be separate from pure path math

## 4. Metrics

Purpose:

- derive planning outputs from raw path results

Modules:

- `percentiles`
- `retirement-summaries`
- `spending-summaries`
- `hover-distributions`

Responsibilities:

- compute `p10`, `p50`, and `p90` across modeled years
- compute retirement-date and end-of-plan summaries
- compute success probability and depletion-year metrics
- compute hovered-year distributions for:
  investment income, withdrawals, and account assets

Allowed dependencies:

- `domain`
- `simulation` result types

Used by:

- `view-model`
- `ui`

Boundary rule:

- metrics modules produce derived data only
- they must not know about chart-library configuration or DOM structure

## 5. View-Model

Purpose:

- adapt simulation and metric outputs into stable render contracts

Modules:

- `ui-contracts`
- `view-model-adapter`

Responsibilities:

- define typed contracts for cards, chart layers, hovered-year state, distributions, and mode-aware panels
- map simulation and metric outputs into those contracts
- keep render shape changes explicit and testable

Allowed dependencies:

- `domain`
- `metrics`

Used by:

- `ui`

Boundary rule:

- this layer is the only translation boundary between computation and rendering
- chart and component code should consume contracts from here rather than reconstructing shapes ad hoc

## 6. UI

Purpose:

- render the app and handle user interaction

Modules:

- `custom-element`
- `app-shell`
- `controls`
- `summary-cards`
- `path-chart`
- `distribution-panel`
- `methodology-panel`
- `state-controller`

Responsibilities:

- expose `<sim-returns-app>`
- own Shadow DOM creation and app lifecycle
- handle form input, mode switching, validation display, hover state, and run/restart behavior
- render summary cards, chart, distributions, and methodology copy
- coordinate with the simulation runner and the view-model layer

Allowed dependencies:

- `domain`
- `simulation` through runner interfaces
- `metrics` only if needed indirectly through `view-model`
- `view-model`
- `styling`
- `platform/logging`
- `uPlot`

Boundary rule:

- UI modules must not contain core simulation math
- controls should not directly mutate chart internals without going through application state

## 7. Styling

Purpose:

- provide token-driven Shadow DOM styling with minimal host theming

Modules:

- `tokens`
- `base-styles`
- `layout-styles`
- `component-styles`
- `state-styles`
- `chart-theme`

Responsibilities:

- define design tokens
- define Shadow DOM reset/base rules
- style shell layout and component states
- expose a small host-facing CSS custom property API
- map design tokens into `uPlot` visual configuration

Allowed dependencies:

- no dependency on simulation or metrics logic
- chart theming may provide values to `ui/path-chart`

Used by:

- `ui`

Boundary rule:

- styling should be declarative and token-driven
- host customization is limited to documented custom properties on the custom element

## 8. Platform

Purpose:

- support cross-cutting runtime concerns

Modules:

- `logging`
- `performance-harness`
- `bundle-size-check` as build tooling

Responsibilities:

- provide structured browser logs
- report seed resolution, dataset metadata, batch progress, and failures
- support performance measurement against timing budgets
- support build-time size budget checks

Allowed dependencies:

- may depend on narrow interfaces from `domain`, `data`, or `simulation`

Boundary rule:

- platform modules should not become a grab-bag for application logic

## 9. Testing

Purpose:

- verify all module boundaries with failing-test-first execution

Test areas:

- pure unit tests for `domain`, `simulation`, and `metrics`
- contract tests for `view-model`
- DOM/custom-element tests for `ui`
- Shadow DOM snapshot tests for structure and mode changes
- theme-contract tests for host custom property overrides
- smoke tests for `demo.html`

Boundary rule:

- tests should target the narrowest module that can prove the behavior
- integration tests should only be added when a lower-level test cannot validate the requirement

## Dependency Direction

Preferred dependency flow:

`data` -> `simulation`

`domain` -> `simulation`

`simulation` -> `metrics`

`metrics` -> `view-model`

`view-model` -> `ui`

`styling` -> `ui`

`platform` supports multiple layers but should remain thin

Forbidden or discouraged dependency directions:

- `ui` -> raw `data`
- `ui` -> pure simulation internals beyond runner/controller interfaces
- `simulation` -> `ui`
- `metrics` -> `uPlot`
- `styling` -> `simulation`

## State Ownership

State should be owned in a small number of places:

- scenario input state: `ui/state-controller`
- active hovered year: `ui/state-controller`
- run lifecycle state: `simulation/batch-runner` plus `ui/state-controller`
- derived render state: `view-model`

State that should not be global:

- current scenario
- active seed
- current run status
- hovered year
- resolved metrics

## Key Interfaces

These interfaces should be explicit and typed before broad implementation:

- scenario input contract
- validated scenario contract
- yearly path result contract
- batch update contract
- retirement summary contract
- hovered-year distribution contract
- UI render contract

## Major Boundary Risks

- if `ui` starts deriving its own metrics, rendering and computation will drift
- if `simulation` becomes aware of DOM or charting concerns, testing complexity will spike
- if style tokens are not centralized, the Shadow DOM theme contract will become unstable
- if the batch runner and pure path logic are not separated, performance tuning will be much harder
- if hover distribution formulas are not pinned in the domain/metrics layers, UI behavior will become inconsistent

## Recommended Repo Shape

One reasonable source layout is:

- `src/data/`
- `src/domain/`
- `src/simulation/`
- `src/metrics/`
- `src/view-model/`
- `src/ui/`
- `src/styling/`
- `src/platform/`
- `src/test/`

This is a guideline, not a strict final tree. The important part is preserving the module boundaries above.
