/* TRTL MEDIA: React layer (React 18 UMD, no build step)
   Components: ScrollCue, velocity Marquee, ProcessRail, ConceptDash,
   ScrollProgress, Cursor ring, magnetic FloatingCTA */
(() => {
  if (!window.React || !window.ReactDOM) return;
  const { createElement: h, Fragment, useState, useEffect, useRef } = React;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const go = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    window.__lenis ? __lenis.scrollTo(el, { duration: 1.4 }) : el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  /* run a callback on every scroll/resize frame (rAF throttled) */
  const useFrameScroll = (fn) => {
    useEffect(() => {
      let raf = 0;
      const run = () => { raf = 0; fn(); };
      const on = () => { raf || (raf = requestAnimationFrame(run)); };
      addEventListener("scroll", on, { passive: true });
      addEventListener("resize", on);
      run();
      return () => { removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); };
    }, []);
  };

  /* ---------- data ---------- */
  const star = () => h("svg", { viewBox: "0 0 24 24", "aria-hidden": true }, h("path", { d: "M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z", fill: "#C8F169" }));
  const TECH = ["Mobile-first build", "Fast loading", "Search-ready structure", "Clear enquiry paths", "Accessible design", "Handover checklist"].map((n) => ({ n, i: star }));
  const STEPS = [
    { k: "01 Understand", t: "Start with the business.", d: "We learn about your audience, goals, existing website, content, and what a useful outcome would look like." },
    { k: "02 Plan and design", t: "Agree the direction.", d: "We define the pages, content needs, visual direction, scope, timeline, and fee before the build proceeds." },
    { k: "03 Build and handover", t: "Make it ready to use.", d: "We build and review the agreed experience, check key layouts, and clarify handover and any optional ongoing support." },
  ];
  const TABS = [
    { n: "Overview", v: [35, 55, 42, 75, 62, 90] },
    { n: "Enquiries", v: [60, 40, 70, 45, 80, 55] },
    { n: "Projects", v: [25, 38, 52, 60, 78, 95] },
    { n: "Care", v: [80, 66, 54, 70, 40, 62] },
  ];

  /* ---------- hero scroll cue ---------- */
  function Cue() {
    return h("a", { className: "cue", href: "#approach", onClick: (e) => { e.preventDefault(); go("#approach"); } },
      h("span", null, "Scroll to explore"), h("i", { "aria-hidden": true }));
  }

  /* ---------- marquee: speeds up with scroll, slows on hover ---------- */
  function Marquee() {
    const track = useRef(null);
    useEffect(() => {
      const el = track.current;
      if (!el || reduce) return;
      const box = el.parentElement;
      let x = 0, dir = -1, boost = 0, hov = 0, half = 0, last = performance.now(), lastY = scrollY, raf = 0, hovering = false;
      const measure = () => { half = el.getBoundingClientRect().width / 2; };
      measure();
      document.fonts && document.fonts.ready.then(measure);
      addEventListener("resize", measure);
      const enter = () => (hovering = true), leave = () => (hovering = false);
      box.addEventListener("mouseenter", enter); box.addEventListener("mouseleave", leave);
      let vis = true; const io = window.IntersectionObserver ? new IntersectionObserver(([en]) => (vis = en.isIntersecting)) : null; io && io.observe(box);
      const tick = (now) => {
        if (!vis) { last = now; lastY = scrollY; raf = requestAnimationFrame(tick); return; }
        const dt = Math.min((now - last) / 1000, 0.05); last = now;
        const dy = scrollY - lastY; lastY = scrollY;
        if (dy) dir = dy > 0 ? -1 : 1;
        boost += (Math.min(Math.abs(dy) * 0.18, 9) - boost) * Math.min(dt * 5, 1);
        hov += ((hovering ? 1 : 0) - hov) * Math.min(dt * 6, 1);
        x += dir * 70 * (1 + boost) * (1 - hov * 0.9) * dt;
        if (half) { if (x <= -half) x += half; if (x > 0) x -= half; }
        el.style.transform = `translate3d(${x}px,0,0)`;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => { cancelAnimationFrame(raf); removeEventListener("resize", measure); box.removeEventListener("mouseenter", enter); box.removeEventListener("mouseleave", leave); };
    }, []);
    const set = (p) => TECH.map((t, k) => h("b", { key: p + k, className: "tk" }, t.i(), h("em", null, t.n)));
    return h("div", { className: "ticker-track", ref: track, style: { animation: "none" }, "aria-hidden": true }, set("a"), set("b"), set("c"), set("d"));
  }

  /* ---------- process: sticky cards that scale back as the next one covers them ---------- */
  function Process() {
    const root = useRef(null);
    useFrameScroll(() => {
      const cards = root.current && root.current.children;
      if (!cards) return;
      /* read every position first, then write (avoids forcing a layout between cards) */
      const fs = [];
      for (let i = 0; i < cards.length; i++) {
        const nx = cards[i + 1];
        fs.push(nx ? clamp((1 - nx.getBoundingClientRect().top / innerHeight) / 0.85, 0, 1) : 0);
      }
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i].firstChild, f = fs[i];
        el.style.transform = `scale(${1 - 0.08 * f})`;
        el.style.opacity = 1 - 0.55 * f;
      }
    });
    return h("div", { className: "sk", ref: root },
      STEPS.map((s, i) => h("article", { key: i, className: "sk-card", style: { "--i": i } },
        h("div", { className: "sk-in" },
          h("span", { className: "sk-n", "aria-hidden": true }, String(i + 1).padStart(2, "0")),
          h("div", null, h("small", null, s.k.replace(/^\d+\s/, "")), h("h4", null, s.t), h("p", null, s.d))))));
  }

  /* ---------- concept work: pinned horizontal gallery ---------- */
  const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;
  const GALLERY = [
    { k: "Real estate", t: "Alder Residences", d: "A residential launch site where every window is a home you can open, with floor plans and a clear way to book a visit.", img: "alder-card.svg", url: "sample / alder residences", href: "alder.html", logo: { cls: "alder", a: "alder", b: "residences" } },
    { k: "Design portfolio", t: "Akiro Designers", d: "A portfolio site for a design studio: selected work, services and a clear way to get in touch.", img: "akiro-card.svg", url: "sample / akiro designers", href: "akiro.html", logo: { cls: "akiro", a: "akiro", b: "designers" } },
  ];
  function Gallery() {
    const wrap = useRef(null), track = useRef(null), bar = useRef(null), pin = useRef(false);
    const [pinned, setPinned] = useState(false);
    useEffect(() => {
      let t = 0;
      const measure = () => {
        const w = wrap.current, tr = track.current;
        if (!w || !tr) return;
        const dist = Math.max(0, tr.offsetWidth - document.documentElement.clientWidth);
        const on = !reduce && innerWidth > 900 && dist > 0;
        pin.current = on; w.dataset.dist = dist;
        w.style.height = on ? innerHeight + dist + "px" : "";
        if (!on) tr.style.transform = "";
        setPinned(on);
      };
      const re = () => { clearTimeout(t); t = setTimeout(measure, 120); };
      measure();
      addEventListener("resize", re); addEventListener("load", re);
      document.fonts && document.fonts.ready.then(re);
      return () => { clearTimeout(t); removeEventListener("resize", re); removeEventListener("load", re); };
    }, []);
    useFrameScroll(() => {
      const w = wrap.current, tr = track.current;
      if (!w || !tr) return;
      if (pin.current) {
        const r = w.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, w.offsetHeight - innerHeight), 0, 1);
        tr.style.transform = `translate3d(${-p * +w.dataset.dist}px,0,0)`;
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      }
      [...tr.children].forEach((c) => {
        const r = c.getBoundingClientRect(), mid = (r.left + r.right) / 2;
        c.classList.toggle("act", mid > innerWidth * 0.25 && mid < innerWidth * 0.75);
      });
    });
    return h("div", { className: "gal-pin" + (pinned ? "" : " native"), ref: wrap },
      h("div", { className: "gal-sticky" },
        h("div", { className: "gal-track", ref: track },
          GALLERY.map((g, i) => h("a", { key: i, className: "gcard", href: g.href, "aria-label": "Open sample: " + g.t },
            h("div", { className: "gcard-win" },
              h("div", { className: "gcard-bar" }, h("i"), h("i"), h("i"), h("span", null, g.url)),
              h("div", { className: "gcard-img" }, h("img", { src: g.img, alt: "Sample: " + g.t, loading: "lazy", draggable: false }), h("div", { className: "gcard-logo " + g.logo.cls, "aria-hidden": true }, h("b", null, g.logo.a), h("span", null, g.logo.b)), h("span", { className: "gcard-tag" }, "Sample project"))),
            h("div", { className: "gcard-cap" }, h("small", null, g.k), h("h4", null, g.t), h("p", null, g.d))))),
        h("div", { className: "gal-prog", "aria-hidden": true }, h("i", { ref: bar }))));
  }

  /* ---------- concept dashboard: tilt + switchable tabs ---------- */
  function Concept() {
    const [t, setT] = useState(0);
    const [seen, setSeen] = useState(reduce);
    const win = useRef(null);
    useEffect(() => {
      if (reduce || !win.current) return;
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.35 });
      io.observe(win.current);
      return () => io.disconnect();
    }, []);
    const move = (e) => {
      if (!fine || reduce) return;
      const el = win.current, r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(1100px) rotateY(${(px - 0.5) * 8}deg) rotateX(${(0.5 - py) * 8}deg)`;
      el.style.setProperty("--mx", px * 100 + "%"); el.style.setProperty("--my", py * 100 + "%");
    };
    const leave = () => { if (win.current) win.current.style.transform = ""; };
    return h("div", { className: "win tilt", ref: win, onPointerMove: move, onPointerLeave: leave, "aria-label": "Illustrative concept dashboard" },
      h("div", { className: "win-bar" }, h("i"), h("i"), h("i"), h("span", null, "TRTL / Concept dashboard"), h("em", { className: "win-hint" }, "Try the side tabs")),
      h("div", { className: "win-body" },
        h("aside", null, h("b", null, "TM"),
          TABS.map((x, i) => h("button", { key: i, type: "button", className: i === t ? "on" : "", "aria-label": x.n, "aria-pressed": i === t, onClick: () => setT(i) }))),
        h("div", { className: "dash" },
          h("small", null, "Illustrative concept: " + TABS[t].n),
          h("h4", null, "Your business,", h("br"), "more connected."),
          h("div", { className: "dash-cards" },
            h("div", null, h("small", null, "Example metric"), h("strong", null, "—"), h("span", null, "Illustrative")),
            h("div", null, h("small", null, "Example value"), h("strong", null, "—"), h("span", null, "Illustrative"))),
          h("div", { className: "dash-lines" + (seen ? " in" : ""), "aria-hidden": true },
            TABS[t].v.map((v, i) => h("i", { key: i, style: { "--h": v + "%", "--d": i * 70 + "ms" } }))))));
  }

  /* ---------- site chrome: progress bar, cursor ring, magnetic CTA ---------- */
  function Progress() {
    const bar = useRef(null);
    useFrameScroll(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
    });
    return h("div", { className: "sp", "aria-hidden": true }, h("i", { ref: bar }));
  }
  function Cursor() {
    const ring = useRef(null);
    const [s, setS] = useState({ k: "", down: false, vis: false });
    useEffect(() => {
      if (!fine || reduce) return;
      let x = -100, y = -100, cx = x, cy = y, raf = 0;
      const merge = (p) => setS((o) => { for (const k in p) if (o[k] !== p[k]) return { ...o, ...p }; return o; });
      const kind = (t) => { const c = (q) => t && t.closest && t.closest(q); return c(".row") ? "hide" : c("input,textarea") ? "text" : c("a,button,summary,label,.dk") ? "link" : ""; };
      let hasPos = false, sraf = 0;
      const mv = (e) => {
        x = e.clientX; y = e.clientY; hasPos = true;
        raf || (raf = requestAnimationFrame(tick)); /* wake the loop only while the pointer is moving */
        merge({ vis: true, k: kind(e.target) });
      };
      /* after a click or a scroll the page moves under a still pointer: re-check what is under it so the ring never keeps a stale big white state */
      const resense = () => { if (sraf) return; sraf = requestAnimationFrame(() => { sraf = 0; if (hasPos) merge({ k: kind(document.elementFromPoint(x, y)) }); }); };
      const clk = () => { setTimeout(resense, 80); setTimeout(resense, 700); };
      const dn = () => merge({ down: true }), up = () => merge({ down: false }), out = () => merge({ vis: false });
      addEventListener("pointermove", mv); addEventListener("pointerdown", dn); addEventListener("pointerup", up);
      addEventListener("click", clk); addEventListener("scroll", resense, { passive: true });
      document.documentElement.addEventListener("mouseleave", out);
      const tick = () => {
        cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
        if (ring.current) ring.current.style.transform = `translate3d(${cx}px,${cy}px,0)`;
        /* PERF-OFF: raf = requestAnimationFrame(tick);  (it used to run forever, even when the pointer was still) */
        raf = (Math.abs(x - cx) > 0.1 || Math.abs(y - cy) > 0.1) ? requestAnimationFrame(tick) : 0;
      };
      /* PERF-OFF: tick(); */
      return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", mv); removeEventListener("pointerdown", dn); removeEventListener("pointerup", up); removeEventListener("click", clk); removeEventListener("scroll", resense); cancelAnimationFrame(sraf); document.documentElement.removeEventListener("mouseleave", out); };
    }, []);
    if (!fine || reduce) return null;
    return h("div", { className: "cur-r " + s.k + (s.down ? " down" : "") + (s.vis ? " vis" : ""), ref: ring, "aria-hidden": true }, h("i"));
  }
  function FloatingCTA() {
    const [show, setShow] = useState(false);
    const btn = useRef(null), shown = useRef(false);
    useFrameScroll(() => {
      const c = document.getElementById("contact");
      const on = scrollY > innerHeight * 0.9 && !(c && c.getBoundingClientRect().top < innerHeight * 0.55);
      shown.current = on; setShow(on);
    });
    useEffect(() => {
      if (!fine || reduce) return;
      const mv = (e) => {
        const b = btn.current; if (!b || !shown.current) return;
        const r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.translate = Math.hypot(dx, dy) < 120 ? `${dx * 0.3}px ${dy * 0.3}px` : "0 0";
      };
      addEventListener("pointermove", mv);
      return () => removeEventListener("pointermove", mv);
    }, []);
    return h("div", { className: "fcta" + (show ? " show" : "") },
      h("button", { type: "button", ref: btn, onClick: () => go("#contact"), onMouseLeave: () => btn.current && (btn.current.style.translate = "0 0") },
        "Start a project", h("span", { "aria-hidden": true }, "↗")));
  }

  /* ---------- scroll-drawn thread: a rounded line that snakes down the page margins ---------- */
  function Thread() {
    const svg = useRef(null), path = useRef(null), dot = useRef(null), halo = useRef(null), showing = useRef(false);
    const g = useRef({ total: 0, knots: [], maxY: 0 });
    const vh = useRef(innerHeight); /* vh: viewport height that ignores phone toolbar slides */
    const paint = (L) => {
      const { total } = g.current, p = path.current;
      if (!total || !p) return;
      p.style.strokeDashoffset = total - L;
      const on = L > 1 && L < total - 1;
      if (on !== showing.current) { showing.current = on; [dot.current, halo.current].forEach((c) => c && (c.style.display = on ? "" : "none")); }
      if (on) {
        const pt = p.getPointAtLength(L);
        [dot.current, halo.current].forEach((c) => { c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); });
      }
    };
    const draw = () => {
      const { total, knots, maxY } = g.current, p = path.current;
      if (!total || !p || !knots.length) return;
      /* Keep the dot in stable document coordinates while iOS changes its visual viewport. */
      const ly = Math.min(Math.max(scrollY, 0), maxY) + vh.current * 0.7;
      let L = 0;
      if (ly >= knots[knots.length - 1].ly) L = total;
      else if (ly > knots[0].ly) {
        let i = 1; while (knots[i].ly < ly) i++;
        const a = knots[i - 1], b = knots[i];
        const t = Math.min(1, Math.max(0, (ly - a.ly) / (b.ly - a.ly || 1)));
        L = a.L + (b.L - a.L) * t;
      }
      paint(L);
    };
    const build = () => {
      const s = svg.current, p = path.current;
      if (!s || !p) return;
      const secs = ["#approach", "#process", "#roi", "#industries", "#services", "#faq", ".next"].map((q) => document.querySelector(q)).filter(Boolean);
      if (secs.length < 2) { p.setAttribute("d", ""); g.current.total = 0; return; }
      const W = document.documentElement.clientWidth, H = Math.ceil(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
      s.style.width = W + "px";
      s.style.height = H + "px";
      const xL = Math.max(8, (parseFloat(getComputedStyle(secs[0]).paddingLeft) || 24) * 0.5), xR = W - xL;
      const ys = secs.map((el) => el.getBoundingClientRect().top + scrollY + Math.min((parseFloat(getComputedStyle(el).paddingTop) || 80) * 0.4, 70));
      const n = ys.length;
      let minGap = Infinity; for (let i = 1; i < n; i++) minGap = Math.min(minGap, ys[i] - ys[i - 1]);
      const r = Math.max(12, Math.min(56, (xR - xL) / 4, minGap / 4));
      const Z = Math.min(vh.current * 0.8, 700);
      let d = `M -20 ${ys[0]} H ${xR - r}`, acc = xR - r + 20, side = "R";
      const knots = [{ ly: ys[0] - Z, L: 0 }, { ly: ys[0], L: acc }];
      for (let i = 1; i < n; i++) {
        const gap = ys[i] - ys[i - 1], zi = Math.min(Z, gap * 0.4);
        const sw = side === "R" ? 1 : 0, ex = side === "R" ? xR : xL, ix = side === "R" ? xR - r : xL + r;
        d += ` A ${r} ${r} 0 0 ${sw} ${ex} ${ys[i - 1] + r} V ${ys[i] - r} A ${r} ${r} 0 0 ${sw} ${ix} ${ys[i]}`;
        acc += Math.PI * r + (gap - 2 * r);
        knots.push({ ly: ys[i] - zi, L: acc });
        const target = side === "R" ? xL + r : xR - r;
        d += ` H ${target}`; acc += Math.abs(ix - target);
        side = side === "R" ? "L" : "R";
        if (i === n - 1) {
          if (side === "L") { d += " H -20"; acc += xL + r + 20; }
          else { d += ` H ${W + 20}`; acc += W + 20 - (xR - r); }
        }
        knots.push({ ly: ys[i], L: acc });
      }
      p.setAttribute("d", d);
      const total = p.getTotalLength(), k = total / acc;
      knots.forEach((kn) => (kn.L *= k));
      g.current = { total, knots, maxY: Math.max(0, H - vh.current) };
      p.style.strokeDasharray = total + " " + total;
      /* Size the page-anchored SVG only when its geometry is rebuilt, never while scrolling. */
      draw();
    };
    useEffect(() => {
      if (reduce) return;
      let t = 0;
      const re = () => { clearTimeout(t); t = setTimeout(build, 150); };
      let lastW = innerWidth, lastHt = innerHeight;
      const onResize = () => {
        if (innerWidth === lastW && Math.abs(innerHeight - lastHt) < 160) return; /* phone toolbar sliding: not a real resize */
        lastW = innerWidth; lastHt = innerHeight; vh.current = innerHeight; re();
      };
      let rb = 0, lastH = 0;
      /* PERF-OFF (rebuilt on every tiny layout change): const live = () => { rb || (rb = requestAnimationFrame(() => { rb = 0; build(); })); };
         OPTIMISED: wait until layout settles, and only rebuild if the page height really changed. */
      const live = () => {
        const hgt = Math.round(document.body.getBoundingClientRect().height);
        if (Math.abs(hgt - lastH) < 2) return;
        lastH = hgt; clearTimeout(rb); rb = setTimeout(build, 250);
      };
      /* follow the accordion while it animates so the dot glides instead of jumping */
      let follow = 0;
      const track = (e) => {
        if (!e.target.closest || !e.target.closest(".acc button")) return;
        const end = performance.now() + 900;
        cancelAnimationFrame(follow);
        const step = () => { build(); if (performance.now() < end) follow = requestAnimationFrame(step); };
        follow = requestAnimationFrame(step);
      };
      document.addEventListener("click", track);
      build();
      addEventListener("load", re); addEventListener("resize", onResize);
      document.fonts && document.fonts.ready.then(re);
      const ro = "ResizeObserver" in window ? new ResizeObserver(live) : null;
      ro && ro.observe(document.body);
      const t1 = setTimeout(build, 400), t2 = setTimeout(build, 1800);
      return () => { clearTimeout(t); clearTimeout(rb); clearTimeout(t1); clearTimeout(t2); cancelAnimationFrame(follow); document.removeEventListener("click", track); removeEventListener("load", re); removeEventListener("resize", onResize); ro && ro.disconnect(); };
    }, []);
    useEffect(() => {
      if (reduce) return;
      let raf = 0;
      const schedule = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => { raf = 0; draw(); });
      };
      addEventListener("scroll", schedule, { passive: true });
      addEventListener("resize", schedule, { passive: true });
      schedule();
      return () => { removeEventListener("scroll", schedule); removeEventListener("resize", schedule); cancelAnimationFrame(raf); };
    }, []);
    if (reduce) return null;
    return h("div", { className: "thr-box", "aria-hidden": true }, h("svg", { className: "thr", ref: svg, "aria-hidden": true },
      h("g", null,
        h("path", { ref: path, fill: "none", stroke: "#C8F169", strokeWidth: 4, strokeLinecap: "round", strokeLinejoin: "round" }),
        h("circle", { ref: halo, r: 16, fill: "#C8F169", opacity: 0.2, style: { display: "none" } }),
        h("circle", { ref: dot, r: 7, fill: "#C8F169", style: { display: "none" } }))));
  }
  /* The green scroll thread is back, in a lighter form (see Thread above).
     To switch it off again, change THREAD_ON to false. */
  const THREAD_ON = true;
  const Chrome = () => h(Fragment, null, THREAD_ON ? h(Thread) : null, h(Progress), h(Cursor), h(FloatingCTA));

  /* ---------- mount ---------- */
  const mount = (sel, C) => { const el = document.querySelector(sel); if (el) ReactDOM.createRoot(el).render(h(C)); };
  mount("#hero-cue", Cue);
  mount(".ticker", Marquee);
  mount("#process-react", Process);
  mount("#concept-react", Concept);
  mount("#gallery-react", Gallery);
  const ui = document.createElement("div"); ui.id = "ui-root"; document.body.appendChild(ui);
  ReactDOM.createRoot(ui).render(h(Chrome));
  /* React changes section heights after first paint; keep GSAP triggers accurate */
  [300, 1200].forEach((ms) => setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), ms));
})();