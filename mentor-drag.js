/* =========================================================
   MENTOR STUDIO - CAMERA BOX: DRAG WITH MOUSE
   File: mentor/mentor-drag.js

   Load this AFTER script.js, fixes.js, brand-drag.js, covers.js:
   <script src="mentor-drag.js"></script>

   - Drag the camera box anywhere on the stage.
   - Corner handle = resize (already handled by index.html).
   - Double-click the camera box to put it back.
   - The position is saved in this browser.
   ========================================================= */

(function () {

  "use strict";

  const STORAGE_KEY = "pcsMentorCardPosition";

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function init() {

    const card = document.getElementById("mentorCard");
    const stage = document.getElementById("stage");

    if (!card || !stage) {
      console.warn("mentor-drag.js: mentorCard or stage not found");
      return;
    }

    card.style.cursor = "move";
    card.style.touchAction = "none";
    card.style.userSelect = "none";
    card.title = "Drag to move. Double-click to reset.";

    function applyPosition(position) {

      if (!position) {
        card.style.left = "";
        card.style.top = "";
        card.style.right = "";
        card.style.bottom = "";
        return;
      }

      card.style.left = position.left + "%";
      card.style.top = position.top + "%";
      card.style.right = "auto";
      card.style.bottom = "auto";
    }

    /* Saved position */

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
        applyPosition(saved);
      }
    }
    catch (_) {}

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    card.addEventListener("pointerdown", event => {

      if (event.target.closest("#mentorResize")) {
        return;
      }

      if (event.button !== undefined && event.button !== 0) {
        return;
      }

      const stageRect = stage.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      dragging = true;

      startX = event.clientX;
      startY = event.clientY;
      startLeft = cardRect.left - stageRect.left;
      startTop = cardRect.top - stageRect.top;

      if (card.setPointerCapture) {
        card.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
    });

    card.addEventListener("pointermove", event => {

      if (!dragging) {
        return;
      }

      const stageRect = stage.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const left = clamp(
        startLeft + (event.clientX - startX),
        0,
        Math.max(0, stageRect.width - cardRect.width)
      );

      const top = clamp(
        startTop + (event.clientY - startY),
        0,
        Math.max(0, stageRect.height - cardRect.height)
      );

      applyPosition({
        left: (left / stageRect.width) * 100,
        top: (top / stageRect.height) * 100
      });
    });

    function endDrag(event) {

      if (!dragging) {
        return;
      }

      dragging = false;

      try {
        card.releasePointerCapture(event.pointerId);
      }
      catch (_) {}

      const left = parseFloat(card.style.left);
      const top = parseFloat(card.style.top);

      if (Number.isFinite(left) && Number.isFinite(top)) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ left, top }));
        }
        catch (_) {}
      }
    }

    card.addEventListener("pointerup", endDrag);
    card.addEventListener("pointercancel", endDrag);

    /* Double-click = reset */

    card.addEventListener("dblclick", event => {

      if (event.target.closest("#mentorResize")) {
        return;
      }

      try {
        localStorage.removeItem(STORAGE_KEY);
      }
      catch (_) {}

      applyPosition(null);
    });

    console.log("✓ mentor-drag.js loaded");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  }
  else {
    init();
  }

})();
