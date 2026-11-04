function initDisqus() {
  const container = document.getElementById("disqus_thread");
  if (!container) return;

  const button = container.querySelector("[data-disqus-load]");
  let observer;
  let started = false;

  function loadComments() {
    if (started) return;
    started = true;
    observer?.disconnect();
    button.disabled = true;
    button.textContent = "Loading comments…";

    const script = document.createElement("script");
    script.src = `https://${container.dataset.disqusShortname}.disqus.com/embed.js`;
    script.async = true;
    script.onload = () => button.remove();
    script.onerror = () => {
      script.remove();
      started = false;
      button.disabled = false;
      button.textContent = "Retry loading comments";
    };
    document.head.appendChild(script);
  }

  button.addEventListener("click", loadComments);
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadComments();
    }, { rootMargin: "600px 0px" });
    observer.observe(container);
  } else {
    loadComments();
  }
}

initDisqus();
