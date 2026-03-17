# Console Verification

Date recorded: `2026-03-16`

Verification path:

- built-bundle harness: `node scripts/measure-default-scenario.mjs`
- log contract tests: [test/logging.test.ts](/Users/adamwespiser/projects/sim-my-life/test/logging.test.ts)
- batch lifecycle tests: [test/batch-runner.test.ts](/Users/adamwespiser/projects/sim-my-life/test/batch-runner.test.ts)
- UI error/cancel tests: [test/sim-returns-app.runner.test.ts](/Users/adamwespiser/projects/sim-my-life/test/sim-returns-app.runner.test.ts)

Observed run-sequence logs from the built bundle:

- `sim-returns: data-version`
- `sim-returns: run-start`
- `sim-returns: batch-progress`
- `sim-returns: run-complete`

Failure-handling evidence:

- cancellation is verified by the batch-runner and custom-element runner tests
- error-state rendering is verified by the runner DOM test that forces `Simulation failed: boom`

Note:

- this environment is headless, so the verification was recorded through the built-bundle harness rather than an interactive desktop browser console
- the emitted prefix and event names are the same ones a reviewer will see in `demo.html`
