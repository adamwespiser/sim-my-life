import { runDefaultScenarioAndMeasure } from "./browser-harness.mjs";

const firstVisibleBudgetMs = 500;
const completionBudgetMs = 2000;

const result = await runDefaultScenarioAndMeasure();

console.log("Default scenario performance");
console.log(`First visible update: ${result.firstVisibleUpdateMs.toFixed(2)} ms`);
console.log(`Completion: ${result.completionMs.toFixed(2)} ms`);
console.log(
  `First visible budget (${firstVisibleBudgetMs} ms): ${passFail(result.firstVisibleUpdateMs <= firstVisibleBudgetMs)}`,
);
console.log(
  `Completion budget (${completionBudgetMs} ms): ${passFail(result.completionMs <= completionBudgetMs)}`,
);

function passFail(passed) {
  return passed ? "pass" : "fail";
}
