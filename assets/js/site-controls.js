import { createMovingPoints } from "./canvas-nest.js";

function readPreference(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writePreference(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}
function getDefaultTheme() {
  return document.documentElement.dataset.defaultTheme;
}
function getSavedTheme() {
  return readPreference('theme') || getDefaultTheme();
}
function saveTheme(theme) {
  writePreference('theme', theme);
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.dark-mode-toggle-btn').forEach(button => {
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  });
}
function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme;
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
  const saved = readPreference('bganim-enabled');
  const defaultEnabled = window.innerWidth >= 480
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const savedEnabled = saved === 'true';
  return saved === null ? defaultEnabled : savedEnabled;
}
function saveEnabledState(enabled) {
  writePreference('bganim-enabled', enabled);
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
    movingPoints?.stopAnimation();
  }
}
function toggleEnabledState() {
  const currentEnabledState = document.documentElement.dataset.bganimEnabled === 'true';
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
      applyTheme(e.newValue || getDefaultTheme());
    } else if (e.key === "bganim-enabled") {
      applyEnabledState(getSavedEnabledState());
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
