# VyaparVoice (व्यापारवॉइस)

> **"Built for the way India does business."**  
> *"Your business idea deserves a clear plan. Describe the problem in your own words. Turn local business insight into structured requirements, practical next steps, and a plan your team can act on."*

Powered by **Sarvam AI** Indic speech & language models and the **BhashaBRD** requirements-generation engine.

---

## 🌟 Overview

**VyaparVoice** is a distinctive, premium product studio engineered for Indian entrepreneurs. It bridges the gap between grassroots business founders across India and modern technical execution. Non-technical entrepreneurs and product leaders can speak or write their vision in their native language—such as Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, Odia, Punjabi, or Indian English—and generate an enterprise-grade, 12-section Business Requirements Document (BRD) complete with functional requirements, acceptance criteria, milestones, and explicitly marked assumptions.

---

## 🚀 Key Features

1. **Multimodal Input (Voice, Audio & Text)**:
   - **Live Microphone Recording**: In-browser voice notes using HTML5 `MediaRecorder` with real-time Web Audio API waveform visualization.
   - **Audio File Upload**: Drag-and-drop support for `.wav`, `.mp3`, `.m4a`, `.webm`, `.ogg`, and `.flac` files up to 25MB.
   - **Text & Transcript Review**: Directly edit, refine, or paste transcripts before requirements analysis.

2. **Selectable Indian Business Scenarios**:
   - Manage customers and appointments (Clinic & OPD Consultation Scheduler)
   - Reduce queues and waiting times (Walk-in Token & Live Queue Tracker)
   - Track inventory and prevent stockouts (Kirana Khata & Stock Reorder)
   - Organise local deliveries (Hyperlocal Morning Milk & Dairy Supply)
   - Improve billing and payment tracking (Wholesale Vyapar Khata & GST Invoicing)
   - Launch a new product or service (Artisanal D2C Regional Pre-Orders)

3. **Sarvam AI Speech-to-Text (Saaras v4)**:
   - Official integration with Sarvam AI's flagship `saaras:v4` speech recognition model.
   - Supports 11+ Indic languages with automatic language detection (`unknown`) or explicit BCP-47 language codes (`hi-IN`, `mr-IN`, `ta-IN`, etc.).

4. **BhashaBRD Clarification & Assumption Engine**:
   - Detects missing operational constraints, payment flows, and edge cases.
   - Generates 3–4 high-impact clarification questions with **recommended default assumptions**.
   - **Explicit Assumption Guarantee**: Founders can proceed in one click using default assumptions, which are strictly labelled as `[ASSUMPTION]` and never disguised as confirmed facts.

5. **12-Section Enterprise BRD Structure**:
   - **1. Executive Summary & Problem Statement** (Summary, Problem, Proposed Solution)
   - **2. Business Objectives** (Measurable commercial goals)
   - **3. Stakeholders & Target Users** (Roles & responsibilities table)
   - **4. Scope & Exclusions** (In-scope checklist vs Out-of-scope boundaries)
   - **5. Functional Requirements** (Structured table with `FR-001`, `FR-002`, priority tags)
   - **6. Non-Functional Requirements** (Performance, Security, DPDP compliance metrics `NFR-001`)
   - **7. User Stories & Acceptance Criteria** (`US-001` with Given/When/Then scenarios)
   - **8. Business Rules & Governance** (`BR-001` with system impact analysis)
   - **9. Dependencies & Explicit Assumptions** (`DEP-001`, `ASM-001` with risk if invalid)
   - **10. Risks & Open Questions** (`RSK-001` with mitigation strategies)
   - **11. Suggested Delivery Milestones** (`M-001` sprint phases & timelines)
   - **12. Success Metrics & KPIs** (`SM-001` with measurement benchmarks)

6. **Editing, Exporting & PDF Printing**:
   - **Formatted Document View**: Styled tables, badges, and sanitized markdown rendering.
   - **Live Markdown Editor**: Direct in-place editing of generated specifications.
   - **1-Click Copy**: Copies clean Markdown to clipboard with toast notification.
   - **Download as .MD and .TXT**: Instant local file exports.
   - **Browser Print to PDF**: Tailored `@media print` stylesheets formatting pages cleanly for executive PDF export.

7. **Transparent DEMO MODE**:
   - If no Sarvam API key is configured, VyaparVoice automatically runs in **DEMO MODE**.
   - Uses local deterministic simulation. Never implies that demo-mode output comes from a live AI model.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Warm paper ivory, deep forest green, terracotta, muted marigold, and ink navy)
- **UI & Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: [React Markdown](https://github.com/remarkjs/react-markdown) + [Remark GFM](https://github.com/remarkjs/remark-gfm)
- **Audio Processing**: Web Audio API (`AnalyserNode`) / MediaRecorder API
- **AI Integration**: Official [Sarvam AI REST APIs](https://docs.sarvam.ai/)
  - `POST https://api.sarvam.ai/speech-to-text` (`saaras:v4`)
  - `POST https://api.sarvam.ai/v1/chat/completions` (`sarvam-105b`)
- **Testing**: [Vitest](https://vitest.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 📁 Project Architecture & Folder Structure

```text
vyaparvoice/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── clarify/
│   │   │   │   └── route.ts         # Analyzes missing requirements & clarifications
│   │   │   ├── generate-brd/
│   │   │   │   └── route.ts         # Generates 12-section BRD (Sarvam-105B or Demo)
│   │   │   ├── health/
│   │   │   │   └── route.ts         # System readiness & Sarvam config status
│   │   │   └── transcribe/
│   │   │       └── route.ts         # Server-side Saaras v4 audio transcription
│   │   ├── globals.css              # Theme tokens, custom scrollbars, @media print
│   │   ├── layout.tsx               # Root layout & SEO metadata
│   │   └── page.tsx                 # Main workflow state coordinator
│   ├── components/
│   │   ├── AudioRecorder.tsx        # In-browser microphone recording with waveform timer
│   │   ├── AudioUploader.tsx        # File drag-and-drop audio uploader
│   │   ├── BrdViewer.tsx            # Formatted document preview & raw markdown editor
│   │   ├── ClarificationModal.tsx   # Clarification questions & default assumptions UI
│   │   ├── DemoModeBanner.tsx       # Informative banner when running without API key
│   │   ├── Header.tsx               # Brand header with engine tag & status pills
│   │   ├── LanguageSelector.tsx     # Indic language dropdown
│   │   └── StepTracker.tsx          # 3-step progress stepper
│   ├── lib/
│   │   ├── constants.ts             # Supported languages & sample clinic ideas
│   │   ├── demo-data.ts             # Deterministic demo engine & markdown generator
│   │   ├── sarvam.ts                # Server-side Sarvam API client (STT + LLM)
│   │   ├── types.ts                 # Strict TypeScript schemas for BRD & APIs
│   │   └── utils.ts                 # Tailwind class merging & format helpers
│   └── __tests__/
│       ├── validation.test.ts       # File size, string sanitization & language tests
│       └── brd-generation.test.ts   # 12-section validation & assumption tests
├── .env.example                     # Environment template (NO SECRETS COMMITTED)
├── .gitignore                       # Protects node_modules, .env.local, .next
├── next.config.mjs                  # Next.js configuration with React strict mode
├── package.json                     # Dependency manifest and npm scripts
├── postcss.config.mjs               # PostCSS Tailwind plugins
├── tailwind.config.ts               # Custom warm off-white and indigo palette
└── tsconfig.json                    # Strict TypeScript configuration
```

---

## ⚙️ Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your **Sarvam AI API Key** in `.env.local`:
   ```env
   # Obtain from https://dashboard.sarvam.ai/
   SARVAM_API_KEY=your_actual_sarvam_api_key_here

   # Optional overrides (defaults shown)
   SARVAM_BASE_URL=https://api.sarvam.ai
   SARVAM_CHAT_MODEL=sarvam-105b
   SARVAM_STT_MODEL=saaras:v4
   ```

> **Security Note**: All external API calls to Sarvam AI are executed strictly inside Next.js server-side route handlers (`/api/*`). The API key is never exposed to browser client bundles or prefixed with `NEXT_PUBLIC_`.

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Unit & Integration Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Verification & Testing Workflow

### Try the Sample Clinic Idea:
1. Open the app at `http://localhost:3000`.
2. Click **"Try Sample Idea: Clinic Appointment & Queue Management"** to populate the idea.
3. Click **"Analyze & Check Clarifications"**.
4. Review the 4 clarification questions (walk-in vs appointment handling, reminder channels, payment handling, and wait-time algorithms).
5. Click **"Proceed with Explicit Assumptions"**.
6. Inspect the generated 12-section BRD in the **Rendered View** or switch to the **Markdown Editor** tab.
7. Test the **Copy**, **Download .MD**, **Download .TXT**, or **Print / PDF** buttons.

---

## 📡 Official Sarvam AI Endpoints Used

| Capability | Official Endpoint | Headers | Request Format |
| :--- | :--- | :--- | :--- |
| **Speech-to-Text** | `POST https://api.sarvam.ai/speech-to-text` | `api-subscription-key: <KEY>` | `multipart/form-data` (`file`, `model: "saaras:v4"`, `language_code`, `mode: "transcribe"`) |
| **Clarifications & BRD Generation** | `POST https://api.sarvam.ai/v1/chat/completions` | `api-subscription-key: <KEY>` | `application/json` (OpenAI compatible, `model: "sarvam-105b"`, `messages`, `temperature: 0.25`) |

---

## 🚀 Publishing to GitHub

To push this implementation to your existing GitHub repository `Mohit-Gupta1002/VyaparVoice`:

```bash
# 1. Verify git status and ensure no secrets or node_modules are tracked
git status

# 2. Add files and create initial commit
git add .
git commit -m "feat: complete MVP of VyaparVoice multilingual BRD generator with Sarvam AI & BhashaBRD"

# 3. Add remote origin (if not already added)
git remote add origin https://github.com/Mohit-Gupta1002/VyaparVoice.git

# 4. Set main branch and push
git branch -M main
git push -u origin main
```

---

## 📄 License
ISC © VyaparVoice
