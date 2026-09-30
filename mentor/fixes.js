/* =========================================================
   mentor/fixes.js
   index.html-এ এটা আগে থেকেই script.js-এর পরে load হয়।
   শুধু এই ফাইলটা mentor/ ফোল্ডারে রাখুন — আর কিছু বদলাতে হবে না।
   ========================================================= */
(() => {
  "use strict";

  /* ---------------------------------------------------------
     1. ROOT CAUSE: initializeAudioUI কোথাও নেই।
        init() এখানে crash করত, তাই render loop কখনো চালু হতো না
        → canvas খালি → recording 1 KB। এখন crash হবে না।
     --------------------------------------------------------- */
  window.initializeAudioUI = window.initializeAudioUI || function () {};

  /* ---------------------------------------------------------
     2. Record বাটন এখন Start/STOP করে (আগে ২য় click-এ শুধু Pause হতো)
     --------------------------------------------------------- */
  window.handleRecordButton = async function () {
    if (!state.recordingActive) {
      await startRecording();
    } else {
      stopRecording();
    }
  };

  /* ---------------------------------------------------------
     3. ভিডিওর ভিতরে "REC 00:00:12" লেখা burn হওয়া বন্ধ
     --------------------------------------------------------- */
  window.drawRecordingIndicator = function () {};

  /* ---------------------------------------------------------
     4. Screen-share-এর audio একটাই audio track-এ মেশানো
        (আগে আলাদা ২টা audio track দিয়ে recorder বিগড়াতে পারত)
     --------------------------------------------------------- */
  const originalStartScreenCapture = window.startScreenCapture;

  window.startScreenCapture = async function () {
    await originalStartScreenCapture();

    const stream = state.screenStream;
    if (!stream || stream.__routed) return;

    const tracks = stream.getAudioTracks();
    if (tracks.length && state.audioContext && state.masterDestination) {
      try {
        const node = state.audioContext.createMediaStreamSource(
          new MediaStream(tracks)
        );
        node.connect(state.masterDestination);
        stream.__routed = true;
        stream.getAudioTracks = () => [];
      } catch (error) {
        console.warn("Screen audio routing failed:", error);
      }
    }
  };

  if (window.CourseStudio) {
    window.CourseStudio.startScreenCapture = window.startScreenCapture;
  }

  /* ---------------------------------------------------------
     5. Tab background-এ গেলেও recording চলবে।
        Chrome hidden tab-এ requestAnimationFrame থামিয়ে দেয়;
        আপনি Zoom/XD window-তে গেলে Studio tab hidden হয় → frame বন্ধ।
        Worker timer throttle হয় না।
     --------------------------------------------------------- */
  try {
    const workerCode = "setInterval(() => postMessage(0), 33);";
    const worker = new Worker(
      URL.createObjectURL(
        new Blob([workerCode], { type: "text/javascript" })
      )
    );

    worker.onmessage = () => {
      if (document.hidden && state.recordingActive) {
        renderCompositionFrame();
      }
    };
  } catch (error) {
    console.warn("Background render worker unavailable:", error);
  }

  /* ---------------------------------------------------------
     6. Safety: init() অন্য কোনো কারণে থেমে গেলেও render চালু হবে
     --------------------------------------------------------- */
  window.addEventListener("load", () => {
    setTimeout(() => {
      try {
        if (!state.rendering) startRenderLoop();
      } catch (error) {
        console.warn(error);
      }
    }, 1500);
  });

  /* ---------------------------------------------------------
     7. খালি recording আর history-তে জমবে না
     --------------------------------------------------------- */
  const originalHandleRecorderStop = window.handleRecorderStop;

  window.handleRecorderStop = async function () {
    const size = state.recordingChunks.reduce((sum, chunk) => sum + chunk.size, 0);

    if (size < 20000) {
      stopRecordingTimer();
      state.recordingActive = false;
      state.recordingPaused = false;
      document.body.classList.remove("is-recording");
      updateRecordingStatus("Ready");
      updateRecordingButtons();
      cleanupRecordingStream();

      showToast(
        "Recording-e video data ashe ni. Page refresh kore abar chesta korun.",
        "error",
        6000
      );
      return;
    }

    return originalHandleRecorderStop();
  };

  /* ---------------------------------------------------------
     8. Teleprompter window: header ধরে mouse দিয়ে যেখানে খুশি নেওয়া যাবে
        - পিছনের অন্ধকার (backdrop) নেই, তাই Studio-ও ব্যবহার করা যায়
        - header-এ double click করলে আগের জায়গায় ফিরবে
     --------------------------------------------------------- */
  (() => {
    const modal = document.getElementById("teleprompterModal");
    const panel = modal && modal.querySelector(".modal-panel");
    const header = modal && modal.querySelector(".modal-header");
    if (!panel || !header) return;

    const style = document.createElement("style");
    style.textContent = `
      #teleprompterModal{pointer-events:none}
      #teleprompterModal .modal-backdrop{display:none}
      #teleprompterModal .modal-panel{pointer-events:auto;box-shadow:0 20px 60px rgba(0,0,0,.6)}
      #teleprompterModal .modal-header{cursor:move;user-select:none;touch-action:none}
      #teleprompterModal .modal-close{cursor:pointer}`;
    document.head.appendChild(style);

    let x = 0;
    let y = 0;
    let drag = null;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    header.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      drag = { sx: e.clientX, sy: e.clientY, ox: x, oy: y };
      header.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    header.addEventListener("pointermove", (e) => {
      if (!drag) return;

      const rect = panel.getBoundingClientRect();
      const baseLeft = rect.left - x;
      const baseTop = rect.top - y;

      // header সবসময় screen-এর ভিতরে থাকবে
      x = clamp(
        drag.ox + e.clientX - drag.sx,
        -baseLeft - rect.width + 120,
        window.innerWidth - baseLeft - 120
      );
      y = clamp(
        drag.oy + e.clientY - drag.sy,
        -baseTop,
        window.innerHeight - baseTop - 60
      );

      panel.style.transform = `translate(${x}px, ${y}px)`;
    });

    const end = () => (drag = null);
    header.addEventListener("pointerup", end);
    header.addEventListener("pointercancel", end);

    header.addEventListener("dblclick", (e) => {
      if (e.target.closest("button")) return;
      x = 0;
      y = 0;
      panel.style.transform = "";
    });
  })();

  /* ---------------------------------------------------------
     9. Teleprompter আলাদা window-তে (২য় / ডান monitor-এর জন্য)
        Browser-এর ভিতরের modal অন্য monitor-এ যেতে পারে না,
        তাই "↗ Right Monitor" বাটন একটা আলাদা window খোলে।
        - প্রথমে ডান পাশে খোলে, permission দিলে সরাসরি ডান monitor-এ চলে যায়
        - scroll ওই window নিজেই করে, তাই Studio tab ঢাকা থাকলেও মসৃণ চলে
     --------------------------------------------------------- */
  let tpWindow = null;

  // Popup খোলা থাকলে main page-এর scroll বন্ধ (popup নিজে scroll করবে)
  const originalTeleprompterScroll = window.updateTeleprompterScroll;
  window.updateTeleprompterScroll = function () {
    if (tpWindow && !tpWindow.closed) return;
    originalTeleprompterScroll();
  };

  const TP_HTML = [
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Teleprompter</title>',
    "<style>",
    "html,body{margin:0;height:100%;background:#000;color:#fff;font-family:Arial,sans-serif;overflow:hidden}",
    "#bar{position:fixed;top:0;left:0;right:0;display:flex;gap:8px;padding:8px;background:rgba(20,20,20,.92);z-index:2;opacity:.2;transition:opacity .2s}",
    "#bar:hover{opacity:1}",
    "button{background:#1f2937;color:#fff;border:1px solid #374151;border-radius:8px;padding:8px 12px;cursor:pointer;font-size:14px}",
    "button:hover{background:#374151}",
    "#view{position:absolute;inset:0;overflow:auto;padding:90px 8% 60vh;box-sizing:border-box;scrollbar-width:none}",
    "#view::-webkit-scrollbar{display:none}",
    "#text{white-space:pre-wrap;line-height:1.6;text-align:center}",
    "</style></head><body>",
    '<div id="bar">',
    '<button id="play">▶ Play</button>',
    '<button id="pause">❚❚ Pause</button>',
    '<button id="top">⏮ Top</button>',
    '<button id="minus">A−</button>',
    '<button id="plus">A+</button>',
    '<button id="full">⛶ Fullscreen</button>',
    "</div>",
    '<div id="view"><div id="text"></div></div>',
    "<script>",
    "const o = window.opener;",
    "const S = () => o.CourseStudio.state;",
    'const view = document.getElementById("view");',
    'const text = document.getElementById("text");',
    "let pos = 0, last = performance.now(), lastText = null;",
    'document.getElementById("play").onclick = () => o.playTeleprompter();',
    'document.getElementById("pause").onclick = () => o.pauseTeleprompter();',
    'document.getElementById("top").onclick = () => { pos = 0; view.scrollTop = 0; };',
    'document.getElementById("full").onclick = () => document.documentElement.requestFullscreen().catch(() => {});',
    "function size(d) {",
    "  const s = S();",
    "  s.teleprompterFontSize = Math.min(120, Math.max(18, s.teleprompterFontSize + d));",
    '  const slider = o.document.getElementById("teleprompterFontSize");',
    "  if (slider) slider.value = s.teleprompterFontSize;",
    "}",
    'document.getElementById("minus").onclick = () => size(-4);',
    'document.getElementById("plus").onclick = () => size(4);',
    "setInterval(() => {",
    "  if (!o || o.closed) return;",
    "  const s = S();",
    '  const t = s.teleprompterText || "Teleprompter-e kono script nei.";',
    "  if (t !== lastText) { text.textContent = t; lastText = t; }",
    '  text.style.fontSize = s.teleprompterFontSize + "px";',
    "  text.style.opacity = s.teleprompterOpacity;",
    "  const now = performance.now();",
    "  const dt = now - last;",
    "  last = now;",
    "  if (s.teleprompterPlaying) {",
    "    pos += dt * (0.015 + s.teleprompterSpeed * 0.008);",
    "    view.scrollTop = pos;",
    "  } else {",
    "    pos = view.scrollTop;",
    "  }",
    "}, 40);",
    "<\/script></body></html>"
  ].join("\n");

  async function moveToOtherScreen(win) {
    try {
      if (!window.getScreenDetails) return;
      const details = await window.getScreenDetails();
      const cur = details.currentScreen;
      const others = details.screens.filter(
        (s) => s.left !== cur.left || s.top !== cur.top
      );
      const target =
        others
          .filter((s) => s.left >= cur.left)
          .sort((a, b) => a.left - b.left)[0] || others[0];
      if (!target || win.closed) return;
      win.moveTo(target.availLeft, target.availTop);
      win.resizeTo(target.availWidth, target.availHeight);
    } catch (error) {
      console.warn("Second monitor placement skipped:", error);
    }
  }

  function openTeleprompterWindow() {
    if (tpWindow && !tpWindow.closed) {
      tpWindow.focus();
      return;
    }

    // Studio window-র ঠিক ডান পাশে (২য় monitor থাকলে সাধারণত সেখানেই পড়ে)
    const left = window.screenX + window.outerWidth;
    const top = window.screenY;

    tpWindow = window.open(
      "",
      "pcsTeleprompter",
      "popup=yes,width=1000,height=700,left=" + left + ",top=" + top
    );

    if (!tpWindow) {
      showToast("Popup block hoyeche. Browser-e popup allow korun.", "error", 5000);
      return;
    }

    tpWindow.document.open();
    tpWindow.document.write(TP_HTML);
    tpWindow.document.close();

    moveToOtherScreen(tpWindow);

    if (typeof closeTeleprompter === "function") closeTeleprompter();

    showToast("Teleprompter alada window-e khulechhe.", "success");
  }

  // Modal header-এ বাটন
  (() => {
    const header = document.querySelector("#teleprompterModal .modal-header");
    const closeBtn = document.getElementById("closeTeleprompterBtn");
    if (!header || !closeBtn) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "secondary-btn";
    btn.id = "popoutTeleprompterBtn";
    btn.textContent = "↗ Right Monitor";
    btn.style.marginLeft = "auto";
    btn.style.marginRight = "10px";
    btn.addEventListener("click", openTeleprompterWindow);

    closeBtn.parentNode.insertBefore(btn, closeBtn);
  })();

  window.addEventListener("beforeunload", () => {
    if (tpWindow && !tpWindow.closed) tpWindow.close();
  });

  console.log("✓ mentor/fixes.js loaded");
})();
