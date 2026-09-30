/* =========================================================
   MENTOR STUDIO - BRAND NAME: DRAG WITH MOUSE
   File: mentor/brand-drag.js

   Load this AFTER script.js and fixes.js:
   <script src="script.js"></script>
   <script src="fixes.js"></script>
   <script src="brand-drag.js"></script>

   - Drag the brand name anywhere on the stage.
   - Double-click the brand name to put it back.
   - The position is saved in this browser.
   - The brand name is also drawn in the recording,
     at the same place as on the screen.
   ========================================================= */

(function () {

  "use strict";


  const STORAGE_KEY =
    "pcsBrandBadgePosition";


  function clamp(value, min, max) {

    return Math.min(
      max,
      Math.max(min, value)
    );

  }


  /* -------------------------------------------------------
     DRAG
     ------------------------------------------------------- */

  function initBrandDrag() {

    const badge =
      document.getElementById("brandBadge");

    const stage =
      document.getElementById("stage");

    if (!badge || !stage) {
      return;
    }


    badge.style.cursor = "move";

    badge.style.touchAction = "none";

    badge.style.userSelect = "none";

    badge.title =
      "Drag to move. Double-click to reset.";


    function applyPosition(position) {

      if (!position) {

        badge.style.left = "";
        badge.style.top = "";
        badge.style.right = "";
        badge.style.bottom = "";

        return;

      }

      badge.style.left =
        position.left + "%";

      badge.style.top =
        position.top + "%";

      badge.style.right = "auto";

      badge.style.bottom = "auto";

    }


    /* Saved position */

    try {

      const saved =
        JSON.parse(
          localStorage.getItem(STORAGE_KEY) ||
          "null"
        );

      if (
        saved &&
        Number.isFinite(saved.left) &&
        Number.isFinite(saved.top)
      ) {

        applyPosition(saved);

      }

    }
    catch (_) {}


    let dragging = false;

    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;


    badge.addEventListener(
      "pointerdown",
      event => {

        if (
          event.button !== undefined &&
          event.button !== 0
        ) {
          return;
        }

        const stageRect =
          stage.getBoundingClientRect();

        const badgeRect =
          badge.getBoundingClientRect();

        dragging = true;

        startX = event.clientX;
        startY = event.clientY;

        startLeft =
          badgeRect.left - stageRect.left;

        startTop =
          badgeRect.top - stageRect.top;

        if (badge.setPointerCapture) {

          badge.setPointerCapture(
            event.pointerId
          );

        }

        event.preventDefault();

      }
    );


    badge.addEventListener(
      "pointermove",
      event => {

        if (!dragging) {
          return;
        }

        const stageRect =
          stage.getBoundingClientRect();

        const badgeRect =
          badge.getBoundingClientRect();

        const left =
          clamp(
            startLeft +
            (event.clientX - startX),
            0,
            Math.max(
              0,
              stageRect.width -
              badgeRect.width
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
              badgeRect.height
            )
          );

        applyPosition({
          left: (left / stageRect.width) * 100,
          top: (top / stageRect.height) * 100
        });

      }
    );


    function endDrag(event) {

      if (!dragging) {
        return;
      }

      dragging = false;

      try {

        badge.releasePointerCapture(
          event.pointerId
        );

      }
      catch (_) {}


      const left =
        parseFloat(badge.style.left);

      const top =
        parseFloat(badge.style.top);

      if (
        Number.isFinite(left) &&
        Number.isFinite(top)
      ) {

        try {

          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ left, top })
          );

        }
        catch (_) {}

      }

    }

    badge.addEventListener(
      "pointerup",
      endDrag
    );

    badge.addEventListener(
      "pointercancel",
      endDrag
    );


    /* Double-click = reset */

    badge.addEventListener(
      "dblclick",
      () => {

        try {

          localStorage.removeItem(
            STORAGE_KEY
          );

        }
        catch (_) {}

        applyPosition(null);

      }
    );

  }


  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initBrandDrag
    );

  }
  else {

    initBrandDrag();

  }


  /* -------------------------------------------------------
     BRAND NAME INSIDE THE RECORDING
     ------------------------------------------------------- */

  function drawBrandBadge() {

    const canvas =
      state.compositionCanvas;

    const ctx =
      state.compositionCtx;

    const badge =
      document.getElementById("brandBadge");

    const stage =
      document.getElementById("stage");

    if (
      !canvas ||
      !ctx ||
      !badge ||
      !stage
    ) {
      return;
    }


    const text =
      (badge.textContent || "")
        .replace(/\s+/g, " ")
        .trim();

    if (!text) {
      return;
    }


    const stageRect =
      stage.getBoundingClientRect();

    const badgeRect =
      badge.getBoundingClientRect();

    if (
      !stageRect.width ||
      !stageRect.height ||
      !badgeRect.width
    ) {
      return;
    }


    const scale =
      canvas.width / stageRect.width;

    const x =
      (badgeRect.left - stageRect.left) *
      scale;

    const y =
      (badgeRect.top - stageRect.top) *
      scale;

    const width =
      badgeRect.width * scale;

    const height =
      badgeRect.height * scale;


    ctx.save();


    roundedRectPath(
      ctx,
      x,
      y,
      width,
      height,
      8 * scale
    );

    ctx.fillStyle =
      "rgba(4,8,14,.72)";

    ctx.fill();

    ctx.strokeStyle =
      "rgba(255,255,255,.1)";

    ctx.lineWidth =
      Math.max(1, scale);

    ctx.stroke();

    ctx.clip();


    /* Dot */

    ctx.fillStyle = "#4da3ff";

    ctx.beginPath();

    ctx.arc(
      x + 14 * scale,
      y + height / 2,
      3 * scale,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /* Text */

    const fontSize =
      10 * scale;

    ctx.font =
      `500 ${fontSize}px Arial`;

    ctx.fillStyle =
      "rgba(255,255,255,.9)";

    ctx.textAlign = "left";

    ctx.textBaseline = "middle";


    const maxWidth =
      width - 36 * scale;

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
      fontSize * 1.4;

    const maxLines =
      Math.max(
        1,
        Math.floor(height / lineHeight)
      );

    const visible =
      lines.slice(0, maxLines);

    const firstY =
      y +
      height / 2 -
      ((visible.length - 1) *
        lineHeight) / 2;

    visible.forEach(
      (item, index) => {

        ctx.fillText(
          item,
          x + 24 * scale,
          firstY + index * lineHeight
        );

      }
    );


    ctx.restore();

  }


  if (typeof renderCompositionFrame === "function") {

    const originalRender =
      renderCompositionFrame;

    renderCompositionFrame = function () {

      originalRender();

      drawBrandBadge();

    };

  }

})();
