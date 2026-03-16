# System Understanding Summary

## 1. System Goals

- Create a browser-based retirement planning simulator for `wespiser.com/app/sim-returns`.
- Make it fun and fast to explore by updating results progressively while simulations run.
- Help users answer two planning questions:
  can I afford my current lifestyle in retirement, and what does a portfolio-percentage withdrawal rule imply for yearly spending.
- Keep the app fully embeddable with a single JavaScript bundle and a one-line HTML mount.

## 2. Key Requirements

- Use bundled historical S&P 500 total returns data based on the Damodaran dataset.
- Run the simulation entirely in the browser with no backend dependency.
- Model accumulation and retirement on an annual basis.
- Support exactly two retirement modes: `fixed dollars` or `percent of portfolio`.
- Show live-updating path lines, percentile bands, and distribution views.
- Include all three distribution views at once for the currently hovered year:
  distribution of investment income, distribution of retirement withdrawals, and distribution of account asset values.
- Expose annual savings only in the UI.
- Embed through a custom element and isolate the app in Shadow DOM.
- Include a local `demo.html` for manual testing.
- Include automated TypeScript tests for simulation behavior and embed behavior.
- Include DOM-level component snapshot tests that serialize Shadow DOM output after render.
- Include clear browser logging for lifecycle, simulation progress, seed resolution, and failures.
- Use `uPlot` as the charting library for v1.
- Use plain Shadow-DOM-scoped CSS with a small design-token system and a minimal host theming surface.
- Use `Vite` as the bundler for v1.

## 3. Constraints

- No runtime download of historical return data; the dataset must live in code and be bundled once.
- No strict `script.R` parity; preserve the bootstrap logic and data basis, not the original static output format.
- No backend API, CDN dependency, or external CSS requirement for core functionality.
- The UI should not expose a seed control; user-facing runs derive seed from Unix time in seconds.
- Best/worst sampled runs should not be surfaced because they are not useful planning signals.
- The app must work in simple generated HTML environments, including Markdown-to-HTML pages that only load the JS bundle and the custom element tag.
- Avoid introducing a second major charting library in v1.
- Avoid introducing a CSS framework in v1; styling should stay small and bundle-friendly.
- Avoid introducing a frontend framework runtime; `Vite` is the bundler, not a UI framework choice.

## 4. Success Criteria

- A user can load the app and run simulations without a backend.
- The app progressively shows partial results while computing, rather than waiting for a final static render.
- Fixed-dollars mode shows whether inflation-adjusted retirement spending survives the retirement horizon.
- Percent-of-portfolio mode shows the implied yearly spending distribution.
- The app is embeddable with one line and mounts correctly inside Shadow DOM.
- The repo contains `demo.html`, bundled local data, automated tests, and useful browser logs.

## 5. Major Components Implied By The Spec

- Historical returns dataset module bundled into the app.
- Annual simulation engine for accumulation and retirement.
- Retirement strategy logic for fixed-dollars and percent-of-portfolio modes.
- Progressive run controller for chunked simulation and live updates.
- Summary metrics layer for percentile outcomes, survival probability, and retirement-income outputs.
- Visualization layer using `uPlot` for the path chart and supporting chart views.
- Token-driven Shadow DOM styling layer with documented host-page custom-property overrides.
- Embeddable custom element with Shadow DOM isolation.
- Logging utility for browser diagnostics.
- TypeScript test suite covering model behavior, embed behavior, and Shadow DOM snapshot stability.
- Local `demo.html` harness for manual validation.
