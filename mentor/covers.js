/* =========================================================
   MENTOR STUDIO - COVER BOXES  ("+ Add Cover")
   File: mentor/covers.js

   Load this AFTER script.js, fixes.js and brand-drag.js:
   <script src="script.js"></script>
   <script src="fixes.js"></script>
   <script src="brand-drag.js"></script>
   <script src="covers.js"></script>

   - Click "+ Add Cover" (main toolbar) to add a box.
   - Drag a box to move it, drag its bottom right corner to
     resize it.
   - Move the mouse over a box to see its small tools:
       color square = box color
       ◐ button     = Solid / Blur (blur hides but keeps the look)
       × button     = delete the box
   - Double-click a box to write a short text on it.
   - Boxes are saved in this browser.
   - Boxes are drawn in the recording too (below the mentor
     camera, so the mentor is never covered).
   ========================================================= */

(function () {

  "use strict";


  const KEY = "pcsStageCovers";

  const MAX_COVERS = 12;

  const BLUR_PX = 12;


  let covers = [];

  const elements = new Map();


  function clamp(value, min, max) {

    return Math.min(
      max,
      Math.max(min, value)
    );

  }


  function newId() {

    return (
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7)
    );

  }


  function isLight(hex) {

    const value =
      parseInt(
        String(hex).replace("#", ""),
        16
      );

    if (!Number.isFinite(value)) {
      return false;
    }

    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return (
      (0.299 * r +
       0.587 * g +
       0.114 * b) / 255
    ) > 0.6;

  }


  function textColorFor(cover) {

    if (cover.mode === "blur") {
      return "#ffffff";
    }

    return isLight(cover.color)
      ? "#0b1220"
      : "#ffffff";

  }


  function toast(message, type) {

    if (typeof showToast === "function") {

      showToast(message, type || "info");

    }

  }


  function save() {

    try {

      localStorage.setItem(
        KEY,
        JSON.stringify(covers)
      );

    }
    catch (_) {}

  }


  function load() {

    try {

      const data =
        JSON.parse(
          localStorage.getItem(KEY) ||
          "[]"
        );

      if (Array.isArray(data)) {

        covers =
          data.filter(
            item =>
              item &&
              Number.isFinite(item.left) &&
              Number.isFinite(item.top) &&
              Number.isFinite(item.width) &&
              Number.isFinite(item.height)
          );

      }

    }
    catch (_) {}

  }


  /* -------------------------------------------------------
     STYLE
     ------------------------------------------------------- */

  const style = document.createElement("style");

  style.textContent = `
    .stage-cover {
      position: absolute;
      z-index: 25;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 8px;
      border: 1px dashed transparent;
      background: var(--cv-color, #000000);
      color: var(--cv-text, #ffffff);
      font: 600 11px/1.35 Arial, sans-serif;
      text-align: center;
      cursor: move;
      touch-action: none;
      user-select: none;
    }

    .stage-cover.blur {
      background: rgba(255, 255, 255, 0.04);
      -webkit-backdrop-filter: blur(12px);
      backdrop-filter: blur(12px);
    }

    .stage-cover:hover {
      border-color: rgba(255, 255, 255, 0.4);
    }

    .stage-cover .cv-text {
      padding: 4px 8px;
      overflow-wrap: anywhere;
      pointer-events: none;
    }

    .stage-cover .cv-tools {
      position: absolute;
      top: 3px;
      right: 3px;
      display: flex;
      gap: 3px;
      opacity: 0;
    }

    .stage-cover:hover .cv-tools {
      opacity: 1;
    }

    .stage-cover .cv-tools button,
    .stage-cover .cv-tools input {
      width: 20px;
      height: 20px;
      padding: 0;
      border: 1px solid rgba(128, 128, 128, 0.9);
      border-radius: 5px;
      background: rgba(0, 0, 0, 0.65);
      color: #ffffff;
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
    }

    .stage-cover .cv-tools input[type="color"] {
      background: none;
    }

    .stage-cover .cv-resize {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 18px;
      height: 18px;
      cursor: nwse-resize;
      opacity: 0;
      background: linear-gradient(
        135deg,
        transparent 0 45%,
        rgba(160, 160, 160, 0.95) 46% 54%,
        transparent 55%
      );
    }

    .stage-cover:hover .cv-resize {
      opacity: 1;
    }
  `;

  document.head.appendChild(style);


  /* -------------------------------------------------------
     ONE BOX
     ------------------------------------------------------- */

  function getStage() {

    return document.getElementById("stage");

  }


  function applyCover(cover) {

    const element =
      elements.get(cover.id);

    if (!element) {
      return;
    }

    element.style.left =
      cover.left + "%";

    element.style.top =
      cover.top + "%";

    element.style.width =
      cover.width + "%";

    element.style.height =
      cover.height + "%";

    element.style.setProperty(
      "--cv-color",
      cover.color
    );

    element.style.setProperty(
      "--cv-text",
      textColorFor(cover)
    );

    element.classList.toggle(
      "blur",
      cover.mode === "blur"
    );

    const textElement =
      element.querySelector(".cv-text");

    if (textElement) {

      textElement.textContent =
        cover.text || "";

    }

    const colorInput =
      element.querySelector(
        'input[type="color"]'
      );

    if (colorInput) {

      colorInput.value =
        cover.color;

    }

  }


  function createCoverElement(cover) {

    const stage = getStage();

    if (!stage) {
      return;
    }


    const element =
      document.createElement("div");

    element.className =
      "stage-cover";

    element.title =
      "Drag to move. Corner = resize. " +
      "Double-click = text.";


    const textElement =
      document.createElement("div");

    textElement.className =
      "cv-text";

    element.appendChild(textElement);


    /* Tools */

    const tools =
      document.createElement("div");

    tools.className =
      "cv-tools";


    const colorInput =
      document.createElement("input");

    colorInput.type = "color";

    colorInput.title = "Box color";


    const modeButton =
      document.createElement("button");

    modeButton.type = "button";

    modeButton.textContent = "◐";

    modeButton.title =
      "Solid / Blur";


    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";

    deleteButton.textContent = "×";

    deleteButton.title =
      "Delete this box";


    tools.appendChild(colorInput);

    tools.appendChild(modeButton);

    tools.appendChild(deleteButton);

    element.appendChild(tools);


    const handle =
      document.createElement("span");

    handle.className =
      "cv-resize";

    element.appendChild(handle);


    stage.appendChild(element);

    elements.set(cover.id, element);

    applyCover(cover);


    /* ---------------------------------------------------
       DRAG
       --------------------------------------------------- */

    let dragging = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;


    element.addEventListener(
      "pointerdown",
      event => {

        if (
          event.target.closest(
            ".cv-tools, .cv-resize"
          )
        ) {
          return;
        }

        if (
          event.button !== undefined &&
          event.button !== 0
        ) {
          return;
        }

        const stageRect =
          stage.getBoundingClientRect();

        const rect =
          element.getBoundingClientRect();

        dragging = true;

        startX = event.clientX;
        startY = event.clientY;

        startLeft =
          rect.left - stageRect.left;

        startTop =
          rect.top - stageRect.top;

        if (element.setPointerCapture) {

          element.setPointerCapture(
            event.pointerId
          );

        }

        event.preventDefault();

      }
    );


    element.addEventListener(
      "pointermove",
      event => {

        if (!dragging) {
          return;
        }

        const stageRect =
          stage.getBoundingClientRect();

        const rect =
          element.getBoundingClientRect();

        const left =
          clamp(
            startLeft +
            (event.clientX - startX),
            0,
            Math.max(
              0,
              stageRect.width -
              rect.width
            )
          );

        const top =
          clamp(
            startTop +
            (event.clientY - startY),
            0,
            Math.max(
              0,
              stageRect.height -
              rect.height
            )
          );

        cover.left =
          (left / stageRect.width) * 100;

        cover.top =
          (top / stageRect.height) * 100;

        applyCover(cover);

      }
    );


    function endDrag(event) {

      if (!dragging) {
        return;
      }

      dragging = false;

      try {

        element.releasePointerCapture(
          event.pointerId
        );

      }
      catch (_) {}

      save();

    }

    element.addEventListener(
      "pointerup",
      endDrag
    );

    element.addEventListener(
      "pointercancel",
      endDrag
    );


    /* ---------------------------------------------------
       RESIZE
       --------------------------------------------------- */

    let resizing = false;

    let resizeStartX = 0;
    let resizeStartY = 0;

    let startWidth = 0;
    let startHeight = 0;

    let boxLeft = 0;
    let boxTop = 0;


    handle.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        event.stopPropagation();

        const stageRect =
          stage.getBoundingClientRect();

        const rect =
          element.getBoundingClientRect();

        resizing = true;

        resizeStartX = event.clientX;
        resizeStartY = event.clientY;

        startWidth = rect.width;
        startHeight = rect.height;

        boxLeft =
          rect.left - stageRect.left;

        boxTop =
          rect.top - stageRect.top;

        if (handle.setPointerCapture) {

          handle.setPointerCapture(
            event.pointerId
          );

        }

      }
    );


    handle.addEventListener(
      "pointermove",
      event => {

        if (!resizing) {
          return;
        }

        const stageRect =
          stage.getBoundingClientRect();

        const width =
          clamp(
            startWidth +
            (event.clientX - resizeStartX),
            40,
            stageRect.width - boxLeft
          );

        const height =
          clamp(
            startHeight +
            (event.clientY - resizeStartY),
            20,
            stageRect.height - boxTop
          );

        cover.width =
          (width / stageRect.width) * 100;

        cover.height =
          (height / stageRect.height) * 100;

        applyCover(cover);

      }
    );


    function endResize(event) {

      if (!resizing) {
        return;
      }

      resizing = false;

      try {

        handle.releasePointerCapture(
          event.pointerId
        );

      }
      catch (_) {}

      save();

    }

    handle.addEventListener(
      "pointerup",
      endResize
    );

    handle.addEventListener(
      "pointercancel",
      endResize
    );


    /* ---------------------------------------------------
       TOOLS
       --------------------------------------------------- */

    colorInput.addEventListener(
      "input",
      () => {

        cover.color =
          colorInput.value;

        applyCover(cover);

      }
    );

    colorInput.addEventListener(
      "change",
      save
    );


    modeButton.addEventListener(
      "click",
      () => {

        cover.mode =
          cover.mode === "blur"
            ? "solid"
            : "blur";

        applyCover(cover);

        save();

        toast(
          cover.mode === "blur"
            ? "Cover: Blur"
            : "Cover: Solid"
        );

      }
    );


    deleteButton.addEventListener(
      "click",
      () => {

        element.remove();

        elements.delete(cover.id);

        covers =
          covers.filter(
            item => item.id !== cover.id
          );

        save();

      }
    );


    /* Double-click = text */

    element.addEventListener(
      "dblclick",
      event => {

        if (
          event.target.closest(
            ".cv-tools, .cv-resize"
          )
        ) {
          return;
        }

        const value =
          window.prompt(
            "Cover text (leave empty for no text):",
            cover.text || ""
          );

        if (value === null) {
          return;
        }

        cover.text =
          value.trim();

        applyCover(cover);

        save();

      }
    );

  }


  /* -------------------------------------------------------
     ADD BUTTON
     ------------------------------------------------------- */

  function addCover() {

    if (covers.length >= MAX_COVERS) {

      toast(
        "You can add up to " +
        MAX_COVERS +
        " covers.",
        "error"
      );

      return;

    }

    const offset =
      (covers.length % 6) * 3;

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
      document.querySelector(
        ".main-toolbar .toolbar-right"
      ) ||
      document.querySelector(
        ".main-toolbar .toolbar-group"
      );

    if (!group) {
      return;
    }

    const button =
      document.createElement("button");

    button.type = "button";

    button.className = "tool-btn";

    button.id = "addCoverBtn";

    button.textContent =
      "+ Add Cover";

    button.title =
      "Add a box to hide something in the video";

    button.addEventListener(
      "click",
      addCover
    );

    group.insertBefore(
      button,
      group.firstChild
    );

  }


  function init() {

    load();

    addButton();

    covers.forEach(createCoverElement);

  }


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  }
  else {

    init();

  }


  /* -------------------------------------------------------
     DRAW THE COVERS IN THE RECORDING
     (drawn before the mentor camera, so the mentor is
     always on top, same as on the screen)
     ------------------------------------------------------- */

  function drawWrappedText(
    ctx,
    text,
    centerX,
    centerY,
    maxWidth,
    maxHeight,
    fontSize,
    color
  ) {

    ctx.font =
      `600 ${fontSize}px Arial`;

    ctx.fillStyle = color;

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";


    const words =
      text.split(" ");

    const lines = [];

    let line = "";

    words.forEach(word => {

      const test =
        line
          ? line + " " + word
          : word;

      if (
        ctx.measureText(test).width >
          maxWidth &&
        line
      ) {

        lines.push(line);

        line = word;

      }
      else {

        line = test;

      }

    });

    if (line) {
      lines.push(line);
    }


    const lineHeight =
      fontSize * 1.35;

    const maxLines =
      Math.max(
        1,
        Math.floor(maxHeight / lineHeight)
      );

    const visible =
      lines.slice(0, maxLines);

    const firstY =
      centerY -
      ((visible.length - 1) *
        lineHeight) / 2;

    visible.forEach(
      (item, index) => {

        ctx.fillText(
          item,
          centerX,
          firstY + index * lineHeight
        );

      }
    );

  }


  function drawCovers(ctx, width, height) {

    const stage = getStage();

    if (!ctx || !stage || !covers.length) {
      return;
    }

    const stageRect =
      stage.getBoundingClientRect();

    if (
      !stageRect.width ||
      !stageRect.height
    ) {
      return;
    }

    const scale =
      width / stageRect.width;

    const canvas =
      ctx.canvas;


    covers.forEach(cover => {

      const element =
        elements.get(cover.id);

      if (!element) {
        return;
      }

      const rect =
        element.getBoundingClientRect();

      const x =
        (rect.left - stageRect.left) *
        scale;

      const y =
        (rect.top - stageRect.top) *
        scale;

      const w =
        rect.width * scale;

      const h =
        rect.height * scale;


      ctx.save();

      roundedRectPath(
        ctx,
        x,
        y,
        w,
        h,
        8 * scale
      );

      ctx.clip();


      if (cover.mode === "blur") {

        const radius =
          BLUR_PX * scale;

        const pad =
          Math.ceil(radius * 2.5);

        const sx =
          Math.max(0, Math.floor(x - pad));

        const sy =
          Math.max(0, Math.floor(y - pad));

        const sw =
          Math.min(
            canvas.width,
            Math.ceil(x + w + pad)
          ) - sx;

        const sh =
          Math.min(
            canvas.height,
            Math.ceil(y + h + pad)
          ) - sy;

        if (sw > 0 && sh > 0) {

          ctx.filter =
            `blur(${radius}px)`;

          ctx.drawImage(
            canvas,
            sx,
            sy,
            sw,
            sh,
            sx,
            sy,
            sw,
            sh
          );

          ctx.filter = "none";

        }

      }
      else {

        ctx.fillStyle =
          cover.color;

        ctx.fillRect(
          x,
          y,
          w,
          h
        );

      }


      if (cover.text) {

        drawWrappedText(
          ctx,
          cover.text,
          x + w / 2,
          y + h / 2,
          w - 16 * scale,
          h,
          11 * scale,
          textColorFor(cover)
        );

      }


      ctx.restore();

    });

  }


  if (typeof drawMentorComposition === "function") {

    const originalDrawMentor =
      drawMentorComposition;

    drawMentorComposition = function (
      ctx,
      width,
      height
    ) {

      try {

        drawCovers(ctx, width, height);

      }
      catch (error) {

        console.warn(
          "Cover draw failed:",
          error
        );

      }

      originalDrawMentor(
        ctx,
        width,
        height
      );

    };

  }

})();
