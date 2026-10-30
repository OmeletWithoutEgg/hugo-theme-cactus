import { createMovingPoints } from "./canvas-nest.js";

function getSavedTheme() {
  return localStorage.getItem('theme') || 'dark';
}
function saveTheme(theme) {
  localStorage.setItem('theme', theme);
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.dark-mode-toggle-btn').forEach(button => {
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  });
}
function toggleTheme() {
  const currentTheme = getSavedTheme();
  const newTheme = currentTheme === 'dark' ? 'white' : 'dark';
  applyTheme(newTheme);
  saveTheme(newTheme);
}
let movingPoints = null;
function initMovingPoints() {
  if (movingPoints !== null) return;
  movingPoints = createMovingPoints({
    canvas: document.getElementById("bganim-canvas"),
    config: {
      count: 90,
      color: "0,200,100",
      opacity: 0.5,
    }
  });
}
function getSavedEnabledState() {
  const saved = localStorage.getItem('bganim-enabled');
  const defaultEnabled = window.innerWidth >= 480
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const savedEnabled = saved === 'true';
  return saved === null ? defaultEnabled : savedEnabled;
}
function saveEnabledState(enabled) {
  localStorage.setItem('bganim-enabled', enabled);
}
function applyEnabledState(enabled) {
  document.documentElement.setAttribute('data-bganim-enabled', enabled);
  document.querySelectorAll('.bganim-toggle-btn').forEach(button => {
    button.setAttribute('aria-pressed', String(enabled));
  });
  if (enabled) {
    initMovingPoints();
    movingPoints.startAnimation();
  } else {
    if (movingPoints !== null) {
      movingPoints.stopAnimation();
    }
  }
}
function toggleEnabledState() {
  const currentEnabledState = getSavedEnabledState();
  const newEnabledState = !currentEnabledState;
  applyEnabledState(newEnabledState);
  saveEnabledState(newEnabledState);
}
function bindControls() {
  for (const [selector, handler] of [
    [".dark-mode-toggle-btn", toggleTheme],
    [".bganim-toggle-btn", toggleEnabledState],
  ]) {
    document.querySelectorAll(selector).forEach(button => {
      button.addEventListener("click", handler);
    });
  }
}

function initSiteControls() {
  window.addEventListener("storage", function(e) {
    if (e.key === "theme") {
      applyTheme(e.newValue || "dark");
    } else if (e.key === "bganim-enabled") {
      applyEnabledState(e.newValue === "true");
    }
  });

  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function() {
    applyEnabledState(getSavedEnabledState());
  });

  applyTheme(getSavedTheme());
  applyEnabledState(getSavedEnabledState());
  bindControls();
}

document.addEventListener("DOMContentLoaded", initSiteControls);
