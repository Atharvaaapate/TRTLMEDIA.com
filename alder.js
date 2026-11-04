(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* the building: 4 floors x 3 homes. Top row of the grid is the 4th floor. */
  const TYPE = { A: { bed: 2, area: "980 sq ft", name: "Residence A" }, B: { bed: 3, area: "1,420 sq ft", name: "Residence B" } };
  const PLAN = { 4: "ABB", 3: "ABB", 2: "ABB", 1: "AAA" };
  const RESERVED = ["2C", "3A"];
  const ORD = ["", "1st", "2nd", "3rd", "4th"];
  const bld = $("#bld"), info = $("#info");
  const wins = [];
  [4, 3, 2, 1].forEach((fl) => [0, 1, 2].forEach((c) => {
    const id = fl + "ABC"[c], t = TYPE[PLAN[fl][c]], taken = RESERVED.includes(id);
    const b = document.createElement("button");
    b.type = "button"; b.className = "win"; b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", `Home ${id}, ${t.name}, ${t.bed} bedrooms, ${ORD[fl]} floor, ${taken ? "reserved" : "available"}`);
    b.dataset.free = taken ? "" : "1";
    b.addEventListener("click", () => {
      wins.forEach((w) => w.setAttribute("aria-pressed", w === b));
      info.innerHTML = `<strong>Home ${id}</strong><span>${t.name}. ${t.bed} bedrooms, ${t.area}, ${ORD[fl]} floor. ${taken ? "Reserved." : "Available."}</span>` + (taken ? "" : '<a href="#visit" data-scroll>Ask about this home</a>');
    });
    bld.appendChild(b); wins.push(b);
  }));
  /* windows light up one by one, in a shuffled order */
  const free = wins.filter((w) => w.dataset.free).sort(() => Math.random() - 0.5);
  free.forEach((w, i) => reduce ? w.classList.add("on") : setTimeout(() => w.classList.add("on"), 900 + i * 140));

  $("#f").addEventListener("submit", (e) => { e.preventDefault(); $("#msg").textContent = "This is a sample, so nothing was sent."; });

  const hasLibs = window.gsap && window.ScrollTrigger && window.Lenis;
  const go = (a, fn) => a.addEventListener("click", (e) => { e.preventDefault(); fn(a.getAttribute("href")); });
  if (!hasLibs || reduce) { $$("[data-scroll]").forEach((a) => go(a, (h) => $(h).scrollIntoView())); document.addEventListener("click", (e) => { const a = e.target.closest(".info a"); if (a) { e.preventDefault(); $("#visit").scrollIntoView(); } }); return; }

  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  /* links inside the info panel are added later, so listen on the document */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-scroll]");
    if (!a) return;
    e.preventDefault();
    lenis.scrollTo(a.getAttribute("href"), { duration: 1.4 });
  });

  gsap.set(".line > span", { yPercent: 110 });
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .to(".line > span", { yPercent: 0, duration: 1.3, stagger: 0.12, delay: 0.15 })
    .from(".hero-note, .info", { opacity: 0, y: 16, duration: 1, stagger: 0.1 }, "-=0.7")
    .from(".facade", { opacity: 0, y: 30, duration: 1.2 }, 0.2)
    .from(".top", { opacity: 0, duration: 1 }, "-=1");

  gsap.to(".reel-panel", { clipPath: "inset(0 0% 0 0%)", ease: "none", scrollTrigger: { trigger: ".reel", start: "top 90%", end: "top 15%", scrub: true } });
  gsap.to(".reel-panel img", { scale: 1, ease: "none", scrollTrigger: { trigger: ".reel", start: "top 90%", end: "bottom 30%", scrub: true } });

  const para = $(".reveal");
  para.innerHTML = para.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  gsap.to(".reveal .w", { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".reveal", start: "top 75%", end: "bottom 55%", scrub: true } });

  const preview = $(".preview");
  if (matchMedia("(hover: hover)").matches) {
    const x = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
    const y = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
    addEventListener("mousemove", (e) => { x(e.clientX + 28); y(e.clientY - preview.offsetHeight / 2); });
    $$(".row").forEach((row) => {
      row.addEventListener("mouseenter", () => { preview.style.background = row.dataset.tone; $("img", preview).src = row.dataset.img; preview.classList.add("on"); });
      row.addEventListener("mouseleave", () => preview.classList.remove("on"));
    });
  }
})();
