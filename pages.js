(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  /* LITE = phones and low-power devices. SMOOTH = Lenis only for a desktop mouse (Mac trackpads and phones scroll smoothly on their own). */
  const LITE = matchMedia("(pointer: coarse)").matches || innerWidth <= 900 || (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const SMOOTH = matchMedia("(hover: hover) and (pointer: fine)").matches && !/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  if (LITE) root.classList.add("lite");

  /* mobile menu */
  const mb = $("#menu-btn"), mn = $("#mnav");
  const setMenu = (o) => {
    mb.setAttribute("aria-expanded", o); mn.classList.toggle("open", o); root.classList.toggle("menu-open", o);
    if (window.__lenis) o ? __lenis.stop() : __lenis.start();
    if (!o) { $("#mn-sub") && $("#mn-sub").classList.remove("open"); $("#mn-btn") && $("#mn-btn").setAttribute("aria-expanded", "false"); }
  };
  mb.addEventListener("click", () => setMenu(!mn.classList.contains("open")));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* founding offer: places left */
  const O = window.TRTL_OFFER;
  if (O) $$("[data-offer-left]").forEach((el) => (el.textContent = Math.max(0, O.limit - O.approved)));

  /* animation layer, same engine as the home page */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const go = () => {
    if (!(window.gsap && window.ScrollTrigger && window.Lenis) || reduce) { root.classList.add("static"); return; }
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("fx");
    ScrollTrigger.config({ ignoreMobileResize: true });
    /* PERF-OFF (original: Lenis for everyone): const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 }); ... */
    let lenis = null;
    if (SMOOTH) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    $$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); const t = a.getAttribute("href"); lenis ? lenis.scrollTo(t, { duration: 1.4 }) : $(t) && $(t).scrollIntoView({ behavior: "smooth" }); }));

    gsap.set(".phero h1 .line > span", { yPercent: 110 });
    gsap.timeline({ defaults: { ease: "power4.out" } })
      .to(".phero h1 .line > span", { yPercent: 0, duration: 1.4, stagger: 0.12, delay: 0.1 })
      .from(".phero .section-title, .phero .lead, .phero .btns, .phero .offer-pill, .phero .tags, .phero .hero-meta", { opacity: 0, y: 18, duration: 1, stagger: 0.08 }, "-=0.9")
      .from(".top", { opacity: 0, duration: 1 }, "-=1.2");

    if (!LITE) $$(".reel").forEach((r) => {
      gsap.fromTo($(".reel-panel", r), { clipPath: "inset(0px 14% 0px 14%)" }, { clipPath: "inset(0px 0% 0px 0%)", ease: "none", immediateRender: true, scrollTrigger: { trigger: r, start: "top 90%", end: "top 15%", scrub: true } });
      gsap.to($(".reel-panel img", r), { scale: 1, ease: "none", scrollTrigger: { trigger: r, start: "top 90%", end: "bottom 30%", scrub: true } });
    });

    const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    $$(".big").forEach((el) => {
      const txt = el.textContent.trim();
      el.setAttribute("aria-label", txt);
      el.innerHTML = txt.split(/\s+/).map((w) => `<span class="wm" aria-hidden="true"><span>${esc(w)}</span></span>`).join(" ");
      gsap.from($$(".wm > span", el), { yPercent: 115, duration: 1.2, stagger: 0.06, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } });
    });
    $$("[data-fade]:not(.big)").forEach((el) => gsap.from(el, { opacity: 0, y: 36, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" } }));
    $$(".tier").forEach((el, i) => gsap.from(el, { opacity: 0, y: 50, duration: 1.1, delay: i * 0.08, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reverse" } }));

    const fs = { trigger: ".foot-stage", start: "top 92%", toggleActions: "play none none reverse" };
    gsap.from(".foot-giant .ch", { yPercent: 110, duration: 1.4, ease: "power4.out", stagger: 0.07, scrollTrigger: fs });
    gsap.from(".foot-reflect", { opacity: 0, duration: 1.8, delay: 0.5, ease: "power2.out", scrollTrigger: fs });
    gsap.from(".foot-glow", { opacity: 0, duration: 2, ease: "power2.out", scrollTrigger: fs });
    $$(".faq details").forEach((d) => d.addEventListener("toggle", () => setTimeout(() => ScrollTrigger.refresh(), 60)));
    addEventListener("load", () => ScrollTrigger.refresh());
  };
  go();
})();
