# CSS Strategy

Source documents:

- [spec.md](/Users/adamwespiser/projects/sim-my-life/docs/spec.md)
- [system-understanding-summary.md](/Users/adamwespiser/projects/sim-my-life/docs/system-understanding-summary.md)
- [implementation-plan.md](/Users/adamwespiser/projects/sim-my-life/docs/implementation-plan.md)

## Goals

- keep styling small, predictable, and easy to change
- preserve the single-bundle constraint
- isolate the app from host-page CSS
- expose a minimal theming surface for host pages
- make styling concrete enough that an autonomous coding agent does not invent a CSS architecture ad hoc

## Core Strategy

- use plain CSS inside the custom element's Shadow DOM
- do not use Tailwind, CSS-in-JS, Sass, or another styling framework in v1
- keep all required styles bundled with the app JavaScript
- define a small design-token system with CSS custom properties
- treat the host page as untrusted and do not rely on global resets, fonts, or inherited layout rules

## Shadow DOM Styling Contract

The app styling contract is:

- all internal layout and component styles live inside the Shadow DOM
- host-page CSS should not be required for correct rendering
- host-page CSS should not be able to accidentally break internal layout through element selectors
- the component should default to `display: block` and fill the width of its container
- the host page controls placement and width of the custom element, not internal layout

The app should not assume:

- global `box-sizing`
- global font-family
- global `body` colors or spacing
- normalize or reset styles provided by the host page

## Design Tokens

Define a small set of CSS custom properties at the `:host` level.

Implementation reference:

- the initial token definitions should live in [src/styling/tokens.ts](/Users/adamwespiser/projects/sim-my-life/src/styling/tokens.ts)

Token groups:

- color tokens
- typography tokens
- spacing tokens
- radius tokens
- border/shadow tokens
- motion tokens
- chart color tokens

Recommended token shape:

- `--sr-color-bg`
- `--sr-color-surface`
- `--sr-color-fg`
- `--sr-color-muted`
- `--sr-color-accent`
- `--sr-color-accent-soft`
- `--sr-color-border`
- `--sr-font-body`
- `--sr-font-mono`
- `--sr-font-size-1` through `--sr-font-size-6`
- `--sr-space-1` through `--sr-space-8`
- `--sr-radius-sm`
- `--sr-radius-md`
- `--sr-radius-lg`
- `--sr-motion-fast`
- `--sr-motion-base`
- `--sr-chart-path`
- `--sr-chart-band`
- `--sr-chart-median`
- `--sr-chart-retirement`
- `--sr-chart-failure`

Token rules:

- tokens should have sensible defaults inside the component
- token names are part of the host-facing API and should remain stable once released
- internal styles may use more CSS variables, but only a small subset should be documented for host customization

## Host Theming Surface

The host page may override a limited set of documented custom properties on the custom element.

Recommended host-facing theming surface:

- background color
- foreground color
- muted text color
- accent color
- border color
- body font family
- chart accent colors if needed

Example host usage:

```css
sim-returns-app {
  --sr-color-bg: #f4efe6;
  --sr-color-fg: #1f1a17;
  --sr-color-accent: #0f766e;
}
```

Non-goals for host theming:

- host pages should not target internal class names
- host pages should not depend on internal DOM structure
- host pages should not need to inject additional stylesheets

## File And Style Structure

The styling system should be organized into a few clear layers:

1. token definitions
2. base/reset rules inside Shadow DOM
3. layout rules
4. component rules
5. state rules

Suggested style concerns:

- shell layout
- controls and field groups
- summary cards
- chart container
- distribution panels
- methodology/footer copy
- loading/running states
- invalid input states
- depleted/failure states

## Layout Strategy

- mobile-first layout
- CSS Grid for major page sections
- Flexbox for small internal arrangements
- two or three breakpoints at most
- summary cards and distribution panels should stack cleanly on small screens
- avoid brittle absolute positioning except where chart overlays truly require it

## Typography Strategy

- define app typography inside Shadow DOM
- avoid inheriting arbitrary host fonts by default
- choose one primary body font stack and one monospace stack
- ensure type scale supports dense data display without looking dashboard-generic

## State Styling

The CSS system must support these visual states:

- idle
- running
- completed
- invalid input
- hovered year selected
- retirement boundary emphasized
- failure/depletion visible but not visually overwhelming

State rules:

- state should be represented through explicit classes, attributes, or component state hooks
- avoid style logic that depends on incidental DOM order

## Chart Styling

`uPlot` should inherit its visual configuration from the same token system used by the rest of the app.

Chart styling rules:

- centralize chart color mapping so app theme and chart theme stay aligned
- avoid hardcoded chart colors scattered across rendering code
- keep chart visual configuration separate from chart data transformation logic

## Testing Requirements For CSS

The CSS strategy should be validated by tests where practical.

Required coverage:

- DOM snapshot tests for default render structure
- DOM snapshot tests for mode switching between fixed-dollars and percent-of-portfolio
- DOM snapshot tests for validation and loading states where markup changes
- at least one test or fixture proving host-level CSS custom property overrides are applied without breaking structure

The goal is not pixel-perfect screenshot testing in v1. The goal is structural and styling-contract stability.

## Constraints

- keep the CSS approach small enough to respect bundle budgets
- do not introduce a CSS framework that materially increases bundle size or markup complexity
- do not rely on global utility classes
- do not require a separate stylesheet asset for production use

## Recommended Decision

For v1, the styling architecture should be:

- plain CSS
- Shadow DOM scoped
- token-driven
- minimally themeable from the host page through documented custom properties
