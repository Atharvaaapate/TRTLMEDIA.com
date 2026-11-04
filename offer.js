(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- places left (controlled by offer-config.js) ---------- */
  const O = window.TRTL_OFFER || { limit: 3, approved: 0 };
  const left = Math.max(0, O.limit - O.approved);
  $$("[data-left]").forEach((e) => (e.textContent = left));
  $$("[data-limit]").forEach((e) => (e.textContent = O.limit));
  $$(".gem").forEach((g, i) => g.classList.toggle("taken", i < O.approved));

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    $$(".rv").forEach((el) => io.observe(el));
  } else $$(".rv").forEach((el) => el.classList.add("in"));

  /* ---------- testimonials: only entries that have real text are shown ---------- */
  (() => {
    let data = [];
    try { data = JSON.parse($("#t-data").textContent); } catch {}
    data = data.filter((d) => d && d.text && d.text.trim());
    const sec = $("#proof");
    if (!data.length || !sec) return;
    const track = $("#t-track"), dots = $("#t-dots");
    data.forEach((d, i) => {
      const s = document.createElement("figure");
      s.className = "t-slide";
      s.setAttribute("role", "group");
      s.setAttribute("aria-roledescription", "slide");
      s.setAttribute("aria-label", `${i + 1} of ${data.length}`);
      const q = document.createElement("blockquote"); q.textContent = d.text;
      const by = document.createElement("figcaption"); by.className = "t-by";
      const av = document.createElement("span"); av.className = "t-av"; av.textContent = d.name.trim().charAt(0).toUpperCase();
      const who = document.createElement("div");
      const b = document.createElement("b"); b.textContent = d.name;
      const sm = document.createElement("small"); sm.textContent = d.role || "";
      who.append(b, sm); by.append(av, who); s.append(q, by); track.append(s);
      const dot = document.createElement("button"); dot.type = "button"; dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      dot.addEventListener("click", () => { go(i); restart(); });
      dots.append(dot);
    });
    sec.hidden = false;
    let cur = 0, timer = 0, paused = false;
    const go = (n) => {
      cur = (n + data.length) % data.length;
      track.style.transform = `translateX(${-100 * cur}%)`;
      $$("button", dots).forEach((d, i) => d.setAttribute("aria-current", i === cur));
      $$(".t-slide", track).forEach((s, i) => s.setAttribute("aria-hidden", i !== cur));
    };
    const restart = () => { clearInterval(timer); if (!reduce && data.length > 1) timer = setInterval(() => { if (!paused) go(cur + 1); }, 6000); };
    $("#t-prev").addEventListener("click", () => { go(cur - 1); restart(); });
    $("#t-next").addEventListener("click", () => { go(cur + 1); restart(); });
    const wrap = $(".t-wrap");
    wrap.addEventListener("mouseenter", () => (paused = true));
    wrap.addEventListener("mouseleave", () => (paused = false));
    wrap.addEventListener("focusin", () => (paused = true));
    wrap.addEventListener("focusout", () => (paused = false));
    if (data.length < 2) $(".t-ctl").hidden = true;
    go(0); restart();
  })();

  /* ---------- application form ---------- */
  const form = $("#offer-form"), status = $("#o-status"), send = $("#o-send"), msg = $("#o-msg");
  const MAIL = "hello.trtlmedia@gmail.com";
  msg.addEventListener("input", () => ($("#o-cnt").textContent = msg.value.length));
  form.addEventListener("input", (e) => { const f = e.target.closest(".fld"); f && f.classList.remove("bad"); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (left <= 0) { status.textContent = "This offer is now closed."; return; }
    if (send.disabled) return;
    const bad = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
    $$(".fld", form).forEach((f) => f.classList.toggle("bad", !!$(":invalid", f)));
    if (bad.length) { status.textContent = "Please complete the highlighted fields and tick both boxes."; bad[0].focus(); return; }
    if (form.elements.botcheck && form.elements.botcheck.value) { form.classList.add("sent"); return; }
    send.disabled = true; status.textContent = "Sending...";
    const body = new FormData(form); body.delete("botcheck");
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body, signal: ctrl.signal });
      clearTimeout(timer);
      /* STRICT: success only when the server clearly confirms it */
      let res = null;
      try { res = await r.json(); } catch {}
      if (!(r.ok && res && (res.success === true || res.success === "true"))) throw new Error("not confirmed: " + r.status + " " + ((res && res.message) || ""));
      form.reset(); $("#o-cnt").textContent = 0; status.textContent = ""; form.classList.add("sent");
      $(".done").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    } catch (err) {
      clearTimeout(timer); console.error("Offer form error:", err);
      status.textContent = err && err.name === "AbortError"
        ? "This is taking longer than usual. Your application may already have reached us, so please check before resending. Or email " + MAIL + "."
        : "We could not confirm that your application was sent. Please try again, or email " + MAIL + ".";
    }
    send.disabled = false;
  });
})();
