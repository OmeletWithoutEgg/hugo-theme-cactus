function initReadingLayout() {
  const mobile = window.matchMedia("(max-width: 799px)");
  const wide = window.matchMedia("(min-width: 1280px)");
  const header = document.querySelector(".reading-header");
  const siteMenu = document.querySelector(".reading-nav");
  const grid = document.querySelector(".reading-grid");
  const toc = document.querySelector(".reading-toc");
  const tocButton = document.querySelector(".medium-toc-toggle");
  const toolbar = document.querySelector(".reading-toolbar");
  const panels = [...document.querySelectorAll(".reading-mobile-panel")];
  const toggles = [...document.querySelectorAll(".mobile-panel-toggle")];

  function closePanels() {
    panels.forEach(panel => { panel.hidden = true; });
    toggles.forEach(button => button.setAttribute("aria-expanded", "false"));
  }

  function setTocVisible(visible) {
    if (!toc) return;
    toc.hidden = !visible;
    tocButton?.setAttribute("aria-expanded", String(visible));
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

  function initMobilePanels() {
    toggles.forEach(button => {
      button.addEventListener("click", () => {
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        const opening = panel.hidden;
        closePanels();
        panel.hidden = !opening;
        button.setAttribute("aria-expanded", String(opening));
        if (opening) panel.querySelector("button, a")?.focus();
      });
    });
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      const open = toggles.find(button => button.getAttribute("aria-expanded") === "true");
      closePanels();
      open?.focus();
    });
    document.addEventListener("click", event => {
      if (!event.target.closest(".reading-mobile-panel, .mobile-panel-toggle")) closePanels();
    });
  }

  function initToc() {
    if (!toc) return;
    tocButton?.addEventListener("click", () => setTocVisible(toc.hidden));
    document.addEventListener("click", event => {
      if (isMedium() && !event.target.closest(".reading-toc, .medium-toc-toggle")) {
        setTocVisible(false);
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && isMedium() && !toc.hidden) {
        setTocVisible(false);
        tocButton?.focus();
      }
    });
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
    let lastScrollTop = window.scrollY;
    function updateScrollControls() {
      const current = Math.max(0, window.scrollY);
      const panelOpen = toggles.some(button => button.getAttribute("aria-expanded") === "true");
      toolbar.classList.toggle("scroll-hidden", mobile.matches && !panelOpen && current > 60 && current > lastScrollTop);
      top.hidden = current < 200;
      mobileTop.hidden = current < 100;
      lastScrollTop = current;
    }
    updateScrollControls();
    window.addEventListener("scroll", updateScrollControls, { passive: true });
    window.addEventListener("pageshow", updateScrollControls);
  }

  placeNavigation();
  mobile.addEventListener("change", placeNavigation);
  wide.addEventListener("change", placeNavigation);
  initMobilePanels();
  initToc();
  initScrollControls();
  document.querySelectorAll(".floating-share, .floating-menu").forEach(initDropdown);
}

function initDropdown(dropdown) {
  document.addEventListener("click", event => {
    if (!dropdown.contains(event.target)) dropdown.open = false;
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && dropdown.open) {
      dropdown.open = false;
      dropdown.querySelector("summary").focus();
    }
  });
}

initReadingLayout();
