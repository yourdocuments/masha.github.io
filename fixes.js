/* =========================================================
   MENTOR STUDIO - FIXES (v3)
   File: mentor/fixes.js

   Load this AFTER script.js:
   <script src="script.js"></script>
   <script src="fixes.js"></script>

   It only replaces a few functions from script.js.
   It does not change style.css or script.js.
   ========================================================= */

(function () {

  "use strict";


  /* =======================================================
     0. MISSING FUNCTION
     script.js calls initializeAudioUI() but never defines it.
     Without this, init() stops half way (no render loop,
     no settings, no history).
     ======================================================= */

  window.initializeAudioUI = function () {

    updateMainVolumeLabel();

    updateMicVolumeLabel();

    updateAudioIndicator();

  };


  /* =======================================================
     1. LOGIN GUARD
     The page stays hidden until Mentor login is verified.
     ======================================================= */

  const guardStyle = document.createElement("style");

  guardStyle.textContent =
    "body:not(.authed) .app { visibility: hidden; }";

  document.head.appendChild(guardStyle);


  import("../auth-guard.js")
    .then(module => module.protectMentor())
    .then(() => {
      document.body.classList.add("authed");
    })
    .catch(error => {
      console.error("Mentor auth guard:", error);
      window.location.replace("../login/");
    });


  /* =======================================================
     2. RECORDING FORMAT (VP8 / VP9 / MP4)
     ======================================================= */

  getRecordingMimeType = function () {

    if (typeof MediaRecorder === "undefined") {
      return "";
    }

    const lists = {

      "mp4": [
        'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
        "video/mp4"
      ],

      "webm-vp8": [
        "video/webm;codecs=vp8,opus",
        "video/webm"
      ],

      "webm-vp9": [
        "video/webm;codecs=vp9,opus",
        "video/webm"
      ]

    };

    const candidates = [
      ...(lists[state.recordingFormat] || lists["webm-vp9"]),
      "video/webm"
    ];

    return (
      candidates.find(
        mime => MediaRecorder.isTypeSupported(mime)
      ) || ""
    );

  };


  /* =======================================================
     3. SCREEN AUDIO IS MIXED INTO THE MAIN AUDIO
     ======================================================= */

  const originalStartScreenCapture = startScreenCapture;

  startScreenCapture = async function () {

    await originalStartScreenCapture();

    if (
      state.screenStream &&
      state.audioContext &&
      state.masterDestination
    ) {

      const audioTracks =
        state.screenStream.getAudioTracks();

      if (audioTracks.length) {

        const source =
          state.audioContext.createMediaStreamSource(
            new MediaStream(audioTracks)
          );

        source.connect(
          state.masterDestination
        );

        state.screenAudioTracks =
          audioTracks;

        audioTracks.forEach(
          track => state.screenStream.removeTrack(track)
        );

      }

    }

  };


  const originalStopScreenCapture = stopScreenCapture;

  stopScreenCapture = function () {

    if (state.screenAudioTracks) {

      state.screenAudioTracks.forEach(
        track => {
          try { track.stop(); } catch (_) {}
        }
      );

      state.screenAudioTracks = null;

    }

    originalStopScreenCapture();

  };


  /* =======================================================
     4. RECORDING PREVIEW (WebM duration fix)
     ======================================================= */

  const originalPreviewMetadata = handlePreviewMetadata;

  handlePreviewMetadata = function () {

    const video = $("recordingPreviewVideo");

    if (
      video &&
      !Number.isFinite(video.duration)
    ) {

      const onFix = () => {

        if (!Number.isFinite(video.duration)) {
          return;
        }

        video.removeEventListener(
          "timeupdate",
          onFix
        );

        video.currentTime = 0;

        originalPreviewMetadata();

      };

      video.addEventListener(
        "timeupdate",
        onFix
      );

      video.currentTime = 1e9;

      return;

    }

    originalPreviewMetadata();

  };


  /* =======================================================
     5. AI BACKGROUND: hide the plain camera video
     ======================================================= */

  const originalSetBackgroundMode = setBackgroundMode;

  setBackgroundMode = async function (mode) {

    await originalSetBackgroundMode(mode);

    const hidePlain =
      mode !== "original" &&
      state.segmentationReady;

    [
      $("mentorCameraVideo"),
      $("mentorVideo")
    ].forEach(video => {

      if (video) {

        video.style.visibility =
          hidePlain
            ? "hidden"
            : "visible";

      }

    });

  };


  /* =======================================================
     6. AI BACKGROUND - SHARP, HIGH QUALITY
     - full camera resolution (up to 1280 px), not 640 px
     - smooth (feathered) edge around the person
     - faster refresh
     - camera mirror is the same as the normal view
     ======================================================= */

  function ensureAIQuality() {

    if (!state._aiFixed) {

      const make = () => {

        const canvas =
          document.createElement("canvas");

        return {
          canvas,
          ctx: canvas.getContext("2d")
        };

      };

      const source = make();
      const mask = make();
      const person = make();

      state.sourceCanvas = source.canvas;
      state.sourceCtx = source.ctx;

      state.maskCanvas = mask.canvas;
      state.maskCtx = mask.ctx;

      state.personCanvas = person.canvas;
      state.personCtx = person.ctx;

      state._aiFixed = true;

    }


    if (
      state.segmentation &&
      !state._aiOptionsFixed
    ) {

      try {

        state.segmentation.setOptions({
          modelSelection: 0,
          selfieMode: false
        });

        state._aiOptionsFixed = true;

      }
      catch (error) {

        console.warn(
          "Segmentation options:",
          error
        );

      }

    }

  }


  processSegmentationFrame = async function () {

    if (
      !state.segmentationReady ||
      !state.segmentation ||
      state.segmentationBusy
    ) {
      return;
    }

    const source = getMentorSourceVideo();

    if (
      !source ||
      source.readyState < 2 ||
      !source.videoWidth
    ) {
      return;
    }

    ensureAIQuality();

    state.segmentationBusy = true;

    try {

      const scale =
        Math.min(1, 1280 / source.videoWidth);

      const width =
        Math.max(
          1,
          Math.floor(source.videoWidth * scale)
        );

      const height =
        Math.max(
          1,
          Math.floor(source.videoHeight * scale)
        );

      prepareAICanvases(width, height);

      const ctx = state.sourceCtx;

      ctx.save();

      ctx.clearRect(0, 0, width, height);

      if (state.mentorSource === "camera") {

        ctx.translate(width, 0);

        ctx.scale(-1, 1);

      }

      ctx.drawImage(
        source,
        0,
        0,
        width,
        height
      );

      ctx.restore();

      await state.segmentation.send({
        image: state.sourceCanvas
      });

    }
    catch (error) {

      console.warn(
        "Segmentation frame failed:",
        error
      );

    }
    finally {

      state.segmentationBusy = false;

    }

  };


  handleSegmentationResults = function (results) {

    const mask = results && results.segmentationMask;

    if (!mask) {
      return;
    }

    const width = state.aiFrameWidth;
    const height = state.aiFrameHeight;

    if (!width || !height) {
      return;
    }

    const feather =
      Math.max(1, Math.round(width / 500));


    /* Soft edge mask */

    const maskCtx = state.maskCtx;

    maskCtx.clearRect(0, 0, width, height);

    maskCtx.filter =
      `blur(${feather}px)`;

    maskCtx.drawImage(
      mask,
      0,
      0,
      width,
      height
    );

    maskCtx.filter = "none";


    /* Person only */

    const personCtx = state.personCtx;

    personCtx.globalCompositeOperation =
      "source-over";

    personCtx.clearRect(0, 0, width, height);

    personCtx.drawImage(
      state.sourceCanvas,
      0,
      0,
      width,
      height
    );

    personCtx.globalCompositeOperation =
      "destination-in";

    personCtx.drawImage(
      state.maskCanvas,
      0,
      0,
      width,
      height
    );

    personCtx.globalCompositeOperation =
      "source-over";


    drawAIComposite(width, height);

  };


  drawAIComposite = function (width, height) {

    const output = $("mentorAICanvas");

    if (!output) {
      return;
    }

    if (
      output.width !== width ||
      output.height !== height
    ) {

      output.width = width;
      output.height = height;

    }

    const ctx = output.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";


    if (state.backgroundMode === "blur") {

      ctx.save();

      ctx.filter =
        `blur(${Math.round(width / 70)}px)`;

      ctx.drawImage(
        state.sourceCanvas,
        0,
        0,
        width,
        height
      );

      ctx.restore();

    }
    else if (state.backgroundMode === "custom") {

      if (state.customBackgroundImage) {

        drawCover(
          ctx,
          state.customBackgroundImage,
          0,
          0,
          width,
          height
        );

      }
      else {

        ctx.fillStyle = "#101827";

        ctx.fillRect(0, 0, width, height);

      }

    }
    else if (state.backgroundMode === "color") {

      ctx.fillStyle =
        $("backgroundColor")?.value ||
        "#101827";

      ctx.fillRect(0, 0, width, height);

    }
    else if (state.backgroundMode === "original") {

      ctx.drawImage(
        state.sourceCanvas,
        0,
        0,
        width,
        height
      );

      output.style.display = "block";

      return;

    }
    /* "remove" keeps a transparent background */


    ctx.drawImage(
      state.personCanvas,
      0,
      0,
      width,
      height
    );

    output.style.display = "block";

  };


  /* Faster refresh (script.js already runs a slower loop) */

  setInterval(
    () => {

      if (state.backgroundMode !== "original") {

        processSegmentationFrame();

      }

    },
    33
  );


  /* =======================================================
     7. NO EMPTY "MENTOR" BOX IN THE RECORDING
     ======================================================= */

  const originalDrawMentor = drawMentorComposition;

  drawMentorComposition = function (ctx, width, height) {

    if (state.mentorSource === "none") {
      return;
    }

    originalDrawMentor(ctx, width, height);

  };


  /* =======================================================
     8. DUPLICATE ID: Files > Background button
     ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      const buttons =
        document.querySelectorAll(
          "#uploadBackgroundSideBtn"
        );

      if (buttons[1]) {

        buttons[1].addEventListener(
          "click",
          () => $("backgroundImageUpload")?.click()
        );

      }

    }
  );


  /* =======================================================
     9. TELEPROMPTER IN A SEPARATE, MOVABLE WINDOW
     - Second monitor: opens full screen on monitor 2
       (Chrome / Edge, permission asked once)
     - One monitor: floating always-on-top window
       (Document Picture-in-Picture)
     - Other browsers: normal popup window
     - It is NOT part of the recording, so you can read it
       while recording.
     - Script can follow your voice (Voice mode) or scroll
       by itself (Auto mode).
     ======================================================= */

  let tpWin = null;


  openTeleprompter = async function () {

    if (tpWin && !tpWin.closed) {

      tpWin.focus();

      return;

    }

    const width =
      Math.min(
        Math.round(screen.availWidth * 0.7),
        1000
      );

    const height = 380;

    let win = null;


    /* 1) Second monitor (Chrome / Edge, permission needed once) */

    if ("getScreenDetails" in window) {

      try {

        const details =
          await window.getScreenDetails();

        const other =
          details.screens.find(
            item => item !== details.currentScreen
          );

        if (other) {

          win = window.open(
            "",
            "mentorTeleprompter",
            "popup=yes" +
            ",left=" + other.availLeft +
            ",top=" + other.availTop +
            ",width=" + other.availWidth +
            ",height=" + other.availHeight
          );

        }

      }
      catch (error) {

        console.warn(
          "Second monitor:",
          error
        );

        win = null;

      }

    }


    /* 2) Floating window (Document Picture-in-Picture) */

    if (
      !win &&
      "documentPictureInPicture" in window
    ) {

      try {

        win =
          await window.documentPictureInPicture
            .requestWindow({ width, height });

      }
      catch (error) {

        console.warn(
          "Document PiP:",
          error
        );

        win = null;

      }

    }


    /* 3) Normal popup window */

    if (!win) {

      const left =
        Math.round(
          (screen.availLeft || 0) +
          (screen.availWidth - width) / 2
        );

      win = window.open(
        "",
        "mentorTeleprompter",
        "width=" + width +
        ",height=" + height +
        ",left=" + left +
        ",top=0,resizable=yes"
      );

    }


    if (!win) {

      showToast(
        "Popup blocked. Please allow popups for this site and try again.",
        "error",
        5000
      );

      return;

    }


    tpWin = win;

    buildTeleprompterWindow(win);

    document.body.classList.add(
      "teleprompter-open"
    );

  };


  closeTeleprompter = function () {

    if (tpWin && !tpWin.closed) {

      tpWin.close();

    }

  };


  window.addEventListener(
    "beforeunload",
    () => {

      if (tpWin && !tpWin.closed) {

        tpWin.close();

      }

    }
  );


  function saveTeleprompterSilently() {

    try {

      localStorage.setItem(
        "pcsMentorTeleprompter",
        JSON.stringify({

          text: state.teleprompterText,

          speed: state.teleprompterSpeed,

          fontSize: state.teleprompterFontSize,

          opacity: state.teleprompterOpacity

        })
      );

    }
    catch (_) {}

  }


  function buildTeleprompterWindow(win) {

    const doc = win.document;

    doc.title = "Teleprompter";

    doc.head.innerHTML = "";

    doc.body.innerHTML = "";


    const style = doc.createElement("style");

    style.textContent = `
      * { box-sizing: border-box; }
      html, body {
        margin: 0; height: 100%;
        background: #000; color: #fff;
        font-family: Inter, system-ui, sans-serif;
        overflow: hidden;
      }
      body { display: flex; flex-direction: column; }
      .bar {
        display: flex; flex-wrap: wrap; align-items: center;
        gap: 8px; padding: 7px 10px;
        background: #111; border-bottom: 1px solid #222;
      }
      .bar button, .bar select {
        height: 32px; padding: 0 11px;
        border: 1px solid #333; background: #1c1c1c;
        color: #fff; border-radius: 8px;
        font-size: 12px; font-weight: 700; cursor: pointer;
      }
      .bar button:hover { background: #2a2a2a; }
      .bar label { font-size: 10px; color: #9ca3af; }
      .bar input[type=range] { width: 78px; }
      .meter {
        width: 56px; height: 8px; border-radius: 99px;
        background: #222; overflow: hidden;
      }
      .meter i {
        display: block; height: 100%; width: 0;
        background: #22c55e;
      }
      #viewport { position: relative; flex: 1; min-height: 0; overflow: hidden; }
      #scroller { padding: 0 6vw; will-change: transform; }
      #tpText {
        white-space: pre-wrap; word-break: break-word;
        text-align: center; line-height: 1.55;
      }
      .line {
        position: absolute; left: 0; right: 0; top: 45%;
        border-top: 2px solid rgba(96,165,250,.55);
        pointer-events: none;
      }
      #tpEditor {
        display: none; position: absolute; inset: 0;
        width: 100%; height: 100%; padding: 16px;
        background: #0a0a0a; color: #fff;
        border: 0; outline: none; resize: none;
        font-size: 18px; font-family: inherit;
      }
    `;

    doc.head.appendChild(style);


    doc.body.innerHTML = `
      <div class="bar">
        <button id="tpPlay">▶ Start</button>
        <button id="tpEdit">✎ Edit</button>
        <button id="tpTop">⤒ Top</button>
        <select id="tpMode">
          <option value="voice">🎙 Voice</option>
          <option value="auto">⏱ Auto</option>
        </select>
        <label>Speed</label>
        <input id="tpSpeed" type="range" min="1" max="10">
        <label>Size</label>
        <input id="tpSize" type="range" min="18" max="90">
        <label>Mic</label>
        <input id="tpSens" type="range" min="1" max="100">
        <div class="meter"><i id="tpMeter"></i></div>
      </div>
      <div id="viewport">
        <div id="scroller"><div id="tpText"></div></div>
        <div class="line"></div>
        <textarea id="tpEditor"></textarea>
      </div>
    `;


    const d = id => doc.getElementById(id);

    const playBtn = d("tpPlay");
    const editBtn = d("tpEdit");
    const topBtn = d("tpTop");
    const modeSel = d("tpMode");
    const speedRange = d("tpSpeed");
    const sizeRange = d("tpSize");
    const sensRange = d("tpSens");
    const meter = d("tpMeter");
    const viewport = d("viewport");
    const scroller = d("scroller");
    const tpText = d("tpText");
    const editor = d("tpEditor");


    let text =
      state.teleprompterText ||
      "Write your script here...";

    let speed =
      Number(state.teleprompterSpeed) || 5;

    let size =
      Number(state.teleprompterFontSize) || 38;

    let sens =
      Number(localStorage.getItem("pcsTeleprompterSens")) || 60;

    let mode =
      localStorage.getItem("pcsTeleprompterMode") || "voice";

    let playing = false;
    let editing = false;
    let closed = false;
    let pos = 0;
    let last = null;
    let lastVoice = -100000;
    let raf = null;

    let micStream = null;
    let audioCtx = null;
    let analyser = null;
    let samples = null;


    tpText.textContent = text;

    tpText.style.opacity =
      String(state.teleprompterOpacity || 0.9);

    speedRange.value = speed;
    sizeRange.value = size;
    sensRange.value = sens;
    modeSel.value = mode;


    function layout() {

      tpText.style.fontSize = size + "px";

      scroller.style.paddingTop =
        Math.round(viewport.clientHeight * 0.45) + "px";

      scroller.style.paddingBottom =
        Math.round(viewport.clientHeight * 0.6) + "px";

    }

    layout();

    setTimeout(layout, 120);

    win.addEventListener("resize", layout);


    async function ensureMic() {

      if (analyser) {
        return true;
      }

      try {

        micStream =
          await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: false
            }
          });

        audioCtx =
          new (window.AudioContext ||
            window.webkitAudioContext)();

        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }

        const source =
          audioCtx.createMediaStreamSource(micStream);

        analyser = audioCtx.createAnalyser();

        analyser.fftSize = 1024;

        source.connect(analyser);

        samples = new Uint8Array(analyser.fftSize);

        return true;

      }
      catch (error) {

        console.warn(
          "Teleprompter mic:",
          error
        );

        showToast(
          "Microphone not available. Auto mode will be used.",
          "info"
        );

        mode = "auto";

        modeSel.value = "auto";

        return false;

      }

    }


    function readLevel() {

      analyser.getByteTimeDomainData(samples);

      let sum = 0;

      for (let i = 0; i < samples.length; i++) {

        const x = (samples[i] - 128) / 128;

        sum += x * x;

      }

      return Math.sqrt(sum / samples.length);

    }


    function frame(now) {

      if (closed) {
        return;
      }

      if (last === null) {
        last = now;
      }

      const dt =
        Math.min((now - last) / 1000, 0.1);

      last = now;


      if (analyser) {

        const level = readLevel();

        const threshold =
          0.004 + (1 - sens / 100) * 0.08;

        if (level > threshold) {
          lastVoice = now;
        }

        meter.style.width =
          Math.min(100, (level / 0.15) * 100) + "%";

      }


      const speaking =
        now - lastVoice < 600;


      if (
        playing &&
        !editing &&
        (mode === "auto" || speaking)
      ) {

        pos += speed * 14 * dt;

        const max =
          Math.max(
            0,
            scroller.scrollHeight -
            viewport.clientHeight * 0.55
          );

        if (pos > max) {
          pos = max;
        }

        scroller.style.transform =
          "translateY(-" + pos + "px)";

      }

      raf = win.requestAnimationFrame(frame);

    }

    raf = win.requestAnimationFrame(frame);


    async function togglePlay() {

      if (editing) {
        return;
      }

      if (!playing) {

        if (mode === "voice") {
          await ensureMic();
        }

        playing = true;

        playBtn.textContent = "⏸ Pause";

      }
      else {

        playing = false;

        playBtn.textContent = "▶ Start";

      }

    }

    playBtn.addEventListener("click", togglePlay);


    doc.addEventListener(
      "keydown",
      event => {

        if (
          event.code === "Space" &&
          !editing
        ) {

          event.preventDefault();

          togglePlay();

        }

      }
    );


    topBtn.addEventListener(
      "click",
      () => {

        pos = 0;

        scroller.style.transform =
          "translateY(0px)";

      }
    );


    editBtn.addEventListener(
      "click",
      () => {

        editing = !editing;

        if (editing) {

          playing = false;

          playBtn.textContent = "▶ Start";

          editor.value = text;

          editor.style.display = "block";

          editBtn.textContent = "✓ Done";

          editor.focus();

        }
        else {

          text = editor.value;

          state.teleprompterText = text;

          tpText.textContent = text;

          editor.style.display = "none";

          editBtn.textContent = "✎ Edit";

          if ($("teleprompterText")) {
            $("teleprompterText").value = text;
          }

          updateTeleprompterPreview();

          saveTeleprompterSilently();

          layout();

        }

      }
    );


    modeSel.addEventListener(
      "change",
      async () => {

        mode = modeSel.value;

        localStorage.setItem(
          "pcsTeleprompterMode",
          mode
        );

        if (mode === "voice" && playing) {
          await ensureMic();
        }

      }
    );


    speedRange.addEventListener(
      "input",
      () => {

        speed = Number(speedRange.value);

        state.teleprompterSpeed = speed;

        if ($("teleprompterSpeed")) {
          $("teleprompterSpeed").value = speed;
        }

        saveTeleprompterSilently();

      }
    );


    sizeRange.addEventListener(
      "input",
      () => {

        size = Number(sizeRange.value);

        state.teleprompterFontSize = size;

        if ($("teleprompterFontSize")) {
          $("teleprompterFontSize").value = size;
        }

        saveTeleprompterSilently();

        layout();

      }
    );


    sensRange.addEventListener(
      "input",
      () => {

        sens = Number(sensRange.value);

        localStorage.setItem(
          "pcsTeleprompterSens",
          String(sens)
        );

      }
    );


    function cleanup() {

      if (closed) {
        return;
      }

      closed = true;

      if (raf) {

        try {
          win.cancelAnimationFrame(raf);
        }
        catch (_) {}

      }

      if (micStream) {

        micStream
          .getTracks()
          .forEach(track => track.stop());

        micStream = null;

      }

      if (audioCtx) {

        audioCtx.close().catch(() => {});

        audioCtx = null;

      }

      analyser = null;

      tpWin = null;

      document.body.classList.remove(
        "teleprompter-open"
      );

    }

    win.addEventListener("pagehide", cleanup);

    win.addEventListener("unload", cleanup);

  }

})();
