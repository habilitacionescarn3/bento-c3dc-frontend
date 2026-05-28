/**
 * Suppress known third-party / DOM noise in Jest output (no package upgrades required).
 * Patches after Jest installs its console buffer so filtered messages never appear in output.
 */

const { format } = require('util');

const SUPPRESSED = [
  /createMuiTheme function was renamed to createTheme/i,
  /React Router Future Flag Warning/i,
  /Invalid DOM property.*stroke-dasharray/i,
  /CustomBreadcrumb/i,
];

function shouldSuppress(args) {
  const text = format(...args);
  return SUPPRESSED.some((pattern) => pattern.test(text));
}

function installConsoleFilters() {
  const errorSink = console.error;
  const warnSink = console.warn;

  console.error = (...args) => {
    if (shouldSuppress(args)) return;
    errorSink(...args);
  };

  console.warn = (...args) => {
    if (shouldSuppress(args)) return;
    warnSink(...args);
  };
}

// Re-apply after Jest's jsdom environment replaces console (once per worker).
installConsoleFilters();

// Some suites re-bind console when loading heavy UI; filter again before each file.
beforeAll(() => {
  installConsoleFilters();
});
