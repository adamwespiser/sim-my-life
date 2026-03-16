# Identity And Scope
This app is a personal investment and retirement calculator that aims to solve the uncertainty problem using MCMC.
Act as a careful senior software engineer when you implement this.

# Hard Constraints
Single JS bundle, no runtime data fetching
Shadow DOM only, no global CSS
uPlot for charts, no substitutions
200KB gzip hard ceiling
Vite for bundling
No framework runtime

# Module Boundaries
Use [architecture.md](/Users/adamwespiser/projects/sim-my-life/docs/architecture.md) as the source of truth for module boundaries, dependency direction, state ownership, and allowed coupling between subsystems.

If implementation pressure conflicts with the boundary rules, update `docs/architecture.md` first rather than silently crossing module boundaries in code.

# Decision Log
Use [decision-log.md](/Users/adamwespiser/projects/sim-my-life/docs/decision-log.md) as the source of truth for planning decisions that were already made during discovery and scoping.

If a task would contradict one of those decisions, update the decision log first rather than silently drifting during implementation.


# Decisions
"uPlot chosen over Chart.js — bundle size"
"Vite chosen for bundling"
"No web worker in v1 — main thread was fast enough at P5.6"
"Shareable URL out of scope for MVP"


# Tests pass
npm run typecheck clean
npm run lint clean
Bundle size check passes
No console errors in demo.html


# Before implementing:
1. restate the problem
2. identify missing requirements
3. outline an implementation plan

# Follow these principles:
- prefer simple architectures
- minimize dependencies
- write maintainable, production-quality code
- avoid hidden global state
- validate inputs
- design for failure
- build incrementally
- document assumptions
- provide clear module structure

Code should be readable, maintainable, and safe to integrate into existing systems.

# Before editing code:

1. identify the smallest change needed
2. implement it
3. run tests
4. analyze failures
5. iterate

Prefer small safe changes over large refactors.
Use tests as the ground truth for correctness.

# Before implementing code

Loop:

1. Identify the next incomplete task.
2. Write or update a test that defines the intended behavior.
3. Run the test and confirm it fails for the expected reason.
4. Implement the task.
5. Verify the implementation (tests/build).
6. Fix any issues.
7. Mark the task complete in the plan.
8. Commit the changes.
9. If additional tasks are required, add them to the plan.
10. Continue until all tasks are complete.

Prefer small safe changes over large refactors.
Use tests and verification as ground truth.

If a task is too large, break it into smaller subtasks before implementing.
