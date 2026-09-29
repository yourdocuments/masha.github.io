/* =========================================================
   PERSONAL COURSE STUDIO — STEP 3.4
   File: mentor/script.js

   Features:
   - Main image / video
   - Mentor video upload
   - Webcam start / stop / switch
   - AI background: original / remove / blur / image / color
   - Mentor overlay drag + resize compatibility
   - Students panel
   - Settings + localStorage
   - Final composition recording canvas
   - Main video audio + microphone audio
   - WebM download
========================================================= */

"use strict";

/* -----------------------------
   DOM
----------------------------- */

const $ = (id) => document.getElementById(id);

const stage = $("stage");

const imageUpload = $("imageUpload");
const videoUpload = $("videoUpload");
const mentorUpload = $("mentorUpload");

const mainImage = $("mainImage");
const mainVideo = $("mainVideo");
const mentorVideo = $("mentorVideo");
const mentorCameraVideo = $("mentorCameraVideo");
const mentorAICanvas = $("mentorAICanvas");

const mentorPlaceholder = $("mentorPlaceholder");
const mentorCard = $("mentorCard");
const mentorResize = $("mentorResize");
const mentorSourceLabel = $("mentorSourceLabel");

const welcomeContent = $("welcomeContent");
const brandBadge = $("brandBadge");
const brandInput = $("brandInput");

const studentsList = $("studentsList");
const studentCount = $("studentCount");

const statusText = $("statusText");
const statusDot = $("statusDot");
const recordTopBtn = $("recordTopBtn");

const settingsModal = $("settingsModal");
const toast = $("toast");

const startCameraBtn = $("startCameraBtn");
const stopCameraBtn = $("stopCameraBtn");
const switchCameraBtn = $("switchCameraBtn");
const cameraStatus = $("cameraStatus");

const bgOriginalBtn = $("bgOriginalBtn");
const bgRemoveBtn = $("bgRemoveBtn");
const bgBlurBtn = $("bgBlurBtn");
const bgImageBtn = $("bgImageBtn");
const bgColorBtn = $("bgColorBtn");
const backgroundColor = $("backgroundColor");
const backgroundImageUpload = $("backgroundImageUpload");

const aiCanvas = $("aiCanvas");
const aiSourceCanvas = $("aiSourceCanvas");
const aiMaskCanvas = $("aiMaskCanvas");

const ctx = aiCanvas?.getContext("2d", { willReadFrequently: true });
const sourceCtx = aiSourceCanvas?.getContext("2d", { willReadFrequently: true });
const maskCtx = aiMaskCanvas?.getContext("2d", { willReadFrequently: true });

/* -----------------------------
   State
----------------------------- */

let students = Array.from({ length: 8 }, (_, i) => ({
  name: `Student ${String(i + 1).padStart(2, "0")}`,
  online: true
}));

let cameraStream = null;
let cameraFacingMode = "user";
let cameraActive = false;

let segmentation = null;
let segmentationReady = false;
let segmentationBusy = false;

let backgroundMode = "original";
let customBackgroundImage = null;

let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];

let compositionCanvas = null;
let compositionCtx = null;
let compositionAnimationId = null;
let compositionLastFrame = 0;

let audioContext = null;
let audioDestination = null;
let microphoneStream = null;
let microphoneSource = null;
let mainVideoAudioSource = null;
let mentorVideoAudioSource = null;

let mentorDragging = false;
let dragPointerId = null;
let dragStartX = 0;
let dragStartY = 0;
let dragStartLeft = 0;
let dragStartTop = 0;

const MASK_EDGE_START = 0.10;
const MASK_EDGE_END = 0.62;
const MASK_EDGE_POWER = 1.15;

/* -----------------------------
   Helpers
----------------------------- */

function showToast(message) {
  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function setStatus(message, online = true) {
  if (statusText) statusText.textContent = message;
  if (statusDot) {
    statusDot.style.background = online ? "#22c55e" : "#f59e0b";
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function createFileDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smoothStep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function getStageRect() {
  return stage?.getBoundingClientRect() || null;
}

function isVisible(element) {
  if (!element) return false;
  const style = getComputedStyle(element);
  return style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number(style.opacity) !== 0 &&
    element.getBoundingClientRect().width > 0;
}

function setElementVisible(element, visible) {
  if (!element) return;
  element.style.display = visible ? "" : "none";
}

/* -----------------------------
   Students
----------------------------- */

function renderStudents() {
  if (!studentsList) return;

  studentsList.innerHTML = students.map((student, index) => `
    <div class="student-item">
      <div class="student-avatar">${escapeHTML(student.name.charAt(0).toUpperCase())}</div>
      <div class="student-info">
        <strong>${escapeHTML(student.name)}</strong>
        <small>
          <span class="student-online-dot"></span>
          ${student.online ? "Online" : "Offline"}
        </small>
      </div>
      <button class="student-remove" type="button" data-remove-student="${index}" aria-label="Remove student">×</button>
    </div>
  `).join("");

  updateStudentCount();
}

function updateStudentCount() {
  if (studentCount) studentCount.textContent = students.length;
}

function addStudent(name = "") {
  const studentName = name.trim() || `Student ${String(students.length + 1).padStart(2, "0")}`;
  students.push({ name: studentName, online: true });
  renderStudents();
  showToast("Student added");
}

function removeStudent(index) {
  if (index < 0 || index >= students.length) return;
  students.splice(index, 1);
  renderStudents();
}

studentsList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-student]");
  if (!button) return;
  removeStudent(Number(button.dataset.removeStudent));
});

/* -----------------------------
   Main image / video
----------------------------- */

imageUpload?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  mainImage.src = url;
  mainImage.style.display = "block";

  if (mainVideo) {
    mainVideo.pause();
    mainVideo.removeAttribute("src");
    mainVideo.load();
    mainVideo.style.display = "none";
  }

  if (welcomeContent) welcomeContent.style.display = "none";

  setStatus("Slide loaded");
  showToast("Image added to class stage");
});

videoUpload?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  if (mainImage) {
    mainImage.removeAttribute("src");
    mainImage.style.display = "none";
  }

  mainVideo.src = url;
  mainVideo.style.display = "block";
  mainVideo.load();

  if (welcomeContent) welcomeContent.style.display = "none";

  setStatus("Class video loaded");
  showToast("Video added to class stage");
});

mentorUpload?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  stopCamera();

  if (mentorVideo) {
    mentorVideo.src = url;
    mentorVideo.style.display = "block";
    mentorVideo.controls = true;
    mentorVideo.play().catch(() => {});
  }

  setElementVisible(mentorCameraVideo, false);
  setElementVisible(mentorAICanvas, false);
  setElementVisible(mentorPlaceholder, false);

  if (mentorSourceLabel) mentorSourceLabel.textContent = "Uploaded Mentor Video";

  showToast("Mentor video loaded");
});

function toggleMainPlay() {
  if (!mainVideo || !mainVideo.src) {
    showToast("Upload a class video first");
    return;
  }

  if (mainVideo.paused) {
    mainVideo.play().catch(() => showToast("Could not play video"));
  } else {
    mainVideo.pause();
  }
}

mainVideo?.addEventListener("ended", () => {
  showToast("Class video finished");
});

function clearMainContent() {
  if (mainImage) {
    mainImage.removeAttribute("src");
    mainImage.style.display = "none";
  }

  if (mainVideo) {
    mainVideo.pause();
    mainVideo.removeAttribute("src");
    mainVideo.load();
    mainVideo.style.display = "none";
  }

  if (welcomeContent) welcomeContent.style.display = "";
  showToast("Stage cleared");
}

function fullscreenStage() {
  if (!stage) return;

  if (document.fullscreenElement) {
    document.exitFullscreen?.();
  } else {
    stage.requestFullscreen?.().catch(() => {});
  }
}

/* -----------------------------
   Camera
----------------------------- */

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Camera requires HTTPS or localhost");
    return;
  }

  stopCamera();

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: cameraFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    if (mentorCameraVideo) {
      mentorCameraVideo.srcObject = cameraStream;
      mentorCameraVideo.muted = true;
      mentorCameraVideo.playsInline = true;
      mentorCameraVideo.style.display = "block";
      await mentorCameraVideo.play();
    }

    cameraActive = true;

    setElementVisible(mentorVideo, false);
    setElementVisible(mentorPlaceholder, false);

    if (mentorSourceLabel) {
      mentorSourceLabel.textContent = cameraFacingMode === "user"
        ? "Mentor Camera"
        : "External Camera";
    }

    if (cameraStatus) cameraStatus.textContent = "Camera connected";
    if (startCameraBtn) startCameraBtn.disabled = true;
    if (stopCameraBtn) stopCameraBtn.disabled = false;

    await initializeSegmentation();

    setStatus("Camera active");
    showToast("Camera started");
  } catch (error) {
    console.error(error);
    setStatus("Camera unavailable", false);
    if (cameraStatus) cameraStatus.textContent = "Camera permission or device error";
    showToast("Could not start camera. Check permission.");
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  cameraActive = false;

  if (mentorCameraVideo) {
    mentorCameraVideo.pause();
    mentorCameraVideo.srcObject = null;
    mentorCameraVideo.style.display = "none";
  }

  if (mentorAICanvas) mentorAICanvas.style.display = "none";

  if (startCameraBtn) startCameraBtn.disabled = false;
  if (stopCameraBtn) stopCameraBtn.disabled = true;
  if (cameraStatus) cameraStatus.textContent = "Camera stopped";

  setStatus("Camera stopped");
}

async function switchCamera() {
  cameraFacingMode = cameraFacingMode === "user" ? "environment" : "user";

  if (cameraActive) {
    await startCamera();
  }

  if (mentorCameraVideo) {
    mentorCameraVideo.style.transform =
      cameraFacingMode === "user" ? "scaleX(-1)" : "none";
  }

  showToast(cameraFacingMode === "user" ? "Front camera" : "Rear camera");
}

startCameraBtn?.addEventListener("click", startCamera);
stopCameraBtn?.addEventListener("click", stopCamera);
switchCameraBtn?.addEventListener("click", switchCamera);

/* -----------------------------
   AI Segmentation
----------------------------- */

async function initializeSegmentation() {
  if (segmentationReady || !window.SelfieSegmentation) return;

  try {
    segmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
    });

    segmentation.setOptions({
      modelSelection: 1,
      selfieMode: false
    });

    segmentation.onResults(handleSegmentationResults);

    await segmentation.initialize();
    segmentationReady = true;

    if (cameraActive) {
      requestSegmentationFrame();
    }
  } catch (error) {
    console.error("Segmentation initialization failed:", error);
    showToast("AI background could not initialize");
  }
}

async function requestSegmentationFrame() {
  if (!cameraActive || !segmentationReady || segmentationBusy) return;
  if (!mentorCameraVideo || mentorCameraVideo.readyState < 2) {
    requestAnimationFrame(requestSegmentationFrame);
    return;
  }

  segmentationBusy = true;

  try {
    await segmentation.send({ image: mentorCameraVideo });
  } catch (error) {
    console.error("Segmentation frame error:", error);
  } finally {
    segmentationBusy = false;
    if (cameraActive) requestAnimationFrame(requestSegmentationFrame);
  }
}

function handleSegmentationResults(results) {
  if (!mentorAICanvas || !ctx || !results.image) return;

  const width = results.image.videoWidth || results.image.width || 640;
  const height = results.image.videoHeight || results.image.height || 480;

  if (mentorAICanvas.width !== width || mentorAICanvas.height !== height) {
    mentorAICanvas.width = width;
    mentorAICanvas.height = height;
  }

  if (aiSourceCanvas && (aiSourceCanvas.width !== width || aiSourceCanvas.height !== height)) {
    aiSourceCanvas.width = width;
    aiSourceCanvas.height = height;
  }

  if (aiMaskCanvas && (aiMaskCanvas.width !== width || aiMaskCanvas.height !== height)) {
    aiMaskCanvas.width = width;
    aiMaskCanvas.height = height;
  }

  if (backgroundMode === "original") {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(results.image, 0, 0, width, height);
    mentorAICanvas.style.display = "block";
    mentorCameraVideo.style.display = "none";
    return;
  }

  if (backgroundMode === "remove") {
    drawPersonWithBackground(results, width, height, "transparent");
  } else if (backgroundMode === "blur") {
    drawPersonWithBackground(results, width, height, "blur");
  } else if (backgroundMode === "image") {
    drawPersonWithBackground(results, width, height, "image");
  } else if (backgroundMode === "color") {
    drawPersonWithBackground(results, width, height, "color");
  }

  mentorAICanvas.style.display = "block";
  mentorCameraVideo.style.display = "none";
}

function drawPersonWithBackground(results, width, height, mode) {
  if (!sourceCtx || !maskCtx || !aiSourceCanvas || !aiMaskCanvas || !ctx) return;

  sourceCtx.clearRect(0, 0, width, height);
  sourceCtx.drawImage(results.image, 0, 0, width, height);

  maskCtx.clearRect(0, 0, width, height);
  if (results.segmentationMask) {
    maskCtx.drawImage(results.segmentationMask, 0, 0, width, height);
  }

  const sourceData = sourceCtx.getImageData(0, 0, width, height);
  const maskData = maskCtx.getImageData(0, 0, width, height);

  const personData = new ImageData(width, height);

  for (let i = 0; i < sourceData.data.length; i += 4) {
    const confidence = maskData.data[i] / 255;
    let alpha = smoothStep(MASK_EDGE_START, MASK_EDGE_END, confidence);
    alpha = Math.pow(alpha, MASK_EDGE_POWER);

    personData.data[i] = sourceData.data[i];
    personData.data[i + 1] = sourceData.data[i + 1];
    personData.data[i + 2] = sourceData.data[i + 2];
    personData.data[i + 3] = Math.round(alpha * 255);
  }

  ctx.clearRect(0, 0, width, height);

  if (mode === "blur") {
    ctx.save();
    ctx.filter = "blur(14px)";
    ctx.drawImage(results.image, -20, -20, width + 40, height + 40);
    ctx.restore();
  } else if (mode === "image") {
    if (customBackgroundImage && customBackgroundImage.complete) {
      drawImageCover(ctx, customBackgroundImage, 0, 0, width, height);
    } else {
      ctx.fillStyle = "#253247";
      ctx.fillRect(0, 0, width, height);
    }
  } else if (mode === "color") {
    ctx.fillStyle = backgroundColor?.value || "#263548";
    ctx.fillRect(0, 0, width, height);
  }

  const personCanvas = document.createElement("canvas");
  personCanvas.width = width;
  personCanvas.height = height;
  personCanvas.getContext("2d").putImageData(personData, 0, 0);

  ctx.drawImage(personCanvas, 0, 0);
}

function drawImageCover(context, image, x, y, width, height) {
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih) return;

  const scale = Math.max(width / iw, height / ih);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;

  context.drawImage(image, sx, sy, sw, sh, x, y, width, height);
}

/* -----------------------------
   Background controls
----------------------------- */

function setBackgroundMode(mode) {
  backgroundMode = mode;

  if (cameraActive && mode === "original") {
    if (mentorAICanvas) mentorAICanvas.style.display = "none";
    if (mentorCameraVideo) mentorCameraVideo.style.display = "block";
  } else if (cameraActive) {
    if (mentorCameraVideo) mentorCameraVideo.style.display = "none";
    if (mentorAICanvas) mentorAICanvas.style.display = "block";
  }

  document.querySelectorAll("[data-bg-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.bgMode === mode);
  });

  showToast(`Background: ${mode}`);
}

bgOriginalBtn?.addEventListener("click", () => setBackgroundMode("original"));
bgRemoveBtn?.addEventListener("click", () => setBackgroundMode("remove"));
bgBlurBtn?.addEventListener("click", () => setBackgroundMode("blur"));
bgImageBtn?.addEventListener("click", () => {
  setBackgroundMode("image");
  backgroundImageUpload?.click();
});
bgColorBtn?.addEventListener("click", () => setBackgroundMode("color"));

backgroundImageUpload?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const image = new Image();
  image.onload = () => {
    customBackgroundImage = image;
    setBackgroundMode("image");
    showToast("Custom background applied");
  };
  image.src = URL.createObjectURL(file);
});

backgroundColor?.addEventListener("input", () => {
  if (backgroundMode === "color") setBackgroundMode("color");
});

/* -----------------------------
   Mentor drag and position
----------------------------- */

function initializeMentorDrag() {
  if (!mentorCard || !stage) return;

  mentorCard.style.touchAction = "none";
  mentorCard.addEventListener("pointerdown", mentorPointerDown);
  window.addEventListener("pointermove", mentorPointerMove);
  window.addEventListener("pointerup", mentorPointerUp);
  window.addEventListener("pointercancel", mentorPointerUp);
}

function mentorPointerDown(event) {
  if (event.target.closest("button, input, select, textarea, a, label, video")) return;
  if (event.target === mentorResize) return;

  const stageRect = getStageRect();
  if (!stageRect) return;

  const cardRect = mentorCard.getBoundingClientRect();

  mentorDragging = true;
  dragPointerId = event.pointerId;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragStartLeft = cardRect.left - stageRect.left;
  dragStartTop = cardRect.top - stageRect.top;

  mentorCard.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function mentorPointerMove(event) {
  if (!mentorDragging || event.pointerId !== dragPointerId) return;

  const stageRect = getStageRect();
  if (!stageRect) return;

  const nextLeft = dragStartLeft + (event.clientX - dragStartX);
  const nextTop = dragStartTop + (event.clientY - dragStartY);

  const maxLeft = stageRect.width - mentorCard.offsetWidth;
  const maxTop = stageRect.height - mentorCard.offsetHeight;

  mentorCard.style.left = `${clamp(nextLeft, 0, maxLeft)}px`;
  mentorCard.style.top = `${clamp(nextTop, 0, maxTop)}px`;
  mentorCard.style.right = "auto";
  mentorCard.style.bottom = "auto";
}

function mentorPointerUp(event) {
  if (!mentorDragging || (event.pointerId !== undefined && event.pointerId !== dragPointerId)) return;

  mentorDragging = false;
  dragPointerId = null;

  localStorage.setItem("courseStudioMentorLeft", mentorCard.style.left || "auto");
  localStorage.setItem("courseStudioMentorTop", mentorCard.style.top || "auto");
}

function resetMentorPosition() {
  if (!mentorCard) return;

  mentorCard.style.left = "auto";
  mentorCard.style.top = "auto";
  mentorCard.style.right = "18px";
  mentorCard.style.bottom = "18px";

  localStorage.removeItem("courseStudioMentorLeft");
  localStorage.removeItem("courseStudioMentorTop");

  showToast("Mentor position reset");
}

/* -----------------------------
   Composition canvas recording
----------------------------- */

function createCompositionCanvas() {
  if (compositionCanvas) return;

  compositionCanvas = document.createElement("canvas");
  compositionCanvas.width = 1920;
  compositionCanvas.height = 1080;
  compositionCanvas.id = "courseStudioRecordCanvas";

  compositionCtx = compositionCanvas.getContext("2d", {
    alpha: false
  });
}

function drawMediaCover(context, media, x, y, width, height) {
  const mediaWidth = media.videoWidth || media.naturalWidth || media.width;
  const mediaHeight = media.videoHeight || media.naturalHeight || media.height;

  if (!mediaWidth || !mediaHeight) return;

  const scale = Math.max(width / mediaWidth, height / mediaHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (mediaWidth - sourceWidth) / 2;
  const sourceY = (mediaHeight - sourceHeight) / 2;

  try {
    context.drawImage(
      media,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height
    );
  } catch (error) {
    // Media may not be ready for drawing yet.
  }
}

function drawRoundedMedia(context, media, x, y, width, height, radius = 24) {
  context.save();
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.clip();
  drawMediaCover(context, media, x, y, width, height);
  context.restore();
}

function getActiveMentorMedia() {
  if (cameraActive && backgroundMode !== "original" && mentorAICanvas) {
    return mentorAICanvas;
  }

  if (cameraActive && mentorCameraVideo) {
    return mentorCameraVideo;
  }

  if (mentorVideo && mentorVideo.src && !mentorVideo.paused) {
    return mentorVideo;
  }

  if (mentorVideo && mentorVideo.src) {
    return mentorVideo;
  }

  return null;
}

function drawMainStage(context, width, height) {
  context.fillStyle = "#101827";
  context.fillRect(0, 0, width, height);

  if (mainVideo && mainVideo.src && isVisible(mainVideo) && mainVideo.readyState >= 2) {
    drawMediaCover(context, mainVideo, 0, 0, width, height);
    return;
  }

  if (mainImage && mainImage.src && isVisible(mainImage) && mainImage.complete) {
    drawMediaCover(context, mainImage, 0, 0, width, height);
    return;
  }

  // Fallback slide when no media is loaded.
  context.fillStyle = "#eaf2fb";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#64748b";
  context.font = "600 44px Arial";
  context.textAlign = "center";
  context.fillText("Personal Course Studio", width / 2, height / 2);
}

function drawMentorOverlay(context, width, height) {
  if (!mentorCard || !stage) return;

  const stageRect = stage.getBoundingClientRect();
  const cardRect = mentorCard.getBoundingClientRect();

  if (!cardRect.width || !cardRect.height) return;

  const scaleX = width / stageRect.width;
  const scaleY = height / stageRect.height;

  const x = (cardRect.left - stageRect.left) * scaleX;
  const y = (cardRect.top - stageRect.top) * scaleY;
  const w = cardRect.width * scaleX;
  const h = cardRect.height * scaleY;

  context.save();

  // Card shadow/background.
  context.shadowColor = "rgba(0,0,0,0.35)";
  context.shadowBlur = 28;
  context.fillStyle = "#111827";
  context.beginPath();
  context.roundRect(x, y, w, h, 24);
  context.fill();
  context.shadowBlur = 0;

  const media = getActiveMentorMedia();

  if (media) {
    drawRoundedMedia(context, media, x, y, w, h, 24);
  } else {
    context.fillStyle = "#1e293b";
    context.beginPath();
    context.roundRect(x, y, w, h, 24);
    context.fill();

    context.fillStyle = "#e2e8f0";
    context.font = `600 ${Math.max(18, w * 0.055)}px Arial`;
    context.textAlign = "center";
    context.fillText("Mentor Camera", x + w / 2, y + h / 2);
  }

  // Recording label.
  context.fillStyle = "rgba(15,23,42,0.72)";
  context.beginPath();
  context.roundRect(x + 14, y + 14, Math.min(230, w - 28), 42, 12);
  context.fill();

  context.fillStyle = "#ffffff";
  context.font = `600 ${Math.max(14, w * 0.035)}px Arial`;
  context.textAlign = "left";
  context.fillText("MENTOR", x + 28, y + 41);

  context.restore();
}

function drawBrandBadge(context, width, height) {
  if (!brandBadge || !isVisible(brandBadge)) return;

  const stageRect = stage.getBoundingClientRect();
  const badgeRect = brandBadge.getBoundingClientRect();

  const scaleX = width / stageRect.width;
  const scaleY = height / stageRect.height;

  const x = (badgeRect.left - stageRect.left) * scaleX;
  const y = (badgeRect.top - stageRect.top) * scaleY;
  const w = badgeRect.width * scaleX;
  const h = badgeRect.height * scaleY;

  const brandName = brandBadge.textContent?.trim() || "Personal Course Studio";

  context.save();
  context.fillStyle = "rgba(15,23,42,0.76)";
  context.beginPath();
  context.roundRect(x, y, w, h, 12);
  context.fill();

  context.fillStyle = "#ffffff";
  context.font = `600 ${Math.max(14, h * 0.42)}px Arial`;
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(brandName, x + 14, y + h / 2, w - 28);
  context.restore();
}

function renderCompositionFrame(timestamp = 0) {
  if (!compositionCtx || !compositionCanvas || !isRecording) return;

  if (timestamp - compositionLastFrame >= 30) {
    compositionLastFrame = timestamp;

    const width = compositionCanvas.width;
    const height = compositionCanvas.height;

    drawMainStage(compositionCtx, width, height);
    drawMentorOverlay(compositionCtx, width, height);
    drawBrandBadge(compositionCtx, width, height);
  }

  compositionAnimationId = requestAnimationFrame(renderCompositionFrame);
}

/* -----------------------------
   Audio mixing
----------------------------- */

async function prepareAudioMix() {
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  audioDestination = audioContext.createMediaStreamDestination();

  // Main video sound.
  if (mainVideo && mainVideo.src) {
    try {
      if (!mainVideoAudioSource) {
        mainVideoAudioSource = audioContext.createMediaElementSource(mainVideo);
        mainVideoAudioSource.connect(audioContext.destination);
      }

      mainVideoAudioSource.connect(audioDestination);
    } catch (error) {
      console.warn("Main video audio routing:", error);
    }
  }

  // Optional uploaded mentor video sound, only when no live camera is active.
  if (!cameraActive && mentorVideo && mentorVideo.src) {
    try {
      if (!mentorVideoAudioSource) {
        mentorVideoAudioSource = audioContext.createMediaElementSource(mentorVideo);
        mentorVideoAudioSource.connect(audioContext.destination);
      }

      mentorVideoAudioSource.connect(audioDestination);
    } catch (error) {
      console.warn("Mentor video audio routing:", error);
    }
  }

  // Microphone audio.
  try {
    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    });

    microphoneSource = audioContext.createMediaStreamSource(microphoneStream);
    microphoneSource.connect(audioDestination);
  } catch (error) {
    console.warn("Microphone unavailable:", error);
    showToast("Microphone unavailable — recording without mic");
  }

  return audioDestination.stream;
}

/* -----------------------------
   Recording controls
----------------------------- */

async function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  if (!stage) {
    showToast("Stage not found");
    return;
  }

  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    showToast("This browser does not support canvas recording");
    return;
  }

  try {
    createCompositionCanvas();

    const audioStream = await prepareAudioMix();
    const videoStream = compositionCanvas.captureStream(30);

    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ]);

    recordedChunks = [];

    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];

    const supportedMimeType = mimeTypes.find((type) =>
      MediaRecorder.isTypeSupported(type)
    );

    mediaRecorder = new MediaRecorder(
      combinedStream,
      supportedMimeType ? { mimeType: supportedMimeType } : undefined
    );

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = finishRecording;

    mediaRecorder.onerror = (event) => {
      console.error("Recorder error:", event.error);
      showToast("Recording error");
    };

    isRecording = true;
    compositionLastFrame = 0;
    compositionAnimationId = requestAnimationFrame(renderCompositionFrame);

    mediaRecorder.start(1000);
    updateRecordingUI();

    setStatus("Recording");
    showToast("Recording started");
  } catch (error) {
    console.error(error);
    isRecording = false;
    updateRecordingUI();
    setStatus("Recording failed", false);
    showToast("Could not start recording");
    cleanupRecordingResources();
  }
}

function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state === "inactive") return;

  isRecording = false;

  if (compositionAnimationId) {
    cancelAnimationFrame(compositionAnimationId);
    compositionAnimationId = null;
  }

  mediaRecorder.stop();
  updateRecordingUI();
  setStatus("Preparing recording");
}

function finishRecording() {
  if (!recordedChunks.length) {
    showToast("No recording data was created");
    cleanupRecordingResources();
    return;
  }

  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `Personal-Course-Studio-${createFileDate()}.webm`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 10000);

  recordedChunks = [];
  cleanupRecordingResources();

  setStatus("Recording saved");
  showToast("Recording downloaded");
}

function cleanupRecordingResources() {
  if (microphoneStream) {
    microphoneStream.getTracks().forEach((track) => track.stop());
    microphoneStream = null;
  }

  microphoneSource = null;

  if (audioDestination) {
    audioDestination = null;
  }
}

function updateRecordingUI() {
  if (!recordTopBtn) return;

  recordTopBtn.classList.toggle("recording", isRecording);
  recordTopBtn.textContent = isRecording ? "■ Stop Recording" : "● Record";
  recordTopBtn.setAttribute("aria-pressed", String(isRecording));
}

recordTopBtn?.addEventListener("click", toggleRecording);

/* -----------------------------
   Settings
----------------------------- */

function openSettings() {
  if (settingsModal) settingsModal.classList.add("open");
}

function closeSettings() {
  if (settingsModal) settingsModal.classList.remove("open");
}

function openBrandSettings() {
  openSettings();
  brandInput?.focus();
}

function saveSettings() {
  const brandName = brandInput?.value.trim() || "Personal Course Studio";

  localStorage.setItem("courseStudioBrand", brandName);

  if (brandBadge) brandBadge.textContent = brandName;

  closeSettings();
  showToast("Settings saved");
}

function loadSettings() {
  const savedBrand = localStorage.getItem("courseStudioBrand");

  if (savedBrand) {
    if (brandBadge) brandBadge.textContent = savedBrand;
    if (brandInput) brandInput.value = savedBrand;
  }

  const savedLeft = localStorage.getItem("courseStudioMentorLeft");
  const savedTop = localStorage.getItem("courseStudioMentorTop");

  if (mentorCard && savedLeft && savedTop) {
    mentorCard.style.left = savedLeft;
    mentorCard.style.top = savedTop;
    mentorCard.style.right = "auto";
    mentorCard.style.bottom = "auto";
  }

  const savedWidth = localStorage.getItem("courseStudioMentorWidth");
  const savedHeight = localStorage.getItem("courseStudioMentorHeight");

  if (mentorCard && savedWidth) mentorCard.style.width = savedWidth;
  if (mentorCard && savedHeight) mentorCard.style.height = savedHeight;
}

settingsModal?.addEventListener("click", (event) => {
  if (event.target === settingsModal) closeSettings();
});

/* -----------------------------
   Button compatibility
----------------------------- */

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    switch (action) {
      case "play":
        toggleMainPlay();
        break;
      case "clear":
        clearMainContent();
        break;
      case "fullscreen":
        fullscreenStage();
        break;
      case "settings":
        openSettings();
        break;
      case "close-settings":
        closeSettings();
        break;
      case "save-settings":
        saveSettings();
        break;
      case "brand-settings":
        openBrandSettings();
        break;
      case "reset-mentor":
        resetMentorPosition();
        break;
      case "record":
        toggleRecording();
        break;
      case "add-student":
        addStudent();
        break;
    }
  });
});

/* -----------------------------
   Keyboard shortcuts
----------------------------- */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSettings();
  }

  if (event.ctrlKey && event.key === "Enter") {
    event.preventDefault();
    toggleRecording();
  }

  if (
    event.key.toLowerCase() === "r" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
  ) {
    resetMentorPosition();
  }
});

/* -----------------------------
   Optional global helpers
----------------------------- */

window.CourseStudio = {
  addStudent,
  removeStudent,
  toggleRecording,
  startRecording,
  stopRecording,
  startCamera,
  stopCamera,
  switchCamera,
  setBackgroundMode,
  resetMentorPosition,
  clearMainContent,
  fullscreenStage,
  openSettings,
  closeSettings,
  saveSettings
};

/* -----------------------------
   Initialize
----------------------------- */

renderStudents();
loadSettings();
initializeMentorDrag();

if (mentorResize && mentorCard) {
  // Resize is handled by the resize control already present in index.html.
  mentorResize.style.touchAction = "none";
}

if (stopCameraBtn) stopCameraBtn.disabled = true;

setStatus("Ready");
