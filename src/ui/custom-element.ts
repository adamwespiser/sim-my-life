import { getDefaultScenario } from "../domain/scenario-defaults";
import { normalizeScenarioInput, validateScenarioInput } from "../domain/scenario-validation";
import type { BatchResult, ScenarioInput } from "../domain/types";
import { historicalReturnsMetadata } from "../data/historical-returns";
import { getHoverYearDistributions } from "../metrics/hover-distributions";
import { calculateYearlyPercentiles } from "../metrics/percentiles";
import { calculateRetirementSummaries } from "../metrics/retirement-summaries";
import { calculatePercentOfPortfolioSpendingSummary } from "../metrics/spending-summaries";
import { createBatchRunner, type BatchRunner } from "../simulation/batch-runner";
import { appShellStyles } from "./app-shell-styles";
import { buildAppViewModel } from "../view-model/view-model-adapter";
import type {
  AppViewModel,
  DistributionViewData,
  SpendingPanelDetail,
  SpendingPanelViewModel,
} from "../view-model/ui-contracts";

export const simReturnsAppTagName = "sim-returns-app";
export const AUTO_RUN_DEBOUNCE_MS = 300;
const DEFAULT_PERCENT_WITHDRAWAL_RATE = 4;

interface RunState {
  completedPaths: number;
  message: string;
  resolvedSeed: number | null;
  status: "idle" | "scheduled" | "running" | "completed" | "canceled" | "error" | "invalid";
  totalPaths: number;
}

interface FormDraft {
  annualInflationAdjustment: string;
  annualSavings: string;
  annualSpending: string;
  currentPortfolio: string;
  mode: ScenarioInput["retirementStrategy"]["mode"];
  numberOfSimulations: string;
  retirementStartYear: string;
  withdrawalRate: string;
  yearsInRetirement: string;
}

let createBatchRunnerForApp: () => BatchRunner = () => createBatchRunner();

export function setSimReturnsAppBatchRunnerFactoryForTest(
  factory: (() => BatchRunner) | null,
): void {
  createBatchRunnerForApp = factory ?? (() => createBatchRunner());
}

function createIdleRunState(totalPaths = 0): RunState {
  return {
    completedPaths: 0,
    message: "Waiting to run. Change an input or click Run simulation.",
    resolvedSeed: null,
    status: "idle",
    totalPaths,
  };
}

export class SimReturnsAppElement extends HTMLElement {
  readonly #root: ShadowRoot;
  #currentYear: number | null = null;
  #formDraft: FormDraft | null = null;
  #hoveredCalendarYear: number | null = null;
  #latestResult: BatchResult | null = null;
  #pendingAutoRunTimer: number | null = null;
  readonly #runner: BatchRunner;
  #runExecutionId = 0;
  #runState = createIdleRunState();
  #scenario: ScenarioInput | null = null;
  #validationErrors: string[] = [];
  #viewModel: AppViewModel | null = null;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#runner = createBatchRunnerForApp();
  }

  connectedCallback() {
    if (this.#currentYear == null) {
      this.#currentYear = this.getCurrentYear();
    }

    if (this.#scenario == null) {
      const defaultScenario = getDefaultScenario(this.#currentYear);
      this.#scenario = defaultScenario;
      this.#formDraft = createFormDraft(defaultScenario);
    }

    if (this.#formDraft == null && this.#scenario != null) {
      this.#formDraft = createFormDraft(this.#scenario);
    }

    this.#runState = createIdleRunState(this.#scenario?.numberOfSimulations ?? 0);
    this.render();
  }

  disconnectedCallback() {
    this.clearPendingAutoRun();
    this.#runner.cancel();
  }

  render() {
    const currentYear = this.#currentYear ?? this.getCurrentYear();
    const scenario = this.#scenario ?? getDefaultScenario(currentYear);
    const formDraft = this.#formDraft ?? createFormDraft(scenario);
    const isFixedMode = formDraft.mode === "fixed-dollars";

    this.#root.innerHTML = `
      <style>${appShellStyles}</style>
      <div class="shell">
        <section class="panel intro" data-testid="intro">
          <p class="eyebrow">Historical bootstrap planning tool</p>
          <h1 class="title">Simulate a savings path before the chart arrives.</h1>
          <p class="lede">
            Start with the defaults, then adjust your current portfolio, yearly savings,
            retirement timing, and spending strategy. Run the simulation to compare
            pessimistic, typical, and optimistic paths across retirement.
          </p>
        </section>

        <section class="panel" data-testid="controls">
          <p class="section-label">Inputs</p>
          <h2 class="section-title">Scenario controls</h2>
          <div class="controls-grid">
            <div class="field" data-invalid="${this.hasFieldError("currentPortfolio")}">
              <label for="current-portfolio">Current portfolio</label>
              <input
                id="current-portfolio"
                type="text"
                inputmode="decimal"
                spellcheck="false"
                value="${escapeHtml(formDraft.currentPortfolio)}"
              />
            </div>
            <div class="field" data-invalid="${this.hasFieldError("annualSavings")}">
              <label for="annual-savings">Annual savings amount</label>
              <input
                id="annual-savings"
                type="text"
                inputmode="decimal"
                spellcheck="false"
                value="${escapeHtml(formDraft.annualSavings)}"
              />
            </div>
            <div class="field" data-invalid="${this.hasFieldError("retirementStartYear")}">
              <label for="retirement-start-year">Retirement start year</label>
              <input
                id="retirement-start-year"
                type="text"
                inputmode="numeric"
                spellcheck="false"
                value="${escapeHtml(formDraft.retirementStartYear)}"
              />
            </div>
            <div class="field" data-invalid="${this.hasFieldError("yearsInRetirement")}">
              <label for="years-in-retirement">Years in retirement</label>
              <input
                id="years-in-retirement"
                type="text"
                inputmode="numeric"
                spellcheck="false"
                value="${escapeHtml(formDraft.yearsInRetirement)}"
              />
            </div>
            <div class="field">
              <label for="retirement-mode">Retirement spending strategy</label>
              <select id="retirement-mode">
                <option value="fixed-dollars" ${isFixedMode ? "selected" : ""}>Fixed dollars</option>
                <option value="percent-of-portfolio" ${
                  isFixedMode ? "" : "selected"
                }>Percent of portfolio</option>
              </select>
            </div>
            <div
              class="field"
              data-field="fixed-dollars"
              data-invalid="${this.hasFieldError("annualSpending")}"
              ${isFixedMode ? "" : "hidden"}
            >
              <label for="annual-spending">Annual retirement spending</label>
              <input
                id="annual-spending"
                type="text"
                inputmode="decimal"
                spellcheck="false"
                value="${escapeHtml(formDraft.annualSpending)}"
              />
            </div>
            <div
              class="field"
              data-field="fixed-dollars"
              data-invalid="${this.hasFieldError("annualInflationAdjustment")}"
              ${isFixedMode ? "" : "hidden"}
            >
              <label for="inflation-adjustment">Annual inflation adjustment (%)</label>
              <input
                id="inflation-adjustment"
                type="text"
                inputmode="decimal"
                spellcheck="false"
                value="${escapeHtml(formDraft.annualInflationAdjustment)}"
              />
            </div>
            <div
              class="field"
              data-field="percent-of-portfolio"
              data-invalid="${this.hasFieldError("withdrawalRate")}"
              ${isFixedMode ? "hidden" : ""}
            >
              <label for="withdrawal-rate">Retirement withdrawal rate (%)</label>
              <input
                id="withdrawal-rate"
                type="text"
                inputmode="decimal"
                spellcheck="false"
                value="${escapeHtml(formDraft.withdrawalRate)}"
              />
            </div>
            <div class="field" data-invalid="${this.hasFieldError("numberOfSimulations")}">
              <label for="simulation-count">Number of simulations</label>
              <input
                id="simulation-count"
                type="text"
                inputmode="numeric"
                spellcheck="false"
                value="${escapeHtml(formDraft.numberOfSimulations)}"
              />
            </div>
          </div>
          <div class="actions">
            <button class="button-primary" data-action="run" type="button">${
              this.#runState.status === "running" ? "Stop Simulation" : "Run Simulation"
            }</button>
            <button class="button-secondary" data-action="reset" type="button">Reset to defaults</button>
          </div>
          ${this.renderValidationErrors()}
        </section>

        <section class="panel" data-testid="summary">
          <p class="section-label">Summary</p>
          <h2 class="section-title">Retirement readiness</h2>
          ${this.renderSummaryCards(currentYear, scenario)}
          ${this.renderSpendingPanel(scenario)}
        </section>

        <section class="panel chart-section" data-testid="chart">
          <div class="run-state-panel" data-testid="run-state-panel">
            <p class="section-label">Run state</p>
            <h2 class="section-title">Simulation status</h2>
            <div class="placeholder" data-testid="run-state">
              ${this.renderRunState()}
            </div>
          </div>
          <div data-testid="chart-panel">
            <p class="section-label">Primary chart</p>
            <h2 class="section-title">Portfolio paths across time</h2>
            ${this.renderChart(currentYear, scenario)}
          </div>
        </section>

        <section class="panel" data-testid="distributions">
          <p class="section-label">Hover distributions</p>
          <h2 class="section-title">Three yearly views at once</h2>
          ${this.renderDistributions()}
        </section>

        <section class="panel" data-testid="methodology">
          <p class="section-label">Methodology</p>
          <h2 class="section-title">What this model assumes</h2>
          <p class="methodology-copy">
            The app samples from bundled annual S&amp;P 500 total returns, applies annual growth,
            adds savings before retirement, and applies withdrawals during retirement. Results are
            simulated rather than guaranteed.
          </p>
          <ul class="methodology-list">
            <li>Savings and withdrawals are modeled annually for clarity.</li>
            <li>Fixed-dollar plans can include annual inflation adjustments.</li>
            <li>Percent-of-portfolio plans produce variable yearly retirement income.</li>
            <li>Created for educational purposes by non-financial advisors. <strong>Not financial advice.</strong></li>
          </ul>
          <p class="source-note">
            Data source: ${historicalReturnsMetadata.sourceName},
            ${historicalReturnsMetadata.coverageStartYear}-${historicalReturnsMetadata.coverageEndYear}.
          </p>
        </section>
      </div>
    `;

    this.overrideRootListeners();
  }

  getCurrentYear(): number {
    const attributeValue = Number(this.getAttribute("data-current-year"));

    if (Number.isInteger(attributeValue) && attributeValue > 0) {
      return attributeValue;
    }

    return new Date().getFullYear();
  }

  renderValidationErrors(): string {
    if (this.#validationErrors.length === 0) {
      return "";
    }

    return `
      <div class="validation-block" data-testid="validation-errors">
        <p class="card-label">Validation issues</p>
        <ul>
          ${this.#validationErrors.map((error) => `<li>${error}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  renderRunState(): string {
    const completedDisplay =
      this.#runState.totalPaths > 0
        ? `${this.#runState.completedPaths} / ${this.#runState.totalPaths}`
        : "Not started";
    const resolvedSeed =
      this.#runState.resolvedSeed == null ? "Pending" : this.#runState.resolvedSeed;

    return `
      <div class="status-stack">
        <span class="status-badge" data-state="${this.#runState.status}" data-testid="run-status-badge">
          ${this.#runState.status}
        </span>
        <p class="placeholder-copy" data-testid="run-status-message">${this.#runState.message}</p>
        <dl class="status-list">
          <div class="status-row">
            <dt>Completed paths</dt>
            <dd data-testid="run-progress">${completedDisplay}</dd>
          </div>
          <div class="status-row">
            <dt>Resolved seed</dt>
            <dd data-testid="run-seed">${resolvedSeed}</dd>
          </div>
        </dl>
      </div>
    `;
  }

  overrideRootListeners() {
    for (const input of this.#root.querySelectorAll<HTMLInputElement>("input")) {
      input.addEventListener("input", this.handleFormInput);
    }

    const modeSelect = this.#root.querySelector<HTMLSelectElement>("#retirement-mode");
    modeSelect?.addEventListener("change", this.handleFormInput);

    const runButton = this.#root.querySelector<HTMLButtonElement>("[data-action='run']");
    runButton?.addEventListener("click", this.handleRunButtonClick);

    const resetButton = this.#root.querySelector<HTMLButtonElement>("[data-action='reset']");
    resetButton?.addEventListener("click", this.handleReset);

    for (const target of this.#root.querySelectorAll<HTMLElement>("[data-hover-year]")) {
      target.addEventListener("mouseenter", this.handleHoverYear);
      target.addEventListener("click", this.handleHoverYear);
    }
  }

  handleFormInput = (event: Event) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement | null;
    const selectionStart =
      target instanceof HTMLInputElement ? (target.selectionStart ?? target.value.length) : null;
    const selectionEnd =
      target instanceof HTMLInputElement ? (target.selectionEnd ?? target.value.length) : null;

    this.updateFormDraftFromTarget(target);
    this.syncScenarioFromForm();
    this.syncRunStateForScenarioChange();
    this.render();

    if (target instanceof HTMLInputElement && target.id !== "") {
      this.restoreInputState(target.id, selectionStart, selectionEnd);
    }
  };

  handleReset = () => {
    const currentYear = this.#currentYear ?? this.getCurrentYear();
    const defaultScenario = getDefaultScenario(currentYear);
    this.#scenario = defaultScenario;
    this.#formDraft = createFormDraft(defaultScenario);
    this.#validationErrors = [];
    this.syncRunStateForScenarioChange();
    this.render();
  };

  handleRunButtonClick = () => {
    if (this.#runState.status === "running") {
      this.cancelActiveRun("Simulation stopped.");
      this.render();
      return;
    }

    void this.executeRun("manual");
  };

  handleHoverYear = (event: Event) => {
    const target = event.currentTarget as HTMLElement | null;
    const hoveredYear = Number(target?.dataset.hoverYear);

    if (!Number.isInteger(hoveredYear) || this.#latestResult == null) {
      return;
    }

    this.#hoveredCalendarYear = hoveredYear;
    this.updateViewModelFromResult(this.#latestResult);
    this.render();
  };

  syncScenarioFromForm() {
    const formDraft = this.#formDraft;

    if (formDraft == null) {
      return;
    }

    const scenario: ScenarioInput = normalizeScenarioInput({
      annualSavings: parseDraftNumber(formDraft.annualSavings),
      currentPortfolio: parseDraftNumber(formDraft.currentPortfolio),
      numberOfSimulations: parseDraftNumber(formDraft.numberOfSimulations),
      retirementStartYear: parseDraftNumber(formDraft.retirementStartYear),
      retirementStrategy:
        formDraft.mode === "percent-of-portfolio"
          ? {
              mode: "percent-of-portfolio",
              withdrawalRate: parseDraftPercent(formDraft.withdrawalRate),
            }
          : {
              annualInflationAdjustment: parseDraftPercent(formDraft.annualInflationAdjustment),
              annualSpending: parseDraftNumber(formDraft.annualSpending),
              mode: "fixed-dollars",
            },
      yearsInRetirement: parseDraftNumber(formDraft.yearsInRetirement),
    });

    const validationResult = validateScenarioInput(
      scenario,
      this.#currentYear ?? this.getCurrentYear(),
    );

    this.#scenario = scenario;
    this.#validationErrors = validationResult.errors;
    this.#runState.totalPaths = scenario.numberOfSimulations;
  }

  syncRunStateForScenarioChange() {
    const scenario = this.#scenario;

    if (scenario == null) {
      return;
    }

    this.clearPendingAutoRun();

    if (this.#runState.status === "running") {
      this.cancelActiveRun("Input changed. Scheduling restart.");
    }

    if (this.#validationErrors.length > 0) {
      this.#runState = {
        completedPaths: 0,
        message: "Fix validation errors before running a simulation.",
        resolvedSeed: null,
        status: "invalid",
        totalPaths: scenario.numberOfSimulations,
      };
      return;
    }

    this.#runState = {
      completedPaths: 0,
      message: `Auto-rerun scheduled in ${AUTO_RUN_DEBOUNCE_MS} ms.`,
      resolvedSeed: null,
      status: "scheduled",
      totalPaths: scenario.numberOfSimulations,
    };
    this.#pendingAutoRunTimer = window.setTimeout(() => {
      this.#pendingAutoRunTimer = null;
      void this.executeRun("auto");
    }, AUTO_RUN_DEBOUNCE_MS);
  }

  clearPendingAutoRun() {
    if (this.#pendingAutoRunTimer != null) {
      window.clearTimeout(this.#pendingAutoRunTimer);
      this.#pendingAutoRunTimer = null;
    }
  }

  cancelActiveRun(message: string) {
    this.clearPendingAutoRun();
    this.#runExecutionId += 1;
    this.#runner.cancel();
    this.#runState = {
      completedPaths: this.#runState.completedPaths,
      message,
      resolvedSeed: this.#runState.resolvedSeed,
      status: "canceled",
      totalPaths: this.#runState.totalPaths,
    };
  }

  async executeRun(trigger: "manual" | "auto"): Promise<void> {
    const scenario = this.#scenario;

    if (scenario == null) {
      return;
    }

    if (this.#validationErrors.length > 0) {
      this.#runState = {
        completedPaths: 0,
        message: "Fix validation errors before running a simulation.",
        resolvedSeed: null,
        status: "invalid",
        totalPaths: scenario.numberOfSimulations,
      };
      this.render();
      return;
    }

    this.clearPendingAutoRun();
    const executionId = ++this.#runExecutionId;
    this.#runState = {
      completedPaths: 0,
      message:
        trigger === "manual"
          ? "Simulation started from the Run button."
          : "Auto-rerun started after input changes.",
      resolvedSeed: null,
      status: "running",
      totalPaths: scenario.numberOfSimulations,
    };
    this.render();

    try {
      const result = await this.#runner.run({
        batchSize: this.resolveBatchSize(scenario.numberOfSimulations),
        currentYear: this.#currentYear ?? this.getCurrentYear(),
        onBatch: (batchResult) => {
          if (executionId !== this.#runExecutionId) {
            return;
          }

          this.updateRunStateFromBatch(batchResult);
          this.#latestResult = batchResult;
          this.updateViewModelFromResult(batchResult);
          this.render();
        },
        scenario,
      });

      if (executionId !== this.#runExecutionId) {
        return;
      }

      if (result == null) {
        this.#runState = {
          completedPaths: this.#runState.completedPaths,
          message: "Simulation canceled before completion.",
          resolvedSeed: this.#runState.resolvedSeed,
          status: "canceled",
          totalPaths: this.#runState.totalPaths,
        };
      } else {
        this.#latestResult = result;
        this.updateViewModelFromResult(result);
        this.#runState = {
          completedPaths: result.completedPaths,
          message: "Simulation complete. Charts and summaries can now render from these results.",
          resolvedSeed: result.resolvedSeed,
          status: "completed",
          totalPaths: result.totalPaths,
        };
      }
    } catch (error) {
      if (executionId !== this.#runExecutionId) {
        return;
      }

      const message = error instanceof Error ? error.message : "Unknown error";
      this.#runState = {
        completedPaths: this.#runState.completedPaths,
        message: `Simulation failed: ${message}`,
        resolvedSeed: this.#runState.resolvedSeed,
        status: "error",
        totalPaths: this.#runState.totalPaths,
      };
    }

    this.render();
  }

  updateRunStateFromBatch(batchResult: BatchResult) {
    this.#runState = {
      completedPaths: batchResult.completedPaths,
      message: `Running ${batchResult.completedPaths} of ${batchResult.totalPaths} paths.`,
      resolvedSeed: batchResult.resolvedSeed,
      status: "running",
      totalPaths: batchResult.totalPaths,
    };
  }

  resolveBatchSize(totalPaths: number): number {
    return Math.max(1, Math.min(250, Math.ceil(totalPaths / 10)));
  }

  updateFormDraftFromTarget(target: HTMLInputElement | HTMLSelectElement | null) {
    if (target == null || this.#formDraft == null || target.id === "") {
      return;
    }

    switch (target.id) {
      case "current-portfolio":
        this.#formDraft.currentPortfolio = target.value;
        break;
      case "annual-savings":
        this.#formDraft.annualSavings = target.value;
        break;
      case "retirement-start-year":
        this.#formDraft.retirementStartYear = target.value;
        break;
      case "years-in-retirement":
        this.#formDraft.yearsInRetirement = target.value;
        break;
      case "retirement-mode":
        this.#formDraft.mode = target.value as FormDraft["mode"];
        break;
      case "annual-spending":
        this.#formDraft.annualSpending = target.value;
        break;
      case "inflation-adjustment":
        this.#formDraft.annualInflationAdjustment = target.value;
        break;
      case "withdrawal-rate":
        this.#formDraft.withdrawalRate = target.value;
        break;
      case "simulation-count":
        this.#formDraft.numberOfSimulations = target.value;
        break;
      default:
        break;
    }
  }

  restoreInputState(inputId: string, selectionStart: number | null, selectionEnd: number | null) {
    const input = this.#root.querySelector<HTMLInputElement>(`#${inputId}`);

    if (input == null) {
      return;
    }

    input.focus();

    if (selectionStart == null || selectionEnd == null) {
      return;
    }

    try {
      input.setSelectionRange(selectionStart, selectionEnd);
    } catch {
      // Some input types do not support selection ranges.
    }
  }

  hasFieldError(fieldKey: string): boolean {
    return this.#validationErrors.some((error) => error.includes(fieldKey));
  }

  updateViewModelFromResult(result: BatchResult) {
    if (result.points.length === 0 || this.#scenario == null) {
      this.#viewModel = null;
      return;
    }

    const yearlyPercentiles = calculateYearlyPercentiles(result.points);
    const fallbackHoverYear =
      this.resolveDefaultHoverYear(result) ?? result.points[0]?.at(-1)?.calendarYear ?? null;
    const hoveredCalendarYear =
      this.#hoveredCalendarYear != null && this.hasCalendarYear(result, this.#hoveredCalendarYear)
        ? this.#hoveredCalendarYear
        : fallbackHoverYear;

    if (hoveredCalendarYear == null) {
      this.#viewModel = null;
      return;
    }

    this.#hoveredCalendarYear = hoveredCalendarYear;
    const retirementSummaries = calculateRetirementSummaries(result.points);
    const spendingSummary =
      this.#scenario.retirementStrategy.mode === "percent-of-portfolio"
        ? calculatePercentOfPortfolioSpendingSummary(result.points)
        : null;

    this.#viewModel = buildAppViewModel({
      hoverDistributions: getHoverYearDistributions(result.points, hoveredCalendarYear),
      hoveredCalendarYear,
      paths: result.points.slice(0, 24),
      retirementSummaries,
      scenario: this.#scenario,
      spendingSummary,
      yearlyPercentiles,
    });
  }

  hasCalendarYear(result: BatchResult, calendarYear: number): boolean {
    return result.points.some((path) => path.some((point) => point.calendarYear === calendarYear));
  }

  resolveDefaultHoverYear(result: BatchResult): number | null {
    const retirementStartYear = this.#scenario?.retirementStartYear;

    if (
      retirementStartYear != null &&
      result.points.some((path) => path.some((point) => point.calendarYear === retirementStartYear))
    ) {
      return retirementStartYear;
    }

    return result.points[0]?.at(-1)?.calendarYear ?? null;
  }

  renderSummaryCards(currentYear: number, scenario: ScenarioInput): string {
    if (this.#viewModel == null) {
      return `
        <div class="summary-grid">
          <article class="card">
            <p class="card-label">Retirement balance</p>
            <p class="card-value">Pending</p>
            <p class="card-meta">Will show pessimistic, median, and optimistic values.</p>
          </article>
          <article class="card">
            <p class="card-label">End balance</p>
            <p class="card-value">Pending</p>
            <p class="card-meta">Will summarize the end of the retirement horizon.</p>
          </article>
          <article class="card">
            <p class="card-label">Plan survival</p>
            <p class="card-value">Pending</p>
            <p class="card-meta">Will report the probability of not hitting zero.</p>
          </article>
          <article class="card">
            <p class="card-label">Total contributions</p>
            <p class="card-value">${formatCurrency(
              scenario.annualSavings * (scenario.retirementStartYear - currentYear),
            )}</p>
            <p class="card-meta">Based on the accumulation years in the current scenario.</p>
          </article>
        </div>
      `;
    }

    return `
      <div class="summary-grid">
        ${this.#viewModel.summaryCards
          .map(
            (card) => `
              <article class="card">
                <p class="card-label">${card.label}</p>
                <p class="card-value">${formatSummaryCardValue(card.id, card.value)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    `;
  }

  renderSpendingPanel(scenario: ScenarioInput): string {
    const spendingPanel = this.#viewModel?.spendingPanel ?? buildPendingSpendingPanel(scenario);

    return `
      <article class="spending-panel" data-testid="spending-panel" data-mode="${spendingPanel.id}">
        <div class="spending-panel-copy">
          <p class="section-label">Spending panel</p>
          <h3 class="spending-panel-title">${spendingPanel.headline}</h3>
          <p class="placeholder-copy">${spendingPanel.summary}</p>
        </div>
        <dl class="spending-panel-details">
          ${spendingPanel.details
            .map(
              (detail) => `
                <div class="spending-panel-row">
                  <dt>${detail.label}</dt>
                  <dd>${formatSpendingPanelValue(detail)}</dd>
                </div>
              `,
            )
            .join("")}
        </dl>
      </article>
    `;
  }

  renderChart(currentYear: number, scenario: ScenarioInput): string {
    if (this.#viewModel == null || this.#latestResult == null) {
      return `
        <div class="placeholder">
          <p class="placeholder-copy">
            The chart container is ready. Run a simulation to draw sample paths, percentile bands,
            and the retirement boundary.
          </p>
        </div>
      `;
    }

    const chart = this.#viewModel.chart;

    if (chart.percentileBand.length === 0) {
      return `
        <div class="placeholder">
          <p class="placeholder-copy">No chart data is available yet.</p>
        </div>
      `;
    }

    const layout = buildChartLayout(chart, this.#latestResult, this.#hoveredCalendarYear);
    const yearLabels = layout.labelYears.map(
      (year) => `
        <text class="chart-axis" x="${layout.xScale(year)}" y="${layout.height - 8}" text-anchor="middle">
          ${year}
        </text>
      `,
    );
    const valueLabels = layout.valueLabels.map(
      (value) => `
        <text class="chart-axis" x="8" y="${layout.yScale(value) + 4}">
          ${shortCurrency(value)}
        </text>
      `,
    );

    return `
      <div class="chart-card">
        <div class="chart-meta">
          <p class="distribution-caption">
            Hovered year:
            <strong data-testid="hovered-year">${this.#hoveredCalendarYear ?? chart.retirementStartYear}</strong>
          </p>
          <p class="distribution-caption">
            Retirement starts in <strong>${scenario.retirementStartYear}</strong>
          </p>
        </div>
        <div class="chart-frame">
          <svg
            class="chart-svg"
            data-testid="chart-svg"
            viewBox="0 0 ${layout.width} ${layout.height}"
            role="img"
            aria-label="Simulated portfolio paths with percentile band"
          >
            <rect
              class="chart-retirement-zone"
              x="${layout.xScale(chart.retirementStartYear)}"
              y="${layout.paddingTop}"
              width="${layout.width - layout.paddingRight - layout.xScale(chart.retirementStartYear)}"
              height="${layout.plotHeight}"
            />
            <path class="chart-band" d="${layout.bandPath}" />
            ${layout.samplePaths.map((path) => `<path class="chart-line" d="${path}" />`).join("")}
            <path class="chart-line-median" data-testid="chart-median-line" d="${layout.medianPath}" />
            <line
              class="chart-retirement-line"
              x1="${layout.xScale(chart.retirementStartYear)}"
              x2="${layout.xScale(chart.retirementStartYear)}"
              y1="${layout.paddingTop}"
              y2="${layout.height - layout.paddingBottom}"
            />
            ${
              layout.hoverLineX == null
                ? ""
                : `<line
                    class="chart-hover-line"
                    x1="${layout.hoverLineX}"
                    x2="${layout.hoverLineX}"
                    y1="${layout.paddingTop}"
                    y2="${layout.height - layout.paddingBottom}"
                  />`
            }
            ${layout.failureMarkers
              .map(
                (marker) => `
                  <circle
                    class="chart-failure-marker"
                    cx="${marker.x}"
                    cy="${marker.y}"
                    r="3.2"
                  />
                `,
              )
              .join("")}
            ${valueLabels.join("")}
            ${yearLabels.join("")}
            ${layout.hitboxes
              .map(
                (hitbox) => `
                  <rect
                    class="chart-hitbox"
                    data-hover-year="${hitbox.calendarYear}"
                    x="${hitbox.x}"
                    y="${layout.paddingTop}"
                    width="${hitbox.width}"
                    height="${layout.plotHeight}"
                  />
                `,
              )
              .join("")}
          </svg>
        </div>
      </div>
    `;
  }

  renderDistributions(): string {
    if (this.#viewModel == null) {
      return `
        <div class="distribution-grid">
          <article class="distribution-card">
            <p class="distribution-label">Investment income</p>
            <p class="placeholder-copy">Shows gains or losses from market returns in the hovered year.</p>
          </article>
          <article class="distribution-card">
            <p class="distribution-label">Retirement withdrawals</p>
            <p class="placeholder-copy">Shows actual withdrawals after annual growth is applied.</p>
          </article>
          <article class="distribution-card">
            <p class="distribution-label">Account assets</p>
            <p class="placeholder-copy">Shows end-of-year balances for the selected modeled year.</p>
          </article>
        </div>
      `;
    }

    return `
      <p class="distribution-caption">
        Selected year:
        <strong data-testid="distribution-year-label">${this.#viewModel.hoverState.calendarYear}</strong>
      </p>
      <div class="distribution-grid">
        ${this.#viewModel.distributions
          .map((distribution) =>
            this.renderDistributionCard(
              distribution,
              this.#viewModel?.hoverState.calendarYear ?? null,
            ),
          )
          .join("")}
      </div>
    `;
  }

  renderDistributionCard(distribution: DistributionViewData, calendarYear: number | null): string {
    const histogram = buildHistogram(distribution.values);
    const minValue = distribution.values.length === 0 ? 0 : Math.min(...distribution.values);
    const maxValue = distribution.values.length === 0 ? 0 : Math.max(...distribution.values);
    const titleSuffix =
      calendarYear == null ? distribution.label : `${distribution.label} in ${calendarYear}`;

    return `
      <article class="distribution-card">
        <p class="distribution-label">${titleSuffix}</p>
        <svg class="distribution-bars" viewBox="0 0 180 100" role="img" aria-label="${distribution.label} distribution">
          ${histogram.bars
            .map(
              (bar) => `
                <rect
                  class="distribution-bar"
                  x="${bar.x}"
                  y="${bar.y}"
                  width="${bar.width}"
                  height="${bar.height}"
                  rx="3"
                />
              `,
            )
            .join("")}
        </svg>
        <div class="distribution-axis" aria-hidden="true">
          <span>Min ${formatDistributionCurrency(minValue)}</span>
          <span>Median ${formatDistributionCurrency(distribution.percentileSummary.p50)}</span>
          <span>Max ${formatDistributionCurrency(maxValue)}</span>
        </div>
        <div class="distribution-stats">
          <div class="distribution-stat-row"><span>P10</span><strong>${formatDistributionCurrency(
            distribution.percentileSummary.p10,
          )}</strong></div>
          <div class="distribution-stat-row"><span>P50</span><strong>${formatDistributionCurrency(
            distribution.percentileSummary.p50,
          )}</strong></div>
          <div class="distribution-stat-row"><span>P90</span><strong>${formatDistributionCurrency(
            distribution.percentileSummary.p90,
          )}</strong></div>
        </div>
      </article>
    `;
  }
}

if (!customElements.get(simReturnsAppTagName)) {
  customElements.define(simReturnsAppTagName, SimReturnsAppElement);
}

interface ChartLayout {
  bandPath: string;
  failureMarkers: Array<{ x: number; y: number }>;
  height: number;
  hitboxes: Array<{ calendarYear: number; width: number; x: number }>;
  hoverLineX: number | null;
  labelYears: number[];
  medianPath: string;
  paddingBottom: number;
  paddingRight: number;
  paddingTop: number;
  plotHeight: number;
  samplePaths: string[];
  valueLabels: number[];
  width: number;
  xScale: (calendarYear: number) => number;
  yScale: (value: number) => number;
}

function buildChartLayout(
  chart: AppViewModel["chart"],
  result: BatchResult,
  hoveredCalendarYear: number | null,
): ChartLayout {
  const width = 720;
  const height = 320;
  const paddingTop = 16;
  const paddingRight = 16;
  const paddingBottom = 28;
  const paddingLeft = 44;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const years = chart.percentileBand.map((point) => point.calendarYear);
  const minYear = years[0] ?? chart.retirementStartYear;
  const maxYear = years.at(-1) ?? minYear;
  const maxBalance = Math.max(
    1,
    ...chart.percentileBand.map((point) => point.p90),
    ...chart.samplePaths.flatMap((path) => path.points.map((point) => point.endingBalance)),
  );
  const xScale = (calendarYear: number) => {
    if (maxYear === minYear) {
      return paddingLeft + plotWidth / 2;
    }

    return paddingLeft + ((calendarYear - minYear) / (maxYear - minYear)) * plotWidth;
  };
  const yScale = (value: number) => paddingTop + plotHeight - (value / maxBalance) * plotHeight;
  const bandTop = chart.percentileBand.map(
    (point) => `${xScale(point.calendarYear)},${yScale(point.p90)}`,
  );
  const bandBottom = [...chart.percentileBand]
    .reverse()
    .map((point) => `${xScale(point.calendarYear)},${yScale(point.p10)}`);
  const bandPath = `M ${bandTop.join(" L ")} L ${bandBottom.join(" L ")} Z`;
  const medianPath = buildLinePath(
    chart.percentileBand.map((point) => ({
      x: xScale(point.calendarYear),
      y: yScale(point.p50),
    })),
  );
  const samplePaths = chart.samplePaths.map((path) =>
    buildLinePath(
      path.points.map((point) => ({
        x: xScale(point.calendarYear),
        y: yScale(point.endingBalance),
      })),
    ),
  );
  const failureMarkers = result.points
    .slice(0, chart.samplePaths.length)
    .map((path) => path.find((point) => point.depleted))
    .filter((point): point is NonNullable<typeof point> => point != null)
    .map((point) => ({
      x: xScale(point.calendarYear),
      y: yScale(point.endingBalance),
    }));
  const hoverLineX = hoveredCalendarYear == null ? null : xScale(hoveredCalendarYear);
  const stepWidth = years.length > 1 ? xScale(years[1] ?? minYear) - xScale(minYear) : plotWidth;
  const hitboxes = years.map((calendarYear) => ({
    calendarYear,
    width: Math.max(stepWidth, 18),
    x: xScale(calendarYear) - Math.max(stepWidth, 18) / 2,
  }));
  const labelYears = [minYear, chart.retirementStartYear, maxYear].filter(
    (year, index, values) => values.indexOf(year) === index,
  );
  const valueLabels = [0, maxBalance * 0.5, maxBalance];

  return {
    bandPath,
    failureMarkers,
    height,
    hitboxes,
    hoverLineX,
    labelYears,
    medianPath,
    paddingBottom,
    paddingRight,
    paddingTop,
    plotHeight,
    samplePaths,
    valueLabels,
    width,
    xScale,
    yScale,
  };
}

function buildLinePath(points: Array<{ x: number; y: number }>): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`).join(" ");
}

function buildHistogram(values: number[]) {
  if (values.length === 0) {
    return { bars: [] as Array<{ height: number; width: number; x: number; y: number }> };
  }

  const width = 180;
  const height = 100;
  const bins = 12;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const counts = Array.from({ length: bins }, () => 0);

  for (const value of values) {
    const index =
      minValue === maxValue
        ? Math.floor(bins / 2)
        : Math.min(bins - 1, Math.floor(((value - minValue) / (maxValue - minValue)) * bins));
    counts[index] = (counts[index] ?? 0) + 1;
  }

  const maxCount = Math.max(...counts, 1);
  const barGap = 4;
  const barWidth = (width - barGap * (bins - 1)) / bins;

  return {
    bars: counts.map((count, index) => {
      const barHeight = (count / maxCount) * height;

      return {
        height: barHeight,
        width: barWidth,
        x: index * (barWidth + barGap),
        y: height - barHeight,
      };
    }),
  };
}

function createFormDraft(scenario: ScenarioInput): FormDraft {
  return {
    annualInflationAdjustment:
      scenario.retirementStrategy.mode === "fixed-dollars"
        ? formatPercentDraft(scenario.retirementStrategy.annualInflationAdjustment)
        : formatPercentDraft(0.025),
    annualSavings: String(scenario.annualSavings),
    annualSpending:
      scenario.retirementStrategy.mode === "fixed-dollars"
        ? String(scenario.retirementStrategy.annualSpending)
        : "50000",
    currentPortfolio: String(scenario.currentPortfolio),
    mode: scenario.retirementStrategy.mode,
    numberOfSimulations: String(scenario.numberOfSimulations),
    retirementStartYear: String(scenario.retirementStartYear),
    withdrawalRate:
      scenario.retirementStrategy.mode === "percent-of-portfolio"
        ? formatPercentDraft(scenario.retirementStrategy.withdrawalRate)
        : String(DEFAULT_PERCENT_WITHDRAWAL_RATE),
    yearsInRetirement: String(scenario.yearsInRetirement),
  };
}

function parseDraftNumber(rawValue: string): number {
  const normalizedValue = rawValue
    .trim()
    .replaceAll(",", "")
    .replaceAll("$", "")
    .replaceAll("_", "");

  if (normalizedValue === "") {
    return 0;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function parseDraftPercent(rawValue: string): number {
  return parseDraftNumber(rawValue) / 100;
}

function formatPercentDraft(decimalValue: number): string {
  return decimalValue % 1 === 0
    ? String(decimalValue * 100)
    : String(decimalValue * 100).replace(/\.0+$/, "");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatSummaryCardValue(cardId: string, value: number | null): string {
  if (value == null) {
    return "n/a";
  }

  if (cardId === "survival-probability") {
    return `${Math.round(value * 100)}%`;
  }

  return formatCurrency(value);
}

function formatSpendingPanelValue(detail: SpendingPanelDetail): string {
  if (detail.value == null) {
    return "Pending";
  }

  if (detail.valueKind === "percent") {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
      style: "percent",
    }).format(detail.value);
  }

  return formatCurrency(detail.value);
}

function formatDistributionCurrency(value: number): string {
  if (Math.abs(value) >= 10000000) {
    const millions = Math.round(Math.abs(value) / 1000000);
    return `${value < 0 ? "-" : ""}$${millions}M`;
  }

  return formatCurrency(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function shortCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
    style: "currency",
  }).format(value);
}

function buildPendingSpendingPanel(scenario: ScenarioInput): SpendingPanelViewModel {
  if (scenario.retirementStrategy.mode === "fixed-dollars") {
    return {
      details: [
        {
          label: "Year 1 target",
          value: scenario.retirementStrategy.annualSpending,
        },
        {
          label: `Year ${scenario.yearsInRetirement} target`,
          value:
            scenario.retirementStrategy.annualSpending *
            (1 + scenario.retirementStrategy.annualInflationAdjustment) **
              Math.max(0, scenario.yearsInRetirement - 1),
        },
        {
          label: "Inflation adjustment",
          value: scenario.retirementStrategy.annualInflationAdjustment,
          valueKind: "percent",
        },
      ],
      headline: "Fixed spending target",
      id: "fixed-dollars",
      summary:
        "Run the simulation to see how often this inflation-adjusted target survives retirement.",
    };
  }

  return {
    details: [
      {
        label: "Withdrawal rate",
        value: scenario.retirementStrategy.withdrawalRate,
        valueKind: "percent",
      },
      {
        label: "Median year 1 income",
        value: null,
      },
      {
        label: "Year 10 income (p10)",
        value: null,
      },
    ],
    headline: "Variable retirement income",
    id: "percent-of-portfolio",
    summary:
      "Run the simulation to see the implied spending distribution for this withdrawal rule.",
  };
}
