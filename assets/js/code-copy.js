import ClipboardJS from "./vendor/clipboard.min.js";
import { copyIcon } from "@params";

function initCodeCopy() {
  const targets = new Map();
  const blocks = new Set();
  document.querySelectorAll("pre").forEach(pre => {
    blocks.add(pre.closest(".highlight") || pre);
  });

  for (const block of blocks) {
    // In table layouts the first code element contains only line numbers.
    const code = block.querySelector("code[data-lang]") || block.querySelector("code");
    if (!code) continue;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-copy tooltipped tooltipped-sw";
    button.setAttribute("aria-label", "Copy to clipboard!");
    button.innerHTML = copyIcon;
    block.prepend(button);
    targets.set(button, code);
  }

  if (!targets.size) return;
  const clipboard = new ClipboardJS(document.querySelectorAll(".highlight > .btn-copy, pre > .btn-copy"), {
    text: trigger => {
      const copy = targets.get(trigger).cloneNode(true);
      // Chroma emits classes with noClasses=false and inline styles otherwise.
      copy.querySelectorAll('.ln, .lnt, .lnlinks, span[style*="user-select:none"], span[style*="user-select: none"]')
        .forEach(number => number.remove());
      return copy.textContent;
    },
  });
  clipboard.on("success", event => {
    event.trigger.setAttribute("aria-label", "Copied!");
    event.clearSelection();
  });
  clipboard.on("error", event => {
    event.trigger.setAttribute("aria-label", "Copy failed; select the code to copy.");
  });
  for (const button of targets.keys()) {
    button.addEventListener("mouseleave", () => button.setAttribute("aria-label", "Copy to clipboard!"));
    button.addEventListener("blur", () => button.setAttribute("aria-label", "Copy to clipboard!"));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCodeCopy, { once: true });
} else {
  initCodeCopy();
}
