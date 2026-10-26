// Run with: node --experimental-vm-modules tests/navigation.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

class Element {
  constructor(id = '') {
    this.id = id;
    this.style = {};
    this.attributes = {};
    this.events = {};
    this.children = new Map();
    const classes = new Set();
    this.classList = {
      contains: name => classes.has(name),
      toggle(name, force = !classes.has(name)) {
        if (force) classes.add(name);
        else classes.delete(name);
        return force;
      },
    };
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, handler) { this.events[name] = handler; }
  querySelector(selector) { return this.children.get(selector) || null; }
  querySelectorAll() { return []; }
  getClientRects() { return this.style.display === 'none' ? [] : [{}]; }
  getBoundingClientRect() { return { top: 32 }; }
  click() { this.events.click({ preventDefault() {} }); }
}

async function setup(width, post = true) {
  const ids = new Map(['menu', 'nav', 'menu-icon', 'menu-icon-tablet', 'top-icon-tablet',
    'footer-post', 'nav-footer', 'toc-footer', 'share-footer', 'top'].map(id => [id, new Element(id)]));
  const nav = new Element();
  const toggle = new Element();
  nav.children.set('.icon a', toggle);
  ids.get('menu').children.set('#nav', ids.get('nav'));
  const document = {
    readyState: 'interactive',
    documentElement: { clientWidth: width },
    getElementById: id => ids.get(id) || null,
    querySelector(selector) {
      return { '#header > #nav > ul': nav, '.post': post ? new Element() : null,
        '#actions-footer > #top': ids.get('top') }[selector] || null;
    },
    querySelectorAll(selector) {
      return selector === '#nav-footer, #toc-footer, #share-footer'
        ? ['nav-footer', 'toc-footer', 'share-footer'].map(id => ids.get(id)) : [];
    },
  };
  const window = { scrollY: 0, events: {}, addEventListener(name, handler) { this.events[name] = handler; } };
  const context = vm.createContext({ document, window, getComputedStyle: element => element.style });
  const modules = new Map();
  function load(filename) {
    if (!modules.has(filename)) {
      modules.set(filename, new vm.SourceTextModule(fs.readFileSync(filename, 'utf8'), {
        context, identifier: filename,
      }));
    }
    return modules.get(filename);
  }
  const entry = load(path.resolve(__dirname, '../assets/js/main.js'));
  await entry.link((specifier, parent) => load(path.resolve(path.dirname(parent.identifier), specifier)));
  await entry.evaluate();
  return { ids, nav, toggle, window, scroll(y) { window.scrollY = y; window.events.scroll(); } };
}

async function main() {
  let state = await setup(1200);
  let { ids } = state;
  assert.equal(ids.get('menu').style.visibility, 'hidden');
  ids.get('menu-icon').click();
  assert.equal(ids.get('menu').style.visibility, 'visible');
  assert.equal(ids.get('menu-icon-tablet').attributes['aria-expanded'], 'true');
  ids.get('menu-icon').click();
  assert.equal(ids.get('menu').style.visibility, 'hidden');
  ids.get('menu-icon-tablet').style.display = 'none';
  state.scroll(150);
  assert.equal(ids.get('nav').style.display, 'none');
  assert.equal(ids.get('menu-icon-tablet').style.display, 'none');
  assert.equal(ids.get('footer-post').style.display, 'none');
  state.scroll(120);
  assert.equal(ids.get('footer-post').style.display, '');
  for (const id of ['nav-footer', 'toc-footer', 'share-footer']) assert.equal(ids.get(id).style.display, 'none');
  state.scroll(0);
  assert.equal(ids.get('nav').style.display, '');
  assert.equal(ids.get('top').style.display, 'none');

  state = await setup(800);
  ids = state.ids;
  ids.get('menu-icon').style.display = 'none';
  state.scroll(150);
  assert.equal(ids.get('menu-icon-tablet').style.display, 'none');
  assert.equal(ids.get('top-icon-tablet').style.display, '');
  state.scroll(0);
  assert.equal(ids.get('menu-icon-tablet').style.display, '');
  assert.equal(ids.get('top-icon-tablet').style.display, 'none');

  state = await setup(1440);
  assert.equal(state.ids.get('menu').style.visibility, 'visible');
  state = await setup(390, false);
  assert.equal(state.window.events.scroll, undefined);
  state.toggle.click();
  assert.equal(state.nav.classList.contains('responsive'), true);
  state.toggle.click();
  assert.equal(state.nav.classList.contains('responsive'), false);
  console.log('PASS: native navigation state, scrolling, responsive defaults and header menu.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
