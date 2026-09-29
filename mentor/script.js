/* =========================================================
   PERSONAL COURSE STUDIO
   MENTOR STUDIO — COMPLETE script.js

   File:
   mentor/script.js

   FEATURES
   ---------------------------------------------------------
   ✓ Students
   ✓ Image upload
   ✓ Main video upload
   ✓ Mentor video upload
   ✓ Mentor drag / move
   ✓ Mentor resize support
   ✓ Mentor position save
   ✓ Main video play / pause
   ✓ Recording
   ✓ Settings
   ✓ Brand settings
   ✓ Mentor background
   ✓ AI camera background
   ✓ Original
   ✓ Remove background
   ✓ Blur background
   ✓ Custom image background
   ✓ Solid color background
   ✓ Proper person alpha masking
   ✓ Camera mode
   ✓ LocalStorage settings
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const imageUpload =
  document.getElementById("imageUpload");

const videoUpload =
  document.getElementById("videoUpload");

const mentorUpload =
  document.getElementById("mentorUpload");

const mainImage =
  document.getElementById("mainImage");

const mainVideo =
  document.getElementById("mainVideo");

const mentorVideo =
  document.getElementById("mentorVideo");

const mentorPlaceholder =
  document.getElementById("mentorPlaceholder");

const welcomeContent =
  document.getElementById("welcomeContent");

const brandBadge =
  document.getElementById("brandBadge");

const brandInput =
  document.getElementById("brandInput");

const mentorCard =
  document.getElementById("mentorCard");

const studentsList =
  document.getElementById("studentsList");

const studentCount =
  document.getElementById("studentCount");

const statusText =
  document.getElementById("statusText");

const statusDot =
  document.getElementById("statusDot");

const recordTopBtn =
  document.getElementById("recordTopBtn");

const settingsModal =
  document.getElementById("settingsModal");

const toast =
  document.getElementById("toast");

const stage =
  document.getElementById("stage");

const backgroundColor =
  document.getElementById("backgroundColor");

const backgroundImageUpload =
  document.getElementById("backgroundImageUpload");

const aiCanvas =
  document.getElementById("aiCanvas");

const aiSourceCanvas =
  document.getElementById("aiSourceCanvas");

const aiMaskCanvas =
  document.getElementById("aiMaskCanvas");


/* =========================================================
   STUDENTS
   ========================================================= */

let students = [
  {
    name: "Student 01",
    status: "Online"
  },
  {
    name: "Student 02",
    status: "Online"
  },
  {
    name: "Student 03",
    status: "Online"
  },
  {
    name: "Student 04",
    status: "Online"
  },
  {
    name: "Student 05",
    status: "Online"
  },
  {
    name: "Student 06",
    status: "Online"
  },
  {
    name: "Student 07",
    status: "Online"
  },
  {
    name: "Student 08",
    status: "Online"
  }
];


function renderStudents() {

  if (!studentsList) {
    return;
  }

  studentsList.innerHTML = "";

  students.forEach(
    (student, index) => {

      const item =
        document.createElement("div");

      item.className =
        "student-item";

      item.innerHTML = `
        <div class="student-avatar">
          ${escapeHTML(
            getStudentInitials(student.name)
          )}
        </div>

        <div class="student-info">

          <div class="student-name">
            ${escapeHTML(student.name)}
          </div>

          <div class="student-status">
            ● ${escapeHTML(student.status)}
          </div>

        </div>

        <button
          class="student-remove"
          type="button"
          title="Remove student"
        >
          ✕
        </button>
      `;


      const removeButton =
        item.querySelector(
          ".student-remove"
        );


      if (removeButton) {

        removeButton.addEventListener(
          "click",
          function () {

            removeStudent(index);

          }
        );

      }


      studentsList.appendChild(item);

    }
  );


  updateStudentCount();

}


function updateStudentCount() {

  if (studentCount) {

    studentCount.textContent =
      students.length;

  }

}


function getStudentInitials(name) {

  if (!name) {
    return "ST";
  }

  const words =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (words.length === 1) {

    return words[0]
      .substring(0, 2)
      .toUpperCase();

  }


  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();

}


function addStudent() {

  const number =
    students.length + 1;

  students.push({
    name:
      `Student ${String(number).padStart(2, "0")}`,
    status: "Online"
  });


  renderStudents();

  showToast(
    "New student added."
  );

}


function removeStudent(index) {

  if (
    index < 0 ||
    index >= students.length
  ) {
    return;
  }


  students.splice(index, 1);

  renderStudents();

  showToast(
    "Student removed."
  );

}


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

if (imageUpload) {

  imageUpload.addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }


      if (
        !file.type.startsWith("image/")
      ) {

        showToast(
          "Please select an image file."
        );

        return;
      }


      const objectURL =
        URL.createObjectURL(file);


      mainImage.onload =
        function () {

          URL.revokeObjectURL(
            objectURL
          );

        };


      mainImage.src =
        objectURL;

      mainImage.classList.add(
        "show"
      );


      mainVideo.pause();

      mainVideo.classList.remove(
        "show"
      );

      mainVideo.removeAttribute(
        "src"
      );


      if (welcomeContent) {

        welcomeContent.style.display =
          "none";

      }


      setStatus(
        "Image loaded"
      );

      showToast(
        "Course image loaded."
      );

    }
  );

}


/* =========================================================
   MAIN VIDEO UPLOAD
   ========================================================= */

if (videoUpload) {

  videoUpload.addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }


      if (
        !file.type.startsWith("video/")
      ) {

        showToast(
          "Please select a video file."
        );

        return;
      }


      const objectURL =
        URL.createObjectURL(file);


      mainVideo.src =
        objectURL;

      mainVideo.classList.add(
        "show"
      );


      mainImage.classList.remove(
        "show"
      );


      if (welcomeContent) {

        welcomeContent.style.display =
          "none";

      }


      mainVideo.load();


      setStatus(
        "Main video loaded"
      );

      showToast(
        "Course video loaded."
      );

    }
  );

}


/* =========================================================
   MENTOR VIDEO UPLOAD
   ========================================================= */

if (mentorUpload) {

  mentorUpload.addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }


      if (
        !file.type.startsWith("video/")
      ) {

        showToast(
          "Please select a mentor video."
        );

        return;
      }


      const objectURL =
        URL.createObjectURL(file);


      mentorVideo.src =
        objectURL;


      mentorVideo.style.display =
        "block";


      if (mentorPlaceholder) {

        mentorPlaceholder.style.display =
          "none";

      }


      mentorVideo.muted =
        true;


      mentorVideo.loop =
        true;


      mentorVideo.playsInline =
        true;


      mentorVideo.play()
        .catch(
          function () {}
        );


      setStatus(
        "Mentor video loaded"
      );

      showToast(
        "Mentor video loaded."
      );


      /*
       * AI processing will use this video.
       */

      initializeAIForMentorVideo();

    }
  );

}


/* =========================================================
   MAIN VIDEO PLAY / PAUSE
   ========================================================= */

function toggleMainPlay() {

  if (
    !mainVideo ||
    !mainVideo.src
  ) {

    showToast(
      "Upload a main video first."
    );

    return;
  }


  if (mainVideo.paused) {

    mainVideo.play()
      .then(
        function () {

          setStatus(
            "Main video playing"
          );

        }
      )
      .catch(
        function () {

          showToast(
            "Unable to play video."
          );

        }
      );

  } else {

    mainVideo.pause();

    setStatus(
      "Main video paused"
    );

  }

}


if (mainVideo) {

  mainVideo.addEventListener(
    "play",
    function () {

      setStatus(
        "Main video playing"
      );

    }
  );


  mainVideo.addEventListener(
    "pause",
    function () {

      setStatus(
        "Main video paused"
      );

    }
  );


  mainVideo.addEventListener(
    "ended",
    function () {

      setStatus(
        "Main video finished"
      );

    }
  );

}


/* =========================================================
   CLEAR MAIN CONTENT
   ========================================================= */

function clearMainContent() {

  if (mainVideo) {

    mainVideo.pause();

    mainVideo.removeAttribute(
      "src"
    );

    mainVideo.load();

    mainVideo.classList.remove(
      "show"
    );

  }


  if (mainImage) {

    mainImage.removeAttribute(
      "src"
    );

    mainImage.classList.remove(
      "show"
    );

  }


  if (welcomeContent) {

    welcomeContent.style.display =
      "block";

  }


  if (videoUpload) {
    videoUpload.value = "";
  }

  if (imageUpload) {
    imageUpload.value = "";
  }


  setStatus(
    "Ready"
  );

  showToast(
    "Main content cleared."
  );

}


/* =========================================================
   FULLSCREEN
   ========================================================= */

function fullscreenStage() {

  if (!stage) {
    return;
  }


  if (document.fullscreenElement) {

    document.exitFullscreen()
      .catch(
        function () {}
      );

    return;
  }


  if (
    stage.requestFullscreen
  ) {

    stage.requestFullscreen()
      .catch(
        function () {}
      );

  }

}


/* =========================================================
   RECORDING
   ========================================================= */

let isRecording = false;

let mediaRecorder = null;

let recordedChunks = [];

let recordingStream = null;


async function toggleRecording() {

  if (isRecording) {

    stopRecording();

  } else {

    await startRecording();

  }

}


async function startRecording() {

  if (!stage) {
    return;
  }


  recordedChunks = [];


  try {

    /*
     * Capture the complete stage.
     */

    if (
      typeof stage.captureStream !==
      "function"
    ) {

      showToast(
        "Your browser does not support stage recording."
      );

      return;
    }


    recordingStream =
      stage.captureStream(30);


    /*
     * Add microphone if available.
     */

    try {

      const microphone =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });


      microphone
        .getAudioTracks()
        .forEach(
          function (track) {

            recordingStream.addTrack(
              track
            );

          }
        );

    } catch (microphoneError) {

      console.warn(
        "Microphone unavailable:",
        microphoneError
      );

    }


    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];


    let selectedMime =
      "";


    for (
      const mimeType of mimeTypes
    ) {

      if (
        MediaRecorder.isTypeSupported(
          mimeType
        )
      ) {

        selectedMime =
          mimeType;

        break;

      }

    }


    mediaRecorder =
      selectedMime
        ? new MediaRecorder(
            recordingStream,
            {
              mimeType:
                selectedMime
            }
          )
        : new MediaRecorder(
            recordingStream
          );


    mediaRecorder.ondataavailable =
      function (event) {

        if (
          event.data &&
          event.data.size > 0
        ) {

          recordedChunks.push(
            event.data
          );

        }

      };


    mediaRecorder.onstop =
      function () {

        finishRecording();

      };


    mediaRecorder.start(
      1000
    );


    isRecording =
      true;


    updateRecordingUI();


    setStatus(
      "Recording..."
    );


    showToast(
      "Recording started."
    );

  } catch (error) {

    console.error(
      "Recording error:",
      error
    );


    showToast(
      "Unable to start recording."
    );

  }

}


function stopRecording() {

  if (
    !mediaRecorder ||
    mediaRecorder.state === "inactive"
  ) {

    return;
  }


  mediaRecorder.stop();

  isRecording =
    false;


  updateRecordingUI();


  setStatus(
    "Preparing recording..."
  );

}


function finishRecording() {

  if (
    recordedChunks.length === 0
  ) {

    setStatus(
      "No recording data"
    );

    return;
  }


  const blob =
    new Blob(
      recordedChunks,
      {
        type:
          "video/webm"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;

  link.download =
    `mentor-studio-${createFileDate()}.webm`;


  document.body.appendChild(
    link
  );

  link.click();

  link.remove();


  setTimeout(
    function () {

      URL.revokeObjectURL(
        url
      );

    },
    1500
  );


  if (recordingStream) {

    recordingStream
      .getTracks()
      .forEach(
        function (track) {

          track.stop();

        }
      );

  }


  recordingStream =
    null;

  mediaRecorder =
    null;


  setStatus(
    "Recording saved"
  );


  showToast(
    "Recording saved successfully."
  );

}


function updateRecordingUI() {

  if (!recordTopBtn) {
    return;
  }


  if (isRecording) {

    recordTopBtn.textContent =
      "■ Stop";

    recordTopBtn.classList.add(
      "recording"
    );

  } else {

    recordTopBtn.textContent =
      "● Record";

    recordTopBtn.classList.remove(
      "recording"
    );

  }

}


/* =========================================================
   MENTOR DRAG / MOVE
   ========================================================= */

let mentorDragging =
  false;

let mentorDragPointerId =
  null;

let mentorStartPointerX =
  0;

let mentorStartPointerY =
  0;

let mentorStartLeft =
  0;

let mentorStartTop =
  0;


function initializeMentorDrag() {

  if (
    !mentorCard ||
    !stage
  ) {

    return;
  }


  mentorCard.addEventListener(
    "pointerdown",
    mentorPointerDown
  );


  window.addEventListener(
    "pointermove",
    mentorPointerMove
  );


  window.addEventListener(
    "pointerup",
    mentorPointerUp
  );


  window.addEventListener(
    "pointercancel",
    mentorPointerUp
  );

}


function mentorPointerDown(event) {

  const target =
    event.target;


  /*
   * Do not start dragging when clicking
   * resize handle or buttons.
   */

  if (
    target.closest(
      ".mentor-resize"
    ) ||
    target.closest(
      "button"
    ) ||
    target.closest(
      "input"
    ) ||
    target.closest(
      "select"
    ) ||
    target.closest(
      "textarea"
    ) ||
    target.closest(
      "a"
    )
  ) {

    return;
  }


  event.preventDefault();


  const stageRect =
    stage.getBoundingClientRect();

  const mentorRect =
    mentorCard.getBoundingClientRect();


  mentorDragging =
    true;

  mentorDragPointerId =
    event.pointerId;


  mentorStartPointerX =
    event.clientX;

  mentorStartPointerY =
    event.clientY;


  mentorStartLeft =
    mentorRect.left -
    stageRect.left;

  mentorStartTop =
    mentorRect.top -
    stageRect.top;


  mentorCard.classList.add(
    "dragging"
  );


  try {

    mentorCard.setPointerCapture(
      event.pointerId
    );

  } catch (error) {}

}


function mentorPointerMove(event) {

  if (
    !mentorDragging ||
    event.pointerId !==
      mentorDragPointerId
  ) {

    return;
  }


  const stageRect =
    stage.getBoundingClientRect();

  const mentorRect =
    mentorCard.getBoundingClientRect();


  const dx =
    event.clientX -
    mentorStartPointerX;

  const dy =
    event.clientY -
    mentorStartPointerY;


  const mentorWidth =
    mentorRect.width;

  const mentorHeight =
    mentorRect.height;


  const maxLeft =
    Math.max(
      0,
      stageRect.width -
      mentorWidth
    );


  const maxTop =
    Math.max(
      0,
      stageRect.height -
      mentorHeight
    );


  const newLeft =
    clamp(
      mentorStartLeft + dx,
      0,
      maxLeft
    );


  const newTop =
    clamp(
      mentorStartTop + dy,
      0,
      maxTop
    );


  mentorCard.style.left =
    `${newLeft}px`;

  mentorCard.style.top =
    `${newTop}px`;

  mentorCard.style.right =
    "auto";

}


function mentorPointerUp(event) {

  if (
    !mentorDragging
  ) {

    return;
  }


  if (
    event.pointerId !==
    mentorDragPointerId
  ) {

    return;
  }


  mentorDragging =
    false;

  mentorCard.classList.remove(
    "dragging"
  );


  saveMentorPosition();


  try {

    mentorCard.releasePointerCapture(
      event.pointerId
    );

  } catch (error) {}


  mentorDragPointerId =
    null;

}


function saveMentorPosition() {

  if (!mentorCard) {
    return;
  }


  const left =
    parseFloat(
      mentorCard.style.left
    );

  const top =
    parseFloat(
      mentorCard.style.top
    );


  if (
    Number.isFinite(left)
  ) {

    localStorage.setItem(
      "courseStudioMentorLeft",
      left
    );

  }


  if (
    Number.isFinite(top)
  ) {

    localStorage.setItem(
      "courseStudioMentorTop",
      top
    );

  }

}


function resetMentorPosition() {

  if (!mentorCard) {
    return;
  }


  mentorCard.style.left =
    "";

  mentorCard.style.top =
    "30px";

  mentorCard.style.right =
    "30px";


  localStorage.removeItem(
    "courseStudioMentorLeft"
  );

  localStorage.removeItem(
    "courseStudioMentorTop"
  );


  showToast(
    "Mentor position reset."
  );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function openSettings() {

  if (!settingsModal) {
    return;
  }


  if (brandInput) {

    brandInput.value =
      localStorage.getItem(
        "courseStudioBrand"
      ) ||
      "SNK Mentor Studio";

  }


  const savedBackground =
    localStorage.getItem(
      "courseStudioMentorBg"
    );


  const backgroundSelect =
    document.getElementById(
      "mentorBackgroundSelect"
    );


  if (
    backgroundSelect &&
    savedBackground
  ) {

    backgroundSelect.value =
      savedBackground;

  }


  settingsModal.classList.add(
    "show"
  );

}


function closeSettings() {

  if (!settingsModal) {
    return;
  }


  settingsModal.classList.remove(
    "show"
  );

}


function openBrandSettings() {

  openSettings();

}


function saveSettings() {

  const brand =
    brandInput?.value.trim() ||
    "SNK Mentor Studio";


  localStorage.setItem(
    "courseStudioBrand",
    brand
  );


  if (brandBadge) {

    brandBadge.textContent =
      brand;

  }


  const backgroundSelect =
    document.getElementById(
      "mentorBackgroundSelect"
    );


  if (backgroundSelect) {

    changeMentorBackground(
      backgroundSelect.value
    );

  }


  closeSettings();


  showToast(
    "Settings saved."
  );

}


function loadSettings() {

  const savedBrand =
    localStorage.getItem(
      "courseStudioBrand"
    );


  if (savedBrand) {

    if (brandBadge) {

      brandBadge.textContent =
        savedBrand;

    }


    if (brandInput) {

      brandInput.value =
        savedBrand;

    }

  }


  const savedBackground =
    localStorage.getItem(
      "courseStudioMentorBg"
    );


  if (
    savedBackground &&
    mentorCard
  ) {

    mentorCard.style.background =
      savedBackground;

  }


  const savedLeft =
    parseFloat(
      localStorage.getItem(
        "courseStudioMentorLeft"
      )
    );


  const savedTop =
    parseFloat(
      localStorage.getItem(
        "courseStudioMentorTop"
      )
    );


  if (
    Number.isFinite(savedLeft) &&
    Number.isFinite(savedTop)
  ) {

    mentorCard.style.left =
      `${savedLeft}px`;

    mentorCard.style.top =
      `${savedTop}px`;

    mentorCard.style.right =
      "auto";

  }


  const savedColor =
    localStorage.getItem(
      "courseStudioBgColor"
    );


  if (
    savedColor &&
    backgroundColor
  ) {

    backgroundColor.value =
      savedColor;

  }

}


function changeMentorBackground(
  color
) {

  if (!mentorCard) {
    return;
  }


  mentorCard.style.background =
    color;


  localStorage.setItem(
    "courseStudioMentorBg",
    color
  );

}


/* =========================================================
   AI BACKGROUND SYSTEM
   ========================================================= */

let aiBackgroundMode =
  "original";

let aiBackgroundImage =
  null;

let aiSegmentation =
  null;

let aiProcessing =
  false;

let aiReady =
  false;

let aiLastFrameTime =
  0;

let aiFrameRequest =
  null;


/*
 * Canvas dimensions are deliberately kept
 * separate from display dimensions.
 */

let aiWidth =
  0;

let aiHeight =
  0;


/* =========================================================
   AI INITIALIZATION
   ========================================================= */

function initializeAIForMentorVideo() {

  if (
    typeof SelfieSegmentation ===
    "undefined"
  ) {

    console.warn(
      "MediaPipe Selfie Segmentation is unavailable."
    );

    setStatus(
      "Mentor video ready"
    );

    return;
  }


  if (!aiSegmentation) {

    aiSegmentation =
      new SelfieSegmentation({
        locateFile:
          function (file) {

            return (
              "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/" +
              file
            );

          }
      });


    aiSegmentation.setOptions({
      modelSelection: 1
    });


    aiSegmentation.onResults(
      onAIResults
    );

  }


  startAIProcessing();

}


function startAIProcessing() {

  if (
    aiProcessing
  ) {

    return;
  }


  if (
    !mentorVideo ||
    !mentorVideo.src
  ) {

    return;
  }


  aiProcessing =
    true;

  aiReady =
    false;


  processAIFrame();

}


function stopAIProcessing() {

  aiProcessing =
    false;


  if (aiFrameRequest) {

    cancelAnimationFrame(
      aiFrameRequest
    );

    aiFrameRequest =
      null;

  }

}


function processAIFrame(
  timestamp
) {

  if (!aiProcessing) {
    return;
  }


  if (
    !mentorVideo ||
    mentorVideo.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
  ) {

    aiFrameRequest =
      requestAnimationFrame(
        processAIFrame
      );

    return;
  }


  if (
    mentorVideo.videoWidth === 0 ||
    mentorVideo.videoHeight === 0
  ) {

    aiFrameRequest =
      requestAnimationFrame(
        processAIFrame
      );

    return;
  }


  /*
   * Limit AI processing to roughly 24 FPS.
   */

  if (
    timestamp &&
    timestamp - aiLastFrameTime <
      41
  ) {

    aiFrameRequest =
      requestAnimationFrame(
        processAIFrame
      );

    return;
  }


  aiLastFrameTime =
    timestamp || performance.now();


  ensureAICanvasSize();


  /*
   * If original mode is selected,
   * no segmentation is necessary.
   */

  if (
    aiBackgroundMode ===
    "original"
  ) {

    if (
      mentorVideo.style.display !==
      "block"
    ) {

      mentorVideo.style.display =
        "block";

    }


    aiFrameRequest =
      requestAnimationFrame(
        processAIFrame
      );

    return;
  }


  /*
   * Send the current video frame
   * to MediaPipe.
   */

  aiSegmentation
    .send({
      image: mentorVideo
    })
    .catch(
      function (error) {

        console.warn(
          "AI segmentation error:",
          error
        );

      }
    );


  aiFrameRequest =
    requestAnimationFrame(
      processAIFrame
    );

}


function ensureAICanvasSize() {

  if (
    !mentorVideo ||
    !aiCanvas ||
    !aiSourceCanvas ||
    !aiMaskCanvas
  ) {

    return;
  }


  const width =
    mentorVideo.videoWidth;

  const height =
    mentorVideo.videoHeight;


  if (
    width === aiWidth &&
    height === aiHeight
  ) {

    return;
  }


  aiWidth =
    width;

  aiHeight =
    height;


  aiCanvas.width =
    width;

  aiCanvas.height =
    height;


  aiSourceCanvas.width =
    width;

  aiSourceCanvas.height =
    height;


  aiMaskCanvas.width =
    width;

  aiMaskCanvas.height =
    height;

}


/* =========================================================
   AI RESULTS
   ========================================================= */

function onAIResults(results) {

  if (
    !results ||
    !results.image ||
    !results.segmentationMask
  ) {

    return;
  }


  if (
    aiBackgroundMode ===
    "original"
  ) {

    mentorVideo.style.display =
      "block";

    return;

  }


  if (
    !aiCanvas ||
    !aiSourceCanvas ||
    !aiMaskCanvas
  ) {

    return;
  }


  const width =
    results.image.width ||
    aiWidth;

  const height =
    results.image.height ||
    aiHeight;


  if (
    !width ||
    !height
  ) {

    return;
  }


  if (
    aiCanvas.width !== width
  ) {

    aiCanvas.width =
      width;

  }


  if (
    aiCanvas.height !== height
  ) {

    aiCanvas.height =
      height;

  }


  if (
    aiSourceCanvas.width !== width
  ) {

    aiSourceCanvas.width =
      width;

  }


  if (
    aiSourceCanvas.height !== height
  ) {

    aiSourceCanvas.height =
      height;

  }


  if (
    aiMaskCanvas.width !== width
  ) {

    aiMaskCanvas.width =
      width;

  }


  if (
    aiMaskCanvas.height !== height
  ) {

    aiMaskCanvas.height =
      height;

  }


  const sourceContext =
    aiSourceCanvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );


  const maskContext =
    aiMaskCanvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );


  const outputContext =
    aiCanvas.getContext(
      "2d"
    );


  /*
   * Draw source frame.
   */

  sourceContext.clearRect(
    0,
    0,
    width,
    height
  );


  sourceContext.drawImage(
    results.image,
    0,
    0,
    width,
    height
  );


  /*
   * Draw segmentation mask.
   */

  maskContext.clearRect(
    0,
    0,
    width,
    height
  );


  maskContext.drawImage(
    results.segmentationMask,
    0,
    0,
    width,
    height
  );


  /*
   * IMPORTANT:
   *
   * We do NOT use the grayscale mask
   * directly as destination-in.
   *
   * Instead we convert mask brightness
   * into real alpha values.
   */

  const sourceData =
    sourceContext.getImageData(
      0,
      0,
      width,
      height
    );


  const maskData =
    maskContext.getImageData(
      0,
      0,
      width,
      height
    );


  const personData =
    new ImageData(
      width,
      height
    );


  for (
    let i = 0;
    i < sourceData.data.length;
    i += 4
  ) {

    const maskValue =
      maskData.data[i] / 255;


    /*
     * Soft threshold.
     *
     * 0.15 = background starts disappearing
     * 0.65 = strong person confidence
     */

    let alpha =
      (
        maskValue - 0.15
      ) / 0.65;


    alpha =
      clamp(
        alpha,
        0,
        1
      );


    /*
     * Smooth edge.
     */

    alpha =
      alpha *
      alpha *
      (
        3 -
        2 * alpha
      );


    personData.data[i] =
      sourceData.data[i];

    personData.data[i + 1] =
      sourceData.data[i + 1];

    personData.data[i + 2] =
      sourceData.data[i + 2];

    personData.data[i + 3] =
      Math.round(
        alpha * 255
      );

  }


  /*
   * Clear final canvas.
   */

  outputContext.clearRect(
    0,
    0,
    width,
    height
  );


  /*
   * Draw replacement background.
   */

  drawAIBackground(
    outputContext,
    results.image,
    width,
    height
  );


  /*
   * Draw the isolated person.
   */

  outputContext.putImageData(
    personData,
    0,
    0
  );


  /*
   * Display processed canvas
   * instead of original video.
   */

  displayAICanvas();

}


/* =========================================================
   DRAW AI BACKGROUND
   ========================================================= */

function drawAIBackground(
  context,
  sourceImage,
  width,
  height
) {

  if (
    aiBackgroundMode ===
    "remove"
  ) {

    /*
     * Transparent background.
     */

    context.clearRect(
      0,
      0,
      width,
      height
    );

    return;
  }


  if (
    aiBackgroundMode ===
    "blur"
  ) {

    /*
     * Draw blurred source.
     */

    context.save();

    context.filter =
      "blur(18px)";

    context.drawImage(
      sourceImage,
      -20,
      -20,
      width + 40,
      height + 40
    );

    context.restore();

    return;
  }


  if (
    aiBackgroundMode ===
    "image"
  ) {

    if (aiBackgroundImage) {

      drawCoverImage(
        context,
        aiBackgroundImage,
        width,
        height
      );

    } else {

      context.fillStyle =
        "#101823";

      context.fillRect(
        0,
        0,
        width,
        height
      );

    }

    return;
  }


  if (
    aiBackgroundMode ===
    "color"
  ) {

    const color =
      backgroundColor?.value ||
      "#101823";


    context.fillStyle =
      color;

    context.fillRect(
      0,
      0,
      width,
      height
    );

    return;
  }


  context.clearRect(
    0,
    0,
    width,
    height
  );

}


/* =========================================================
   DISPLAY AI CANVAS
   ========================================================= */

function displayAICanvas() {

  if (
    !mentorCard ||
    !aiCanvas
  ) {

    return;
  }


  /*
   * Canvas is placed inside mentor card
   * as a visual layer.
   */

  let displayCanvas =
    document.getElementById(
      "mentorAICanvas"
    );


  if (!displayCanvas) {

    displayCanvas =
      document.createElement(
        "canvas"
      );

    displayCanvas.id =
      "mentorAICanvas";


    displayCanvas.style.position =
      "absolute";

    displayCanvas.style.inset =
      "0";

    displayCanvas.style.width =
      "100%";

    displayCanvas.style.height =
      "100%";

    displayCanvas.style.objectFit =
      "cover";

    displayCanvas.style.pointerEvents =
      "none";

    displayCanvas.style.zIndex =
      "2";


    const videoWrap =
      mentorCard.querySelector(
        ".mentor-video-wrap"
      );


    if (videoWrap) {

      videoWrap.appendChild(
        displayCanvas
      );

    }

  }


  displayCanvas.width =
    aiCanvas.width;

  displayCanvas.height =
    aiCanvas.height;


  const context =
    displayCanvas.getContext(
      "2d"
    );


  context.clearRect(
    0,
    0,
    displayCanvas.width,
    displayCanvas.height
  );


  context.drawImage(
    aiCanvas,
    0,
    0
  );


  /*
   * Hide original video only when
   * processed mode is active.
   */

  mentorVideo.style.visibility =
    "hidden";


  displayCanvas.style.display =
    "block";

}


/* =========================================================
   SET AI BACKGROUND MODE
   ========================================================= */

function setMentorBackgroundMode(
  mode
) {

  const validModes = [
    "original",
    "remove",
    "blur",
    "image",
    "color"
  ];


  if (
    !validModes.includes(mode)
  ) {

    return;
  }


  aiBackgroundMode =
    mode;


  updateAIButtons();


  if (
    mode ===
    "original"
  ) {

    showOriginalMentorVideo();

    setStatus(
      "Original background"
    );

    showToast(
      "Original background enabled."
    );

    return;
  }


  /*
   * Make sure AI processing starts.
   */

  if (
    mentorVideo &&
    mentorVideo.src
  ) {

    startAIProcessing();

  } else {

    showToast(
      "Upload a mentor video first."
    );

    return;

  }


  if (
    mode ===
    "remove"
  ) {

    setStatus(
      "Removing background..."
    );

    showToast(
      "AI background removal enabled."
    );

  }


  if (
    mode ===
    "blur"
  ) {

    setStatus(
      "Blurring background..."
    );

    showToast(
      "AI background blur enabled."
    );

  }


  if (
    mode ===
    "image"
  ) {

    if (!aiBackgroundImage) {

      showToast(
        "Upload a custom background image."
      );

    } else {

      setStatus(
        "Custom background enabled"
      );

    }

  }


  if (
    mode ===
    "color"
  ) {

    setStatus(
      "Solid background enabled"
    );

    showToast(
      "Solid background enabled."
    );

  }

}


function updateAIButtons() {

  const buttons = {
    original:
      document.getElementById(
        "bgOriginalBtn"
      ),

    remove:
      document.getElementById(
        "bgRemoveBtn"
      ),

    blur:
      document.getElementById(
        "bgBlurBtn"
      ),

    image:
      document.getElementById(
        "bgImageBtn"
      ),

    color:
      document.getElementById(
        "bgColorBtn"
      )
  };


  Object.keys(buttons)
    .forEach(
      function (key) {

        const button =
          buttons[key];

        if (!button) {
          return;
        }


        button.classList.toggle(
          "active",
          key ===
          aiBackgroundMode
        );

      }
    );

}


/* =========================================================
   SHOW ORIGINAL VIDEO
   ========================================================= */

function showOriginalMentorVideo() {

  const displayCanvas =
    document.getElementById(
      "mentorAICanvas"
    );


  if (displayCanvas) {

    displayCanvas.style.display =
      "none";

  }


  if (mentorVideo) {

    mentorVideo.style.visibility =
      "visible";

    mentorVideo.style.display =
      "block";

  }

}


/* =========================================================
   CUSTOM BACKGROUND IMAGE
   ========================================================= */

if (backgroundImageUpload) {

  backgroundImageUpload.addEventListener(
    "change",
    function (event) {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        showToast(
          "Please select an image."
        );

        return;
      }


      const objectURL =
        URL.createObjectURL(
          file
        );


      const image =
        new Image();


      image.onload =
        function () {

          aiBackgroundImage =
            image;


          URL.revokeObjectURL(
            objectURL
          );


          setMentorBackgroundMode(
            "image"
          );


          showToast(
            "Custom background image loaded."
          );

        };


      image.onerror =
        function () {

          URL.revokeObjectURL(
            objectURL
          );


          showToast(
            "Unable to load background image."
          );

        };


      image.src =
        objectURL;

    }
  );

}


/* =========================================================
   SOLID COLOR
   ========================================================= */

if (backgroundColor) {

  backgroundColor.addEventListener(
    "input",
    function () {

      localStorage.setItem(
        "courseStudioBgColor",
        backgroundColor.value
      );


      if (
        aiBackgroundMode ===
        "color"
      ) {

        setMentorBackgroundMode(
          "color"
        );

      }

    }
  );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
  "keydown",
  function (event) {

    /*
     * ESC closes modal.
     */

    if (
      event.key ===
      "Escape"
    ) {

      closeSettings();

    }


    /*
     * CTRL + ENTER
     * Recording shortcut.
     */

    if (
      event.ctrlKey &&
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      toggleRecording();

    }


    /*
     * R = reset mentor position.
     *
     * Avoid when user is typing.
     */

    const activeElement =
      document.activeElement;


    const isTyping =
      activeElement &&
      (
        activeElement.tagName ===
          "INPUT" ||
        activeElement.tagName ===
          "TEXTAREA" ||
        activeElement.tagName ===
          "SELECT"
      );


    if (
      !isTyping &&
      event.key.toLowerCase() ===
        "r"
    ) {

      resetMentorPosition();

    }

  }
);


/* =========================================================
   SETTINGS MODAL OUTSIDE CLICK
   ========================================================= */

if (settingsModal) {

  settingsModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        settingsModal
      ) {

        closeSettings();

      }

    }
  );

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
  text
) {

  if (statusText) {

    statusText.textContent =
      text;

  }


  if (statusDot) {

    statusDot.style.background =
      "#35d58a";

  }

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer =
  null;


function showToast(
  message
) {

  if (!toast) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =========================================================
   HELPERS
   ========================================================= */

function clamp(
  value,
  min,
  max
) {

  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );

}


function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function createFileDate() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  const hours =
    String(
      now.getHours()
    ).padStart(
      2,
      "0"
    );


  const minutes =
    String(
      now.getMinutes()
    ).padStart(
      2,
      "0"
    );


  const seconds =
    String(
      now.getSeconds()
    ).padStart(
      2,
      "0"
    );


  return (
    `${year}${month}${day}` +
    `-${hours}${minutes}${seconds}`
  );

}


/* =========================================================
   DRAW IMAGE AS COVER
   ========================================================= */

function drawCoverImage(
  context,
  image,
  width,
  height
) {

  const imageWidth =
    image.naturalWidth ||
    image.videoWidth ||
    image.width;

  const imageHeight =
    image.naturalHeight ||
    image.videoHeight ||
    image.height;


  if (
    !imageWidth ||
    !imageHeight
  ) {

    return;
  }


  const imageRatio =
    imageWidth /
    imageHeight;

  const canvasRatio =
    width /
    height;


  let drawWidth;
  let drawHeight;

  let offsetX;
  let offsetY;


  if (
    imageRatio >
    canvasRatio
  ) {

    drawHeight =
      height;

    drawWidth =
      height *
      imageRatio;

    offsetX =
      (width -
        drawWidth) /
      2;

    offsetY =
      0;

  } else {

    drawWidth =
      width;

    drawHeight =
      width /
      imageRatio;

    offsetX =
      0;

    offsetY =
      (height -
        drawHeight) /
      2;

  }


  context.drawImage(
    image,
    offsetX,
    offsetY,
    drawWidth,
    drawHeight
  );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeStudio() {

  renderStudents();

  loadSettings();

  initializeMentorDrag();

  updateAIButtons();

  setStatus(
    "Ready"
  );


  /*
   * Restore background color.
   */

  const savedColor =
    localStorage.getItem(
      "courseStudioBgColor"
    );


  if (
    savedColor &&
    backgroundColor
  ) {

    backgroundColor.value =
      savedColor;

  }


  console.log(
    "Personal Course Studio — Mentor Studio ready."
  );

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeStudio
  );

} else {

  initializeStudio();

}


/* =========================================================
   WINDOW LOAD
   ========================================================= */

window.addEventListener(
  "load",
  function () {

    console.log(
      "Mentor Studio loaded successfully."
    );

  }
);


/* =========================================================
   RESIZE SAFETY
   ========================================================= */

window.addEventListener(
  "resize",
  function () {

    /*
     * Keep mentor inside stage
     * after browser resize.
     */

    if (
      !mentorCard ||
      !stage
    ) {

      return;
    }


    const mentorRect =
      mentorCard.getBoundingClientRect();

    const stageRect =
      stage.getBoundingClientRect();


    const currentLeft =
      parseFloat(
        mentorCard.style.left
      );


    const currentTop =
      parseFloat(
        mentorCard.style.top
      );


    if (
      Number.isFinite(currentLeft)
    ) {

      const maxLeft =
        Math.max(
          0,
          stageRect.width -
          mentorRect.width
        );


      mentorCard.style.left =
        `${clamp(
          currentLeft,
          0,
          maxLeft
        )}px`;

    }


    if (
      Number.isFinite(currentTop)
    ) {

      const maxTop =
        Math.max(
          0,
          stageRect.height -
          mentorRect.height
        );


      mentorCard.style.top =
        `${clamp(
          currentTop,
          0,
          maxTop
        )}px`;

    }

  }
);


/* =========================================================
   END
   ========================================================= */
