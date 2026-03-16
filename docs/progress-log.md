# Progress Log

## 2026-03-15

- Completed `P0.2` by defining exact hovered-year formulas in [spec.md](/Users/adamwespiser/projects/sim-my-life/docs/spec.md) for investment income, retirement withdrawals, and account assets.
- Completed `P0.3` by resolving the remaining MVP open questions in [spec.md](/Users/adamwespiser/projects/sim-my-life/docs/spec.md): fixed-dollars mode now initializes from current annual spending when provided, and shareable URL state is explicitly out of scope for v1.
- Completed `P1.1` by adding [package.json](/Users/adamwespiser/projects/sim-my-life/package.json) and placeholder `build`, `test`, and `verify` scripts that establish the repo's initial command surface for later Vite and test-runner wiring.
- Completed `P1.2` by adding [tsconfig.json](/Users/adamwespiser/projects/sim-my-life/tsconfig.json), the initial `src/` and `test/` tree, installing TypeScript, and verifying `npm run typecheck` succeeds without configuration errors.
- Completed `P1.3` by adding a minimal Biome-based lint/format setup, wiring `lint`, `format`, and `format:check` scripts, and verifying both checks pass.
- Completed `P1.4` by switching the build to [Vite](/Users/adamwespiser/projects/sim-my-life/vite.config.ts) and verifying `npm run build` emits a single `dist/sim-returns.js` bundle.
- Completed `P1.5` by adding a gzip-aware bundle-size check script and verifying `npm run size` reports the built bundle against the configured target and hard ceiling.
- Completed `P1.6` by wiring Vitest with `happy-dom`, replacing the placeholder test script, and verifying both a unit test and a Shadow DOM snapshot test pass under `npm test`.
- Completed `P1.7` by verifying [demo.html](/Users/adamwespiser/projects/sim-my-life/demo.html) already matches the Vite output path and one-line embed contract: it loads `./dist/sim-returns.js` and mounts `<sim-returns-app></sim-returns-app>`.
- Completed `P1.8` by adding `uPlot` to the project, including it in the build baseline, and verifying the bundled artifact still lands comfortably under the gzip budget at roughly `26.36 KB` gzipped.
- Completed `P1.9` by adding the initial host-theme token definitions in [src/styling/tokens.ts](/Users/adamwespiser/projects/sim-my-life/src/styling/tokens.ts), linking them from [css-strategy.md](/Users/adamwespiser/projects/sim-my-life/docs/css-strategy.md), and verifying typecheck/build/format checks still pass.
- Completed `P1.10` by adding [src/styling/base-styles.ts](/Users/adamwespiser/projects/sim-my-life/src/styling/base-styles.ts), proving the Shadow DOM base layer with a failing-first snapshot test, and verifying `npm test`, `npm run typecheck`, and `npm run format:check` all pass.
- Completed `P1.11` by adding a host-theme override fixture and DOM test that proves a host-set `--sr-color-accent` custom property flows into the Shadow DOM without relying on host structural CSS.
- Completed `P2.1` by adding the bundled historical S&P 500 total-return dataset and metadata in [src/data/historical-returns.ts](/Users/adamwespiser/projects/sim-my-life/src/data/historical-returns.ts), with a test proving the data loads from code rather than runtime fetches.
- Completed `P2.2` by extending the dataset test suite to lock the record count, coverage years, first/last records, and metadata version so later refreshes have a concrete integrity baseline.
