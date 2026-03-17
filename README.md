# Sim My Life

An embeddable retirement-planning simulator shipped as a single custom element:

```html
<sim-returns-app></sim-returns-app>
```

## Local Development

- `npm install`
- `npm run dev`

For the static demo page after a production build:

- `npm run build`
- `python3 -m http.server 4173`
- open `http://localhost:4173/demo.html`

## Verification Commands

- `npm test` runs the unit, DOM, snapshot, and smoke tests.
- `npm run typecheck` runs TypeScript with Node typings enabled for smoke tests.
- `npm run lint` runs Biome linting.
- `npm run format:check` checks formatting.
- `npm run build` emits `dist/sim-returns.js`.
- `npm run size` checks the built bundle against the gzip budget.
- `npm run smoke` builds the app and verifies `demo.html` plus the built bundle mount together.
- `npm run perf` builds the app and measures default-scenario first-update and completion timings.
- `npm run verify` runs the full release verification pass.

## Build Output

- The shipped bundle is `dist/sim-returns.js`.
- Historical returns data and styles are embedded in the bundle.
- The app does not fetch runtime data from the network.

## Embedding

Production usage is the one-line custom element plus the built script:

```html
<script type="module" src="/path/to/sim-returns.js"></script>
<sim-returns-app></sim-returns-app>
```

Theme overrides use host-level CSS custom properties documented in [docs/css-strategy.md](/Users/adamwespiser/projects/sim-my-life/docs/css-strategy.md).

## Performance And Size

- Target bundle size: `<= 150 KB` gzip.
- Hard bundle ceiling: `<= 200 KB` gzip.
- Target first visible update for the default scenario: `<= 500 ms`.
- Target default-scenario completion: `<= 2 s`.

Measured results are recorded in [docs/performance-verification.md](/Users/adamwespiser/projects/sim-my-life/docs/performance-verification.md).
