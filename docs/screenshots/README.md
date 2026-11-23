# Visual Verification Checklist — VyaparVoice MVP

This checklist documents the key user interface states, workflows, and visual specifications for the VyaparVoice AI Engineering MVP. Use this guide to verify UI rendering or capture production screenshots.

---

## 1. State Checklist

### State 1: Landing Page & Problem Presets
- **URL**: `http://localhost:3000/`
- **Visual Elements**:
  - Sticky navigation bar with Craftsman Monogram logo, `VyaparVoice` title, `BhashaBRD` badge, and "Explore Sample BRD" button.
  - "Saved Projects" button in navigation.
  - Theme toggle (Sun / Moon) and Demo / Live connectivity pill.
  - Step 1 Active Indicator: "1. Voice / Idea Input".
  - Language Selector dropdown featuring 11+ Indic languages (Hindi, Marathi, Tamil, etc.).
  - 6 Indian business domain preset cards (Clinic OPD, Kirana Inventory, Textile B2B, Artisan Cooperative, Mandi Aggregation, Truck Logistics).
  - 3 input mode tabs: Text Input, Record Audio, Upload Audio File.
  - Persistent bottom philosophy marquee bar ("From local ideas to actionable business plans ◆ Built for the way India does business").

---

### State 2: Audio Recording & File Upload
- **Trigger**: Click "Record Audio" or "Upload File" tab.
- **Visual Elements**:
  - **Record Tab**:
    - Microphone permission prompt / record button with pulsing red recording indicator.
    - Real-time 12-bar Web Audio API frequency meter responding to voice volume.
    - Elapsed time counter (MM:SS) and "Stop & Transcribe" button.
  - **Upload Tab**:
    - Drag-and-drop boundary with dashed border.
    - Supported format badges (`WAV`, `MP3`, `M4A`, `WebM`, `OGG`, `FLAC`, `AAC <= 25MB`).
    - File details card (name, formatted size, valid format indicator) upon selection.

---

### State 3: Transcript Review & Edit
- **Trigger**: Audio transcription finishes or user selects a preset.
- **Visual Elements**:
  - Editable textarea containing consolidated transcription text.
  - Character counter displaying minimum length threshold (`>= 15 characters`).
  - Provider indicator badge (Local Whisper vs Sarvam Saaras v4 vs Demo Mode).
  - "Analyze & Generate Clarifications" primary CTA button with arrow icon.

---

### State 4: Clarification Interview Modal
- **Trigger**: Click "Analyze & Generate Clarifications".
- **Visual Elements**:
  - Centered modal dialog with backdrop blur.
  - Staged progress indicators during analysis ("Understanding business domain", "Checking constraints").
  - 3–4 targeted clarification question cards.
  - Each question highlights:
    - Clear operational inquiry (e.g. "Walk-in vs Advance booking policy?").
    - Explicit default assumption with badge (`[Recommended Default Assumption]`).
    - Text field for custom answers or quick-select option pills.
  - "Generate 12-Section BRD" action button with confirmation count.

---

### State 5: 12-Section Enterprise BRD Viewer
- **Trigger**: Complete clarifications or click "Explore Sample BRD".
- **Visual Elements**:
  - Toolbar with Dual Mode tabs: "Rendered Deliverable" and "Markdown Editor".
  - Section Jump Pills (1 through 12).
  - Quick action buttons: "Copy Markdown", "Download (.md)", "Download (.txt)", "Print to PDF".
  - "12 SECTIONS VERIFIED" stamp badge.
  - Fully rendered GitHub Flavored Markdown deliverable:
    - Tables for Functional Requirements (`FR-001` - `FR-008`), NFRs, and RACI Stakeholders.
    - Implementation Milestones with sprint estimates.
    - Section 9 explicitly highlighting `[ASSUMPTION]` tags.

---

### State 6: Browser-Local Project History Modal
- **Trigger**: Click "Saved Projects" in the top navigation header.
- **Visual Elements**:
  - Modal displaying list of previously generated and saved business plans.
  - Metadata pills per item: Project Name, Creation Timestamp, Language, Engine, Demo/Live badge.
  - Inline rename control with Save/Cancel buttons.
  - Delete control with double-click / inline confirmation prompt.
  - One-click "Open Plan" button loading the BRD directly into the deliverable viewer.
  - Prominent privacy disclaimer notice: *"Saved locally in this browser's localStorage. No cloud account required. Clearing browser cache will remove local history."*

---

## 2. Screenshot Capture Standards
When capturing visual artifacts:
- **Viewport**: 1280x800 (Desktop) and 375x812 (Mobile).
- **Themes**: Capture both Light (`warm-50` paper background) and Dark (`charcoal-900` slate background).
- **File Format**: Standard PNG, 24-bit RGB.
- **Directory**: Store captured imagery under `docs/screenshots/`.
