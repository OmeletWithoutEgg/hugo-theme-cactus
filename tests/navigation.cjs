// Run with: node --experimental-vm-modules tests/navigation.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

async function main() {
  const events = {};
  const document = {
    activeElement: null,
    addEventListener(name, listener) { events[name] = listener; },
  };
  class Element {
    constructor(tagName = 'DIV') {
      this.tagName = tagName;
      this.hidden = true;
      this.open = false;
      this.children = [];
      this.attributes = {};
    }
    contains(target) { return this === target || this.children.includes(target); }
    setAttribute(name, value) { this.attributes[name] = value; }
    querySelector() { return this.children[0] || null; }
    focus() { document.activeElement = this; }
  }
  const context = vm.createContext({ document });
  const module = new vm.SourceTextModule(
    fs.readFileSync(path.resolve(__dirname, '../assets/js/navigation/panels.js'), 'utf8'),
    { context },
  );
  await module.link(() => { throw new Error('Unexpected import'); });
  await module.evaluate();
  const { createPanel, initPanelDismissal } = module.namespace;
  const menu = new Element(), menuButton = new Element('BUTTON'), link = new Element('A');
  menu.children.push(link);
  const mobile = createPanel(menu, menuButton, { focusOnOpen: true });
  const details = new Element('DETAILS'), summary = new Element('SUMMARY');
  details.children.push(summary);
  const native = createPanel(details, summary);
  const toc = new Element(), tocButton = new Element('BUTTON');
  let medium = true;
  const contents = createPanel(toc, tocButton, { isActive: () => medium });
  initPanelDismissal([mobile, native, contents]);

  mobile.setOpen(true);
  assert.equal(menuButton.attributes['aria-expanded'], 'true');
  assert.equal(document.activeElement, link);
  events.click({ target: link });
  assert(mobile.isOpen(), 'Clicking inside a panel must not dismiss it');
  events.click({ target: menuButton });
  assert(mobile.isOpen(), 'Opening click must not dismiss its own panel');
  events.keydown({ key: 'Escape' });
  assert(!mobile.isOpen());
  assert.equal(menuButton.attributes['aria-expanded'], 'false');
  assert.equal(document.activeElement, menuButton);

  details.open = true; // Native summary activation owns this state.
  events.click({ target: summary });
  assert(native.isOpen());
  events.click({ target: new Element() });
  assert(!native.isOpen());
  native.setOpen(true);
  summary.focus();
  events.keydown({ key: 'Escape' });
  assert(!native.isOpen());
  assert.equal(document.activeElement, summary);

  contents.setOpen(true);
  tocButton.focus();
  events.keydown({ key: 'Escape' });
  assert(!contents.isOpen());
  assert.equal(document.activeElement, tocButton);
  medium = false;
  contents.setOpen(true);
  events.click({ target: new Element() });
  events.keydown({ key: 'Escape' });
  assert(contents.isOpen(), 'The permanent wide-screen TOC must remain visible');

  // Multiple open panels close together, but focus returns to the relevant trigger.
  medium = true;
  mobile.setOpen(true);
  native.setOpen(true);
  summary.focus();
  events.keydown({ key: 'Escape' });
  assert(!mobile.isOpen() && !native.isOpen() && !contents.isOpen());
  assert.equal(document.activeElement, summary);

  console.log('PASS: panel dismissal, native details, focus restoration and permanent TOC');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
