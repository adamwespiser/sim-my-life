# Blog Notes

## Working Thesis

This project is a good example of how to "vibe code" a real software project without living in the source tree, but only if you build a control system around the model.

The key idea is:

- do not start by asking the model to "build the app"
- start by creating a stack of documents that force the model to externalize understanding, decisions, boundaries, and execution order
- then steer implementation through plans, logs, tests, screenshots, demo review, and visible behavior instead of line-by-line code review

This repo is useful because that is not just the theory. That is what actually happened here.

## The Core Process

The process used here was roughly:

1. Write a real `spec.md`.
2. Review the spec with the LLM until it is concrete enough to implement.
3. Ask the LLM to restate its understanding in a `system-understanding-summary.md`.
4. Ask it to convert that understanding into `architecture.md` so module boundaries are explicit.
5. Create an `AGENT.md` that tells the coding agent how to behave.
6. Create a `decision-log.md` so important choices stop floating around in chat.
7. Create an `implementation-plan.md` from the spec, user stories, architecture, and decisions.
8. Review the plan in multiple passes until every task is small, observable, and test-first.
9. Add an `IMPLEMENTATION_GUIDE.md` / agent execution guide so implementation follows the expected loop.
10. Have the agent execute against the plan while updating a `progress-log.md`.
11. Steer the project through status checks, verification results, screenshots, and visible UI feedback instead of code inspection.

That sequence is the main story.

## What Each Document Did

### `docs/spec.md`

This was the anchor document.

It defined:

- the product goal
- non-goals
- user stories
- required inputs
- required outputs
- required visualizations
- simulation semantics
- deployment constraints
- UX expectations

In other words, it answered: what are we building, what is in scope, and what does "done" mean from a product perspective?

Important detail: the spec was not left fuzzy. It got refined enough to include things like:

- exact retirement-mode behavior
- exact hovered-year distribution definitions
- one-line embed constraints
- no-backend / single-bundle constraints
- performance and delivery expectations

That matters because vague specs produce fake progress.

### `docs/system-understanding-summary.md`

This was a comprehension checkpoint.

Its job was not to invent new requirements. Its job was to prove the model understood the spec in plain English:

- goals
- key requirements
- constraints
- success criteria
- major implied components

This is a very useful step for article purposes because it turns "the model read the spec" into something auditable.

### `docs/architecture.md`

This forced the model to stop thinking in terms of one giant blob and start thinking in subsystems.

It defined:

- top-level module areas
- allowed dependencies
- boundary rules
- responsibility splits

For this project that meant clear separation between:

- `data`
- `domain`
- `simulation`
- `metrics`
- `view-model`
- `ui`
- `styling`
- `platform`

This is one of the main reasons the project stayed steerable. Once module boundaries exist, you can ask about progress in terms of systems, not files.

### `docs/AGENT.md`

This documented how the coding agent should behave.

It encoded things like:

- act like a careful senior engineer
- restate the problem
- identify missing requirements
- outline the plan before coding
- prefer simple architectures
- minimize dependencies
- use tests as ground truth
- implement the smallest useful change
- work in a test-first loop

This is important for the article because "vibe coding" here did not mean "let the model improvise." It meant: create a behavioral contract for the model.

### `docs/decision-log.md`

This turned floating chat decisions into durable project facts.

Examples of decisions captured there:

- no strict `script.R` parity
- annual model, not monthly
- two retirement modes only
- no runtime data fetches
- one-line embed contract
- Shadow DOM
- `Vite`
- `uPlot`
- no shareable URL state in MVP
- test-first execution

This matters because LLMs forget and drift. A decision log is memory with authority.

### `docs/implementation-plan.md`

This is where the project became executable.

The plan did a few important things:

- broke the work into phases
- made each task small
- made each task observable
- attached verification to each task
- explicitly required failing-test-first execution

That last part matters a lot. The plan did not just say "build simulation engine." It said things like:

- implement RNG utility
- verify deterministic output
- implement accumulation-year math
- verify balances in simple scenarios
- implement batch runner
- verify partial updates before final completion

That is how you make an LLM useful on a non-trivial project.

### `docs/IMPLEMENTATION_GUIDE.md`

This was the execution loop for the implementation phase.

It reinforced:

- identify the next incomplete task
- write or update a test first
- confirm it fails
- implement
- verify
- mark progress

This is different from the implementation plan.

- the plan says what to do
- the guide says how to execute each item

### `docs/progress-log.md`

This turned implementation into an inspectable trail.

Instead of asking "what changed in the code?" you could ask:

- what phase is complete?
- what task ID did we reach?
- what observable outputs were produced?
- what tests or verification passed?

That made status checks easy and reliable.

## What Happened In Practice On This Repo

The actual project followed that document ladder pretty closely.

### Phase 1: Planning Before Coding

The repo accumulated a planning stack before the implementation was pushed hard:

- `docs/spec.md`
- `docs/system-understanding-summary.md`
- `docs/architecture.md`
- `docs/css-strategy.md`
- `docs/AGENT.md`
- `docs/decision-log.md`
- `docs/implementation-plan.md`

This was effectively the "pre-code operating system" for the project.

### Phase 2: Implementation As Planned Execution

Implementation then followed the task plan in phases:

- project foundation
- styling foundation
- data and domain
- simulation engine
- metrics and hover distributions
- progressive execution and logging
- embed shell
- visualization and interaction
- testing, hardening, and release readiness

Because tasks were numbered and logged, progress could be discussed without opening the code.

Examples of status framing that became possible:

- implementation is through `P3.4`
- the next missing work starts at `P3.5`
- visualization is complete through `P7.7`
- hardening remains in `P8.*`

That is a big part of the article angle. The project became navigable through task IDs, not source files.

## What Was Actually Built

By the end of the implementation plan, the repo had:

- a bundled historical returns dataset
- typed scenario/domain models
- validation and defaults
- deterministic RNG and seed resolution
- accumulation-year and retirement-year simulation logic
- fixed-dollar and percent-of-portfolio retirement strategies
- multi-path bootstrap simulation
- percentile and summary metrics
- hover-year distributions
- typed UI contracts and a view-model adapter
- a batch runner with cancellation and structured logs
- a real Shadow DOM custom element
- a styled input shell
- progressive chart rendering
- hover-driven lower panels
- mode-aware spending panels
- failure markers
- a demo page
- tests across unit, DOM, snapshot, smoke, and theme-contract levels
- a performance harness
- a verify script

That is a real software project, not a toy.

## How The Project Was Steered Without Reading Code

This is the most important section for the article.

The project was not steered by inspecting implementation details line by line. It was steered through:

- planning docs
- task IDs
- progress logs
- test results
- build results
- size checks
- performance results
- screenshots
- local demo review
- plain-English bug reports

That steering loop looked like this:

1. Ask where implementation is.
2. Compare the answer to the plan and progress log.
3. Tell the agent to keep going.
4. Review visible output in the browser.
5. Give product-level corrections in plain language.
6. Let the agent update implementation and verification.
7. Repeat.

## Concrete Chat-Driven Corrections

This repo has a lot of examples of meaningful product steering that did not require code review.

### 1. UI review via demo, not source

At one point the app appeared missing in `demo.html`.

The issue was not the code itself, but how the page was being opened. The review surfaced that:

- `demo.html` needed to be loaded over HTTP, not `file://`
- a local server was started
- manual UI review became possible

That is a good article detail because it shows "reviewing behavior" instead of "reading implementation."

### 2. Input quality was improved from UX feedback

The user reported that the inputs were "janky":

- large numbers were hard to type
- decimals for withdrawal rate broke while typing

The fix was driven from that plain-language complaint, not from code inspection:

- input handling moved to draft-string state
- commas and in-progress decimals were preserved
- rerenders stopped fighting the user

That is a textbook example of product-level steering.

### 3. Run controls were changed from UI preference

The user asked for:

- big `Run Simulation` and `Stop Simulation` buttons
- default simulation count of `100`

That led to:

- larger action buttons
- updated default scenario values
- updated spec/tests

Again: visible behavior changed through simple product guidance.

### 4. Visualization details were refined via screenshot review

The bottom panels were adjusted based on direct review:

- add titles that include the selected year
- add labels to the plots
- abbreviate large values in millions when values exceed `$10M`

None of that required code review. It required looking at the rendered result and describing what felt wrong.

### 5. Default scenario assumptions were steered from plain-language product choices

The defaults were changed to:

- current portfolio `500,000`
- annual savings `80,000`
- retire in `10` years
- `30` years in retirement

That is product direction, not implementation direction.

### 6. Layout was refined iteratively from screenshots

The chart/run-state area went through multiple product-level adjustments:

- make the chart stack above or below run status
- move run status above the chart
- make the chart full-width
- then revert to consistent container spacing while keeping status above the chart

This is exactly the kind of thing that supports the article thesis. The user did not need to care how the layout CSS worked. They only needed to say what they wanted the UI to do.

### 7. Performance and release readiness were driven by plan completion, not code spelunking

The remaining plan items were closed by asking to "fill out the rest of the implementation plan."

That led to:

- a performance harness
- a smoke harness
- a verify script
- additional edge-case tests
- release documentation
- measured timing results

Again, the controlling abstraction was the implementation plan.

## Why This Worked

This approach worked because the project had strong externalized structure.

### The model was not trusted to remember everything

Instead, memory was externalized into:

- spec
- summary
- architecture
- decisions
- plan
- guide
- progress log

### The model was not asked to "just build it"

It was given:

- clear scope
- explicit constraints
- module boundaries
- phased tasks
- verification expectations
- a running audit trail

### The review surface was mostly behavioral

The user could steer through:

- "where are we?"
- "keep going"
- "fill in the visualization"
- "the input fields are janky"
- "make these defaults different"
- "put this on top"
- "keep the spacing consistent"

That is a much easier and higher-leverage interface than reading implementation details.

## Important Caveat

The article should not claim that no technical rigor was used.

The better framing is:

- the user did not need to review source code directly
- because the repo was instrumented with documents, tests, logs, snapshots, and visible milestones

In other words:

- this was not anti-engineering
- it was engineering through better interfaces

That distinction is important.

## The Real Pattern

The repeatable pattern here is:

### 1. Externalize intent

Start with:

- spec
- user stories
- constraints

### 2. Externalize understanding

Create:

- understanding summary
- architecture
- decision log

### 3. Externalize execution

Create:

- implementation plan
- implementation guide
- progress log

### 4. Externalize verification

Require:

- tests
- snapshots
- smoke checks
- performance checks
- build checks
- size checks

### 5. Steer on behavior

Use:

- screenshots
- demo review
- plain-English product feedback
- milestone status

instead of constant code review.

## Suggested Framing For The Article

Possible framing:

"I did not build this project by reviewing source files line by line. I built it by creating a document stack that made the model legible, then steering implementation through plans, logs, tests, screenshots, and product feedback."

Another framing:

"The trick is not to avoid structure. The trick is to create so much structure that you no longer need direct source inspection to stay in control."

Another:

"Vibe coding works better when you stop treating the code as the primary interface. The primary interface becomes the spec, the plan, the progress log, the tests, and the running product."

## Suggested Article Outline

### Opening

- explain the normal fear: if you do not read the code, you lose control
- explain the counterpoint: you can regain control by forcing the project through better artifacts

### Section 1: Start with a spec, not a prompt

- discuss `spec.md`
- discuss manual review with the LLM
- explain why concrete user stories mattered

### Section 2: Make the model prove it understands the problem

- discuss `system-understanding-summary.md`
- discuss `architecture.md`
- discuss module boundaries

### Section 3: Create rules for the coding agent

- discuss `AGENT.md`
- discuss `decision-log.md`
- explain why these reduce drift

### Section 4: Turn the project into an executable plan

- discuss `implementation-plan.md`
- explain multi-pass plan review
- explain test-first task design

### Section 5: Execute from the plan, not from vibes

- discuss `IMPLEMENTATION_GUIDE.md`
- discuss `progress-log.md`
- explain why status checks became easy

### Section 6: Steer from outputs, not source

- use examples from this repo:
  - demo review
  - janky inputs
  - big buttons
  - changed defaults
  - chart layout refinements
  - lower-panel formatting

### Section 7: Why this is still real engineering

- discuss tests
- discuss snapshots
- discuss smoke/perf verification
- discuss size/build constraints

### Closing

- "without looking at the code" does not mean without rigor
- it means controlling the project through the right abstractions

## Good Specific Repo Details To Mention

If you want concrete details in the article, good examples are:

- the project used a single-bundle browser deployment constraint from the start
- the app was built as a Shadow DOM custom element
- `uPlot` and `Vite` were fixed early in the decision log
- the plan explicitly required failing-test-first execution
- progress was tracked by task IDs like `P3.4`, `P6.6`, `P7.8`, `P8.9`
- performance was eventually measured, not guessed
- the final verification path included build, size, smoke, perf, and test checks
- many meaningful product changes happened through screenshots and plain-language instructions

## Short Version

The story is not:

"I told the model to build an app and it did."

The story is:

"I built a document-driven control system around the model, then used that system to steer a real project mostly through plans, logs, tests, screenshots, and product feedback instead of reading source code."

That is the actual lesson from this repo.
