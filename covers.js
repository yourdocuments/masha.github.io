/* =========================================================
   MENTOR STUDIO - COVER BOXES  ("+ Add Cover")
   File: mentor/covers.js
   Load AFTER script.js, fixes.js and brand-drag.js.
   - "+ Add Cover" adds a box. Drag = move, corner = resize.
   - Hover tools: color square, ◐ Solid/Blur, × delete.
   - Double-click a box to write a short text.
   - Boxes are saved in this browser and drawn in the recording
     (below the mentor camera).
   ========================================================= */
(function () {
  "use strict";

  const KEY = "pcsStageCovers";
  const MAX_COVERS = 12;
  const BLUR_PX = 12;

  let covers = [];
  const elements = new Map();

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function isLight(hex) {
    const value = parseInt(String(hex).replace("#", ""), 16);
    if (!Number.isFinite(value)) return false;
    const r = (value >> 16) & 255, g = (value >> 8) & 255, b = value & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
  }

  function textColorFor(cover) {
    if (cover.mode === "blur") return "#ffffff";
    return isLight(cover.color) ? "#0b1220" : "#ffffff";
  }

  function toast(message, type) {
    if (typeof showToast === "function") showToast(message, type || "info");
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(covers)); } catch (_) {}
  }

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(data)) {
        covers = data.filter(i =>
          i && Number.isFinite(i.left) && Number.isFinite(i.top) &&
          Number.isFinite(i.width) && Number.isFinite(i.height));
      }
    } catch (_) {}
  }

  /* ---- Style ---- */

  const style = document.createElement("style");
  style.textContent = `
    .stage-cover{position:absolute;z-index:25;box-sizing:border-box;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:8px;border:1px dashed transparent;background:var(--cv-color,#000);color:var(--cv-text,#fff);font:600 11px/1.35 Arial,sans-serif;text-align:center;cursor:move;touch-action:none;user-select:none}
    .stage-cover.blur{background:rgba(255,255,255,.04);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
    .stage-cover:hover{border-color:rgba(255,255,255,.4)}
    .stage-cover .cv-text{padding:4px 8px;overflow-wrap:anywhere;pointer-events:none}
    .stage-cover .cv-tools{position:absolute;top:3px;right:3px;display:flex;gap:3px;opacity:0}
    .stage-cover:hover .cv-tools{opacity:1}
    .stage-cover .cv-tools button,.stage-cover .cv-tools input{width:20px;height:20px;padding:0;border:1px solid rgba(128,128,128,.9);border-radius:5px;background:rgba(0,0,0,.65);color:#fff;font-size:12px;line-height:1;cursor:pointer}
    .stage-cover .cv-tools input[type="color"]{background:none}
    .stage-cover .cv-resize{position:absolute;right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize;opacity:0;background:linear-gradient(135deg,transparent 0 45%,rgba(160,160,160,.95) 46% 54%,transparent 55%)}
    .stage-cover:hover .cv-resize{opacity:1}
  `;
  document.head.appendChild(style);

  const getStage = () => document.getElementById("stage");

  function applyCover(cover) {
    const el = elements.get(cover.id);
    if (!el) return;
    el.style.left = cover.left + "%";
    el.style.top = cover.top + "%";
    el.style.width = cover.width + "%";
    el.style.height = cover.height + "%";
    el.style.setProperty("--cv-color", cover.color);
    el.style.setProperty("--cv-text", textColorFor(cover));
    el.classList.toggle("blur", cover.mode === "blur");
    const t = el.querySelector(".cv-text");
    if (t) t.textContent = cover.text || "";
    const c = el.querySelector('input[type="color"]');
    if (c) c.value = cover.color;
  }

  function createCoverElement(cover) {
    const stage = getStage();
    if (!stage) return;

    const element = document.createElement("div");
    element.className = "stage-cover";
    element.title = "Drag to move. Corner = resize. Double-click = text.";

    const textElement = document.createElement("div");
    textElement.className = "cv-text";
    element.appendChild(textElement);

    const tools = document.createElement("div");
    tools.className = "cv-tools";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.title = "Box color";

    const modeButton = document.createElement("button");
    modeButton.type = "button";
    modeButton.textContent = "◐";
    modeButton.title = "Solid / Blur";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.title = "Delete this box";

    tools.append(colorInput, modeButton, deleteButton);
    element.appendChild(tools);

    const handle = document.createElement("span");
    handle.className = "cv-resize";
    element.appendChild(handle);

    stage.appendChild(element);
    elements.set(cover.id, element);
    applyCover(cover);

    /* ---- Drag ---- */

    let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

    element.addEventListener("pointerdown", e => {
      if (e.target.closest(".cv-tools, .cv-resize")) return;
      if (e.button !== undefined && e.button !== 0) return;
      const s = stage.getBoundingClientRect();
      const r = element.getBoundingClientRect();
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = r.left - s.left;
      startTop = r.top - s.top;
      if (element.setPointerCapture) element.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    element.addEventListener("pointermove", e => {
      if (!dragging) return;
      const s = stage.getBoundingClientRect();
      const r = element.getBoundingClientRect();
      const left = clamp(startLeft + (e.clientX - startX), 0, Math.max(0, s.width - r.width));
      const top = clamp(startTop + (e.clientY - startY), 0, Math.max(0, s.height - r.height));
      cover.left = (left / s.width) * 100;
      cover.top = (top / s.height) * 100;
      applyCover(cover);
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      try { element.releasePointerCapture(e.pointerId); } catch (_) {}
      save();
    }
    element.addEventListener("pointerup", endDrag);
    element.addEventListener("pointercancel", endDrag);

    /* ---- Resize ---- */

    let resizing = false, rsX = 0, rsY = 0, startWidth = 0, startHeight = 0, boxLeft = 0, boxTop = 0;

    handle.addEventListener("pointerdown", e => {
      e.preventDefault();
      e.stopPropagation();
      const s = stage.getBoundingClientRect();
      const r = element.getBoundingClientRect();
      resizing = true;
      rsX = e.clientX;
      rsY = e.clientY;
      startWidth = r.width;
      startHeight = r.height;
      boxLeft = r.left - s.left;
      boxTop = r.top - s.top;
      if (handle.setPointerCapture) handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener("pointermove", e => {
      if (!resizing) return;
      const s = stage.getBoundingClientRect();
      const width = clamp(startWidth + (e.clientX - rsX), 40, s.width - boxLeft);
      const height = clamp(startHeight + (e.clientY - rsY), 20, s.height - boxTop);
      cover.width = (width / s.width) * 100;
      cover.height = (height / s.height) * 100;
      applyCover(cover);
    });

    function endResize(e) {
      if (!resizing) return;
      resizing = false;
      try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
      save();
    }
    handle.addEventListener("pointerup", endResize);
    handle.addEventListener("pointercancel", endResize);

    /* ---- Tools ---- */

    colorInput.addEventListener("input", () => {
      cover.color = colorInput.value;
      applyCover(cover);
    });
    colorInput.addEventListener("change", save);

    modeButton.addEventListener("click", () => {
      cover.mode = cover.mode === "blur" ? "solid" : "blur";
      applyCover(cover);
      save();
      toast(cover.mode === "blur" ? "Cover: Blur" : "Cover: Solid");
    });

    deleteButton.addEventListener("click", () => {
      element.remove();
      elements.delete(cover.id);
      covers = covers.filter(i => i.id !== cover.id);
      save();
    });

    element.addEventListener("dblclick", e => {
      if (e.target.closest(".cv-tools, .cv-resize")) return;
      const value = window.prompt("Cover text (leave empty for no text):", cover.text || "");
      if (value === null) return;
      cover.text = value.trim();
      applyCover(cover);
      save();
    });
  }

  /* ---- Add button ---- */

  function addCover() {
    if (covers.length >= MAX_COVERS) {
      toast("You can add up to " + MAX_COVERS + " covers.", "error");
      return;
    }
    const offset = (covers.length % 6) * 3;
    const cover = {
      id: newId(),
      left: 35 + offset,
      top: 40 + offset,
      width: 30,
      height: 12,
      color: "#000000",
      mode: "solid",
      text: ""
    };
    covers.push(cover);
    createCoverElement(cover);
    save();
  }

  function addButton() {
    const group =
      document.querySelector(".main-toolbar .toolbar-right") ||
      document.querySelector(".main-toolbar .toolbar-group") ||
      document.querySelector(".main-toolbar");

    if (!group) {
      console.warn("covers.js: toolbar not found, + Add Cover button not added");
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "tool-btn";
    button.id = "addCoverBtn";
    button.textContent = "+ Add Cover";
    button.title = "Add a box to hide something in the video";
    button.addEventListener("click", addCover);
    group.insertBefore(button, group.firstChild);
  }

  function init() {
    load();
    addButton();
    covers.forEach(createCoverElement);
    console.log("✓ covers.js loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* ---- Draw covers in the recording ---- */

  function drawWrappedText(ctx, text, cx, cy, maxWidth, maxHeight, fontSize, color) {
    ctx.font = `600 ${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

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

    const lineHeight = fontSize * 1.35;
    const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));
    const visible = lines.slice(0, maxLines);
    const firstY = cy - ((visible.length - 1) * lineHeight) / 2;
    visible.forEach((item, i) => ctx.fillText(item, cx, firstY + i * lineHeight));
  }

  function drawCovers(ctx, width, height) {
    const stage = getStage();
    if (!ctx || !stage || !covers.length) return;

    const sr = stage.getBoundingClientRect();
    if (!sr.width || !sr.height) return;

    const scale = width / sr.width;
    const canvas = ctx.canvas;

    covers.forEach(cover => {
      const el = elements.get(cover.id);
      if (!el) return;

      const r = el.getBoundingClientRect();
      const x = (r.left - sr.left) * scale;
      const y = (r.top - sr.top) * scale;
      const w = r.width * scale;
      const h = r.height * scale;

      ctx.save();
      roundedRectPath(ctx, x, y, w, h, 8 * scale);
      ctx.clip();

      if (cover.mode === "blur") {
        const radius = BLUR_PX * scale;
        const pad = Math.ceil(radius * 2.5);
        const sx = Math.max(0, Math.floor(x - pad));
        const sy = Math.max(0, Math.floor(y - pad));
        const sw = Math.min(canvas.width, Math.ceil(x + w + pad)) - sx;
        const sh = Math.min(canvas.height, Math.ceil(y + h + pad)) - sy;
        if (sw > 0 && sh > 0) {
          ctx.filter = `blur(${radius}px)`;
          ctx.drawImage(canvas, sx, sy, sw, sh, sx, sy, sw, sh);
          ctx.filter = "none";
        }
      } else {
        ctx.fillStyle = cover.color;
        ctx.fillRect(x, y, w, h);
      }

      if (cover.text) {
        drawWrappedText(ctx, cover.text, x + w / 2, y + h / 2, w - 16 * scale, h, 11 * scale, textColorFor(cover));
      }

      ctx.restore();
    });
  }

  if (typeof drawMentorComposition === "function") {
    const originalDrawMentor = drawMentorComposition;
    drawMentorComposition = function (ctx, width, height) {
      try { drawCovers(ctx, width, height); }
      catch (error) { console.warn("Cover draw failed:", error); }
      originalDrawMentor(ctx, width, height);
    };
  } else {
    console.warn("covers.js: drawMentorComposition not found, cover recording-e ashbe na");
  }
})();
