const mobile = window.matchMedia('(max-width: 799px)');
const wide = window.matchMedia('(min-width: 1280px)');
const siteMenu = document.querySelector('#header > #nav');
const toc = document.querySelector('.reading-toc');
const toggles = [...document.querySelectorAll('.mobile-panel-toggle')];
function closePanels() {
  document.querySelectorAll('.reading-mobile-panel').forEach(panel => { panel.hidden = true; });
  toggles.forEach(button => button.setAttribute('aria-expanded', 'false'));
}
function placeNavigation() {
  closePanels();
  document.querySelector(".reading-toolbar")?.classList.remove("scroll-hidden");
  document.body.classList.remove("toolbar-hidden");
  if (siteMenu) {
    if (mobile.matches) document.querySelector('#mobile-menu-panel .panel-content')?.append(siteMenu);
    else document.querySelector('#header')?.append(siteMenu);
  }
  if (toc) {
    mediumTocButton?.setAttribute('aria-expanded', 'false');
    toc.querySelector('details').open = true;
    toc.hidden = !mobile.matches && !wide.matches;
    toc.classList.remove('toc-open');
    if (mobile.matches) document.querySelector('#mobile-toc-panel .panel-content').append(toc);
    else document.querySelector('.reading-grid').prepend(toc);
  }
}
const mediumTocButton = document.querySelector('.medium-toc-toggle');
mediumTocButton?.addEventListener('click', () => {
  const toc = document.querySelector('.reading-toc');
  const opening = toc.hidden;
  toc.hidden = !opening;
  toc.classList.toggle('toc-open', opening);
  mediumTocButton.setAttribute('aria-expanded', String(opening));
});
document.addEventListener('click', event => {
  if (!mobile.matches && !wide.matches && !event.target.closest('.reading-toc, .medium-toc-toggle')) {
    const toc = document.querySelector('.reading-toc');
    if (toc) { toc.hidden = true; toc.classList.remove('toc-open'); }
    mediumTocButton?.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobile.matches && !wide.matches) {
    const toc = document.querySelector('.reading-toc');
    if (toc && !toc.hidden) {
      toc.hidden = true;
      toc.classList.remove('toc-open');
      mediumTocButton?.setAttribute('aria-expanded', 'false');
      mediumTocButton?.focus();
    }
  }
});
for (const button of toggles) {
  button.addEventListener('click', () => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const opening = panel.hidden;
    closePanels();
    panel.hidden = !opening;
    button.setAttribute('aria-expanded', String(opening));
    if (opening) panel.querySelector('button, a')?.focus();
  });
}
for (const button of document.querySelectorAll('[data-close-panel]')) {
  button.addEventListener('click', () => {
    const id = button.closest('.reading-mobile-panel').id;
    closePanels();
    document.querySelector(`[aria-controls="${id}"]`)?.focus();
  });
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    const open = toggles.find(button => button.getAttribute('aria-expanded') === 'true');
    closePanels();
    open?.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.reading-mobile-panel, .mobile-panel-toggle')) closePanels();
});
toc?.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || mobile.matches || wide.matches) return;
  toc.hidden = true;
  toc.classList.remove('toc-open');
  mediumTocButton?.setAttribute('aria-expanded', 'false');
});
document.querySelector('#mobile-toc-panel')?.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  closePanels();
  const toc = document.querySelector('.reading-toc');
  if (toc && !mobile.matches && !wide.matches) { toc.hidden = true; toc.classList.remove('toc-open'); mediumTocButton?.setAttribute('aria-expanded', 'false'); }
  const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
  if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({preventScroll:true}); }
});
placeNavigation();
mobile.addEventListener('change', placeNavigation);
wide.addEventListener('change', placeNavigation);

let lastScrollTop = window.scrollY;
window.addEventListener('scroll', () => {
  const current = Math.max(0, window.scrollY);
  const panelOpen = toggles.some(button => button.getAttribute('aria-expanded') === 'true');
  document.querySelector('.reading-toolbar')?.classList.toggle('scroll-hidden', mobile.matches && !panelOpen && current > 60 && current > lastScrollTop);
  document.querySelector(".reading-top").hidden = current < 200;
  document.querySelector(".mobile-top").hidden = current < 100;
  lastScrollTop = current;
}, {passive:true});

function initDropdown(dropdown) {
  document.addEventListener('click', event => {
    if (!dropdown.contains(event.target)) dropdown.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dropdown.open) {
      dropdown.open = false;
      dropdown.querySelector('summary').focus();
    }
  });
}
document.querySelectorAll('.floating-share, .floating-menu').forEach(initDropdown);
