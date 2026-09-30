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

  console.log("✓ mentor/fixes.js loaded");
})();
