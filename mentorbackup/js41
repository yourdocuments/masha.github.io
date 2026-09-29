<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Mentor Studio | Personal Course Studio</title>

  <meta
    name="description"
    content="Professional Personal Course Studio for live class recording, mentor camera, screen capture and course production."
  >

  <meta
    name="theme-color"
    content="#07111f"
  >

  <style>
    /* =========================================================
       SNK MENTOR STUDIO
       STEP 3.8 — PROFESSIONAL RECORDING CONTROL
       ========================================================= */

    :root {
      --bg: #050b14;
      --bg-2: #08111e;
      --panel: #0b1625;
      --panel-2: #0f1c2d;
      --panel-3: #13243a;

      --border: rgba(255,255,255,.09);
      --border-strong: rgba(255,255,255,.14);

      --text: #f4f8ff;
      --muted: #8fa4bd;
      --muted-2: #667c95;

      --blue: #4da3ff;
      --blue-2: #2388ee;
      --cyan: #43d9ff;

      --green: #37d67a;
      --red: #ff4d67;
      --yellow: #ffc857;
      --purple: #9b7cff;

      --shadow:
        0 20px 60px rgba(0,0,0,.35);

      --radius: 16px;
      --radius-sm: 11px;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      background: var(--bg);
      color: var(--text);
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    body {
      overflow-x: hidden;
    }

    button,
    input,
    select,
    textarea {
      font: inherit;
    }

    button {
      cursor: pointer;
    }

    video,
    canvas,
    img {
      max-width: 100%;
    }

    /* =========================================================
       APP
       ========================================================= */

    .app {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background:
        radial-gradient(
          circle at top left,
          rgba(50,120,200,.08),
          transparent 32%
        ),
        linear-gradient(
          180deg,
          #07101b 0%,
          #050b14 100%
        );
    }

    /* =========================================================
       TOP BAR
       ========================================================= */

    .topbar {
      min-height: 68px;
      padding: 10px 16px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;

      background: rgba(5,11,20,.94);
      border-bottom: 1px solid var(--border);

      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(20px);
    }

    .brand-area {
      min-width: 230px;

      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      width: 38px;
      height: 38px;
      border-radius: 11px;

      display: grid;
      place-items: center;

      background:
        linear-gradient(
          135deg,
          var(--blue),
          var(--cyan)
        );

      color: #00111e;
      font-weight: 900;
      font-size: 17px;

      box-shadow:
        0 8px 24px rgba(40,150,255,.22);
    }

    .brand-text {
      min-width: 0;
    }

    .brand-title {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: .1px;
      white-space: nowrap;
    }

    .brand-subtitle {
      margin-top: 2px;
      font-size: 11px;
      color: var(--muted);
      white-space: nowrap;
    }

    .top-actions {
      flex: 1;

      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 8px;
    }

    .top-btn {
      height: 38px;
      padding: 0 12px;

      border: 1px solid var(--border);
      border-radius: 10px;

      background: rgba(255,255,255,.035);
      color: var(--text);

      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;

      transition:
        .18s ease;
    }

    .top-btn:hover {
      background: rgba(255,255,255,.07);
      border-color: var(--border-strong);
      transform: translateY(-1px);
    }

    .top-btn.primary {
      background: linear-gradient(
        135deg,
        var(--blue-2),
        #1268c9
      );

      border-color: rgba(100,190,255,.35);

      box-shadow:
        0 8px 25px rgba(24,130,235,.2);
    }

    .top-btn.danger {
      background: rgba(255,77,103,.10);
      border-color: rgba(255,77,103,.28);
      color: #ff8294;
    }

    .top-btn.record {
      min-width: 100px;
      background: rgba(255,77,103,.12);
      border-color: rgba(255,77,103,.28);
      color: #ff8b9b;
    }

    .top-btn.record.active {
      background: rgba(255,77,103,.2);
      box-shadow:
        0 0 0 1px rgba(255,77,103,.2),
        0 8px 28px rgba(255,77,103,.12);
    }

    .top-btn svg {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
    }

    /* =========================================================
       PROFESSIONAL RECORDING BAR
       ========================================================= */

    .recording-control-bar {
      width: 100%;
      min-height: 56px;

      padding: 8px 16px;

      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;

      background:
        linear-gradient(
          90deg,
          rgba(255,255,255,.025),
          rgba(255,255,255,.015)
        );

      border-bottom: 1px solid var(--border);

      position: relative;
      z-index: 90;
    }

    .recording-live-box {
      min-height: 38px;
      padding: 0 12px;

      display: inline-flex;
      align-items: center;
      gap: 8px;

      border-radius: 10px;

      background: rgba(255,255,255,.035);
      border: 1px solid var(--border);
    }

    .recording-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;

      background: var(--muted-2);

      transition: .2s ease;
    }

    .recording-dot.live {
      background: var(--red);

      box-shadow:
        0 0 0 5px rgba(255,77,103,.10),
        0 0 14px rgba(255,77,103,.55);

      animation:
        recordingPulse 1.1s infinite;
    }

    @keyframes recordingPulse {
      0%,
      100% {
        opacity: 1;
      }

      50% {
        opacity: .45;
      }
    }

    .recording-status-text {
      font-size: 12px;
      font-weight: 800;
    }

    .recording-timer {
      min-width: 70px;

      font-variant-numeric: tabular-nums;

      font-size: 14px;
      font-weight: 900;
      letter-spacing: .8px;
    }

    .recording-control-divider {
      width: 1px;
      height: 28px;
      background: var(--border);
    }

    .recording-control-group {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .control-label {
      color: var(--muted);
      font-size: 11px;
      font-weight: 700;
    }

    .control-select {
      height: 36px;
      padding: 0 10px;

      color: var(--text);
      background: #0d1a2b;

      border: 1px solid var(--border);
      border-radius: 9px;

      outline: none;
    }

    .control-select:focus {
      border-color: rgba(77,163,255,.5);
    }

    .record-control-btn {
      height: 36px;
      padding: 0 12px;

      border-radius: 9px;

      border: 1px solid var(--border);

      background: rgba(255,255,255,.035);
      color: var(--text);

      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
    }

    .record-control-btn:hover {
      background: rgba(255,255,255,.075);
    }

    .record-control-btn.pause {
      color: #ffd879;
      border-color: rgba(255,200,87,.25);
    }

    .record-control-btn.resume {
      color: #69e49a;
      border-color: rgba(55,214,122,.25);
    }

    .record-control-btn.stop {
      color: #ff7e90;
      border-color: rgba(255,77,103,.25);
    }

    /* =========================================================
       STATUS INDICATORS
       ========================================================= */

    .device-status {
      margin-left: auto;

      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .status-pill {
      height: 30px;
      padding: 0 9px;

      border: 1px solid var(--border);
      border-radius: 999px;

      display: inline-flex;
      align-items: center;
      gap: 6px;

      color: var(--muted);

      background: rgba(255,255,255,.025);

      font-size: 10px;
      font-weight: 800;
    }

    .status-light {
      width: 7px;
      height: 7px;
      border-radius: 50%;

      background: var(--muted-2);
    }

    .status-light.online {
      background: var(--green);
      box-shadow: 0 0 9px rgba(55,214,122,.5);
    }

    .status-light.warning {
      background: var(--yellow);
    }

    .status-light.recording {
      background: var(--red);
    }

    /* =========================================================
       WORKSPACE
       ========================================================= */

    .workspace {
      flex: 1;

      min-height: 0;

      padding: 14px;

      display: grid;
      grid-template-columns:
        minmax(0, 1fr)
        300px;

      gap: 14px;
    }

    /* =========================================================
       STAGE
       ========================================================= */

    .stage-shell {
      min-width: 0;
      min-height: 520px;

      display: flex;
      flex-direction: column;

      background:
        radial-gradient(
          circle at 50% 0%,
          rgba(65,140,220,.05),
          transparent 40%
        ),
        #07111d;

      border:
        1px solid var(--border);

      border-radius: var(--radius);

      overflow: hidden;

      box-shadow: var(--shadow);

      position: relative;
    }

    .stage-header {
      min-height: 48px;

      padding: 0 13px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;

      border-bottom: 1px solid var(--border);

      background: rgba(255,255,255,.018);
    }

    .stage-title {
      font-size: 12px;
      font-weight: 800;
    }

    .stage-meta {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .stage-badge {
      height: 25px;
      padding: 0 8px;

      display: inline-flex;
      align-items: center;

      border-radius: 999px;

      color: var(--muted);
      background: rgba(255,255,255,.035);

      font-size: 10px;
      font-weight: 800;
    }

    .stage-badge.resolution {
      color: #8ed2ff;
    }

    .stage {
      flex: 1;

      min-height: 0;

      position: relative;

      display: grid;
      place-items: center;

      background:
        radial-gradient(
          circle at center,
          rgba(20,55,90,.12),
          transparent 60%
        ),
        #03070d;

      overflow: hidden;
    }

    .stage-grid {
      position: absolute;
      inset: 0;

      pointer-events: none;

      opacity: .22;

      background-image:
        linear-gradient(
          rgba(255,255,255,.018) 1px,
          transparent 1px
        ),
        linear-gradient(
          90deg,
          rgba(255,255,255,.018) 1px,
          transparent 1px
        );

      background-size: 32px 32px;
    }

    #mainImage,
    #mainVideo,
    #screenCaptureVideo {
      position: absolute;

      inset: 0;

      width: 100%;
      height: 100%;

      object-fit: contain;

      display: none;

      background: #000;
    }

    #mainImage.active,
    #mainVideo.active,
    #screenCaptureVideo.active {
      display: block;
    }

    #welcomeContent {
      position: relative;
      z-index: 4;

      width: min(600px, 90%);

      padding: 40px 25px;

      text-align: center;

      color: var(--muted);
    }

    .welcome-icon {
      width: 64px;
      height: 64px;

      margin: 0 auto 14px;

      display: grid;
      place-items: center;

      border-radius: 20px;

      background:
        linear-gradient(
          135deg,
          rgba(77,163,255,.16),
          rgba(67,217,255,.08)
        );

      border:
        1px solid rgba(77,163,255,.16);

      color: var(--blue);

      font-size: 28px;
    }

    .welcome-title {
      color: var(--text);

      font-size: 22px;
      font-weight: 900;

      margin-bottom: 8px;
    }

    .welcome-text {
      font-size: 13px;
      line-height: 1.7;
    }

    /* =========================================================
       MENTOR OVERLAY
       ========================================================= */

    .mentor-card {
      position: absolute;

      top: 22px;
      right: 22px;

      width: 190px;
      height: 125px;

      min-width: 130px;
      min-height: 90px;

      max-width: 45%;
      max-height: 70%;

      z-index: 20;

      overflow: hidden;

      border-radius: 14px;

      background:
        linear-gradient(
          145deg,
          #142235,
          #08111e
        );

      border:
        1px solid rgba(255,255,255,.16);

      box-shadow:
        0 18px 45px rgba(0,0,0,.42);

      resize: none;

      user-select: none;
    }

    .mentor-card.hidden {
      display: none;
    }

    #mentorVideo,
    #mentorCameraVideo,
    #mentorAICanvas {
      position: absolute;

      inset: 0;

      width: 100%;
      height: 100%;

      object-fit: cover;

      display: none;
    }

    #mentorVideo.active,
    #mentorCameraVideo.active,
    #mentorAICanvas.active {
      display: block;
    }

    #mentorVideo,
    #mentorCameraVideo {
      transform: scaleX(-1);
    }

    #mentorAICanvas {
      transform: none;
    }

    .mentor-placeholder {
      position: absolute;
      inset: 0;

      display: grid;
      place-items: center;

      text-align: center;

      padding: 12px;

      color: var(--muted);

      font-size: 11px;
      line-height: 1.5;
    }

    .mentor-placeholder-icon {
      width: 36px;
      height: 36px;

      margin: 0 auto 7px;

      display: grid;
      place-items: center;

      border-radius: 50%;

      background: rgba(255,255,255,.06);
      color: var(--blue);
    }

    .mentor-source-label {
      position: absolute;

      left: 8px;
      bottom: 8px;

      height: 23px;

      padding: 0 8px;

      display: inline-flex;
      align-items: center;

      border-radius: 999px;

      background: rgba(0,0,0,.56);
      border: 1px solid rgba(255,255,255,.12);

      color: #fff;

      font-size: 9px;
      font-weight: 800;

      z-index: 4;
    }

    .mentor-resize {
      position: absolute;

      right: 3px;
      bottom: 3px;

      width: 18px;
      height: 18px;

      z-index: 30;

      cursor: nwse-resize;

      border-radius: 5px;

      background: rgba(255,255,255,.14);

      border:
        1px solid rgba(255,255,255,.18);
    }

    .mentor-resize::before,
    .mentor-resize::after {
      content: "";

      position: absolute;

      background: rgba(255,255,255,.75);

      border-radius: 2px;
    }

    .mentor-resize::before {
      width: 7px;
      height: 1px;

      right: 3px;
      bottom: 5px;

      transform: rotate(-45deg);
    }

    .mentor-resize::after {
      width: 5px;
      height: 1px;

      right: 3px;
      bottom: 9px;

      transform: rotate(-45deg);
    }

    /* =========================================================
       BRAND BADGE
       ========================================================= */

    .brand-badge {
      position: absolute;

      left: 18px;
      bottom: 18px;

      z-index: 15;

      min-height: 34px;

      padding: 0 12px;

      display: inline-flex;
      align-items: center;

      border-radius: 10px;

      background:
        rgba(4,10,17,.72);

      border:
        1px solid rgba(255,255,255,.1);

      backdrop-filter: blur(12px);

      color: #fff;

      font-size: 11px;
      font-weight: 800;
    }

    /* =========================================================
       RECORDING OVERLAY
       ========================================================= */

    .recording-overlay {
      position: absolute;

      top: 15px;
      left: 15px;

      z-index: 50;

      min-height: 34px;

      padding: 0 10px;

      display: none;
      align-items: center;
      gap: 8px;

      border-radius: 10px;

      background:
        rgba(5,8,14,.82);

      border:
        1px solid rgba(255,77,103,.28);

      backdrop-filter: blur(12px);

      box-shadow:
        0 10px 30px rgba(0,0,0,.28);
    }

    .recording-overlay.active {
      display: inline-flex;
    }

    .recording-overlay-dot {
      width: 8px;
      height: 8px;

      border-radius: 50%;

      background: var(--red);

      animation:
        recordingPulse 1.1s infinite;
    }

    .recording-overlay-text {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .4px;
    }

    .recording-overlay-time {
      font-variant-numeric: tabular-nums;
      font-size: 11px;
      color: #ff9baa;
      font-weight: 900;
    }

    /* =========================================================
       STAGE TOOLBAR
       ========================================================= */

    .stage-toolbar {
      min-height: 62px;

      padding: 9px 10px;

      display: flex;
      align-items: center;
      gap: 7px;

      overflow-x: auto;

      border-top: 1px solid var(--border);

      background: #07101b;
    }

    .tool-btn {
      height: 40px;

      padding: 0 11px;

      flex: 0 0 auto;

      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;

      border:
        1px solid var(--border);

      border-radius: 10px;

      background:
        rgba(255,255,255,.035);

      color: var(--text);

      font-size: 11px;
      font-weight: 800;

      transition: .18s ease;
    }

    .tool-btn:hover {
      background: rgba(255,255,255,.075);
      border-color: var(--border-strong);
    }

    .tool-btn.active {
      background:
        rgba(77,163,255,.12);

      color: #8ccaff;

      border-color:
        rgba(77,163,255,.3);
    }

    .tool-btn.record-tool {
      background:
        rgba(255,77,103,.1);

      color: #ff8b9b;

      border-color:
        rgba(255,77,103,.25);
    }

    /* =========================================================
       SIDE PANEL
       ========================================================= */

    .side-panel {
      min-width: 0;
      min-height: 0;

      display: flex;
      flex-direction: column;

      background:
        linear-gradient(
          180deg,
          #0a1524,
          #08111e
        );

      border:
        1px solid var(--border);

      border-radius: var(--radius);

      overflow: hidden;

      box-shadow: var(--shadow);
    }

    .panel-header {
      min-height: 48px;

      padding: 0 14px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      border-bottom: 1px solid var(--border);
    }

    .panel-title {
      font-size: 13px;
      font-weight: 900;
    }

    .panel-scroll {
      flex: 1;

      min-height: 0;

      overflow-y: auto;

      padding: 10px;
    }

    .panel-section {
      margin-bottom: 12px;

      padding: 12px;

      border:
        1px solid var(--border);

      border-radius: 13px;

      background:
        rgba(255,255,255,.018);
    }

    .section-title {
      margin-bottom: 10px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      color: var(--text);

      font-size: 11px;
      font-weight: 900;
    }

    .section-title span:last-child {
      color: var(--muted);
      font-size: 9px;
      font-weight: 700;
    }

    .side-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
    }

    .side-btn {
      min-height: 38px;

      padding: 8px;

      border:
        1px solid var(--border);

      border-radius: 9px;

      background:
        rgba(255,255,255,.03);

      color: var(--text);

      font-size: 10px;
      font-weight: 800;

      text-align: center;
    }

    .side-btn:hover {
      background:
        rgba(255,255,255,.065);
    }

    .side-btn.active {
      color: #8dccff;

      border-color:
        rgba(77,163,255,.3);

      background:
        rgba(77,163,255,.1);
    }

    .side-btn.danger {
      color: #ff8798;
    }

    .side-btn.success {
      color: #76e9a3;
    }

    .side-control {
      margin-top: 9px;
    }

    .side-control:first-child {
      margin-top: 0;
    }

    .side-control-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 9px;
    }

    .side-control-label {
      min-width: 0;

      color: var(--muted);

      font-size: 10px;
      font-weight: 700;
    }

    .side-value {
      color: var(--text);

      font-size: 10px;
      font-weight: 900;
    }

    input[type="range"] {
      width: 100%;
      accent-color: var(--blue);
    }

    input[type="color"] {
      width: 42px;
      height: 30px;

      padding: 2px;

      border:
        1px solid var(--border);

      border-radius: 8px;

      background: #0d1928;
    }

    .check-row {
      min-height: 34px;

      display: flex;
      align-items: center;
      gap: 8px;

      color: var(--muted);

      font-size: 10px;
      font-weight: 700;
    }

    .check-row input {
      accent-color: var(--blue);
    }

    .upload-box {
      margin-top: 8px;

      padding: 11px;

      border:
        1px dashed rgba(255,255,255,.13);

      border-radius: 10px;

      color: var(--muted);

      text-align: center;

      font-size: 10px;
      line-height: 1.5;
    }

    /* =========================================================
       SCREEN CAPTURE SECTION
       ========================================================= */

    .screen-status {
      margin-top: 9px;

      min-height: 35px;

      padding: 0 9px;

      display: flex;
      align-items: center;
      gap: 8px;

      border-radius: 9px;

      background:
        rgba(255,255,255,.025);

      border:
        1px solid var(--border);

      color: var(--muted);

      font-size: 9px;
      font-weight: 800;
    }

    /* =========================================================
       STUDENTS
       ========================================================= */

    .students-list {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .student-item {
      min-height: 40px;

      padding: 6px 8px;

      display: flex;
      align-items: center;
      gap: 8px;

      border-radius: 9px;

      background:
        rgba(255,255,255,.025);

      border:
        1px solid var(--border);
    }

    .student-avatar {
      width: 27px;
      height: 27px;

      flex: 0 0 auto;

      display: grid;
      place-items: center;

      border-radius: 50%;

      background:
        rgba(77,163,255,.13);

      color: #91cbff;

      font-size: 9px;
      font-weight: 900;
    }

    .student-info {
      min-width: 0;
      flex: 1;
    }

    .student-name {
      overflow: hidden;

      color: var(--text);

      font-size: 10px;
      font-weight: 800;

      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .student-status {
      margin-top: 2px;

      color: var(--green);

      font-size: 8px;
      font-weight: 700;
    }

    .student-remove {
      width: 24px;
      height: 24px;

      display: grid;
      place-items: center;

      border: 0;
      border-radius: 7px;

      background: transparent;

      color: var(--muted-2);
    }

    .student-remove:hover {
      color: var(--red);
      background: rgba(255,77,103,.08);
    }

    /* =========================================================
       TELEPROMPTER
       ========================================================= */

    .teleprompter-mini {
      padding: 10px;

      border-radius: 10px;

      background:
        #050a12;

      border:
        1px solid var(--border);

      color: #eaf4ff;

      font-size: 11px;
      line-height: 1.7;

      max-height: 130px;

      overflow: hidden;
    }

    .teleprompter-mini-empty {
      color: var(--muted-2);
      text-align: center;
    }

    /* =========================================================
       FULLSCREEN
       ========================================================= */

    .stage-shell:fullscreen {
      width: 100vw;
      height: 100vh;

      border-radius: 0;
    }

    .app:fullscreen {
      width: 100vw;
      height: 100vh;
    }

    body.fullscreen-active {
      overflow: hidden;
    }

    /* =========================================================
       MODALS
       ========================================================= */

    .modal-backdrop {
      position: fixed;

      inset: 0;

      z-index: 500;

      display: none;
      align-items: center;
      justify-content: center;

      padding: 20px;

      background:
        rgba(0,0,0,.72);

      backdrop-filter: blur(10px);
    }

    .modal-backdrop.show {
      display: flex;
    }

    .modal {
      width: min(720px, 100%);

      max-height: 90vh;

      overflow-y: auto;

      border:
        1px solid var(--border-strong);

      border-radius: 18px;

      background:
        linear-gradient(
          180deg,
          #0d1a2b,
          #091321
        );

      box-shadow:
        0 35px 100px rgba(0,0,0,.55);
    }

    .modal.small {
      width: min(470px, 100%);
    }

    .modal-header {
      min-height: 58px;

      padding: 0 16px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      border-bottom: 1px solid var(--border);
    }

    .modal-title {
      font-size: 14px;
      font-weight: 900;
    }

    .modal-close {
      width: 34px;
      height: 34px;

      display: grid;
      place-items: center;

      border: 1px solid var(--border);
      border-radius: 9px;

      background: rgba(255,255,255,.035);
      color: var(--muted);
    }

    .modal-body {
      padding: 16px;
    }

    .modal-footer {
      min-height: 62px;

      padding: 10px 16px;

      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;

      border-top: 1px solid var(--border);
    }

    .field {
      margin-bottom: 13px;
    }

    .field:last-child {
      margin-bottom: 0;
    }

    .field-label {
      display: block;

      margin-bottom: 6px;

      color: var(--muted);

      font-size: 10px;
      font-weight: 800;
    }

    .field input,
    .field select,
    .field textarea {
      width: 100%;

      min-height: 40px;

      padding: 9px 11px;

      color: var(--text);

      background: #07111e;

      border:
        1px solid var(--border);

      border-radius: 9px;

      outline: none;
    }

    .field textarea {
      min-height: 100px;
      resize: vertical;
    }

    .field input:focus,
    .field select:focus,
    .field textarea:focus {
      border-color:
        rgba(77,163,255,.45);
    }

    /* =========================================================
       KEYBOARD HELP
       ========================================================= */

    .shortcut-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .shortcut-item {
      min-height: 40px;

      padding: 7px 9px;

      display: flex;
      align-items: center;
      justify-content: space-between;

      border:
        1px solid var(--border);

      border-radius: 9px;

      background:
        rgba(255,255,255,.025);
    }

    .shortcut-name {
      color: var(--muted);
      font-size: 10px;
      font-weight: 700;
    }

    kbd {
      min-width: 60px;

      padding: 5px 7px;

      text-align: center;

      color: #dceaff;

      background: #07101c;

      border:
        1px solid var(--border);

      border-bottom-color:
        rgba(255,255,255,.2);

      border-radius: 6px;

      font-size: 9px;
      font-weight: 900;
    }

    /* =========================================================
       RECORDING PREVIEW
       ========================================================= */

    .record-preview {
      width: 100%;

      max-height: 60vh;

      background: #000;

      border-radius: 10px;

      display: block;
    }

    .recording-file-info {
      margin-top: 10px;

      padding: 10px;

      border:
        1px solid var(--border);

      border-radius: 9px;

      color: var(--muted);

      font-size: 10px;
      line-height: 1.6;
    }

    /* =========================================================
       TOAST
       ========================================================= */

    .toast-container {
      position: fixed;

      right: 18px;
      bottom: 18px;

      z-index: 900;

      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;

      pointer-events: none;
    }

    .toast {
      max-width: min(380px, calc(100vw - 36px));

      padding: 11px 13px;

      border:
        1px solid var(--border-strong);

      border-radius: 10px;

      background:
        rgba(10,20,33,.94);

      color: var(--text);

      box-shadow:
        0 16px 45px rgba(0,0,0,.4);

      font-size: 10px;
      font-weight: 700;

      animation:
        toastIn .2s ease;
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* =========================================================
       HIDDEN
       ========================================================= */

    .hidden {
      display: none !important;
    }

    .sr-only {
      position: absolute;

      width: 1px;
      height: 1px;

      padding: 0;
      margin: -1px;

      overflow: hidden;

      clip: rect(0,0,0,0);

      white-space: nowrap;

      border: 0;
    }

    /* =========================================================
       RESPONSIVE
       ========================================================= */

    @media (max-width: 1180px) {
      .workspace {
        grid-template-columns:
          minmax(0, 1fr)
          270px;
      }

      .top-actions {
        gap: 5px;
      }

      .top-btn {
        padding: 0 9px;
      }
    }

    @media (max-width: 980px) {
      .workspace {
        grid-template-columns: 1fr;
      }

      .side-panel {
        min-height: 420px;
      }

      .panel-scroll {
        max-height: none;
      }

      .device-status {
        width: 100%;
        margin-left: 0;
      }
    }

    @media (max-width: 760px) {
      .topbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .brand-area {
        width: 100%;
      }

      .top-actions {
        width: 100%;

        justify-content: flex-start;

        overflow-x: auto;

        flex-wrap: nowrap;
      }

      .recording-control-bar {
        align-items: flex-start;
      }

      .recording-control-divider {
        display: none;
      }

      .device-status {
        overflow-x: auto;
        flex-wrap: nowrap;
      }

      .workspace {
        padding: 8px;
        gap: 8px;
      }

      .stage-shell {
        min-height: 420px;
      }

      .mentor-card {
        top: 12px;
        right: 12px;

        width: 150px;
        height: 100px;
      }

      .brand-badge {
        left: 10px;
        bottom: 10px;
      }

      .stage-toolbar {
        padding: 7px;
      }

      .tool-btn {
        height: 36px;
      }
    }

    @media (max-width: 520px) {
      .recording-live-box {
        width: 100%;
      }

      .recording-control-group {
        width: calc(50% - 5px);
      }

      .control-select {
        width: 100%;
      }

      .record-control-btn {
        flex: 1;
      }

      .stage-shell {
        min-height: 350px;
      }

      .stage-header {
        padding: 0 10px;
      }

      .stage-title {
        font-size: 11px;
      }

      .stage-badge {
        display: none;
      }

      .mentor-card {
        width: 125px;
        height: 84px;

        min-width: 110px;
        min-height: 74px;
      }

      .workspace {
        padding: 6px;
      }
    }
  </style>

  <!-- =========================================================
       MEDIAPIPE
       ========================================================= -->

  <script
    src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
  ></script>

  <script
    src="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js"
  ></script>
</head>

<body>

  <div
    class="app"
    id="app"
  >

    <!-- =======================================================
         TOP BAR
         ======================================================= -->

    <header class="topbar">

      <div class="brand-area">

        <div class="brand-logo">
          MS
        </div>

        <div class="brand-text">

          <div
            class="brand-title"
            id="studioTitle"
          >
            Mentor Studio
          </div>

          <div class="brand-subtitle">
            Personal Course Studio
          </div>

        </div>

      </div>


      <div class="top-actions">

        <button
          type="button"
          class="top-btn"
          id="openShortcutsBtn"
          title="Keyboard shortcuts"
        >
          ⌨ Shortcuts
        </button>

        <button
          type="button"
          class="top-btn"
          id="startScreenCaptureBtn"
          title="Capture screen, window or browser tab"
        >
          🖥 Screen
        </button>

        <button
          type="button"
          class="top-btn"
          id="fullscreenStageBtn"
          title="Stage fullscreen"
        >
          ⛶ Stage
        </button>

        <button
          type="button"
          class="top-btn"
          id="fullscreenStudioBtn"
          title="Full Studio fullscreen"
        >
          ⛶ Studio
        </button>

        <button
          type="button"
          class="top-btn"
          id="settingsBtn"
        >
          ⚙ Settings
        </button>

        <button
          type="button"
          class="top-btn"
          id="openTeleprompterTopBtn"
        >
          ▤ Teleprompter
        </button>

        <button
          type="button"
          class="top-btn record"
          id="recordBtn"
        >
          ● Record
        </button>

      </div>

    </header>


    <!-- =======================================================
         PROFESSIONAL RECORDING CONTROL BAR
         ======================================================= -->

    <section
      class="recording-control-bar"
      id="recordingStatusBar"
    >

      <div class="recording-live-box">

        <span
          class="recording-dot"
          id="recordingStatusDot"
        ></span>

        <span
          class="recording-status-text"
          id="recordingStatusText"
        >
          Ready
        </span>

        <span
          class="recording-timer"
          id="recordingTimer"
        >
          00:00:00
        </span>

      </div>


      <div class="recording-control-divider"></div>


      <div class="recording-control-group">

        <span class="control-label">
          Quality
        </span>

        <select
          class="control-select"
          id="recordingQuality"
          aria-label="Recording quality"
        >
          <option value="720">720p HD</option>
          <option value="1080" selected>1080p Full HD</option>
          <option value="1440">1440p QHD</option>
        </select>

      </div>


      <div class="recording-control-group">

        <span class="control-label">
          FPS
        </span>

        <select
          class="control-select"
          id="recordingFps"
          aria-label="Recording FPS"
        >
          <option value="24">24 FPS</option>
          <option value="30" selected>30 FPS</option>
          <option value="60">60 FPS</option>
        </select>

      </div>


      <div class="recording-control-divider"></div>


      <button
        type="button"
        class="record-control-btn pause"
        id="pauseRecordingBtn"
      >
        ⏸ Pause
      </button>

      <button
        type="button"
        class="record-control-btn resume hidden"
        id="resumeRecordingBtn"
      >
        ▶ Resume
      </button>

      <button
        type="button"
        class="record-control-btn stop"
        id="stopRecordingBtn"
      >
        ■ Stop
      </button>


      <div class="device-status">

        <div class="status-pill">
          <span
            class="status-light"
            id="cameraIndicator"
          ></span>
          Camera
        </div>

        <div class="status-pill">
          <span
            class="status-light"
            id="micIndicator"
          ></span>
          Mic
        </div>

        <div class="status-pill">
          <span
            class="status-light"
            id="audioIndicator"
          ></span>
          Audio
        </div>

        <div class="status-pill">
          <span
            class="status-light"
            id="screenIndicator"
          ></span>
          Screen
        </div>

      </div>

    </section>


    <!-- =======================================================
         WORKSPACE
         ======================================================= -->

    <main class="workspace">


      <!-- =====================================================
           STAGE
           ===================================================== -->

      <section
        class="stage-shell"
        id="stageShell"
      >

        <div class="stage-header">

          <div class="stage-title">
            Course Production Stage
          </div>

          <div class="stage-meta">

            <span
              class="stage-badge resolution"
              id="stageResolutionBadge"
            >
              1920 × 1080
            </span>

            <span
              class="stage-badge"
              id="stageFpsBadge"
            >
              30 FPS
            </span>

            <span
              class="stage-badge"
              id="stageSourceBadge"
            >
              Ready
            </span>

          </div>

        </div>


        <div
          class="stage"
          id="stage"
        >

          <div class="stage-grid"></div>


          <!-- MAIN IMAGE -->

          <img
            id="mainImage"
            alt="Main course content"
          >


          <!-- MAIN VIDEO -->

          <video
            id="mainVideo"
            playsinline
            preload="metadata"
          ></video>


          <!-- SCREEN CAPTURE VIDEO -->

          <video
            id="screenCaptureVideo"
            playsinline
            muted
            autoplay
          ></video>


          <!-- WELCOME -->

          <div
            id="welcomeContent"
          >

            <div class="welcome-icon">
              ▶
            </div>

            <div class="welcome-title">
              Ready to Create Your Course
            </div>

            <div class="welcome-text">
              Upload your lesson slide or video,
              add your mentor camera,
              configure audio,
              and start professional recording.
            </div>

          </div>


          <!-- =================================================
               MENTOR CARD
               ================================================= -->

          <div
            class="mentor-card"
            id="mentorCard"
          >

            <video
              id="mentorVideo"
              playsinline
              preload="metadata"
            ></video>


            <video
              id="mentorCameraVideo"
              playsinline
              autoplay
              muted
            ></video>


            <canvas
              id="mentorAICanvas"
            ></canvas>


            <div
              class="mentor-placeholder"
              id="mentorPlaceholder"
            >

              <div>

                <div class="mentor-placeholder-icon">
                  🎥
                </div>

                <div>
                  Upload mentor video<br>
                  or start camera
                </div>

              </div>

            </div>


            <div
              class="mentor-source-label"
              id="mentorSourceLabel"
            >
              Mentor
            </div>


            <div
              class="mentor-resize"
              id="mentorResize"
              title="Resize mentor video"
            ></div>

          </div>


          <!-- BRAND -->

          <div
            class="brand-badge"
            id="brandBadge"
          >
            Personal Course Studio
          </div>


          <!-- RECORDING OVERLAY -->

          <div
            class="recording-overlay"
            id="recordingOverlay"
          >

            <span
              class="recording-overlay-dot"
            ></span>

            <span class="recording-overlay-text">
              RECORDING
            </span>

            <span
              class="recording-overlay-time"
              id="recordingOverlayTimer"
            >
              00:00:00
            </span>

          </div>

        </div>


        <!-- ===================================================
             STAGE TOOLBAR
             =================================================== -->

        <div class="stage-toolbar">

          <button
            type="button"
            class="tool-btn"
            id="uploadMainBtn"
          >
            🖼 Upload Slide
          </button>

          <button
            type="button"
            class="tool-btn"
            id="uploadVideoBtn"
          >
            🎬 Main Video
          </button>

          <button
            type="button"
            class="tool-btn"
            id="mainPlayBtn"
          >
            ▶ Play
          </button>

          <button
            type="button"
            class="tool-btn"
            id="mainPauseBtn"
          >
            ⏸ Pause
          </button>

          <button
            type="button"
            class="tool-btn"
            id="uploadMentorBtn"
          >
            🎥 Mentor Video
          </button>

          <button
            type="button"
            class="tool-btn"
            id="startCameraBtn"
          >
            📷 Camera
          </button>

          <button
            type="button"
            class="tool-btn"
            id="stopCameraBtn"
          >
            ⏹ Camera Off
          </button>

          <button
            type="button"
            class="tool-btn"
            id="recordToolbarBtn"
          >
            ● Record
          </button>

          <button
            type="button"
            class="tool-btn"
            id="openTeleprompterBtn"
          >
            ▤ Teleprompter
          </button>

        </div>

      </section>


      <!-- =====================================================
           SIDE PANEL
           ===================================================== -->

      <aside
        class="side-panel"
        id="sidePanel"
      >

        <div class="panel-header">

          <div class="panel-title">
            Studio Controls
          </div>

          <span
            class="stage-badge"
            id="cameraStatus"
          >
            Camera Off
          </span>

        </div>


        <div class="panel-scroll">


          <!-- =================================================
               CAMERA
               ================================================= -->

          <section class="panel-section">

            <div class="section-title">

              <span>
                Camera
              </span>

              <span>
                Mentor
              </span>

            </div>


            <div class="side-grid">

              <button
                type="button"
                class="side-btn"
                id="startCameraSideBtn"
              >
                Start
              </button>

              <button
                type="button"
                class="side-btn danger"
                id="stopCameraSideBtn"
              >
                Stop
              </button>

              <button
                type="button"
                class="side-btn"
                id="switchCameraSideBtn"
              >
                Switch
              </button>

              <button
                type="button"
                class="side-btn"
                id="uploadMentorSideBtn"
              >
                Upload
              </button>

            </div>

          </section>


          <!-- =================================================
               AI BACKGROUND
               ================================================= -->

          <section class="panel-section">

            <div class="section-title">

              <span>
                AI Background
              </span>

              <span>
                Person Segmentation
              </span>

            </div>


            <div class="side-grid">

              <button
                type="button"
                class="side-btn active"
                id="bgOriginalBtn"
              >
                Original
              </button>

              <button
                type="button"
                class="side-btn"
                id="bgRemoveBtn"
              >
                Remove
              </button>

              <button
                type="button"
                class="side-btn"
                id="bgBlurBtn"
              >
                Blur
              </button>

              <button
                type="button"
                class="side-btn"
                id="bgImageBtn"
              >
                Image
              </button>

              <button
                type="button"
                class="side-btn"
                id="bgColorBtn"
              >
                Color
              </button>

            </div>


            <div class="side-control">

              <div class="side-control-row">

                <span class="side-control-label">
                  Background Color
                </span>

                <input
                  type="color"
                  id="backgroundColor"
                  value="#142238"
                  aria-label="Background color"
                >

              </div>

            </div>


            <div
              class="upload-box"
              id="backgroundUploadBox"
            >
              Custom background image can be uploaded here.
            </div>

          </section>


          <!-- =================================================
               SCREEN CAPTURE
               ================================================= -->

          <section class="panel-section">

            <div class="section-title">

              <span>
                Screen Capture
              </span>

              <span>
                Tab / Window / Screen
              </span>

            </div>


            <div class="side-grid">

              <button
                type="button"
                class="side-btn"
                id="startScreenCaptureSideBtn"
              >
                🖥 Start
              </button>

              <button
                type="button"
                class="side-btn danger"
                id="stopScreenCaptureBtn"
              >
                ⏹ Stop
              </button>

            </div>


            <div
              class="screen-status"
              id="screenCaptureStatus"
            >

              <span
                class="status-light"
                id="screenCaptureStatusLight"
              ></span>

              <span>
                Screen capture is off
              </span>

            </div>

          </section>


          <!-- =================================================
               AUDIO
               ================================================= -->

          <section class="panel-section">

            <div class="section-title">

              <span>
                Recording Audio
              </span>

              <span>
                Master
              </span>

            </div>


            <label class="check-row">

              <input
                type="checkbox"
                id="mainVideoAudioCheckbox"
                checked
              >

              <span>
                Main video audio
              </span>

            </label>


            <div class="side-control">

              <div class="side-control-row">

                <span class="side-control-label">
                  Main Volume
                </span>

                <span
                  class="side-value"
                  id="mainVolumeValue"
                >
                  100%
                </span>

              </div>

              <input
                type="range"
                id="mainVideoVolume"
                min="0"
                max="100"
                value="100"
              >

            </div>


            <div class="side-control">

              <div class="side-control-row">

                <span class="side-control-label">
                  Microphone
                </span>

                <span
                  class="side-value"
                  id="micVolumeValue"
                >
                  100%
                </span>

              </div>

              <input
                type="range"
                id="micVolume"
                min="0"
                max="100"
                value="100"
              >

            </div>


            <label class="check-row">

              <input
                type="checkbox"
                id="micEnabled"
                checked
              >

              <span>
                Microphone enabled
              </span>

            </label>


            <label class="check-row">

              <input
                type="checkbox"
                id="micMonitor"
              >

              <span>
                Monitor microphone
              </span>

            </label>


            <div
              class="screen-status"
              data-mic-status
            >
              Microphone not connected
            </div>

          </section>


          <!-- =================================================
               TELEPROMPTER
               ================================================= -->

          <section class="panel-section">

            <div class="section-title">

              <span>
                Teleprompter
              </span>

              <span>
                Mentor Script
              </span>

            </div>


            <div
              class="teleprompter-mini"
              id="teleprompterMiniPreview"
            >

              <div class="teleprompter-mini-empty">
                No script loaded.
              </div>

            </div>


            <div
              class="side-grid"
              style="margin-top:8px;"
            >

              <button
                type="button"
                class="side-btn"
                id="openTeleprompterSide"
              >
                Open
              </button>

              <button
                type="button"
                class="side-btn"
                id="uploadTeleprompterBtn"
              >
                TXT File
              </button>

            </div>

          </section>


          <!-- =================================================
               STUDENTS
               ================================================= -->

          <section class="panel-section">

            <div class="section-title">

              <span>
                Students
              </span>

              <span>
                Live Class
              </span>

            </div>


            <div
              class="students-list"
              id="studentsList"
            ></div>


            <button
              type="button"
              class="side-btn"
              id="addStudentBtn"
              style="width:100%;margin-top:8px;"
            >
              + Add Student
            </button>

          </section>


          <!-- =================================================
               RECORDING SETTINGS
               ================================================= -->

          <section class="panel-section">

            <div class="section-title">

              <span>
                Recording
              </span>

              <span>
                Professional
              </span>

            </div>


            <div class="side-control">

              <div class="side-control-row">

                <span class="side-control-label">
                  Quality
                </span>

                <select
                  class="control-select"
                  id="recordingQualitySide"
                  style="width:135px;"
                >
                  <option value="720">
                    720p HD
                  </option>

                  <option value="1080" selected>
                    1080p Full HD
                  </option>

                  <option value="1440">
                    1440p QHD
                  </option>
                </select>

              </div>

            </div>


            <div class="side-control">

              <div class="side-control-row">

                <span class="side-control-label">
                  Frame Rate
                </span>

                <select
                  class="control-select"
                  id="recordingFpsSide"
                  style="width:135px;"
                >
                  <option value="24">
                    24 FPS
                  </option>

                  <option value="30" selected>
                    30 FPS
                  </option>

                  <option value="60">
                    60 FPS
                  </option>
                </select>

              </div>

            </div>


            <div
              class="upload-box"
              style="margin-top:10px;"
            >
              Higher resolution and FPS require more CPU,
              memory and recording bitrate.
            </div>

          </section>


          <!-- =================================================
               FILES
               ================================================= -->

          <section class="panel-section">

            <div class="section-title">

              <span>
                Files
              </span>

              <span>
                Workspace
              </span>

            </div>


            <div class="side-grid">

              <button
                type="button"
                class="side-btn"
                id="uploadMainSideBtn"
              >
                Slide
              </button>

              <button
                type="button"
                class="side-btn"
                id="uploadVideoSideBtn"
              >
                Video
              </button>

              <button
                type="button"
                class="side-btn"
                id="uploadMentorFileSideBtn"
              >
                Mentor
              </button>

              <button
                type="button"
                class="side-btn"
                id="uploadBackgroundSideBtn"
              >
                BG Image
              </button>

            </div>

          </section>


        </div>

      </aside>

    </main>


    <!-- =======================================================
         HIDDEN FILE INPUTS
         ======================================================= -->

    <input
      type="file"
      id="mainFileInput"
      accept="image/*"
      hidden
    >

    <input
      type="file"
      id="mainVideoInput"
      accept="video/*"
      hidden
    >

    <input
      type="file"
      id="mentorFileInput"
      accept="video/*"
      hidden
    >

    <input
      type="file"
      id="backgroundImageUpload"
      accept="image/*"
      hidden
    >

    <input
      type="file"
      id="teleprompterFileInput"
      accept=".txt,text/plain"
      hidden
    >


    <!-- =======================================================
         AI CANVASES
         ======================================================= -->

    <canvas
      id="aiCanvas"
      class="hidden"
      width="640"
      height="480"
    ></canvas>

    <canvas
      id="aiSourceCanvas"
      class="hidden"
      width="640"
      height="480"
    ></canvas>

    <canvas
      id="aiMaskCanvas"
      class="hidden"
      width="640"
      height="480"
    ></canvas>


    <!-- =======================================================
         SETTINGS MODAL
         ======================================================= -->

    <div
      class="modal-backdrop"
      id="settingsModal"
    >

      <div class="modal">

        <div class="modal-header">

          <div class="modal-title">
            Studio Settings
          </div>

          <button
            type="button"
            class="modal-close"
            id="closeSettingsBtn"
          >
            ✕
          </button>

        </div>


        <div class="modal-body">

          <div class="field">

            <label
              class="field-label"
              for="brandNameInput"
            >
              Brand / Studio Name
            </label>

            <input
              type="text"
              id="brandNameInput"
              value="Personal Course Studio"
              placeholder="Enter studio name"
            >

          </div>


          <div class="field">

            <label class="field-label">
              Default Recording Quality
            </label>

            <select id="settingsRecordingQuality">

              <option value="720">
                720p HD
              </option>

              <option value="1080" selected>
                1080p Full HD
              </option>

              <option value="1440">
                1440p QHD
              </option>

            </select>

          </div>


          <div class="field">

            <label class="field-label">
              Default FPS
            </label>

            <select id="settingsRecordingFps">

              <option value="24">
                24 FPS
              </option>

              <option value="30" selected>
                30 FPS
              </option>

              <option value="60">
                60 FPS
              </option>

            </select>

          </div>


          <div class="field">

            <label class="check-row">

              <input
                type="checkbox"
                id="settingsAutoStartTeleprompter"
              >

              <span>
                Start teleprompter with recording
              </span>

            </label>


            <label class="check-row">

              <input
                type="checkbox"
                id="settingsShowTeleprompterRecording"
                checked
              >

              <span>
                Show teleprompter while recording
              </span>

            </label>

          </div>

        </div>


        <div class="modal-footer">

          <button
            type="button"
            class="record-control-btn"
            id="closeSettingsFooterBtn"
          >
            Cancel
          </button>

          <button
            type="button"
            class="record-control-btn resume"
            id="saveSettingsBtn"
          >
            Save Settings
          </button>

        </div>

      </div>

    </div>


    <!-- =======================================================
         SHORTCUT MODAL
         ======================================================= -->

    <div
      class="modal-backdrop"
      id="shortcutsModal"
    >

      <div class="modal small">

        <div class="modal-header">

          <div class="modal-title">
            Keyboard Shortcuts
          </div>

          <button
            type="button"
            class="modal-close"
            id="closeShortcutsBtn"
          >
            ✕
          </button>

        </div>


        <div class="modal-body">

          <div class="shortcut-list">

            <div class="shortcut-item">

              <span class="shortcut-name">
                Start / Stop Recording
              </span>

              <kbd>Ctrl + Enter</kbd>

            </div>


            <div class="shortcut-item">

              <span class="shortcut-name">
                Pause / Resume Recording
              </span>

              <kbd>Space</kbd>

            </div>


            <div class="shortcut-item">

              <span class="shortcut-name">
                Screen Capture
              </span>

              <kbd>Ctrl + Shift + S</kbd>

            </div>


            <div class="shortcut-item">

              <span class="shortcut-name">
                Stage Fullscreen
              </span>

              <kbd>Ctrl + Shift + F</kbd>

            </div>


            <div class="shortcut-item">

              <span class="shortcut-name">
                Full Studio
              </span>

              <kbd>Ctrl + Shift + G</kbd>

            </div>


            <div class="shortcut-item">

              <span class="shortcut-name">
                Close / Exit Fullscreen
              </span>

              <kbd>Esc</kbd>

            </div>

          </div>

        </div>

      </div>

    </div>


    <!-- =======================================================
         TELEPROMPTER MODAL
         ======================================================= -->

    <div
      class="modal-backdrop"
      id="teleprompterModal"
    >

      <div
        class="modal"
        style="width:min(900px,100%);"
      >

        <div class="modal-header">

          <div class="modal-title">
            Teleprompter
          </div>

          <button
            type="button"
            class="modal-close"
            id="closeTeleprompterBtn"
          >
            ✕
          </button>

        </div>


        <div class="modal-body">

          <div class="field">

            <label
              class="field-label"
              for="teleprompterText"
            >
              Script
            </label>

            <textarea
              id="teleprompterText"
              placeholder="Paste or type your course script here..."
              style="
                min-height:220px;
                font-size:16px;
                line-height:1.8;
              "
            ></textarea>

          </div>


          <div
            style="
              display:grid;
              grid-template-columns:
                repeat(3,1fr);
              gap:10px;
            "
          >

            <div class="field">

              <label class="field-label">
                Speed
              </label>

              <input
                type="range"
                id="teleprompterSpeed"
                min="10"
                max="200"
                value="60"
              >

            </div>


            <div class="field">

              <label class="field-label">
                Font Size
              </label>

              <input
                type="range"
                id="teleprompterFontSize"
                min="16"
                max="54"
                value="30"
              >

            </div>


            <div class="field">

              <label class="field-label">
                Opacity
              </label>

              <input
                type="range"
                id="teleprompterOpacity"
                min="20"
                max="100"
                value="92"
              >

            </div>

          </div>


          <div
            id="teleprompterPreview"
            style="
              height:280px;
              overflow:hidden;
              padding:25px;
              border-radius:14px;
              background:#03070d;
              border:1px solid rgba(255,255,255,.08);
              color:#fff;
              font-size:30px;
              line-height:1.8;
            "
          >
            Your teleprompter text will appear here.
          </div>

        </div>


        <div class="modal-footer">

          <button
            type="button"
            class="record-control-btn"
            id="teleprompterResetBtn"
          >
            Reset
          </button>

          <button
            type="button"
            class="record-control-btn"
            id="teleprompterPauseBtn"
          >
            ⏸ Pause
          </button>

          <button
            type="button"
            class="record-control-btn"
            id="teleprompterPlayBtn"
          >
            ▶ Play
          </button>

          <button
            type="button"
            class="record-control-btn resume"
            id="teleprompterSaveBtn"
          >
            Save
          </button>

        </div>

      </div>

    </div>


    <!-- =======================================================
         RECORDING PREVIEW MODAL
         ======================================================= -->

    <div
      class="modal-backdrop"
      id="recordingPreviewModal"
    >

      <div class="modal">

        <div class="modal-header">

          <div class="modal-title">
            Recording Preview
          </div>

          <button
            type="button"
            class="modal-close"
            id="closeRecordingPreviewBtn"
          >
            ✕
          </button>

        </div>


        <div class="modal-body">

          <video
            id="recordingPreviewVideo"
            class="record-preview"
            controls
            playsinline
          ></video>


          <div
            class="recording-file-info"
            id="recordingFileInfo"
          >
            Recording ready.
          </div>

        </div>


        <div class="modal-footer">

          <button
            type="button"
            class="record-control-btn danger"
            id="deleteRecordingBtn"
          >
            Delete
          </button>

          <button
            type="button"
            class="record-control-btn"
            id="recordAgainBtn"
          >
            Record Again
          </button>

          <a
            href="#"
            class="record-control-btn resume"
            id="downloadRecordingBtn"
            download="mentor-studio-recording.webm"
            style="text-decoration:none;"
          >
            ↓ Download
          </a>

        </div>

      </div>

    </div>


    <!-- =======================================================
         ADD STUDENT MODAL
         ======================================================= -->

    <div
      class="modal-backdrop"
      id="studentModal"
    >

      <div class="modal small">

        <div class="modal-header">

          <div class="modal-title">
            Add Student
          </div>

          <button
            type="button"
            class="modal-close"
            id="closeStudentModalBtn"
          >
            ✕
          </button>

        </div>


        <div class="modal-body">

          <div class="field">

            <label
              class="field-label"
              for="studentNameInput"
            >
              Student Name
            </label>

            <input
              type="text"
              id="studentNameInput"
              placeholder="Enter student name"
            >

          </div>

        </div>


        <div class="modal-footer">

          <button
            type="button"
            class="record-control-btn"
            id="cancelStudentBtn"
          >
            Cancel
          </button>

          <button
            type="button"
            class="record-control-btn resume"
            id="saveStudentBtn"
          >
            Add Student
          </button>

        </div>

      </div>

    </div>


    <!-- =======================================================
         TOAST
         ======================================================= -->

    <div
      class="toast-container"
      id="toastContainer"
    ></div>


    <!-- =======================================================
         INLINE MIC BRIDGE
         ======================================================= -->

    <script>
      /*
       * Existing Step 3.7 compatibility bridge.
       * Step 3.8 script.js will keep using these values.
       */

      window.CourseStudioMicVolume = 1;
      window.CourseStudioMicEnabled = true;
      window.CourseStudioMicMonitor = false;
    </script>


    <!-- =======================================================
         MENTOR RESIZE BRIDGE
         ======================================================= -->

    <script>
      /*
       * Mentor card resizing compatibility.
       * The main script also reads the final DOM dimensions
       * while composing the recording.
       */

      (() => {

        const card =
          document.getElementById("mentorCard");

        const handle =
          document.getElementById("mentorResize");

        if (!card || !handle) return;

        let resizing = false;
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;

        const beginResize = (event) => {

          event.preventDefault();
          event.stopPropagation();

          resizing = true;

          startX =
            event.clientX ??
            event.touches?.[0]?.clientX ??
            0;

          startY =
            event.clientY ??
            event.touches?.[0]?.clientY ??
            0;

          startWidth =
            card.getBoundingClientRect().width;

          startHeight =
            card.getBoundingClientRect().height;

          document.body.style.userSelect = "none";
        };


        const moveResize = (event) => {

          if (!resizing) return;

          const currentX =
            event.clientX ??
            event.touches?.[0]?.clientX ??
            0;

          const currentY =
            event.clientY ??
            event.touches?.[0]?.clientY ??
            0;

          const nextWidth =
            Math.max(
              130,
              Math.min(
                startWidth + (currentX - startX),
                window.innerWidth * 0.45
              )
            );

          const nextHeight =
            Math.max(
              90,
              Math.min(
                startHeight + (currentY - startY),
                window.innerHeight * 0.7
              )
            );

          card.style.width =
            `${nextWidth}px`;

          card.style.height =
            `${nextHeight}px`;
        };


        const endResize = () => {

          if (!resizing) return;

          resizing = false;

          document.body.style.userSelect = "";
        };


        handle.addEventListener(
          "mousedown",
          beginResize
        );

        handle.addEventListener(
          "touchstart",
          beginResize,
          { passive:false }
        );

        window.addEventListener(
          "mousemove",
          moveResize
        );

        window.addEventListener(
          "touchmove",
          moveResize,
          { passive:false }
        );

        window.addEventListener(
          "mouseup",
          endResize
        );

        window.addEventListener(
          "touchend",
          endResize
        );

      })();
    </script>


    <!-- =======================================================
         MAIN SCRIPT
         ======================================================= -->

    <script src="script.js"></script>

  </div>

</body>
</html>
