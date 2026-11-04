(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasLibs = window.gsap && window.ScrollTrigger && window.Lenis;
  if (!hasLibs || reduce) return;

  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll("[data-scroll]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      lenis.scrollTo(a.getAttribute("href"), { duration: 1.4, offset: 0 });
    })
  );

  /* page load: headline lines rise out of their masks */
  gsap.set(".line > span", { yPercent: 110 });
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .to(".line > span", { yPercent: 0, duration: 1.3, stagger: 0.12, delay: 0.15 })
    .from(".hero-note", { opacity: 0, y: 16, duration: 1 }, "-=0.7")
    .from(".top", { opacity: 0, duration: 1 }, "-=1");

  /* the preview panel opens up as you scroll into it */
  gsap.to(".reel-panel", {
    clipPath: "inset(0 0% 0 0%)",
    ease: "none",
    scrollTrigger: { trigger: ".reel", start: "top 90%", end: "top 15%", scrub: true }
  });

  gsap.to(".reel-panel img", {
    scale: 1, ease: "none",
    scrollTrigger: { trigger: ".reel", start: "top 90%", end: "bottom 30%", scrub: true }
  });

  /* studio statement: words light up as you read */
  const para = document.querySelector(".reveal");
  para.innerHTML = para.textContent.trim().split(/\s+/)
    .map((w) => `<span class="w">${w}</span>`).join(" ");
  gsap.to(".reveal .w", {
    opacity: 1, stagger: 0.1, ease: "none",
    scrollTrigger: { trigger: ".reveal", start: "top 75%", end: "bottom 55%", scrub: true }
  });

  /* work list: preview follows the cursor */
  const preview = document.querySelector(".preview");
  const rows = document.querySelectorAll(".row");
  if (window.matchMedia("(hover: hover)").matches) {
    const x = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
    const y = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
    window.addEventListener("mousemove", (e) => {
      x(e.clientX + 28);
      y(e.clientY - preview.offsetHeight / 2);
    });
    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => {
        preview.style.background = row.dataset.tone;
        preview.querySelector("img").src = row.dataset.img;
        preview.classList.add("on");
      });
      row.addEventListener("mouseleave", () => preview.classList.remove("on"));
    });
  }
})();
