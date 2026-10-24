// Run with: node --experimental-vm-modules tests/navigation.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
async function setup(width) {
  const document = {}, window = {}, nodes = new Map();
  function $(key) {
    if (nodes.has(key)) return nodes.get(key);
    const n = {length: 1, visible: true, attrs: {}, styles: {}, events: {}, classes: {},
      ready(fn) { fn(); }, find(k) { return $(k); },
      on(e, fn) { this.events[e] = fn; return this; },
      width() { return width; }, scrollTop() { return window.scrollY || 0; },
      offset() { return {top: (window.scrollY || 0) + 32}; },
      css(k,v) { if(v === undefined) return this.styles[k]; this.styles[k]=v; return this; },
      attr(k,v) { this.attrs[k]=v; return this; },
      toggleClass(k,v) { this.classes[k]=v; return this; },
      is() { return this.visible; },
      toggle(v) { this.visible=v; return this; },
      hide() { return this.toggle(false); }, show() { return this.toggle(true); },
      add(other) {
        const group = {};
        for (const method of ['toggleClass','attr','on']) group[method] = (...args) => {
          this[method](...args); other[method](...args); return group;
        };
        return group;
      }
    };
    nodes.set(key,n); return n;
  }
  const context = vm.createContext({$,document,window});
  function load(filename) {
    return new vm.SourceTextModule(fs.readFileSync(filename, 'utf8'), {
      context, identifier: filename
    });
  }
  const entry = load(path.resolve(__dirname, '../static/js/main.js'));
  await entry.link((specifier, parent) => load(path.resolve(path.dirname(parent.identifier), specifier)));
  await entry.evaluate();
  return {$, scroll(y) {window.scrollY=y; $(window).events.scroll();}};
}
async function main() {
  let {$,scroll} = await setup(1200);
  assert.equal($('#menu').styles.visibility, 'hidden');
  assert.equal($('#menu-icon').attrs['aria-expanded'], 'false');
  $('#menu-icon').events.click({preventDefault(){}});
  assert.equal($('#menu').styles.visibility, 'visible');
  assert.equal($('#menu-icon-tablet').attrs['aria-expanded'], 'true');
  $('#menu-icon').events.click({preventDefault(){}});
  assert.equal($('#menu').styles.visibility, 'hidden');
  $('#menu-icon-tablet').visible = false;
  scroll(150);
  assert.equal($('#menu > #nav').visible, false);
  assert.equal($('#menu-icon-tablet').visible, false, 'desktop scroll must not toggle tablet controls');
  assert.equal($('#footer-post').visible, false);
  scroll(120);
  assert.equal($('#footer-post').visible, true);
  assert.equal($('#nav-footer, #toc-footer, #share-footer').visible, false);
  scroll(0);
  assert.equal($('#menu > #nav').visible, true);
  assert.equal($('#actions-footer > #top').visible, false);
  ({$,scroll} = await setup(800));
  $('#menu-icon').visible = false;
  scroll(150);
  assert.equal($('#menu-icon-tablet').visible, false);
  assert.equal($('#top-icon-tablet').visible, true);
  scroll(0);
  assert.equal($('#menu-icon-tablet').visible, true);
  assert.equal($('#top-icon-tablet').visible, false);
  ({$} = await setup(1440));
  assert.equal($('#menu').styles.visibility, 'visible');
  console.log('Navigation checks passed: toggle state, desktop/tablet scrolling, mobile direction, wide-screen default.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
