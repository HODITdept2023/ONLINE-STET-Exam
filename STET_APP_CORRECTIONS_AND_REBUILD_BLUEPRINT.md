# STET MOCK EXAM & CANDIDATE MANAGEMENT PLATFORM
## Master Compilation of Corrections, Architecture Audit & Full Rebuild Prompt
*Compiled from all user feedback, bug reports, sync audits, and technical specifications.*

---

## TABLE OF CONTENTS
1. [Executive Summary & Why the Current App Struggled](#1-executive-summary)
2. [Full Categorized Compilation of All Corrections & User Complaints](#2-categorized-compilation-of-corrections)
   - 2.1 Modularity & Code Architecture Failures
   - 2.2 Registration & User Sync Disconnections (Subscriber vs. Admin vs. Candidate)
   - 2.3 Preview vs. Production / Multi-PC Sync Desynchronization
   - 2.4 GT Humanities Section Hallucinations & Syllabus Misalignments
   - 2.5 Question Bank Download, Upload & Crash Recovery (1,000 Qs)
   - 2.6 Candidate Roster Bulk Export & Upload (CSV / JSON)
   - 2.7 Payment, GPay QR Scanner & Manual Verification Gaps
   - 2.8 UI, Dashboard & Live Refresh Lags
3. [Question Bank Specification & Schema (PRT, GT Maths-Science, GT Humanities)](#3-question-bank-specification)
4. [Master Blueprint Prompt for Rebuilding the App from Scratch](#4-master-blueprint-prompt)
5. [Step-by-Step Rebuild Execution Guide for AI / Engineers](#5-rebuild-execution-guide)

---

## 1. EXECUTIVE SUMMARY

The user identified critical pain points that made the current iteration difficult to maintain:
1. **Lack of Modularity:** Massive monolithic files (`AdminPanelView.tsx` ~6,000 lines, `storage.ts` ~3,800 lines, `server.ts` ~1,600 lines) where UI logic, storage parsing, fallback seeding, and network calls are tightly coupled.
2. **Disconnected Registration Flows:** When candidates registered via the public modal, their records were stored in one local key; when an admin created a client, it was stored in another; and when someone paid, their status was not reactively propagated to mock tests.
3. **Desynchronization Across Environments:** Differences between the preview container (`ais-dev`), production (`ais-pre`), and different physical PCs or incognito browsers. PC 1 showed 16 candidates while PC 2 showed only 7 because of aggressive local storage caching and server dummy filters.
4. **Hallucination in GT Humanities:** Questions previously suffered from ungrounded AI generation with generic, out-of-syllabus content instead of authentic Indian State Teacher Eligibility Test (STET / NCERT / SCERT Class 6–10) questions.
5. **Missing Unified Data Vault:** Need for clean, reliable 1-click bulk download and upload of the 1,000+ Question Bank (PDF/JSON) and the Registered Candidates Roster (CSV/JSON/PDF) for crash recovery.

---

## 2. CATEGORIZED COMPILATION OF CORRECTIONS

### 2.1 Modularity & Code Architecture Failures
- **The Issue:** All admin features (logins, client table, advisory council, questions export, GPay upload, bulk backup) were crammed into a single 6,000-line React component. This resulted in state pollution, re-render cascades, and difficult debugging.
- **The Correction:**
  - Break into isolated micro-components: `<CandidateRosterTable />`, `<LoginAuditTable />`, `<QuestionVault />`, `<PaymentGatewayConfig />`, `<AdvisoryCouncilManager />`.
  - Extract all business logic into dedicated services: `candidateService.ts`, `questionService.ts`, `authService.ts`, `syncService.ts`.
  - Use a centralized reactive state store (e.g., Zustand or React Context with Reducer) rather than 40 independent `useState` hooks.

### 2.2 Registration & User Sync Disconnections
- **The Issue:** Three independent paths to register:
  1. Candidate clicks "Register Now" on Hero / Modal.
  2. Candidate pays and submits "Paid & Form Filled" screenshot.
  3. Admin manually creates a client in "Add New Client".
  In the legacy code, these wrote to different storage keys (`studeezone_registered_users_v2` vs `studeezone_clients_directory_v1`), meaning an admin could not see self-registered users in the client list, and manual admin entries couldn't log in.
- **The Correction:**
  - Single Unified Schema for all users and candidates. Every registration—regardless of source—writes to the primary backend `/api/clients` and `/api/users`.
  - When an admin creates a candidate, a user auth record is created simultaneously with identical credentials.
  - When a candidate registers publicly, a client profile record is automatically created in the Admin directory with `status: 'active'`, `trialDaysLeft: 7`, and `examTrack` assigned.
  - When a subscriber is approved via the payment portal, their `proPaidActive: true` and `subscribed: true` flags are instantly updated across the whole app.

### 2.3 Preview vs. Production / Multi-PC Sync Desynchronization
- **The Issue:** AI Studio uses separate web containers for development and preview. When an admin modified records on one PC, the changes remained in that PC's `localStorage` and did not sync to the backend. Additionally, `server.ts` had a hardcoded `isServerDummy` filter that accidentally wiped authentic user records.
- **The Correction:**
  - The server (`server.ts` / database) must be the **Single Source of Truth**.
  - All writes must POST/PUT to the server immediately.
  - Implement bidirectional sync with version timestamps (`updatedAt`), so when any client or admin opens the app, it pulls the latest authoritative data.
  - Client components must listen to `window.addEventListener('storage')` and custom reactive events (`studeezone_clients_updated`, `studeezone_profile_updated`) to update the UI without requiring page reloads.

### 2.4 GT Humanities Section Hallucinations
- **The Issue:** The GT Humanities section contained vague, AI-hallucinated questions with questionable answer keys that did not reflect actual Indian STET (Class 6–10) exams.
- **The Correction:**
  - Curate an authentic, static, verified item bank of 300+ questions specifically mapped to:
    1. **History:** Indus Valley Civilization, Vedic Period, Mauryan Empire, Gupta Empire, Delhi Sultanate, Mughal Administration, Revolt of 1857, Indian National Movement & Freedom Struggle.
    2. **Political Science / Civics:** Indian Constitution, Fundamental Rights & Duties, Preamble, Parliament of India, Judiciary, Panchayati Raj, Federal Structure.
    3. **Geography:** Physical Features of India, Climate & Monsoon, River Systems (Drainage), Agriculture, Mineral & Energy Resources, Population & Demographics.
    4. **Economics:** Sectors of Indian Economy, Money & Banking, Poverty & Food Security, Sustainable Development.
    5. **Social Science Pedagogy:** Objectives of Teaching Social Science, Constructivist Approach, Source & Project Methods, Continuous and Comprehensive Evaluation (CCE), Bloom's Taxonomy in Social Studies.
  - Every question must include: 4 distinct options, unambiguous correct option index (0–3), NCERT/SCERT topic reference, and a comprehensive pedagogical explanation.

### 2.5 Question Bank Download, Upload & Crash Recovery
- **The Issue:** Risk of data loss if the browser cache is cleared or the server reboots. Administrators needed a way to print/export the complete question paper and re-import it anytime.
- **The Correction:**
  - Built-in PDF Generator (`jsPDF`) supporting:
    - Publication-Grade Full Booklet (Cover page, instructions, stream sections).
    - Question-Paper-Only Mode (for mock exam printing without answers).
    - Comprehensive Answer Key & Pedagogical Solution Manual mode.
  - JSON Backup Export: Downloads clean `stet_question_bank_backup.json`.
  - JSON Backup Restore: Uploads previously exported question bank, validates schema, and restores database.

### 2.6 Candidate Roster Bulk Export & Upload
- **The Issue:** Inability to bulk import batches of enrolled candidates or export student databases for administrative record-keeping.
- **The Correction:**
  - CSV Export: Includes Name, Email, Phone, Login ID, Password, Course, Track, Status, Pro Subscription, Tests Taken, Avg Score.
  - JSON Full Database Backup: Complete snapshot of all candidates, login audit logs, and payment records.
  - Bulk CSV/JSON Uploader: Drag-and-drop parser with column auto-detection, schema verification, duplicate prevention, and merge/replace options.
  - Downloadable Sample CSV Template with valid placeholder records.

### 2.7 Payment & WhatsApp Verification
- **The Issue:** Payment gateway integration was brittle and lacked verification transparency.
- **The Correction:**
  - Customizable GPay QR code scanner upload (PNG/JPG/WEBP) in Admin Hub.
  - Clear UPI ID and recipient phone display.
  - Candidate payment submission form: Screenshot upload, UTR / Transaction ID input, and registered email linking.
  - Admin approval workflow: 1-click "Approve Access & Enable Pro" button that updates candidate permissions instantly.

---

## 3. QUESTION BANK SPECIFICATION & SCHEMA

### TypeScript Schema:
```typescript
export interface Question {
  id: string;                      // Unique ID (e.g. 'gt-hum-042')
  track: 'prt' | 'gt-maths-science' | 'gt-humanities';
  category: string;                // e.g. 'History', 'Polity', 'Pedagogy'
  topic: string;                   // e.g. 'Indian Freedom Movement 1857'
  question: string;                // Question text in clear English/bilingual
  options: [string, string, string, string]; // Exactly 4 options
  correctAnswer: number;           // Index 0, 1, 2, or 3
  explanation: string;             // Detailed NCERT-grounded pedagogical rationale
  difficulty: 'easy' | 'medium' | 'hard';
  year?: number;                   // e.g. 2024, 2025
}
```

---

## 4. MASTER BLUEPRINT PROMPT FOR REBUILDING THE APP FROM SCRATCH

*Copy and paste the prompt below into an AI agent or provide it to a senior engineering team to rebuild the entire application cleanly.*

```markdown
# MASTER PROMPT: BUILD PRODUCTION-GRADE STET TEACHER EXAM PORTAL & CANDIDATE MANAGEMENT SYSTEM

You are tasked with building a production-grade, modular, and reactive web application: "StudeeZone STET Exam Hub & Admin Portal".

### 1. CORE MISSION & AUDIENCE
A comprehensive preparation and candidate administration platform for State Teacher Eligibility Tests (STET / CTET / State TET) supporting 3 major exam streams:
1. PRT (Primary Teachers: Classes 1 to 5) - Child Development, Language I & II, Mathematics, Environmental Studies.
2. GT Maths & Science (Graduated Teachers: Classes 6 to 10) - Advanced Mathematics, Physics, Chemistry, Biology, Teaching Pedagogy.
3. GT Humanities (Graduated Teachers: Classes 6 to 10) - Indian History, Indian Constitution & Polity, Geography of India, Economics, Social Science Pedagogy.

### 2. ARCHITECTURAL REQUIREMENTS (NO MONOLITHS)
- **Framework:** React 18+ with TypeScript and Vite.
- **Styling:** Modern Tailwind CSS with a clean, high-density academic dashboard aesthetic (Navy, Slate, Emerald, and Gold accents).
- **Modularity:** Strictly enforce single-responsibility micro-components:
  - `src/features/auth/` (AuthModal, LoginForm, RegisterForm, SessionContext)
  - `src/features/exam/` (MockTestRunner, QuestionCard, TimerWidget, ResultAnalytics)
  - `src/features/admin/` (AdminLayout, CandidateDirectory, LoginAudit, PaymentSettings, QuestionBankVault)
  - `src/features/data-vault/` (BulkUploader, PdfExporter, JsonBackupRestore)
  - `src/services/` (apiClient, candidateService, questionService, syncService)
- **State Management:** Zustand or React Context + useReducer with zero race conditions.
- **Backend & Persistence:** Express backend (`server.ts`) with REST API (`/api/candidates`, `/api/users`, `/api/questions`, `/api/payments`) persisting to a structured database or JSON store (`server-data.json`).
- **Real-Time Reactivity:** All client mutations must sync bidirectionally with the server and broadcast via custom events / WebSockets so all browser tabs and admin sessions remain 100% in sync without manual page refresh.

### 3. UNIFIED REGISTRATION & AUTHENTICATION (SINGLE SOURCE OF TRUTH)
There must be ZERO disconnections between registration entry points:
1. Public Candidate Self-Registration (Name, Email, Phone, Exam Track, Password).
2. Admin Candidate Creation (Admin creates student record directly from the directory).
3. Subscriber Payment Upgrade (Candidate submits transaction screenshot / UTR).
- All three flows MUST write to the exact same canonical candidate database.
- A candidate created by an admin can log in immediately.
- A candidate who registers publicly must immediately appear in the Admin Candidate Directory and Login Audit Trail.
- When an admin marks a candidate as "Paid / Approved", their dashboard unlocks full mock tests in real time.

### 4. ZERO-HALLUCINATION QUESTION BANK (1,000+ AUTHENTIC QUESTIONS)
- Embed a verified, authentic question bank across PRT, GT-Maths & Science, and GT-Humanities.
- Strictly adhere to NCERT / SCERT Indian curriculum.
- For GT Humanities, cover:
  - Indian History (Ancient, Medieval, Modern Freedom Struggle)
  - Indian Constitution & Civics (Preamble, Fundamental Rights, Parliament, Panchayati Raj)
  - Geography of India (Physiography, Climate, River Systems, Agriculture)
  - Economics (Indian Economy Sectors, Poverty, Food Security)
  - Pedagogy of Social Science (Constructivist methods, CCE, Bloom's Taxonomy)
- Every question must have 4 options, an unambiguous correct answer, and an explanation.

### 5. DATA VAULT: BULK UPLOAD & DOWNLOAD CENTER
Provide an accessible Data Vault in both the Admin Portal and Dashboard:
1. **Question Bank Operations:**
   - Download Publication-Grade PDF: Cover sheet, candidate instructions, stream separation, question-paper-only mode OR full solution manual.
   - Export Question Bank JSON/CSV.
   - Bulk Upload / Restore Question Bank JSON to recover from any server reset.
2. **Candidate Roster Operations:**
   - Download Candidate Roster CSV (Full fields: Name, Email, Phone, Login ID, Password, Track, Status, Payment, Tests, Scores).
   - Download Printable Candidate Summary PDF.
   - Bulk Upload Candidates (CSV / JSON) with auto-column mapping, validation, duplicate prevention, and conflict resolution (merge or replace).
   - Download Sample CSV Template.

### 6. GPAY & WHATSAPP PAYMENT VERIFICATION WORKFLOW
- Admin settings to upload real GPay / PhonePe / Paytm QR Scanner image, enter UPI ID, and specify WhatsApp support number.
- Public payment modal displaying the real QR code and payment instructions.
- Candidate submission form to submit transaction ID / screenshot.
- Admin verification queue to review pending payments and activate Pro access with 1 click.

### 7. QUALITY & UI STANDARDS
- High-density, professional UI without generic AI placeholders.
- Instant search and multi-criteria filters across all tables.
- Responsive mobile and desktop layouts.
- Toast notifications for every user action.
- Zero uncaught exceptions, zero dead buttons, zero broken links.
```

---

## 5. REBUILD EXECUTION GUIDE FOR AI / ENGINEERS

1. **Step 1: Directory Setup & Type Definitions**
   - Create `src/types/index.ts` with clean interfaces: `User`, `Candidate`, `Question`, `ExamTrack`, `PaymentRecord`, `LoginLog`.
2. **Step 2: Core Data Services**
   - Implement `src/services/apiClient.ts` to manage all fetch calls with retry logic.
   - Implement `src/services/candidateService.ts` to handle CRUD, CSV parsing, and export.
   - Implement `src/services/questionService.ts` to query questions by track and generate PDFs.
3. **Step 3: State Store & Sync**
   - Set up reactive state management that listens to storage events and syncs with `/api/` endpoints.
4. **Step 4: Test Runner & Verification**
   - Build `MockTestRunner` with timer, question navigation palette, review flags, and score calculation.
5. **Step 5: Admin Hub & Data Vault**
   - Assemble modular views for Candidate Management, Login Audit, Payment Settings, and the Data Vault.
6. **Step 6: End-to-End Testing**
   - Verify that adding a candidate on PC 1 immediately shows up on PC 2 upon refresh or sync.
   - Verify that all 1,000 questions export cleanly to PDF and JSON without memory leaks.

---
*End of Documentation. Keep this file stored safely as your master engineering blueprint.*
