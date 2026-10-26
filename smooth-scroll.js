// Heavy, inertia-style smooth scrolling (Lenis) for every page.
// Load lenis.min.js before this file. Exposes the instance as window.lenis
// so module scripts using GSAP's ScrollTrigger can sync with it:
//   window.lenis?.on("scroll", ScrollTrigger.update);

(function () {
  if (typeof Lenis === "undefined") return;
  // Respect users who've asked the OS for less motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lenis = new Lenis({
    lerp: 0.05, // lower = heavier, longer glide
    wheelMultiplier: 0.9,
    smoothWheel: true,
  });
  window.lenis = lenis;

  // Pages with the global GSAP build (profile.html) share GSAP's ticker so
  // pinned and scrubbed ScrollTriggers move in the same frame as the scroll.
  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // Glide to same-page anchors (e.g. #contact) instead of jumping
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href*="#"]');
    // Skip links must jump instantly and move focus, so leave them native
    if (!link || link.target === "_blank" || link.classList.contains("skip-link")) return;
    const url = new URL(link.href, window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash) return;
    const target = document.querySelector(decodeURIComponent(url.hash));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -80, duration: 1.6 });
    history.pushState(null, "", url.hash);
  });

  // Arriving from another page with a hash (index.html#contact)
  if (window.location.hash) {
    window.addEventListener("load", () => {
      const target = document.querySelector(decodeURIComponent(window.location.hash));
      if (target) lenis.scrollTo(target, { offset: -80, immediate: true });
    });
  }
})();
