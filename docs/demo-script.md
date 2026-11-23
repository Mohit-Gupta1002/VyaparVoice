# Demo Recording Script — VyaparVoice (30–45 Seconds)

This script is structured for a concise, compelling 30–45 second Loom or screen recording designed for technical recruiters, engineering hiring managers, and hackathon judges.

---

## Quick Setup Before Recording
1. Start frontend: `npm run dev` (running at `http://localhost:3000`).
2. (Optional) Start Python backend: `cd backend && python run.py` (running at `http://localhost:8000`).
3. Set browser window to 1080p (1920x1080) at 100% zoom.
4. Have microphone audio checked.

---

## Storyboard & Voiceover Script

| Timestamp | Visual Action | Voiceover / Narration |
| :--- | :--- | :--- |
| **00:00 – 00:07** | Show VyaparVoice landing screen. Click Dark/Light theme toggle once to demonstrate UI polish. Hover over the Indic language selector and select **Hindi (hi-IN)** or **English (India)**. | *"This is VyaparVoice—an AI engine built for the way India does business. It converts informal, multilingual spoken trade ideas into production-ready 12-section enterprise BRDs."* |
| **00:07 – 00:15** | Click the **"Ayurveda & Health Clinic"** scenario preset card. Show the transcribed text filling the input area, or click "Record" to speak a brief phrase. | *"A founder can speak in their native tongue or pick a regional trade challenge. The speech pipeline automatically transcribes audio using our local faster-whisper service or Sarvam AI's Saaras v4 model."* |
| **00:15 – 00:25** | Click **"Analyze & Generate Clarifications"**. The modal opens showing 4 clarification questions with highlighted default assumptions. Click **"Generate BRD with All Assumptions"**. | *"Instead of hallucinating unclear business rules, our BhashaBRD engine interviews the founder, recommending practical default assumptions that are explicitly tracked."* |
| **00:25 – 00:37** | The 12-Section BRD renders instantly. Scroll smoothly through **Functional Requirements (`FR-001`)**, **Acceptance Criteria**, and **Section 9 Assumptions**. Toggle to the **Markdown Editor** tab and back. | *"Here is the complete deliverable: 12 structured enterprise sections, GFM requirement tables, user stories, and delivery milestones. It exports to clean Markdown, text, or executive PDF."* |
| **00:37 – 00:45** | Click **"Saved Projects"** in the top navigation. Show the project saved in the history list with timestamp. Click **"Close"**. | *"Generated plans are persisted right in browser localStorage with zero-config offline fallback. Tested across 48 automated test cases and ready for production deployment."* |

---

## Key Talking Points for Recruiters
- **Fullstack TypeScript & Python**: Next.js 15 App Router frontend paired with a decoupled FastAPI microservice.
- **Speech AI Engineering**: Hybrid local Whisper (`faster-whisper` CTranslate2 int8 CPU) + cloud Indic STT (`Sarvam AI`) with graceful fallback.
- **Enterprise-Grade Architecture**: Structured schemas with Pydantic v2 and TypeScript interfaces, deterministic zero-config demo mode, and 48 passing tests across Vitest and Pytest.
