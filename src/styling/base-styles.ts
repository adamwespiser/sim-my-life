import { defaultThemeValues, hostThemeTokens } from "./tokens";

const hostTokenDefaults = Object.entries(defaultThemeValues)
  .map(([token, value]) => `  ${token}: ${value};`)
  .join("\n");

export const baseStyles = `
:host {
${hostTokenDefaults}
  display: block;
  inline-size: 100%;
  box-sizing: border-box;
  background: var(${hostThemeTokens.colorBackground});
  color: var(${hostThemeTokens.colorForeground});
  font-family: var(${hostThemeTokens.fontBody});
}

:host([hidden]) {
  display: none;
}

:host,
:host *,
:host *::before,
:host *::after {
  box-sizing: border-box;
}

:host * {
  min-width: 0;
}

:host button,
:host input,
:host select,
:host textarea {
  color: inherit;
  font: inherit;
}

:host img,
:host canvas,
:host svg {
  display: block;
  max-inline-size: 100%;
}
`;
