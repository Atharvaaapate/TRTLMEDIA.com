/* Sectors dropdown (desktop) and sectors accordion (mobile menu). Shared by every page. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const btn = $("#dd-btn"), dd = $("#sector-dd");
  if (btn && dd) {
    const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
    let t = 0;
    const place = () => {
      const r = btn.getBoundingClientRect(), w = dd.offsetWidth;
      dd.style.left = Math.min(Math.max(r.left + r.width / 2 - w / 2, 12), innerWidth - w - 12) + "px";
      dd.style.top = r.bottom + 16 + "px";
    };
    const open = () => { clearTimeout(t); place(); dd.classList.add("open"); btn.setAttribute("aria-expanded", "true"); };
    const close = () => { clearTimeout(t); dd.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
    const later = () => { clearTimeout(t); t = setTimeout(close, 200); };
    if (canHover) {
      btn.addEventListener("mouseenter", open);
      btn.addEventListener("mouseleave", later);
      dd.addEventListener("mouseenter", () => clearTimeout(t));
      dd.addEventListener("mouseleave", later);
    }
    btn.addEventListener("click", (e) => {
      if (canHover && e.detail !== 0) return; /* mouse: hover already handles it */
      dd.classList.contains("open") ? close() : open();
    });
    dd.addEventListener("focusout", (e) => { if (!dd.contains(e.relatedTarget) && e.relatedTarget !== btn) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && dd.classList.contains("open")) { close(); btn.focus(); } });
    addEventListener("pointerdown", (e) => { if (!dd.contains(e.target) && !btn.contains(e.target)) close(); });
    addEventListener("resize", () => { if (dd.classList.contains("open")) place(); });
    addEventListener("scroll", () => { if (dd.classList.contains("open") && !canHover) close(); }, { passive: true });
  }
  const mb = $("#mn-btn"), ms = $("#mn-sub");
  if (mb && ms) mb.addEventListener("click", () => {
    const o = !ms.classList.contains("open");
    ms.classList.toggle("open", o);
    mb.setAttribute("aria-expanded", o);
  });
})();
