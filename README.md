# CampusPulse 
### Smart Campus Notice Board Summarizer & University Circular Assistant

> **CampusPulse** turns messy, cluttered campus corkboards and formal university circulars into clear, actionable, student-friendly digests with automated deadline tracking and departmental filtering

---

## The Problem
On every college campus, official communications are scattered across physical corkboards, hallway notice boards, and dense PDF circulars filled with legal disclaimers and administrative jargon. Students frequently miss critical fee payment windows, hall ticket cutoffs, scholarship verification dates, or placement drives simply because notices were buried or difficult to read.

---

## Key Features

-  **Google Lens-Style Document Scanner**:
  - High-resolution camera viewfinder with continuous autofocus, flashlight torch toggle, and optical zoom.
  - Multi-paper canvas segmentation (isolates 2–6 distinct circulars pinned on a single corkboard).
  - Single-document close-up mode for formal notifications.
  - Automatic document contrast stretching and ink deepening to ensure crisp OCR legibility.

-  **Comprehensive Photo Upload Support**:
  - Upload photos directly from phone galleries or desktop storage (`JPEG`, `PNG`, `WEBP`, `HEIC`, `BMP`).
  - Native drag-and-drop file upload zone.
  - Clipboard image paste support (`Ctrl+V` / `Cmd+V`) for instant processing of screenshots from WhatsApp or PDFs.

-  **Multimodal Vision Intelligence (Gemini)**:
  - Extracts issuing authorities, circular reference numbers, issue dates, and hard cutoff deadlines.
  - Generates clear **"Why It Matters"** rationales and ultra-crisp one-line TL;DRs.
  - Surfaces strict action checklists, payment modes, fines, and contact persons.

-  **Intelligent Urgency Hierarchy**:
  - **CRITICAL**: Exam fee deadlines, hall ticket revocation, debarment warnings, condonation limits.
  - **HIGH**: Placement drives, semester registrations, elective selections.
  - **NORMAL**: Hostel room clearance, guest lectures, club hackathons, campus events.
  - **LOW**: General notices, surveys, lost & found.

-  **College Department Filtering**:
  - Dedicated classification for **CS, ECE, EEE, MECH, CIVIL, MCA, MTECH**, and **ALL-Campus** general notices.
  - Personalized **"My Department Feed"** tailored to the student's branch and semester profile.

-  **Right-to-Left Circulars Carousel**:
  - Smooth horizontal slideshow ticker highlighting all current campus circulars at a glance.
  - Automatically hides when the notice board is empty to keep the workspace distraction-free.

-  **Local Browser Persistence & Auto-Expiry**:
  - **Zero Default Junk**: The application starts clean and pristine.
  - Any scanned circular is persistently saved in the student's browser.
  - **Automatic Expiry**: Notices are automatically pruned after **2 weeks (14 days)** or after their explicit deadline has elapsed, or whenever manually dismissed.

-  **One-Click Class Representative (CR) Broadcasts**:
  - Automatically composes WhatsApp- and Telegram-ready formatted announcement digests with bullet points, deadlines, and urgency markers ready to forward to class groups.

-  **Interactive AI Circular Q&A**:
  - Ask natural-language questions about any specific notice or the entire board (e.g., *"Is there a late fine for backlog registration?"*, *"Where do I submit the fee receipt?"*).

-  **Modern Glassmorphic Dark Design**:
  - Cyber-slate aesthetic with backdrop blurs, luminous borders, responsive touch-targets, and zero cluttered boilerplate.

---

##  Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React
- **Backend Service**: Express.js with Node.js
- **AI Engine**: Google Gemini API via `@google/genai` (`gemini-3.8-flash` / `gemini-flash-latest`)
- **Storage**: Client-side storage with automated TTL / cutoff lifecycle management

---
## Check it out

- https://campuspulsemace.ai.studio/
