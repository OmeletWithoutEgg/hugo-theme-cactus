// Adapt custom hidden panels and native <details> to the same dismissal behavior.
export function createPanel(element, trigger, { isActive = () => true, focusOnOpen = false } = {}) {
  const native = element.tagName === "DETAILS";
  return {
    element,
    trigger,
    isActive,
    isOpen: () => native ? element.open : !element.hidden,
    contains: target => element.contains(target) || trigger?.contains(target),
    setOpen(open) {
      if (native) element.open = open;
      else {
        element.hidden = !open;
        trigger?.setAttribute("aria-expanded", String(open));
      }
      if (open && focusOnOpen) element.querySelector("button, a, .panel-empty")?.focus();
    },
  };
}

export function initPanelDismissal(panels) {
  document.addEventListener("click", event => {
    panels.forEach(panel => {
      if (panel.isActive() && panel.isOpen() && !panel.contains(event.target)) panel.setOpen(false);
    });
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const open = panels.filter(panel => panel.isActive() && panel.isOpen());
    const focused = open.find(panel => panel.contains(document.activeElement)) || open[0];
    open.forEach(panel => panel.setOpen(false));
    focused?.trigger?.focus();
  });
}
