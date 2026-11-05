import { initHeaderNavigation } from "./navigation/header.js";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeaderNavigation, { once: true });
} else {
  initHeaderNavigation();
}
