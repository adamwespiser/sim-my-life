import { baseStyles } from "../styling/base-styles";
import { hostThemeTokens } from "../styling/tokens";

export const appShellStyles = `
${baseStyles}

:host {
  padding: var(${hostThemeTokens.space4});
}

.shell {
  display: grid;
  gap: var(${hostThemeTokens.space4});
  margin-inline: auto;
  max-inline-size: 1120px;
}

.panel {
  border: 1px solid var(${hostThemeTokens.colorBorder});
  border-radius: var(${hostThemeTokens.radiusLarge});
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.92)),
    var(${hostThemeTokens.colorSurface});
  box-shadow: 0 18px 40px rgba(31, 26, 23, 0.08);
  padding: var(${hostThemeTokens.space5});
}

.intro {
  display: grid;
  gap: var(${hostThemeTokens.space3});
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.14), transparent 35%),
    linear-gradient(135deg, rgba(255, 250, 244, 0.95), rgba(244, 239, 230, 0.9));
}

.eyebrow {
  color: var(${hostThemeTokens.colorAccent});
  font-family: var(${hostThemeTokens.fontMono});
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
}

.title {
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.02;
  margin: 0;
}

.lede,
.methodology-copy,
.source-note,
.placeholder-copy,
.card-meta {
  color: var(${hostThemeTokens.colorMuted});
  line-height: 1.55;
  margin: 0;
}

.summary-grid,
.distribution-grid {
  display: grid;
  gap: var(${hostThemeTokens.space3});
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.distribution-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.card,
.distribution-card,
.placeholder {
  border: 1px solid var(${hostThemeTokens.colorBorder});
  border-radius: var(${hostThemeTokens.radiusMedium});
  background: rgba(255, 255, 255, 0.72);
  padding: var(${hostThemeTokens.space4});
}

.card-label,
.distribution-label,
.section-label {
  color: var(${hostThemeTokens.colorMuted});
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  margin: 0 0 var(${hostThemeTokens.space2});
  text-transform: uppercase;
}

.card-value {
  font-size: 1.7rem;
  line-height: 1.1;
  margin: 0 0 var(${hostThemeTokens.space2});
}

.spending-panel {
  border: 1px solid var(${hostThemeTokens.colorBorder});
  border-radius: var(${hostThemeTokens.radiusMedium});
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(255, 255, 255, 0.82)),
    rgba(255, 255, 255, 0.72);
  display: grid;
  gap: var(${hostThemeTokens.space3});
  margin-top: var(${hostThemeTokens.space3});
  padding: var(${hostThemeTokens.space4});
}

.spending-panel[data-mode="percent-of-portfolio"] {
  background:
    linear-gradient(135deg, rgba(183, 121, 31, 0.12), rgba(255, 255, 255, 0.82)),
    rgba(255, 255, 255, 0.72);
}

.spending-panel-title {
  font-size: 1.2rem;
  margin: 0 0 var(${hostThemeTokens.space2});
}

.spending-panel-copy {
  display: grid;
  gap: var(${hostThemeTokens.space2});
}

.spending-panel-details {
  display: grid;
  gap: var(${hostThemeTokens.space2});
  margin: 0;
}

.spending-panel-row {
  align-items: baseline;
  display: flex;
  font-family: var(${hostThemeTokens.fontMono});
  gap: var(${hostThemeTokens.space2});
  justify-content: space-between;
}

.spending-panel-row dt {
  color: var(${hostThemeTokens.colorMuted});
}

.spending-panel-row dd {
  margin: 0;
}

.controls-grid {
  display: grid;
  gap: var(${hostThemeTokens.space3});
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.field {
  display: grid;
  gap: var(${hostThemeTokens.space2});
}

.field[hidden] {
  display: none;
}

.field[data-invalid="true"] input,
.field[data-invalid="true"] select {
  border-color: #b42318;
  box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.12);
}

.field label {
  font-size: 0.95rem;
  font-weight: 600;
}

.field input,
.field select,
.field button {
  appearance: none;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(${hostThemeTokens.colorBorder});
  border-radius: var(${hostThemeTokens.radiusSmall});
  padding: 0.78rem 0.92rem;
  transition:
    border-color var(${hostThemeTokens.motionFast}) ease,
    transform var(${hostThemeTokens.motionFast}) ease,
    box-shadow var(${hostThemeTokens.motionFast}) ease;
}

.field input:focus,
.field select:focus,
.field button:focus {
  border-color: var(${hostThemeTokens.colorAccent});
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
  outline: none;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(${hostThemeTokens.space2});
  margin-top: var(${hostThemeTokens.space3});
}

.actions button {
  align-items: center;
  display: inline-flex;
  flex: 1 1 220px;
  font-size: 1rem;
  font-weight: 700;
  justify-content: center;
  min-block-size: 56px;
  padding: 0.95rem 1.35rem;
}

.status-stack {
  display: grid;
  gap: var(${hostThemeTokens.space3});
}

.status-badge {
  align-items: center;
  background: rgba(15, 118, 110, 0.1);
  border-radius: 999px;
  color: var(${hostThemeTokens.colorAccent});
  display: inline-flex;
  font-family: var(${hostThemeTokens.fontMono});
  font-size: 0.78rem;
  gap: var(${hostThemeTokens.space2});
  letter-spacing: 0.06em;
  padding: 0.42rem 0.72rem;
  text-transform: uppercase;
}

.status-badge[data-state="error"],
.status-badge[data-state="invalid"] {
  background: rgba(180, 35, 24, 0.1);
  color: #8f291d;
}

.status-badge[data-state="scheduled"],
.status-badge[data-state="canceled"] {
  background: rgba(183, 121, 31, 0.12);
  color: #8f5b17;
}

.status-list {
  display: grid;
  gap: var(${hostThemeTokens.space2});
  margin: 0;
}

.status-row {
  align-items: baseline;
  display: flex;
  gap: var(${hostThemeTokens.space2});
  justify-content: space-between;
}

.status-row dt {
  color: var(${hostThemeTokens.colorMuted});
}

.status-row dd {
  font-family: var(${hostThemeTokens.fontMono});
  margin: 0;
}

.validation-block {
  border: 1px solid rgba(180, 35, 24, 0.18);
  border-radius: var(${hostThemeTokens.radiusMedium});
  background: rgba(180, 35, 24, 0.06);
  margin-top: var(${hostThemeTokens.space3});
  padding: var(${hostThemeTokens.space3});
}

.validation-block ul {
  color: #7a271a;
  margin: var(${hostThemeTokens.space2}) 0 0;
  padding-left: 1.2rem;
}

.button-primary {
  background: var(${hostThemeTokens.colorAccent});
  border-color: transparent;
  color: #fff;
}

.button-secondary {
  background: rgba(255, 255, 255, 0.72);
}

.placeholder {
  min-block-size: 180px;
}

.chart-section {
  display: grid;
  gap: var(${hostThemeTokens.space4});
}

.chart-card {
  display: grid;
  gap: var(${hostThemeTokens.space3});
}

.run-state-panel {
  display: grid;
  gap: var(${hostThemeTokens.space2});
}

.chart-meta {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: var(${hostThemeTokens.space2});
}

.chart-frame {
  border: 1px solid var(${hostThemeTokens.colorBorder});
  border-radius: var(${hostThemeTokens.radiusMedium});
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.96)),
    var(${hostThemeTokens.colorSurface});
  overflow: hidden;
  padding: var(${hostThemeTokens.space2});
}

.chart-svg {
  inline-size: 100%;
}

.chart-axis {
  fill: var(${hostThemeTokens.colorMuted});
  font-family: var(${hostThemeTokens.fontMono});
  font-size: 11px;
}

.chart-retirement-zone {
  fill: rgba(183, 121, 31, 0.08);
}

.chart-retirement-line {
  stroke: var(${hostThemeTokens.chartRetirement});
  stroke-dasharray: 6 4;
  stroke-width: 2;
}

.chart-band {
  fill: var(${hostThemeTokens.chartBand});
}

.chart-line {
  fill: none;
  stroke: var(${hostThemeTokens.chartPath});
  stroke-width: 1.6;
}

.chart-line-median {
  fill: none;
  stroke: var(${hostThemeTokens.chartMedian});
  stroke-width: 2.75;
}

.chart-hover-line {
  stroke: var(${hostThemeTokens.colorAccent});
  stroke-dasharray: 3 4;
  stroke-width: 1.5;
}

.chart-failure-marker {
  fill: var(${hostThemeTokens.chartFailure});
}

.chart-hitbox {
  fill: transparent;
  cursor: pointer;
}

.distribution-bars {
  block-size: 120px;
  inline-size: 100%;
}

.distribution-axis {
  color: var(${hostThemeTokens.colorMuted});
  display: grid;
  font-family: var(${hostThemeTokens.fontMono});
  font-size: 0.76rem;
  gap: var(${hostThemeTokens.space1});
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: var(${hostThemeTokens.space2});
}

.distribution-axis span:nth-child(2) {
  text-align: center;
}

.distribution-axis span:nth-child(3) {
  text-align: right;
}

.distribution-bar {
  fill: var(${hostThemeTokens.colorAccent});
}

.distribution-stats {
  display: grid;
  gap: var(${hostThemeTokens.space2});
  margin-top: var(${hostThemeTokens.space3});
}

.distribution-stat-row {
  align-items: baseline;
  display: flex;
  font-family: var(${hostThemeTokens.fontMono});
  justify-content: space-between;
}

.distribution-caption {
  color: var(${hostThemeTokens.colorMuted});
  font-size: 0.92rem;
  margin: 0;
}

.section-title {
  font-size: 1.35rem;
  margin: 0 0 var(${hostThemeTokens.space3});
}

.methodology-list {
  display: grid;
  gap: var(${hostThemeTokens.space2});
  margin: var(${hostThemeTokens.space3}) 0 0;
  padding-left: 1.2rem;
}

@media (min-width: 840px) {
  :host {
    padding: var(${hostThemeTokens.space5});
  }

  .shell {
    gap: var(${hostThemeTokens.space5});
  }

}
`;
