# Performance Verification

Date recorded: `2026-03-16`

Command:

- `npm run perf`

Current measured default-scenario result:

- first visible update: `13.61 ms`
- completion: `92.55 ms`

Budget comparison:

- first visible update target `<= 500 ms`: pass
- completion target `<= 2000 ms`: pass

Implementation decision from this measurement:

- keep the main-thread batch runner
- do not add a worker-backed runner in v1

Why that decision is defensible:

- the default scenario is well below both timing budgets
- the batch runner now yields between partial batches using `requestAnimationFrame` or `setTimeout(0)` so progressive updates can paint before completion
- keeping one main-thread runner avoids worker packaging complexity while the app remains comfortably under budget
