const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

async function setup(theme, saved = {}, blocked = false) {
  const preferences = new Map(Object.entries(saved));
  const dataset = { theme };
  const events = {};
  const buttons = selector => groups[selector];
  const makeButton = () => ({
    attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(key, handler) { this[key] = handler; },
  });
  const groups = {
    ".dark-mode-toggle-btn": [makeButton(), makeButton()],
    ".bganim-toggle-btn": [makeButton(), makeButton()],
  };
  let running = false;
  const context = vm.createContext({
    document: {
      documentElement: {
        dataset,
        setAttribute(key, value) {
          dataset[key === "data-theme" ? "theme" : "bganimEnabled"] = String(value);
        },
      },
      querySelectorAll: buttons,
      getElementById: () => ({}),
      addEventListener: (event, handler) => { events[event] = handler; },
    },
    window: {
      innerWidth: 1000,
      matchMedia: query => ({ matches: query === "(min-width: 480px)", addEventListener() {} }),
      addEventListener: (event, handler) => { events[event] = handler; },
    },
    localStorage: {
      getItem(key) {
        if (blocked) throw new Error("Storage unavailable");
        return preferences.get(key) ?? null;
      },
      setItem(key, value) {
        if (blocked) throw new Error("Storage unavailable");
        preferences.set(key, String(value));
      },
    },
  });
  const bootstrap = fs.readFileSync(path.join(root, "layouts/_partials/head.html"), "utf8")
    .match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(bootstrap, context);
  const initialTheme = dataset.theme;
  const animation = new vm.SyntheticModule(["createMovingPoints"], function() {
    this.setExport("createMovingPoints", () => ({
      startAnimation() { running = true; },
      stopAnimation() { running = false; },
    }));
  }, { context });
  const module = new vm.SourceTextModule(
    fs.readFileSync(path.join(root, "assets/js/site-controls.js"), "utf8"), { context });
  await module.link(() => animation);
  await module.evaluate();
  events.DOMContentLoaded();
  return { dataset, initialTheme, events, groups, preferences, running: () => running };
}

async function main() {
  for (const theme of ["dark", "white", "light", "classic"]) {
    const state = await setup(theme);
    assert.equal(state.initialTheme, theme, "First paint respects colortheme");
    assert.equal(state.dataset.theme, theme, "Initialization respects colortheme");
  }
  const state = await setup("classic", { theme: "white", "bganim-enabled": "false" });
  assert.equal(state.initialTheme, "white", "Saved preference wins before first paint");
  assert.equal(state.running(), false);
  state.groups[".dark-mode-toggle-btn"][0].click();
  assert.equal(state.preferences.get("theme"), "dark");
  assert.ok(state.groups[".dark-mode-toggle-btn"].every(b => b.attributes["aria-pressed"] === "true"));
  state.groups[".dark-mode-toggle-btn"][1].click();
  assert.equal(state.dataset.theme, "white");
  state.groups[".bganim-toggle-btn"][1].click();
  assert.equal(state.running(), true);
  assert.ok(state.groups[".bganim-toggle-btn"].every(b => b.attributes["aria-pressed"] === "true"));
  state.preferences.delete("theme");
  state.events.storage({ key: "theme", newValue: null });
  assert.equal(state.dataset.theme, "classic", "Removing preference restores configured theme");
  state.preferences.set("bganim-enabled", "false");
  state.events.storage({ key: "bganim-enabled", newValue: "false" });
  assert.equal(state.running(), false);

  const blocked = await setup("light", {}, true);
  blocked.groups[".dark-mode-toggle-btn"][0].click();
  assert.equal(blocked.dataset.theme, "dark");
  blocked.groups[".dark-mode-toggle-btn"][1].click();
  assert.equal(blocked.dataset.theme, "white", "Repeated toggles work without storage");
  blocked.groups[".bganim-toggle-btn"][0].click();
  assert.equal(blocked.running(), false);
  blocked.groups[".bganim-toggle-btn"][1].click();
  assert.equal(blocked.running(), true);
  console.log("PASS: configured themes, saved preferences, synchronized controls and unavailable storage.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
