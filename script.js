(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* PERFORMANCE MODES
     LITE   = phones, tablets and low-power devices: skip the heaviest scroll effects.
     SMOOTH = extra JavaScript smooth-scroll (Lenis). Only for a desktop mouse; Mac trackpads and phones already
              scroll smoothly by themselves, and Lenis on top of that makes them feel laggy. */
  const LITE = matchMedia("(pointer: coarse)").matches || innerWidth <= 900 || (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const SMOOTH = matchMedia("(hover: hover) and (pointer: fine)").matches && !/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  if (LITE) document.documentElement.classList.add("lite");

  /* loader + menu + hero light */
  const root = document.documentElement, ldr = $("#loader"), ldn = $("#ld-n");
  let seen = false; try { seen = !!sessionStorage.getItem("trtl-seen"); } catch {}
  let isLoaded = false; const queue = [];
  const onLoaded = (fn) => (isLoaded ? fn() : queue.push(fn));
  const finish = () => { if (isLoaded) return; isLoaded = true; try { sessionStorage.setItem("trtl-seen", "1"); } catch {} ldr.classList.add("done"); queue.forEach((fn) => fn()); setTimeout(() => root.classList.remove("ld"), 1000); };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !ldr || seen) { root.classList.remove("ld"); isLoaded = true; }
  else {
    let win = document.readyState === "complete"; const t0 = performance.now();
    addEventListener("load", () => (win = true)); setTimeout(finish, 2500);
    const tick = (t) => {
      const k = Math.min((t - t0) / 450, 1), p = k < 1 ? k * 90 : win ? 100 : 90;
      ldr.style.setProperty("--p", p / 100); ldn.textContent = Math.round(p) + "%";
      p >= 100 ? setTimeout(finish, 100) : requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const mb = $("#menu-btn"), mn = $("#mnav");
  const setMenu = (o) => { mb.setAttribute("aria-expanded", o); mn.classList.toggle("open", o); root.classList.toggle("menu-open", o); if (window.__lenis) o ? __lenis.stop() : __lenis.start(); };
  mb.addEventListener("click", () => setMenu(!mn.classList.contains("open")));
  $$("a", mn).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  /* WhatsApp: put your number here (country code first, digits only, e.g. "919876543210") to switch the buttons on */
  const WA_NUMBER = "";
  if (WA_NUMBER) {
    const u = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent("Hi TRTL MEDIA, I'd like to talk about a website project.");
    $$("#wa, #wa-link").forEach((a) => { a.href = u; a.hidden = false; });
  }
  const heroEl = $(".hero");
  /* PERF-OFF (original, ran on every pointer event, also on touch):
  heroEl.addEventListener("pointermove", (e) => { heroEl.style.setProperty("--px", (e.clientX / innerWidth - 0.5) * 2); heroEl.style.setProperty("--py", (e.clientY / innerHeight - 0.5) * 2); });
  */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let hx = 0, hy = 0, hraf = 0;
    const hpaint = () => { hraf = 0; heroEl.style.setProperty("--px", hx); heroEl.style.setProperty("--py", hy); };
    heroEl.addEventListener("pointermove", (e) => { hx = (e.clientX / innerWidth - 0.5) * 2; hy = (e.clientY / innerHeight - 0.5) * 2; hraf || (hraf = requestAnimationFrame(hpaint)); }, { passive: true });
  }

  /* ROI lab */
  const f = (n) => "£" + Math.round(n).toLocaleString("en-GB");
  const ids = ["visits", "cur", "tar", "conv", "val"];
  const fmt = { visits: (v) => (+v).toLocaleString("en-GB"), cur: (v) => (+v).toFixed(1) + "%", tar: (v) => (+v).toFixed(1) + "%", conv: (v) => v + "%", val: (v) => f(+v) };
  function roi() {
    const v = Object.fromEntries(ids.map((i) => [i, +$("#" + i).value]));
    ids.forEach((i) => {
      const el = $("#" + i);
      $("#o-" + i).textContent = fmt[i](v[i]);
      el.style.setProperty("--p", ((el.value - el.min) / (el.max - el.min)) * 100 + "%");
    });
    const rev = (rate) => v.visits * (rate / 100) * (v.conv / 100) * v.val;
    const c = rev(v.cur), t = rev(v.tar), max = Math.max(c, t, 1);
    const u = c ? ((t - c) / c) * 100 : 0, sign = u >= 0 ? "+" : "";
    $("#gap").textContent = (t >= c ? "" : "-") + f(Math.abs(t - c));
    $("#uplift").textContent = c ? `A ${sign}${Math.round(u)}% difference between the two scenarios` : "Based on the assumptions you set";
    $("#ring-val").textContent = sign + Math.round(u) + "%";
    $("#ring").style.strokeDashoffset = 308 * (1 - Math.min(Math.abs(u) / 300, 1));
    $("#cur-label").textContent = f(c); $("#tar-label").textContent = f(t);
    $("#cur-bar").style.width = (c / max) * 100 + "%"; $("#tar-bar").style.width = (t / max) * 100 + "%";
  }
  ids.forEach((i) => $("#" + i).addEventListener("input", roi));
  roi();

  /* founding offer: places left (edit offer-config.js to change) */
  const OFFER = window.TRTL_OFFER;
  if (OFFER) $$("[data-offer-left]").forEach((el) => (el.textContent = Math.max(0, OFFER.limit - OFFER.approved)));

  /* ROI Lab -> contact form: carry the visitor's numbers into the message */
  const roiCta = $("#roi-cta");
  if (roiCta) roiCta.addEventListener("click", () => {
    const m = $("#f-msg");
    if (!m || m.value.trim()) return;
    const g = (i) => fmt[i]($("#" + i).value);
    m.value = `I tried the ROI Lab with ${g("visits")} monthly visitors, a current enquiry rate of ${g("cur")} and a scenario rate of ${g("tar")}, ${g("conv")} of enquiries becoming customers and ${g("val")} average revenue per customer. I'd like to talk about my website.`;
    $("#cnt").textContent = m.value.length;
  });

  /* services accordion */
  $$(".acc-item").forEach((item) => {
    const btn = $("button", item), panel = $(".acc-panel", item);
    panel.inert = !item.classList.contains("open");
    btn.addEventListener("click", () => {
      $$(".acc-item").forEach((o) => {
        const open = o === item && !o.classList.contains("open");
        o.classList.toggle("open", open);
        $("button", o).setAttribute("aria-expanded", open);
        $(".acc-panel", o).inert = !open;
      });
      if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 700);
    });
  });

  /* contact form */
  const form = $("#contact-form"), status = $("#status"), send = $(".send", form), msg = $("#f-msg");
  msg.addEventListener("input", () => ($("#cnt").textContent = msg.value.length));
  form.addEventListener("input", (e) => e.target.closest(".f")?.classList.remove("bad"));
  $("#again").addEventListener("click", () => { form.classList.remove("sent"); status.textContent = ""; $("#cnt").textContent = 0; });
  const MAIL = "hello.trtlmedia@gmail.com";
  /* the form swaps to the "sent" panel and changes the page height, so ScrollTrigger must re-measure or the footer animation never plays */
  if (window.ResizeObserver) {
    let rt = 0;
    new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 200); }).observe(form);
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (send.classList.contains("load")) return; /* block double-clicks / duplicate emails */
    const bad = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
    $$(".f", form).forEach((fld) => fld.classList.toggle("bad", !!$(":invalid", fld)));
    if (bad.length) { status.textContent = "Please complete the highlighted fields."; bad[0].focus(); return; }
    if (form.elements.botcheck && form.elements.botcheck.value) { form.classList.add("sent"); return; } /* bot */
    send.classList.add("load"); send.disabled = true; status.textContent = "Sending...";
    const body = new FormData(form); body.delete("botcheck");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      /* STRICT: success only when the server clearly says success. Anything else (bad JSON, HTML error page, quota, spam block) is a failure. */
      let j = null;
      try { j = await r.json(); } catch (x) {}
      console.log("Form reply:", r.status, j);
      if (!(r.ok && j && (j.success === true || j.success === "true"))) throw new Error("not confirmed: " + r.status + " " + (j && j.message || ""));
      form.reset(); $("#cnt").textContent = 0; status.textContent = ""; form.classList.add("sent");
    } catch (err) {
      clearTimeout(timer); console.error("Form error:", err);
      status.textContent = err && err.name === "AbortError"
        ? "This is taking longer than usual. Your enquiry may already have reached us, so please check before resending. Or email " + MAIL + "."
        : "We could not confirm that your enquiry was sent. Please email " + MAIL + " directly so it is not lost.";
    }
    send.classList.remove("load"); send.disabled = false;
  });

  $$(".faq details").forEach((d) => d.addEventListener("toggle", () => window.ScrollTrigger && setTimeout(() => ScrollTrigger.refresh(), 60)));
  addEventListener("load", () => window.ScrollTrigger && ScrollTrigger.refresh());

  /* animation layer */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!(window.gsap && window.ScrollTrigger && window.Lenis) || reduce) { document.documentElement.classList.add("static"); return; }
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add("fx");

  ScrollTrigger.config({ ignoreMobileResize: true }); /* phone address bar showing/hiding no longer re-measures everything */
  /* PERF-OFF (original: Lenis smooth-scroll for everyone):
  const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  */
  let lenis = null;
  if (SMOOTH) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$("[data-scroll]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = a.getAttribute("href");
    lenis ? lenis.scrollTo(target, { duration: 1.4 }) : $(target) && $(target).scrollIntoView({ behavior: "smooth" });
  }));

  gsap.set(".line > span", { yPercent: 110 });
  const heroTl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } })
    .to(".hero-word .line > span", { yPercent: 0, duration: 1.5, delay: 0.15 })
    .from(".hero-photo", { clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power4.inOut" }, 0.2)
    .to(".hc .line > span", { yPercent: 0, duration: 1.1, stagger: 0.1 }, "-=1")
    .from(".hero-meta, .hero-cta", { opacity: 0, y: 16, duration: 1 }, "-=0.7")
    .from(".top", { opacity: 0, duration: 1 }, "-=1");
  onLoaded(() => heroTl.play());
  /* replay hero when scrolling back up to it */
  ScrollTrigger.create({ trigger: ".hero", start: "bottom top", onLeave: () => heroTl.pause(0), onEnterBack: () => heroTl.restart() });
  if (!LITE) gsap.to(".hero-photo", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  if (!LITE) $$(".reel").forEach((r) => {
    gsap.fromTo($(".reel-panel", r), { clipPath: "inset(0px 14% 0px 14%)" }, { clipPath: "inset(0px 0% 0px 0%)", ease: "none", immediateRender: true, scrollTrigger: { trigger: r, start: "top 90%", end: "top 15%", scrub: true } });
    gsap.to($(".reel-panel img", r), { scale: 1, ease: "none", scrollTrigger: { trigger: r, start: "top 90%", end: "bottom 30%", scrub: true } });
  });

  /* headings: words rise out of a mask */
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  $$(".big").forEach((el) => {
    const txt = el.textContent.trim();
    el.setAttribute("aria-label", txt);
    el.innerHTML = txt.split(/\s+/).map((w) => `<span class="wm" aria-hidden="true"><span>${esc(w)}</span></span>`).join(" ");
    gsap.from($$(".wm > span", el), { yPercent: 115, duration: 1.2, stagger: 0.06, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } });
  });

  /* contact heading: a highlight sweeps through the words as you scroll */
  const cb = $(".contact .big");
  if (cb) ScrollTrigger.create({ trigger: cb, start: "top 90%", end: "bottom 25%", scrub: true, onUpdate: (st) => cb.style.setProperty("--gx", 100 - st.progress * 100 + "%") });

  /* photos settle from grey and zoomed to full colour when they reach the screen */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-in", e.isIntersecting)), { threshold: 0.35 });
    $$(".fig").forEach((el) => io.observe(el));
  }

  $$("[data-fade]:not(.big)").forEach((el) => gsap.from(el, { opacity: 0, y: 36, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } }));

  const para = $(".reveal");
  para.innerHTML = para.textContent.trim().split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
  gsap.to(".reveal .w", { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".reveal", start: "top 75%", end: "bottom 55%", scrub: true } });

  /* PERF-OFF: studio spotlight (its CSS is switched off too)
  /* studio statement: a pointer spotlight tints the words it passes over * /
  const studioEl = $(".studio");
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && studioEl) {
    let sx = -999, sy = -999, sraf = 0;
    const paint = () => { sraf = 0; para.style.setProperty("--sx", sx + "px"); para.style.setProperty("--sy", sy + "px"); };
    studioEl.addEventListener("pointermove", (e) => { sx = e.clientX; sy = e.clientY; sraf || (sraf = requestAnimationFrame(paint)); });
    studioEl.addEventListener("pointerleave", () => { sx = sy = -999; paint(); });
  }

  //

  /* industries: cursor-following photo */
  const preview = $(".preview"), pimg = $("img", preview);
  if (matchMedia("(hover: hover)").matches) {
    const x = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
    const y = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
    addEventListener("mousemove", (e) => { x(e.clientX + 28); y(e.clientY - preview.offsetHeight / 2); });
    $$(".row").forEach((row) => {
      row.addEventListener("mouseenter", () => { preview.style.background = row.dataset.tone; pimg.src = row.dataset.img; preview.classList.add("on"); });
      row.addEventListener("mouseleave", () => preview.classList.remove("on"));
    });
  }

  /* concept dashboard bars are animated by the React ConceptDash component */

  /* footer: giant brand rises in, glow fades up */
  const fs = { trigger: ".foot-stage", start: "top 92%", toggleActions: "play none none reverse" };
  gsap.from(".foot-giant .ch", { yPercent: 110, duration: 1.4, ease: "power4.out", stagger: 0.07, scrollTrigger: fs });
  gsap.from(".foot-reflect", { opacity: 0, duration: 1.8, delay: 0.5, ease: "power2.out", scrollTrigger: fs });
  gsap.from(".foot-glow", { opacity: 0, duration: 2, ease: "power2.out", scrollTrigger: fs });
})();
