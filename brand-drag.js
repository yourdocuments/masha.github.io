/* =========================================================
   MENTOR STUDIO - BRAND NAME: DRAG WITH MOUSE
   File: mentor/brand-drag.js
   Load AFTER script.js and fixes.js.
   - Drag the brand name anywhere on the stage.
   - Double-click the brand name to put it back.
   - The position is saved in this browser.
   - The brand name is also drawn in the recording.
   ========================================================= */
(function () {
  "use strict";

  const STORAGE_KEY = "pcsBrandBadgePosition";
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function initBrandDrag() {
    const badge = document.getElementById("brandBadge");
    const stage = document.getElementById("stage");
    if (!badge || !stage) {
      console.warn("brand-drag.js: brandBadge or stage not found");
      return;
    }

    badge.style.cursor = "move";
    badge.style.touchAction = "none";
    badge.style.userSelect = "none";
    badge.title = "Drag to move. Double-click to reset.";

    function applyPosition(p) {
      if (!p) {
        badge.style.left = "";
        badge.style.top = "";
        badge.style.right = "";
        badge.style.bottom = "";
        return;
      }
      badge.style.left = p.left + "%";
      badge.style.top = p.top + "%";
      badge.style.right = "auto";
      badge.style.bottom = "auto";
    }

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) applyPosition(saved);
    } catch (_) {}

    let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

    badge.addEventListener("pointerdown", e => {
      if (e.button !== undefined && e.button !== 0) return;
      const s = stage.getBoundingClientRect();
      const b = badge.getBoundingClientRect();
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = b.left - s.left;
      startTop = b.top - s.top;
      if (badge.setPointerCapture) badge.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    badge.addEventListener("pointermove", e => {
      if (!dragging) return;
      const s = stage.getBoundingClientRect();
      const b = badge.getBoundingClientRect();
      const left = clamp(startLeft + (e.clientX - startX), 0, Math.max(0, s.width - b.width));
      const top = clamp(startTop + (e.clientY - startY), 0, Math.max(0, s.height - b.height));
      applyPosition({ left: (left / s.width) * 100, top: (top / s.height) * 100 });
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      try { badge.releasePointerCapture(e.pointerId); } catch (_) {}
      const left = parseFloat(badge.style.left);
      const top = parseFloat(badge.style.top);
      if (Number.isFinite(left) && Number.isFinite(top)) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ left, top })); } catch (_) {}
      }
    }

    badge.addEventListener("pointerup", endDrag);
    badge.addEventListener("pointercancel", endDrag);

    badge.addEventListener("dblclick", () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      applyPosition(null);
    });

    console.log("✓ brand-drag.js loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initBrandDrag);
  else initBrandDrag();

  /* ---- Brand name inside the recording ---- */

  function drawBrandBadge() {
    const canvas = state.compositionCanvas;
    const ctx = state.compositionCtx;
    const badge = document.getElementById("brandBadge");
    const stage = document.getElementById("stage");
    if (!canvas || !ctx || !badge || !stage) return;

    const text = (badge.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return;

    const sr = stage.getBoundingClientRect();
    const br = badge.getBoundingClientRect();
    if (!sr.width || !sr.height || !br.width) return;

    const scale = canvas.width / sr.width;
    const x = (br.left - sr.left) * scale;
    const y = (br.top - sr.top) * scale;
    const width = br.width * scale;
    const height = br.height * scale;

    ctx.save();
    roundedRectPath(ctx, x, y, width, height, 8 * scale);
    ctx.fillStyle = "rgba(4,8,14,.72)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.1)";
    ctx.lineWidth = Math.max(1, scale);
    ctx.stroke();
    ctx.clip();

    ctx.fillStyle = "#4da3ff";
    ctx.beginPath();
    ctx.arc(x + 14 * scale, y + height / 2, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    const fontSize = 10 * scale;
    ctx.font = `500 ${fontSize}px Arial`;
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const maxWidth = width - 36 * scale;
    const lines = [];
    let line = "";
    text.split(" ").forEach(word => {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = test;
    });
    if (line) lines.push(line);

    const lineHeight = fontSize * 1.4;
    const maxLines = Math.max(1, Math.floor(height / lineHeight));
    const visible = lines.slice(0, maxLines);
    const firstY = y + height / 2 - ((visible.length - 1) * lineHeight) / 2;
    visible.forEach((item, i) => ctx.fillText(item, x + 24 * scale, firstY + i * lineHeight));

    ctx.restore();
  }

  if (typeof renderCompositionFrame === "function") {
    const originalRender = renderCompositionFrame;
    renderCompositionFrame = function () {
      originalRender();
      drawBrandBadge();
    };
  } else {
    console.warn("brand-drag.js: renderCompositionFrame not found, brand name recording-e ashbe na");
  }
})();
