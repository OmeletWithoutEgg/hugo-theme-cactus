import { createPanel, initPanelDismissal } from "./navigation/panels.js";

function initReadingLayout() {
  const mobile = window.matchMedia("(max-width: 799px)");
  const wide = window.matchMedia("(min-width: 1280px)");
  const header = document.querySelector(".reading-header");
  const siteMenu = document.querySelector(".reading-nav");
  const grid = document.querySelector(".reading-grid");
  const toc = document.querySelector(".reading-toc");
  const tocButton = document.querySelector(".medium-toc-toggle");
  const toolbar = document.querySelector(".reading-toolbar");
  const toggles = [...document.querySelectorAll(".mobile-panel-toggle:not(:disabled)")];

  const panels = toggles.map(button => createPanel(
    document.getElementById(button.getAttribute("aria-controls")), button,
    { isActive: () => mobile.matches, focusOnOpen: true },
  ));
  const tocPanel = toc ? createPanel(toc, tocButton, { isActive: isMedium }) : null;
  const dropdowns = [...document.querySelectorAll(".floating-share, .floating-menu")]
    .map(element => createPanel(element, element.querySelector("summary")));

  function closePanels() {
    panels.forEach(panel => panel.setOpen(false));
  }

  function setTocVisible(visible) {
    tocPanel?.setOpen(visible);
  }

  function isMedium() {
    return !mobile.matches && !wide.matches;
  }

  function placeNavigation() {
    closePanels();
    toolbar.classList.remove("scroll-hidden");
    if (siteMenu) {
      const target = mobile.matches
        ? document.querySelector("#mobile-menu-panel .panel-content")
        : header;
      target.append(siteMenu);
    }
    if (toc) {
      const target = mobile.matches
        ? document.querySelector("#mobile-toc-panel .panel-content")
        : grid;
      if (mobile.matches) target.append(toc);
      else target.prepend(toc);
      setTocVisible(!isMedium());
    }
  }

  function initToolbarSize() {
    // Follow wrapping and font changes instead of assuming a fixed row count.
    const observer = new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize[0].blockSize;
      if (height > 0) {
        document.body.style.setProperty('--reading-toolbar-height', `${height}px`);
      }
    });
    observer.observe(toolbar, { box: "border-box" });
  }

  function initMobilePanels() {
    panels.forEach(panel => {
      panel.trigger.addEventListener("click", () => {
        const opening = !panel.isOpen();
        closePanels();
        panel.setOpen(opening);
      });
    });
  }

  function initToc() {
    if (!toc) return;
    tocButton?.addEventListener("click", () => setTocVisible(toc.hidden));
    toc.addEventListener("click", event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      if (isMedium()) setTocVisible(false);
      if (mobile.matches) {
        closePanels();
        const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      }
    });
  }

  function initScrollControls() {
    const top = document.querySelector(".reading-top");
    const mobileTop = document.querySelector(".mobile-top");
    let lastScrollTop = 0;
    let direction = 0;
    let distance = 0;
    function updateScrollControls(event) {
      const current = Math.max(0, window.scrollY);
      const delta = current - lastScrollTop;
      lastScrollTop = current;
      top.hidden = current < 200;
      mobileTop.disabled = current === 0;
      if (event.type === "pageshow") {
        direction = 0;
        distance = 0;
        return;
      }
      const panelOpen = toggles.some(button => button.getAttribute("aria-expanded") === "true");
      if (!mobile.matches || panelOpen || current <= 60) {
        toolbar.classList.remove("scroll-hidden");
        direction = 0;
        distance = 0;
        return;
      }
      if (delta === 0) return;
      const nextDirection = Math.sign(delta);
      if (nextDirection !== direction) distance = 0;
      direction = nextDirection;
      distance += Math.abs(delta);
      // Reveal with a short upward gesture; ignore small downward corrections.
      if (direction < 0 && distance >= 8) toolbar.classList.remove("scroll-hidden");
      if (direction > 0 && distance >= 48) toolbar.classList.add("scroll-hidden");
    }
    window.addEventListener("scroll", updateScrollControls, { passive: true });
    // Wait for page layout (including restored scroll) before reading scrollY.
    window.addEventListener("pageshow", updateScrollControls);
  }

  placeNavigation();
  mobile.addEventListener("change", placeNavigation);
  wide.addEventListener("change", placeNavigation);
  initToolbarSize();
  initMobilePanels();
  initToc();
  initScrollControls();
  initPanelDismissal([...panels, ...dropdowns, ...(tocPanel ? [tocPanel] : [])]);
  initScrollToTop();
}

function initScrollToTop() {
  document.querySelectorAll("[data-scroll-top]").forEach(control => {
    control.addEventListener("click", event => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
  });
}

initReadingLayout();
