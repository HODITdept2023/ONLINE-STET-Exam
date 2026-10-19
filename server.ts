import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();

function getPort(): number {
  // Check CLI arguments (e.g., --port 3000 passed by AI Studio dev runner)
  const portArgIndex = process.argv.indexOf("--port");
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsedArg = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsedArg)) {
      return parsedArg;
    }
  }

  // Check APP_PORT override
  if (process.env.APP_PORT) {
    const parsedAppPort = parseInt(process.env.APP_PORT, 10);
    if (!isNaN(parsedAppPort)) {
      return parsedAppPort;
    }
  }

  // Cloud Run injects PORT (e.g. 8080) for production deployments
  if (process.env.PORT) {
    const parsedPort = parseInt(process.env.PORT, 10);
    if (!isNaN(parsedPort)) {
      return parsedPort;
    }
  }

  return 3000;
}

const PORT = getPort();

app.use(express.json({ limit: "10mb" }));

// Prevent browser caching for all dynamic API endpoints
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Server-side Gemini Client helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoints for Cloud Run startup and liveness probes
app.get(["/health", "/_health"], (_req, res) => {
  res.status(200).send("OK");
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Pedagogical Fallback Engine for STET / CTET Mentorship when API quota is exhausted
function generatePedagogicalTutorFallback(
  messages: Array<{ role: string; content: string }>,
  currentTopic?: string,
  questionContext?: any
): string {
  const latestMessage = messages[messages.length - 1]?.content || "";
  const query = latestMessage.toLowerCase();

  // If question context is present
  if (questionContext && typeof questionContext === "object") {
    const qText = questionContext.question || "";
    const options = questionContext.options || [];
    const correctIdx = questionContext.correctIndex;
    const correctOptLetter = typeof correctIdx === "number" ? String.fromCharCode(65 + correctIdx) : "correct option";
    const explanation = questionContext.explanation || "";

    return (
      `Hello! I am Prof. Lama, your STET Exam Preparation Mentor.\n\n` +
      `### Question Breakdown & Analysis\n` +
      `**Question**: ${qText}\n\n` +
      `**Key Takeaway**: The correct answer is **Option ${correctOptLetter}** (${options[correctIdx] || ""}).\n\n` +
      `• **Pedagogical Rationale**: ${explanation || "This concept is fundamentally anchored in the NCTE teacher qualification guidelines and standard curriculum frameworks."}\n` +
      `• **Distractor Trap**: Exam boards design incorrect options using extreme qualifiers (such as 'solely', 'never', 'rigidly') or common developmental misconceptions.\n` +
      `• **Exam Strategy Tip**: In Assertion-Reasoning (A-R) items, verify factual truth of (A) and (R) separately before testing if (R) is the genuine reason for (A).`
    );
  }

  // Topic-specific knowledge bases
  if (
    query.includes("piaget") ||
    query.includes("sensorimotor") ||
    query.includes("preoperational") ||
    query.includes("concrete") ||
    query.includes("formal")
  ) {
    return (
      `Hello! I am Prof. Lama. Let's master **Jean Piaget's Cognitive Development Stages** for STET:\n\n` +
      `1. **Sensorimotor (0–2 yrs)**: Object permanence, deferred imitation, reflex actions.\n` +
      `2. **Pre-operational (2–7 yrs)**: Egocentrism, animism, centration, lack of conservation and reversibility.\n` +
      `3. **Concrete Operational (7–11 yrs)**: Conservation (volume, mass, number), classification, seriation, reversibility achieved.\n` +
      `4. **Formal Operational (11+ yrs)**: Abstract thought, hypothetical-deductive reasoning, propositional logic.\n\n` +
      `• **High-Yield Exam Trap**: Questions often confuse *Animism* (giving life to inanimate objects in Pre-operational) with *Conservation* (achieved only in Concrete Operational).\n` +
      `• **Mnemonic**: **S**ome **P**eople **C**an **F**ly (**S**ensorimotor, **P**reoperational, **C**oncrete, **F**ormal).`
    );
  }

  if (query.includes("vygotsky") || query.includes("zpd") || query.includes("scaffolding") || query.includes("mko")) {
    return (
      `Hello! I am Prof. Lama. Here is the core framework for **Lev Vygotsky's Socio-Cultural Theory**:\n\n` +
      `• **Zone of Proximal Development (ZPD)**: The distance between what a learner can do independently and what they can achieve with guidance.\n` +
      `• **Scaffolding (Jerome Bruner)**: Temporary structured support provided by an adult or peer until the learner attains mastery.\n` +
      `• **More Knowledgeable Other (MKO)**: Anyone with higher understanding than the learner (teacher, peer, digital tutor).\n` +
      `• **Role of Language**: Social speech (external communication) → Private speech (self-regulation, cognitive tool) → Silent inner speech.\n\n` +
      `• **Exam Tip**: Piaget viewed self-talk as immature 'egocentric speech', whereas Vygotsky viewed it as a vital cognitive tool for self-direction.`
    );
  }

  if (query.includes("kohlberg") || query.includes("moral")) {
    return (
      `Hello! I am Prof. Lama. Here is the key breakdown of **Lawrence Kohlberg's Theory of Moral Development**:\n\n` +
      `1. **Pre-Conventional Level (4–10 yrs)**:\n` +
      `   - Stage 1: Obedience & Punishment Orientation\n` +
      `   - Stage 2: Individualism & Instrumental Purpose ('Tit for Tat' / Heinz dilemma)\n` +
      `2. **Conventional Level (10–13 yrs)**:\n` +
      `   - Stage 3: 'Good Boy - Nice Girl' Orientation (interpersonal conformity)\n` +
      `   - Stage 4: Law and Order / Social System Maintenance\n` +
      `3. **Post-Conventional Level (13+ yrs)**:\n` +
      `   - Stage 5: Social Contract & Individual Rights\n` +
      `   - Stage 6: Universal Ethical Principles\n\n` +
      `• **Exam Trap**: Carol Gilligan criticized Kohlberg for gender bias (ignoring the 'Ethics of Care' vs 'Ethics of Justice').`
    );
  }

  if (query.includes("nep") || query.includes("2020") || query.includes("fln") || query.includes("curriculum")) {
    return (
      `Hello! I am Prof. Lama. Key **NEP 2020 Highlights** essential for STET:\n\n` +
      `• **New Curricular Structure**: **5 + 3 + 3 + 4** (Replacing the 10+2 system)\n` +
      `  - *Foundational (5 yrs)*: 3 yrs Anganwadi/Pre-school + Classes 1-2 (Ages 3–8)\n` +
      `  - *Preparatory (3 yrs)*: Classes 3–5 (Ages 8–11) • Focus on FLN and play-discovery\n` +
      `  - *Middle (3 yrs)*: Classes 6–8 (Ages 11–14) • Experiential learning, vocational crafts, 10 bagless days\n` +
      `  - *Secondary (4 yrs)*: Classes 9–12 (Ages 14–18) • Multidisciplinary study, critical thinking\n` +
      `• **FLN Goal (NIPUN Bharat)**: Foundational Literacy and Numeracy by Grade 3.\n` +
      `• **Medium of Instruction**: Mother tongue / local language at least until Grade 5.`
    );
  }

  // General high-yield pedagogical mentor response
  return (
    `Hello! I am Prof. Lama, your 24/7 STET Exam Preparation Expert Tutor.\n\n` +
    `Regarding your question on **"${latestMessage.trim().slice(0, 60)}"**:\n\n` +
    `1. **Core Conceptual Principle**:\n` +
    `   In teacher eligibility examinations (STET Paper I & II), focus on child-centered learning paradigms rather than rote memorization. Questions test the teacher's ability to create inclusive, differentiated learning environments.\n\n` +
    `2. **High-Yield Exam Strategy**:\n` +
    `   • **Distractor Elimination**: Reject options promoting passive reception, punitive measures, or rigid standardized labeling.\n` +
    `   • **Assertion-Reason Items**: Always check statement (A) independently first. If true, verify if statement (R) directly explains *why* (A) occurred.\n` +
    `   • **Bloom's Taxonomy**: Align questions with higher-order thinking skills (Analyzing, Evaluating, Creating) over mere recall.\n\n` +
    `3. **Memory Mnemonic / Rule**:\n` +
    `   *Active engagement + Positive reinforcement + Differentiated instruction = Top STET percentile.*`
  );
}

// Fallback generator for question explanations
function generateDeepExplanationFallback(
  question: string,
  options: string[],
  selectedOption: string,
  correctOption: string,
  explanation?: string
): string {
  const isSelectedCorrect =
    selectedOption &&
    correctOption &&
    selectedOption.trim().toUpperCase() === correctOption.trim().toUpperCase();

  return (
    `### High-Yield Question Analysis\n\n` +
    `1. **Why Option ${correctOption} is Unconditionally Correct**:\n` +
    `   ${explanation || `Option ${correctOption} precisely satisfies the theoretical and pedagogical criteria established in state teacher eligibility syllabi.`} The option aligns with modern constructivist and child-centered teaching standards.\n\n` +
    `2. **Distractor Analysis & Common Pitfall**:\n` +
    `   ${
      isSelectedCorrect
        ? `Excellent selection! Many candidates fall for competing options that use familiar terminology or partial truths that fail under strict syllabus definitions.`
        : `Selecting Option ${selectedOption || "an alternate choice"} is a common distractor trap. In exam settings, distractors are designed to look plausible by quoting real terminology in the wrong context or presenting over-generalized statements.`
    }\n\n` +
    `3. **Golden Exam Rule & Mnemonic**:\n` +
    `   **The Elimination Rule**: In multiple-choice STET questions, eliminate options containing absolutist keywords like *"only"*, *"always"*, *"never"*, or *"punish"*. Favor options emphasizing active participation, intrinsic motivation, and conceptual clarity.`
  );
}

// 24/7 Expert Chat Support & Doubt Solver API
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentTopic, questionContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        reply: generatePedagogicalTutorFallback(messages, currentTopic, questionContext),
      });
    }

    const systemInstruction = `You are "Prof. Lama", an elite 24/7 STET Exam Preparation Mentor and Senior Educator specializing in State Teacher Eligibility Tests (STET), CTET, and National Certification exams.
Your expertise covers:
1. Child Development and Pedagogy (CDP): Theories of Piaget, Vygotsky, Kohlberg, Bandura, Erikson, Thorndike, Gardner, Bloom's Taxonomy, Universal Design for Learning (UDL), and Inclusive Education.
2. National Education Policy (NEP 2020): 5+3+3+4 structure, Three-language formula, Bagless days, Experiential learning, Foundational Literacy & Numeracy.
3. Social Sciences: Indian Constitution, Fundamental Rights & Writs, Ancient/Medieval/Modern History, Physical & Regional Geography, Weather/Climate systems, Local Self-Government.
4. English Pedagogy & Language: Reading comprehension, literary devices (metaphor, apostrophe, simile), grammar rules, Krashen, Cummins (BICS vs CALP, Interdependence theory).

Always structure your responses clearly:
- Directly answer the student's question or doubt.
- Provide key concepts, mnemonics, or memory aids where helpful.
- Highlight common pitfalls and distractor traps in multiple-choice exams.
- Keep the tone encouraging, academic yet accessible, crisp, and high-yield.
${currentTopic ? `Active Topic Context: ${currentTopic}` : ""}
${questionContext ? `Current Question Under Review: ${JSON.stringify(questionContext)}` : ""}`;

    // Format chat history for Gemini
    const formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const latestMessage = messages[messages.length - 1]?.content || "";

    // Multi-tier model fallback: try gemini-3.1-flash-lite first, then gemini-3.8-flash
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let replyText: string | null = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const chat = ai.chats.create({
          model,
          history: formattedHistory.length > 0 ? formattedHistory : undefined,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const result = await chat.sendMessage({
          message: latestMessage,
        });

        if (result && result.text) {
          replyText = result.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isQuotaOrRateLimit =
          errMsg.includes("429") ||
          errMsg.includes("quota") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("rate limit");

        if (isQuotaOrRateLimit) {
          console.warn(`[Gemini API] Quota/rate limit reached for model ${model}, checking next model or fallback.`);
        } else {
          console.warn(`[Gemini API] Warning on model ${model}:`, errMsg);
        }
      }
    }

    if (replyText) {
      return res.json({ reply: replyText });
    }

    // Graceful fallback response when quota is exceeded or models are unavailable
    return res.json({
      reply: generatePedagogicalTutorFallback(messages, currentTopic, questionContext),
    });
  } catch (error: any) {
    console.warn("Handled notice in /api/chat:", error?.message || error);
    const messages = req.body?.messages || [];
    return res.json({
      reply: generatePedagogicalTutorFallback(messages, req.body?.currentTopic, req.body?.questionContext),
    });
  }
});

// Deep Question Explanation & Distractor Analysis Endpoint
app.post("/api/explain-question", async (req, res) => {
  try {
    const { question, options, selectedOption, correctOption, explanation } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        deepExplanation: generateDeepExplanationFallback(
          question,
          options,
          selectedOption,
          correctOption,
          explanation
        ),
      });
    }

    const prompt = `As an expert exam evaluator, provide a concise, high-yield analysis for this STET exam question:
Question: ${question}
Options:
${options?.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n")}

Learner selected: ${selectedOption}
Correct answer: ${correctOption}
Reference explanation: ${explanation || "Standard exam key"}

Please provide:
1. Why Option ${correctOption} is unconditionally correct.
2. Why the learner's choice (if different) was an attractive distractor / common exam trap.
3. A 1-line exam memory rule / mnemonic to remember this for similar future questions.`;

    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let explanationText: string | null = null;

    for (const model of candidateModels) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.4,
          },
        });

        if (result && result.text) {
          explanationText = result.text;
          break;
        }
      } catch (err: any) {
        console.warn(`[Gemini API explain] Notice on model ${model}:`, err?.message || err);
      }
    }

    if (explanationText) {
      return res.json({ deepExplanation: explanationText });
    }

    return res.json({
      deepExplanation: generateDeepExplanationFallback(
        question,
        options,
        selectedOption,
        correctOption,
        explanation
      ),
    });
  } catch (error: any) {
    console.warn("Handled notice in /api/explain-question:", error?.message || error);
    const { question, options, selectedOption, correctOption, explanation } = req.body || {};
    return res.json({
      deepExplanation: generateDeepExplanationFallback(
        question,
        options,
        selectedOption,
        correctOption,
        explanation
      ),
    });
  }
});

// Admin state stores (in-memory with fallbacks)
let serverLoginLogs: any[] = [
  {
    id: "log-srv-1",
    userId: "user-admin-vsfintech",
    userName: "studeezone Administrator",
    userEmail: "vsfintech@gmail.com",
    loginId: "vsfintech",
    role: "admin",
    authProvider: "password",
    timestamp: Date.now() - 8 * 60000,
    ipAddress: "157.34.122.91",
    deviceInfo: "Chrome 131 • Windows 11 Desktop",
    location: "Patna, Bihar, India",
    status: "active",
  },
  {
    id: "log-srv-2",
    userId: "user-pooja-sharma",
    userName: "Pooja Sharma",
    userEmail: "pooja.sharma@gmail.com",
    loginId: "poojasharma",
    role: "candidate",
    authProvider: "google",
    timestamp: Date.now() - 18 * 60000,
    ipAddress: "103.21.144.18",
    deviceInfo: "Safari 18 • iPhone 15 Pro",
    location: "Delhi, India",
    status: "active",
  },
  {
    id: "log-srv-3",
    userId: "user-demo-candidate",
    userName: "Aspirant Candidate",
    userEmail: "candidate@studeezone.com",
    loginId: "candidate",
    role: "candidate",
    authProvider: "password",
    timestamp: Date.now() - 50 * 60000,
    ipAddress: "122.160.180.204",
    deviceInfo: "Firefox 133 • macOS Sonoma",
    location: "Bengaluru, Karnataka, India",
    status: "active",
  },
];

// Active IP Session Map: userEmail -> { ipAddress, sessionId, lastActive, status }
const serverActiveSessions = new Map<string, { ipAddress: string; logId: string; lastActive: number; status: 'active' | 'terminated' }>();

// Admin Login Tracking APIs
app.get("/api/admin/logins", (_req, res) => {
  res.json({ logs: serverLoginLogs });
});

app.post("/api/admin/record-login", (req, res) => {
  const newLog = req.body;
  if (!newLog || !newLog.userEmail) {
    return res.status(400).json({ error: "Invalid log payload" });
  }

  const normEmail = newLog.userEmail.toLowerCase().trim();
  const incomingIp = newLog.ipAddress || (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

  // Requirement: One login at one time with one ip address only.
  // Terminate any previous active session for this user if from a different IP or session
  serverLoginLogs = serverLoginLogs.map((log) => {
    if (
      log.userEmail &&
      log.userEmail.toLowerCase().trim() === normEmail &&
      log.status === "active" &&
      (log.id !== newLog.id || log.ipAddress !== incomingIp)
    ) {
      return { ...log, status: "completed" };
    }
    return log;
  });

  serverActiveSessions.set(normEmail, {
    ipAddress: incomingIp,
    logId: newLog.id,
    lastActive: Date.now(),
    status: "active",
  });

  serverLoginLogs = [{ ...newLog, ipAddress: incomingIp, status: "active" }, ...serverLoginLogs.slice(0, 99)];
  persistServerData();
  res.json({ success: true, log: newLog });
});

// Admin Terminate Active Session
app.post("/api/admin/terminate-session", (req, res) => {
  const { logId, userEmail } = req.body;
  const normEmail = userEmail ? userEmail.toLowerCase().trim() : null;

  serverLoginLogs = serverLoginLogs.map((log) => {
    if ((logId && log.id === logId) || (normEmail && log.userEmail.toLowerCase().trim() === normEmail)) {
      return { ...log, status: "completed" };
    }
    return log;
  });

  if (normEmail && serverActiveSessions.has(normEmail)) {
    const sess = serverActiveSessions.get(normEmail)!;
    sess.status = "terminated";
    serverActiveSessions.set(normEmail, sess);
  }

  persistServerData();
  res.json({ success: true, message: "Active session terminated successfully" });
});

// Admin Terminate All Active Sessions
app.post("/api/admin/terminate-all-sessions", (_req, res) => {
  serverLoginLogs = serverLoginLogs.map((log) => {
    if (log.status === "active" && log.userEmail !== "vsfintech@gmail.com" && log.userEmail !== "studeezoneapp@gmail.com") {
      return { ...log, status: "completed" };
    }
    return log;
  });

  for (const [email, sess] of serverActiveSessions.entries()) {
    if (email !== "vsfintech@gmail.com" && email !== "studeezoneapp@gmail.com") {
      sess.status = "terminated";
      serverActiveSessions.set(email, sess);
    }
  }

  persistServerData();
  res.json({ success: true, message: "All candidate active sessions terminated" });
});

// Check Session Status (Used by clients to detect termination from Admin Hub & enforce 1-IP rule)
app.get("/api/auth/check-session", (req, res) => {
  const email = (req.query.email as string)?.toLowerCase().trim();
  const logId = req.query.logId as string;
  const incomingIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";

  if (!email) {
    return res.json({ active: true });
  }

  // Super administrators are exempt
  if (email === "vsfintech@gmail.com" || email === "studeezoneapp@gmail.com") {
    return res.json({ active: true });
  }

  // Check in active sessions
  const sess = serverActiveSessions.get(email);
  if (sess) {
    if (sess.status === "terminated") {
      return res.json({ active: false, reason: "Your active session was terminated by the administrator." });
    }
    if (logId && sess.logId && sess.logId !== logId) {
      return res.json({ active: false, reason: "Your account was logged in from another device/browser. Only one active login at a time is permitted." });
    }
    if (sess.ipAddress && incomingIp !== sess.ipAddress) {
      return res.json({ active: false, reason: "Your account is active on another IP address. Only one IP login is permitted." });
    }
  }

  // Check in login logs
  const activeLog = serverLoginLogs.find((l) => l.userEmail.toLowerCase().trim() === email && l.status === "active");
  if (!activeLog && serverLoginLogs.some((l) => l.userEmail.toLowerCase().trim() === email)) {
    return res.json({ active: false, reason: "Your active session has ended or was terminated by administrator." });
  }

  res.json({ active: true });
});

app.delete("/api/admin/logins", (_req, res) => {
  serverLoginLogs = [];
  persistServerData();
  res.json({ success: true, message: "Logs cleared" });
});

// =========================================================================
// Shared Server Store for Clients and Registered Users (With File Persistence)
// =========================================================================
const SERVER_DATA_FILE = path.join(process.cwd(), "server-data.json");

function isServerDummy(item: any): boolean {
  if (!item) return false;
  const str = (typeof item === 'string' ? item : `${item.name || ''} ${item.email || ''} ${item.loginId || ''} ${item.userName || ''} ${item.userEmail || ''}`).toLowerCase();
  return (
    str.includes('rohan kumar') ||
    str.includes('rohan.k') ||
    str.includes('rohankumar') ||
    str.includes('sunita verma') ||
    str.includes('sunita.v') ||
    str.includes('sunita_v') ||
    str.includes('priya nair') ||
    str.includes('priya.nair') ||
    str.includes('priya_nair')
  );
}

let serverDeletedEmails: string[] = [];

function isServerDeleted(emailOrId?: string): boolean {
  if (!emailOrId) return false;
  const clean = String(emailOrId).toLowerCase().trim();
  if (!clean || clean === 'candidate learner') return false;
  const unPrefixed = clean.replace(/^(client-|user-)+/, '');
  if (serverDeletedEmails.includes(clean)) return true;
  if (unPrefixed && serverDeletedEmails.includes(unPrefixed)) return true;
  if (serverDeletedEmails.some((item) => {
    const it = String(item || '').toLowerCase().trim();
    const itUn = it.replace(/^(client-|user-)+/, '');
    return it === clean || (unPrefixed && itUn === unPrefixed);
  })) {
    return true;
  }
  return false;
}

function resolveServerTrack(c: any): string[] {
  if (!c) return ['prt'];
  if (Array.isArray(c.paidStreams) && c.paidStreams.length > 0) {
    return c.paidStreams;
  }
  const nameAndEmail = `${c.name || ''} ${c.email || ''} ${c.loginId || ''}`.toLowerCase();
  if (
    nameAndEmail.includes('asha') ||
    nameAndEmail.includes('prasad') ||
    nameAndEmail.includes('shanti') ||
    nameAndEmail.includes('subba')
  ) {
    return ['gt-maths-science'];
  }
  if (c.selectedStream === 'graduate-science' || c.targetExam?.toLowerCase().includes('math') || c.targetExam?.toLowerCase().includes('science')) {
    return ['gt-maths-science'];
  }
  if (c.selectedStream === 'graduate-social' || c.targetExam?.toLowerCase().includes('humanities') || c.targetExam?.toLowerCase().includes('social')) {
    return ['gt-humanities'];
  }
  return ['prt'];
}

let serverClients: any[] = [
  {
    id: "client-asha-prasad",
    name: "Asha Prasad",
    email: "ashaprasad@gmail.com",
    loginId: "ashaprasad",
    password: "+91 98321 55678",
    phone: "+91 98321 55678",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    role: "candidate",
    status: "active",
    isPaid: true,
    paidStreams: ["gt-maths-science"],
    selectedStream: "graduate-science",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 4 * 86400000,
    lastLoginAt: Date.now() - 10 * 60000,
    testsCompleted: 18,
    avgScore: 88,
    notes: "Subscribed to GT-Maths & Science (Paper II) • Pro Paid Active",
  },
  {
    id: "client-shanti-subba",
    name: "Shanti Subba",
    email: "shantisubba@gmail.com",
    loginId: "shantisubba",
    password: "+91 97332 66789",
    phone: "+91 97332 66789",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    role: "candidate",
    status: "active",
    isPaid: true,
    paidStreams: ["gt-maths-science"],
    selectedStream: "graduate-science",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 3 * 86400000,
    lastLoginAt: Date.now() - 20 * 60000,
    testsCompleted: 15,
    avgScore: 86,
    notes: "Subscribed to GT-Maths & Science (Paper II) • Pro Paid Active",
  },
  {
    id: "client-1",
    name: "studeezone Administrator",
    email: "vsfintech@gmail.com",
    loginId: "vsfintech@gmail.com",
    password: "+91 98765 43210",
    targetExam: "Sikkim Graduate Teacher (GT Humanities - Paper II)",
    role: "admin",
    status: "active",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 30 * 86400000,
    lastLoginAt: Date.now() - 10 * 60000,
    testsCompleted: 48,
    avgScore: 96,
    notes: "Primary Master Administrator Account.",
    phone: "+91 98765 43210",
    isPaid: true,
    paidStreams: ["gt-humanities"],
  },
  {
    id: "client-1-app",
    name: "studeezone Administrator",
    email: "studeezoneapp@gmail.com",
    loginId: "studeezoneapp@gmail.com",
    password: "9876543210",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    role: "admin",
    status: "active",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 25 * 86400000,
    lastLoginAt: Date.now() - 5 * 60000,
    testsCompleted: 50,
    avgScore: 98,
    notes: "Secondary Master Administrator Account.",
    phone: "9876543210",
    isPaid: true,
    paidStreams: ["prt", "gt-maths-science", "gt-humanities"],
  },
  {
    id: "client-2",
    name: "Pooja Sharma",
    email: "pooja.sharma@gmail.com",
    loginId: "poojasharma",
    password: "+91 98112 34567",
    phone: "+91 98112 34567",
    targetExam: "Sikkim Graduate Teacher (GT Humanities - Paper II)",
    role: "candidate",
    status: "trial",
    trialDaysRemaining: 5,
    registeredAt: Date.now() - 2 * 86400000,
    lastLoginAt: Date.now() - 15 * 60000,
    testsCompleted: 8,
    avgScore: 82,
    notes: "Enrolled in 7-Day Free Trial. High activity in CDP practice.",
    isPaid: false,
    paidStreams: ["gt-humanities"],
    selectedStream: "graduate-social",
    selectedExamTrack: "gt-humanities",
  },
  {
    id: "client-5",
    name: "Amit Patel",
    email: "amit.stet@gmail.com",
    loginId: "amitpatel",
    password: "+91 95456 78901",
    phone: "+91 95456 78901",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    role: "candidate",
    status: "expired",
    trialDaysRemaining: 0,
    registeredAt: Date.now() - 12 * 86400000,
    lastLoginAt: Date.now() - 48 * 3600000,
    testsCompleted: 6,
    avgScore: 68,
    notes: "7-day trial ended 5 days ago. Follow-up for trial extension or discount.",
    isPaid: false,
    paidStreams: ["gt-maths-science"],
    selectedStream: "graduate-science",
    selectedExamTrack: "gt-maths-science",
  },
  {
    id: "client-7",
    name: "Aspirant Candidate",
    email: "candidate@studeezone.com",
    loginId: "candidate",
    password: "+91 93678 90123",
    phone: "+91 93678 90123",
    targetExam: "Sikkim Primary Teacher (PRT - Paper I)",
    role: "candidate",
    status: "trial",
    trialDaysRemaining: 6,
    registeredAt: Date.now() - 1 * 86400000,
    lastLoginAt: Date.now() - 45 * 60000,
    testsCompleted: 12,
    avgScore: 78,
    notes: "Default student practice persona.",
    isPaid: false,
    paidStreams: ["prt"],
    selectedStream: "primary",
    selectedExamTrack: "prt",
  },
  {
    id: "client-sonam-lepcha",
    name: "Sonam Tshering Lepcha",
    email: "sonam.lepcha@gmail.com",
    loginId: "sonamlepcha",
    password: "+91 98320 44512",
    phone: "+91 98320 44512",
    targetExam: "Sikkim Primary Teacher (PRT - Paper I)",
    selectedExamTrack: "prt",
    role: "candidate",
    status: "active",
    isPaid: true,
    paidStreams: ["prt"],
    selectedStream: "primary",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 3 * 86400000,
    lastLoginAt: Date.now() - 25 * 60000,
    testsCompleted: 22,
    avgScore: 85,
    notes: "Subscribed to Primary Teacher (PRT - Paper I) • Pro Paid Active",
  },
  {
    id: "client-diki-bhutia",
    name: "Diki Bhutia",
    email: "diki.bhutia99@gmail.com",
    loginId: "dikibhutia",
    password: "+91 97330 18293",
    phone: "+91 97330 18293",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    selectedExamTrack: "gt-maths-science",
    role: "candidate",
    status: "active",
    isPaid: true,
    paidStreams: ["gt-maths-science"],
    selectedStream: "graduate-science",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 2 * 86400000,
    lastLoginAt: Date.now() - 75 * 60000,
    testsCompleted: 19,
    avgScore: 89,
    notes: "Subscribed to GT-Maths & Science (Paper II) • Pro Paid Active",
  },
  {
    id: "client-karma-bhutia",
    name: "Karma Bhutia",
    email: "karma.bhutia@gmail.com",
    loginId: "karmabhutia",
    password: "+91 98320 12345",
    phone: "+91 98320 12345",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    selectedExamTrack: "gt-maths-science",
    role: "candidate",
    status: "active",
    isPaid: true,
    paidStreams: ["gt-maths-science"],
    selectedStream: "graduate-science",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 5 * 86400000,
    lastLoginAt: Date.now() - 2 * 3600000,
    testsCompleted: 26,
    avgScore: 91,
    notes: "Subscribed to GT-Maths & Science (Paper II) • Pro Paid Active",
  },
  {
    id: "client-pema-dolma",
    name: "Pema Dolma",
    email: "pema.dolma@gmail.com",
    loginId: "pemadolma",
    password: "+91 98322 34567",
    phone: "+91 98322 34567",
    targetExam: "Sikkim Primary Teacher (PRT - Paper I)",
    selectedExamTrack: "prt",
    role: "candidate",
    status: "trial",
    trialDaysRemaining: 7,
    registeredAt: Date.now() - 1 * 86400000,
    lastLoginAt: Date.now() - 3 * 3600000,
    testsCompleted: 7,
    avgScore: 76,
    notes: "7-Day Free Trial Aspirant • Active in CDP practice",
  },
  {
    id: "client-tenzing-norbu",
    name: "Tenzing Norbu",
    email: "tenzing.norbu@gmail.com",
    loginId: "tenzingnorbu",
    password: "+91 98324 56789",
    phone: "+91 98324 56789",
    targetExam: "Sikkim Primary Teacher (PRT - Paper I)",
    selectedExamTrack: "prt",
    role: "candidate",
    status: "active",
    isPaid: true,
    paidStreams: ["prt"],
    selectedStream: "primary",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 6 * 86400000,
    lastLoginAt: Date.now() - 4 * 3600000,
    testsCompleted: 31,
    avgScore: 87,
    notes: "Subscribed to Primary Teacher (PRT - Paper I) • Pro Paid Active",
  },
  {
    id: "client-tshering-yangzom",
    name: "Tshering Yangzom",
    email: "tshering.yangzom@gmail.com",
    loginId: "tsheringyangzom",
    password: "+91 98325 67890",
    phone: "+91 98325 67890",
    targetExam: "Sikkim Graduate Teacher (GT Humanities - Paper II)",
    selectedExamTrack: "gt-humanities",
    role: "candidate",
    status: "active",
    isPaid: true,
    paidStreams: ["gt-humanities"],
    selectedStream: "graduate-social",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 4 * 86400000,
    lastLoginAt: Date.now() - 1 * 3600000,
    testsCompleted: 24,
    avgScore: 90,
    notes: "Subscribed to GT Humanities (Paper II) • Pro Paid Active",
  },
  {
    id: "client-pemba-sharma",
    name: "Pemba Tshering Sharma",
    email: "pemba.sharma.history@sikkim.ac.in",
    loginId: "pembasharma",
    password: "+91 94340 78901",
    phone: "+91 94340 78901",
    targetExam: "Sikkim Graduate Teacher (GT Humanities - Paper II)",
    selectedExamTrack: "gt-humanities",
    role: "candidate",
    status: "active",
    isPaid: true,
    paidStreams: ["gt-humanities"],
    selectedStream: "graduate-social",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 5 * 86400000,
    lastLoginAt: Date.now() - 20 * 60000,
    testsCompleted: 35,
    avgScore: 95,
    notes: "Distinguished Council Fellow & Author • Pro Paid Active",
  },
  {
    id: "client-passang-doma",
    name: "Passang Doma",
    email: "passang.doma@gmail.com",
    loginId: "passangdoma",
    password: "+91 98326 78901",
    phone: "+91 98326 78901",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    selectedExamTrack: "gt-maths-science",
    role: "candidate",
    status: "trial",
    trialDaysRemaining: 6,
    registeredAt: Date.now() - 1 * 86400000,
    lastLoginAt: Date.now() - 5 * 3600000,
    testsCompleted: 9,
    avgScore: 79,
    notes: "Enrolled in 7-Day Free Trial • Practicing Mathematics & Pedagogy",
  },
  {
    id: "client-mingma-sherpa",
    name: "Mingma Sherpa",
    email: "mingma.sherpa@gmail.com",
    loginId: "mingmasherpa",
    password: "+91 98327 89012",
    phone: "+91 98327 89012",
    targetExam: "Sikkim Primary Teacher (PRT - Paper I)",
    selectedExamTrack: "prt",
    role: "candidate",
    status: "active",
    isPaid: true,
    paidStreams: ["prt"],
    selectedStream: "primary",
    trialDaysRemaining: 365,
    registeredAt: Date.now() - 3 * 86400000,
    lastLoginAt: Date.now() - 8 * 3600000,
    testsCompleted: 17,
    avgScore: 83,
    notes: "Subscribed to Primary Teacher (PRT - Paper I) • Pro Paid Active",
  },
];

let serverUsers: any[] = [
  {
    id: "user-asha-prasad",
    name: "Asha Prasad",
    email: "ashaprasad@gmail.com",
    loginId: "ashaprasad",
    phone: "+91 98321 55678",
    password: "+91 98321 55678",
    authProvider: "password",
    role: "candidate",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    createdAt: Date.now() - 4 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["gt-maths-science"],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 10 * 60000,
    testsCompleted: 18,
    avgScore: 88,
  },
  {
    id: "user-shanti-subba",
    name: "Shanti Subba",
    email: "shantisubba@gmail.com",
    loginId: "shantisubba",
    phone: "+91 97332 66789",
    password: "+91 97332 66789",
    authProvider: "password",
    role: "candidate",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    createdAt: Date.now() - 3 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["gt-maths-science"],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 20 * 60000,
    testsCompleted: 15,
    avgScore: 86,
  },
  {
    id: "user-admin-1",
    name: "studeezone Administrator",
    email: "vsfintech@gmail.com",
    loginId: "vsfintech@gmail.com",
    phone: "+91 98765 43210",
    password: "+91 98765 43210",
    authProvider: "password",
    role: "admin",
    targetExam: "Sikkim Graduate Teacher (GT Humanities - Paper II)",
    createdAt: Date.now() - 30 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["gt-humanities"],
  },
  {
    id: "user-admin-2",
    name: "studeezone Administrator",
    email: "studeezoneapp@gmail.com",
    loginId: "studeezoneapp@gmail.com",
    phone: "9876543210",
    password: "9876543210",
    authProvider: "password",
    role: "admin",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    createdAt: Date.now() - 25 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["prt", "gt-maths-science", "gt-humanities"],
  },
  {
    id: "user-pooja-sharma",
    name: "Pooja Sharma",
    email: "pooja.sharma@gmail.com",
    loginId: "poojasharma",
    phone: "+91 98112 34567",
    password: "+91 98112 34567",
    authProvider: "password",
    role: "candidate",
    targetExam: "Sikkim Graduate Teacher (GT Humanities - Paper II)",
    createdAt: Date.now() - 2 * 86400000,
    status: "trial",
    isPaid: false,
    paidStreams: ["gt-humanities"],
    trialExpiresAt: Date.now() + 5 * 86400000,
    lastLoginAt: Date.now() - 15 * 60000,
    testsCompleted: 8,
    avgScore: 82,
  },
  {
    id: "user-demo-candidate",
    name: "Aspirant Candidate",
    email: "candidate@studeezone.com",
    loginId: "candidate",
    password: "+91 93678 90123",
    phone: "+91 93678 90123",
    role: "candidate",
    authProvider: "password",
    targetExam: "Sikkim Primary Teacher (PRT - Paper I)",
    createdAt: Date.now() - 1 * 86400000,
    status: "trial",
    trialExpiresAt: Date.now() + 6 * 86400000,
    lastLoginAt: Date.now() - 45 * 60000,
    testsCompleted: 12,
    avgScore: 78,
  },
  {
    id: "user-sonam-lepcha",
    name: "Sonam Tshering Lepcha",
    email: "sonam.lepcha@gmail.com",
    loginId: "sonamlepcha",
    password: "+91 98320 44512",
    phone: "+91 98320 44512",
    role: "candidate",
    authProvider: "password",
    targetExam: "Sikkim Primary Teacher (PRT - Paper I)",
    selectedExamTrack: "prt",
    createdAt: Date.now() - 3 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["prt"],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 25 * 60000,
    testsCompleted: 22,
    avgScore: 85,
  },
  {
    id: "user-diki-bhutia",
    name: "Diki Bhutia",
    email: "diki.bhutia99@gmail.com",
    loginId: "dikibhutia",
    password: "+91 97330 18293",
    phone: "+91 97330 18293",
    role: "candidate",
    authProvider: "password",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    selectedExamTrack: "gt-maths-science",
    createdAt: Date.now() - 2 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["gt-maths-science"],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 75 * 60000,
    testsCompleted: 19,
    avgScore: 89,
  },
  {
    id: "user-karma-bhutia",
    name: "Karma Bhutia",
    email: "karma.bhutia@gmail.com",
    loginId: "karmabhutia",
    password: "+91 98320 12345",
    phone: "+91 98320 12345",
    role: "candidate",
    authProvider: "password",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    selectedExamTrack: "gt-maths-science",
    createdAt: Date.now() - 5 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["gt-maths-science"],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 2 * 3600000,
    testsCompleted: 26,
    avgScore: 91,
  },
  {
    id: "user-pema-dolma",
    name: "Pema Dolma",
    email: "pema.dolma@gmail.com",
    loginId: "pemadolma",
    password: "+91 98322 34567",
    phone: "+91 98322 34567",
    role: "candidate",
    authProvider: "password",
    targetExam: "Sikkim Primary Teacher (PRT - Paper I)",
    selectedExamTrack: "prt",
    createdAt: Date.now() - 1 * 86400000,
    status: "trial",
    isPaid: false,
    trialExpiresAt: Date.now() + 7 * 86400000,
    lastLoginAt: Date.now() - 3 * 3600000,
    testsCompleted: 7,
    avgScore: 76,
  },
  {
    id: "user-tenzing-norbu",
    name: "Tenzing Norbu",
    email: "tenzing.norbu@gmail.com",
    loginId: "tenzingnorbu",
    password: "+91 98324 56789",
    phone: "+91 98324 56789",
    role: "candidate",
    authProvider: "password",
    targetExam: "Sikkim Primary Teacher (PRT - Paper I)",
    selectedExamTrack: "prt",
    createdAt: Date.now() - 6 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["prt"],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 4 * 3600000,
    testsCompleted: 31,
    avgScore: 87,
  },
  {
    id: "user-tshering-yangzom",
    name: "Tshering Yangzom",
    email: "tshering.yangzom@gmail.com",
    loginId: "tsheringyangzom",
    password: "+91 98325 67890",
    phone: "+91 98325 67890",
    role: "candidate",
    authProvider: "password",
    targetExam: "Sikkim Graduate Teacher (GT Humanities - Paper II)",
    selectedExamTrack: "gt-humanities",
    createdAt: Date.now() - 4 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["gt-humanities"],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 1 * 3600000,
    testsCompleted: 24,
    avgScore: 90,
  },
  {
    id: "user-pemba-sharma",
    name: "Pemba Tshering Sharma",
    email: "pemba.sharma.history@sikkim.ac.in",
    loginId: "pembasharma",
    password: "+91 94340 78901",
    phone: "+91 94340 78901",
    role: "candidate",
    authProvider: "password",
    targetExam: "Sikkim Graduate Teacher (GT Humanities - Paper II)",
    selectedExamTrack: "gt-humanities",
    createdAt: Date.now() - 5 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["gt-humanities"],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 20 * 60000,
    testsCompleted: 35,
    avgScore: 95,
  },
  {
    id: "user-passang-doma",
    name: "Passang Doma",
    email: "passang.doma@gmail.com",
    loginId: "passangdoma",
    password: "+91 98326 78901",
    phone: "+91 98326 78901",
    role: "candidate",
    authProvider: "password",
    targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
    selectedExamTrack: "gt-maths-science",
    createdAt: Date.now() - 1 * 86400000,
    status: "trial",
    isPaid: false,
    trialExpiresAt: Date.now() + 6 * 86400000,
    lastLoginAt: Date.now() - 5 * 3600000,
    testsCompleted: 9,
    avgScore: 79,
  },
  {
    id: "user-mingma-sherpa",
    name: "Mingma Sherpa",
    email: "mingma.sherpa@gmail.com",
    loginId: "mingmasherpa",
    password: "+91 98327 89012",
    phone: "+91 98327 89012",
    role: "candidate",
    authProvider: "password",
    targetExam: "Sikkim Primary Teacher (PRT - Paper I)",
    selectedExamTrack: "prt",
    createdAt: Date.now() - 3 * 86400000,
    status: "active",
    isPaid: true,
    paidStreams: ["prt"],
    trialExpiresAt: Date.now() + 365 * 86400000,
    lastLoginAt: Date.now() - 8 * 3600000,
    testsCompleted: 17,
    avgScore: 83,
  },
];

function loadServerData() {
  try {
    if (fs.existsSync(SERVER_DATA_FILE)) {
      const raw = fs.readFileSync(SERVER_DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.deletedEmails)) {
        serverDeletedEmails = parsed.deletedEmails.map((e: any) => String(e).toLowerCase().trim());
      }
      if (Array.isArray(parsed.clients) && parsed.clients.length > 0) {
        parsed.clients.forEach((c: any) => {
          if (
            !isServerDummy(c) &&
            !isServerDeleted(c.email) &&
            !isServerDeleted(c.id) &&
            !isServerDeleted(c.loginId) &&
            !isServerDeleted(c.name)
          ) {
            const scIdx = serverClients.findIndex((sc) => sc.email.toLowerCase() === c.email.toLowerCase() || sc.id === c.id);
            if (scIdx !== -1) {
              serverClients[scIdx] = { ...serverClients[scIdx], ...c };
            } else {
              serverClients.push(c);
            }
          }
        });
      }
      if (Array.isArray(parsed.users) && parsed.users.length > 0) {
        parsed.users.forEach((u: any) => {
          if (
            !isServerDummy(u) &&
            !isServerDeleted(u.email) &&
            !isServerDeleted(u.id) &&
            !isServerDeleted(u.loginId) &&
            !isServerDeleted(u.name)
          ) {
            const suIdx = serverUsers.findIndex((su) => su.email.toLowerCase() === u.email.toLowerCase() || su.id === u.id);
            if (suIdx !== -1) {
              serverUsers[suIdx] = { ...serverUsers[suIdx], ...u };
            } else {
              serverUsers.push(u);
            }
          }
        });
      }
      if (Array.isArray(parsed.logs) && parsed.logs.length > 0) {
        parsed.logs.forEach((l: any) => {
          if (!isServerDummy(l) && !isServerDeleted(l.userEmail) && !serverLoginLogs.some((sl) => sl.id === l.id)) {
            serverLoginLogs.push(l);
          }
        });
      }
    }
  } catch (e) {
    console.error("Failed to load persistent server data", e);
  }

  // Filter initial hardcoded lists against deleted records
  serverClients = serverClients.filter(
    (c) =>
      !isServerDummy(c) &&
      !isServerDeleted(c.email) &&
      !isServerDeleted(c.id) &&
      !isServerDeleted(c.loginId) &&
      !isServerDeleted(c.name)
  );
  serverUsers = serverUsers.filter(
    (u) =>
      !isServerDummy(u) &&
      !isServerDeleted(u.email) &&
      !isServerDeleted(u.id) &&
      !isServerDeleted(u.loginId) &&
      !isServerDeleted(u.name)
  );
  serverLoginLogs = serverLoginLogs.filter((l) => !isServerDummy(l) && !isServerDeleted(l.userEmail));

  // Ensure Asha Prasad and Shanti Subba have their GT-Maths & Science course allocated properly if present (and not deleted)
  [serverClients, serverUsers].forEach((list) => {
    list.forEach((item: any) => {
      if (
        isServerDeleted(item.email) ||
        isServerDeleted(item.id) ||
        isServerDeleted(item.loginId) ||
        isServerDeleted(item.name)
      ) {
        return;
      }
      const name = (item.name || "").toLowerCase();
      const email = (item.email || "").toLowerCase();
      if (
        name.includes("asha") ||
        name.includes("prasad") ||
        name.includes("shanti") ||
        name.includes("subba") ||
        email.includes("ashaprasad") ||
        email.includes("shantisubba")
      ) {
        item.targetExam = "Sikkim Graduate Teacher (GT Maths & Science - Paper II)";
        item.paidStreams = ["gt-maths-science"];
        item.selectedStream = "graduate-science";
        item.selectedExamTrack = "gt-maths-science";
        item.isPaid = true;
        item.status = "active";
        item.trialDaysRemaining = 365;
      }
    });
  });

  // Ensure studeezoneapp@gmail.com admin credentials are set to requested password
  let appClient = serverClients.find((c) => c.email.toLowerCase() === "studeezoneapp@gmail.com" || c.loginId?.toLowerCase() === "studeezoneapp");
  if (appClient) {
    appClient.password = "9876543210";
    appClient.phone = "9876543210";
    appClient.role = "admin";
    appClient.isPaid = true;
    appClient.status = "active";
    appClient.paidStreams = ["prt", "gt-maths-science", "gt-humanities"];
  } else {
    appClient = {
      id: "client-1-app",
      name: "studeezone Administrator",
      email: "studeezoneapp@gmail.com",
      loginId: "studeezoneapp@gmail.com",
      password: "9876543210",
      targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
      role: "admin",
      status: "active",
      trialDaysRemaining: 365,
      registeredAt: Date.now() - 25 * 86400000,
      lastLoginAt: Date.now() - 5 * 60000,
      testsCompleted: 50,
      avgScore: 98,
      notes: "Secondary Master Administrator Account.",
      phone: "9876543210",
      isPaid: true,
      paidStreams: ["prt", "gt-maths-science", "gt-humanities"],
    };
    serverClients.unshift(appClient);
  }

  let appUser = serverUsers.find((u) => u.email.toLowerCase() === "studeezoneapp@gmail.com" || u.loginId?.toLowerCase() === "studeezoneapp");
  if (appUser) {
    appUser.password = "9876543210";
    appUser.phone = "9876543210";
    appUser.role = "admin";
    appUser.isPaid = true;
    appUser.status = "active";
    appUser.paidStreams = ["prt", "gt-maths-science", "gt-humanities"];
  } else {
    appUser = {
      id: "user-admin-2",
      name: "studeezone Administrator",
      email: "studeezoneapp@gmail.com",
      loginId: "studeezoneapp@gmail.com",
      phone: "9876543210",
      password: "9876543210",
      authProvider: "password",
      role: "admin",
      targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
      createdAt: Date.now() - 25 * 86400000,
      status: "active",
      isPaid: true,
      paidStreams: ["prt", "gt-maths-science", "gt-humanities"],
    };
    serverUsers.unshift(appUser);
  }
}

function persistServerData() {
  try {
    const payload = {
      clients: serverClients.filter(
        (c) =>
          !isServerDummy(c) &&
          !isServerDeleted(c.email) &&
          !isServerDeleted(c.id) &&
          !isServerDeleted(c.loginId) &&
          !isServerDeleted(c.name)
      ),
      users: serverUsers.filter(
        (u) =>
          !isServerDummy(u) &&
          !isServerDeleted(u.email) &&
          !isServerDeleted(u.id) &&
          !isServerDeleted(u.loginId) &&
          !isServerDeleted(u.name)
      ),
      logs: serverLoginLogs.filter((l) => !isServerDummy(l) && !isServerDeleted(l.userEmail)),
      deletedEmails: Array.from(new Set(serverDeletedEmails)),
    };
    fs.writeFileSync(SERVER_DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist server data", e);
  }
}

// Initial load from disk
loadServerData();
persistServerData();

// Helper to check password/phone match
function verifyPasswordMatch(expectedPass?: string, expectedPhone?: string, attempt?: string): boolean {
  if (!attempt) return false;
  const cleanAttempt = attempt.trim();
  if (expectedPass && expectedPass.trim() === cleanAttempt) return true;
  if (expectedPhone && expectedPhone.trim() === cleanAttempt) return true;
  const digitsAttempt = cleanAttempt.replace(/\D/g, "");
  if (digitsAttempt.length >= 7) {
    if (expectedPass) {
      const digitsPass = expectedPass.replace(/\D/g, "");
      if (digitsPass.length >= 7 && (digitsPass === digitsAttempt || digitsPass.endsWith(digitsAttempt) || digitsAttempt.endsWith(digitsPass))) {
        return true;
      }
    }
    if (expectedPhone) {
      const digitsPhone = expectedPhone.replace(/\D/g, "");
      if (digitsPhone.length >= 7 && (digitsPhone === digitsAttempt || digitsPhone.endsWith(digitsAttempt) || digitsAttempt.endsWith(digitsPhone))) {
        return true;
      }
    }
  }
  return false;
}

// Clients Endpoints
app.get("/api/clients", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const filtered = serverClients.filter(
    (c) =>
      !isServerDummy(c) &&
      !isServerDeleted(c.email) &&
      !isServerDeleted(c.id) &&
      !isServerDeleted(c.loginId) &&
      !isServerDeleted(c.name)
  );
  res.json({ success: true, clients: filtered });
});

app.get("/api/deleted-emails", (_req, res) => {
  res.json({ success: true, deletedEmails: serverDeletedEmails });
});

app.post("/api/deleted-emails", (req, res) => {
  const { email, loginId, id, name, phone, deletedEmails } = req.body;
  if (Array.isArray(deletedEmails)) {
    deletedEmails.forEach((e: string) => {
      const clean = String(e).toLowerCase().trim();
      if (clean && !serverDeletedEmails.includes(clean)) serverDeletedEmails.push(clean);
    });
  }
  [email, loginId, id, name, phone].forEach((val) => {
    if (val) {
      const clean = String(val).toLowerCase().trim();
      const unPrefixed = clean.replace(/^(client-|user-)+/, '');
      if (clean && !serverDeletedEmails.includes(clean)) serverDeletedEmails.push(clean);
      if (unPrefixed && !serverDeletedEmails.includes(unPrefixed)) serverDeletedEmails.push(unPrefixed);
    }
  });

  serverClients = serverClients.filter(
    (c) =>
      !isServerDeleted(c.email) &&
      !isServerDeleted(c.id) &&
      !isServerDeleted(c.loginId) &&
      !isServerDeleted(c.name)
  );
  serverUsers = serverUsers.filter(
    (u) =>
      !isServerDeleted(u.email) &&
      !isServerDeleted(u.id) &&
      !isServerDeleted(u.loginId) &&
      !isServerDeleted(u.name)
  );
  serverLoginLogs = serverLoginLogs.filter((l) => !isServerDeleted(l.userEmail));
  persistServerData();
  res.json({ success: true, deletedEmails: serverDeletedEmails });
});

// =========================================================================
// Total User Database Backup & Bulk Import Endpoints
// =========================================================================
app.get("/api/admin/database/backup", (_req, res) => {
  res.json({
    app: "studeezone.com",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    totalClients: serverClients.length,
    totalUsers: serverUsers.length,
    totalLogs: serverLoginLogs.length,
    clients: serverClients,
    users: serverUsers,
    logs: serverLoginLogs,
    deletedEmails: serverDeletedEmails,
  });
});

app.post("/api/admin/database/import", (req, res) => {
  try {
    const { clients, users, logs, mode } = req.body;
    const isReplace = mode === "replace";

    if (isReplace) {
      // Keep master admin accounts safe from wipe
      const adminClients = serverClients.filter((c) => {
        const e = (c.email || "").toLowerCase();
        return e === "vsfintech@gmail.com" || e === "studeezoneapp@gmail.com" || c.role === "admin";
      });
      const adminUsers = serverUsers.filter((u) => {
        const e = (u.email || "").toLowerCase();
        return e === "vsfintech@gmail.com" || e === "studeezoneapp@gmail.com" || u.role === "admin";
      });

      serverClients = [...adminClients];
      serverUsers = [...adminUsers];
      if (Array.isArray(logs)) {
        serverLoginLogs = [...logs];
      }
    } else if (Array.isArray(logs)) {
      serverLoginLogs = [...logs, ...serverLoginLogs];
    }

    if (Array.isArray(clients)) {
      clients.forEach((c: any) => {
        if (!c || (!c.email && !c.name)) return;
        const normEmail = (c.email || "").toLowerCase().trim();
        const normLogin = (c.loginId || normEmail).toLowerCase().trim();
        if (isServerDeleted(normEmail) || isServerDeleted(c.id) || isServerDeleted(normLogin)) return;

        const existingIdx = serverClients.findIndex(
          (sc) => (normEmail && sc.email.toLowerCase().trim() === normEmail) || (normLogin && sc.loginId && sc.loginId.toLowerCase().trim() === normLogin)
        );

        if (existingIdx !== -1) {
          serverClients[existingIdx] = {
            ...serverClients[existingIdx],
            ...c,
            email: normEmail || serverClients[existingIdx].email,
            loginId: normLogin || serverClients[existingIdx].loginId,
          };
        } else {
          serverClients.push({
            ...c,
            id: c.id || `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            email: normEmail,
            loginId: normLogin || normEmail,
          });
        }
      });
    }

    if (Array.isArray(users)) {
      users.forEach((u: any) => {
        if (!u || (!u.email && !u.name)) return;
        const normEmail = (u.email || "").toLowerCase().trim();
        if (isServerDeleted(normEmail) || isServerDeleted(u.id)) return;

        const existingUIdx = serverUsers.findIndex((su) => su.email.toLowerCase().trim() === normEmail);
        if (existingUIdx !== -1) {
          serverUsers[existingUIdx] = { ...serverUsers[existingUIdx], ...u, email: normEmail };
        } else {
          serverUsers.push({ ...u, email: normEmail, id: u.id || `user-${Date.now()}` });
        }
      });
    }

    persistServerData();
    res.json({
      success: true,
      totalClients: serverClients.length,
      totalUsers: serverUsers.length,
      clients: serverClients,
    });
  } catch (error: any) {
    console.error("Database import failed:", error);
    res.status(500).json({ error: "Failed to import database" });
  }
});

const SERVER_QUESTIONS_FILE = path.join(process.cwd(), "server-questions.json");

app.post("/api/questions/restore", (req, res) => {
  try {
    const { questions } = req.body;
    if (Array.isArray(questions) && questions.length > 0) {
      fs.writeFileSync(
        SERVER_QUESTIONS_FILE,
        JSON.stringify({ count: questions.length, restoredAt: new Date().toISOString(), questions }, null, 2),
        "utf-8"
      );
      return res.json({ success: true, count: questions.length });
    }
    return res.status(400).json({ error: "Invalid questions payload" });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to persist restored questions" });
  }
});

app.get("/api/questions", (_req, res) => {
  try {
    if (fs.existsSync(SERVER_QUESTIONS_FILE)) {
      const fileData = fs.readFileSync(SERVER_QUESTIONS_FILE, "utf-8");
      const parsed = JSON.parse(fileData);
      return res.json({
        success: true,
        count: parsed.count || (Array.isArray(parsed.questions) ? parsed.questions.length : 0),
        questions: parsed.questions || [],
      });
    }
    return res.json({ success: true, count: 0, questions: [] });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to load questions from server" });
  }
});

app.post("/api/clients", (req, res) => {
  const { client, clients } = req.body;
  if (Array.isArray(clients)) {
    // Merge without wiping out any clients created from other sessions/browsers
    clients.forEach((c: any) => {
      if (
        c &&
        c.email &&
        !isServerDummy(c) &&
        !isServerDeleted(c.email) &&
        !isServerDeleted(c.id) &&
        !isServerDeleted(c.loginId) &&
        !isServerDeleted(c.name)
      ) {
        const normEmail = c.email.toLowerCase().trim();
        const cPass = c.password || c.phone || "";
        const cLogin = (c.loginId || normEmail).toLowerCase().trim();
        const existingIdx = serverClients.findIndex((sc) => sc.email.toLowerCase().trim() === normEmail || sc.id === c.id);
        const resolvedTrack = (c.paidStreams && c.paidStreams.length > 0)
          ? c.paidStreams
          : (c.targetExam?.toLowerCase().includes('math') || c.targetExam?.toLowerCase().includes('science'))
          ? ['gt-maths-science']
          : (c.targetExam?.toLowerCase().includes('humanities') || c.targetExam?.toLowerCase().includes('social'))
          ? ['gt-humanities']
          : ['prt'];

        if (existingIdx !== -1) {
          const current = serverClients[existingIdx];
          const cUpdated = Number(c.updatedAt || 0);
          const sUpdated = Number(current.updatedAt || 0);
          const isLocalNewer = cUpdated > sUpdated && cUpdated > 0;

          // Never downgrade isPaid or status on passive device sync
          const isPaid = (c.isPaid === true || current.isPaid === true) && (isLocalNewer && c.status === 'revoked' ? false : (current.isPaid || c.isPaid || false));
          const status = isPaid ? 'active' : ((isLocalNewer ? c.status : current.status) || 'trial');
          const paidStreams = (current.paidStreams && current.paidStreams.length > 0)
            ? current.paidStreams
            : (c.paidStreams && c.paidStreams.length > 0)
            ? c.paidStreams
            : resolvedTrack;

          serverClients[existingIdx] = {
            ...current,
            ...(isLocalNewer ? c : {}),
            email: normEmail,
            loginId: cLogin,
            paidStreams,
            selectedExamTrack: current.selectedExamTrack || c.selectedExamTrack || paidStreams[0],
            targetExam: current.targetExam || c.targetExam,
            selectedStream: current.selectedStream || c.selectedStream,
            isPaid,
            status,
            updatedAt: Math.max(sUpdated, cUpdated, Date.now()),
          };
        } else {
          serverClients.push({
            ...c,
            email: normEmail,
            loginId: cLogin,
            password: cPass,
            status: c.status || 'trial',
            role: c.role || 'candidate',
            paidStreams: c.paidStreams || resolvedTrack,
            selectedExamTrack: c.selectedExamTrack || resolvedTrack[0],
            targetExam: c.targetExam || (resolvedTrack[0] === 'gt-maths-science' ? 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)' : 'Sikkim Primary Teacher (PRT - Paper I)'),
          });
        }
        // Also ensure they are synchronized in serverUsers
        const uIdx = serverUsers.findIndex((u) => u.email.toLowerCase().trim() === normEmail);
        if (uIdx !== -1) {
          serverUsers[uIdx] = {
            ...serverUsers[uIdx],
            name: c.name || serverUsers[uIdx].name,
            loginId: cLogin,
            phone: c.phone || serverUsers[uIdx].phone,
            password: cPass || serverUsers[uIdx].password,
            status: c.status || serverUsers[uIdx].status,
            targetExam: c.targetExam || serverUsers[uIdx].targetExam,
            selectedExamTrack: c.selectedExamTrack || serverUsers[uIdx].selectedExamTrack || resolvedTrack[0],
            isPaid: c.isPaid !== undefined ? c.isPaid : serverUsers[uIdx].isPaid,
            paidStreams: c.paidStreams || serverUsers[uIdx].paidStreams || resolvedTrack,
          };
        } else {
          serverUsers.push({
            id: `user-${c.id}`,
            name: c.name || 'Candidate',
            email: normEmail,
            loginId: cLogin,
            phone: c.phone,
            password: cPass,
            role: c.role || "candidate",
            targetExam: c.targetExam || "Sikkim Primary Teacher (PRT - Paper I)",
            selectedExamTrack: c.selectedExamTrack || resolvedTrack[0],
            status: c.status || "trial",
            createdAt: c.registeredAt || Date.now(),
            isPaid: c.isPaid || false,
            paidStreams: c.paidStreams || resolvedTrack,
          });
        }
      }
    });
    persistServerData();
    return res.json({ success: true, clients: serverClients });
  }
  if (!client || !client.email) {
    return res.status(400).json({ error: "Invalid client payload" });
  }

  const normalizedEmail = client.email.toLowerCase().trim();
  if (
    isServerDeleted(normalizedEmail) ||
    isServerDeleted(client.id) ||
    isServerDeleted(client.loginId) ||
    isServerDeleted(client.name)
  ) {
    return res.json({ success: false, message: "Client is in deleted registry" });
  }

  const normalizedLoginId = (client.loginId || normalizedEmail).toLowerCase().trim();
  const clientPass = client.password || client.phone || "";
  const resolvedTrack = (client.paidStreams && client.paidStreams.length > 0)
    ? client.paidStreams
    : (client.targetExam?.toLowerCase().includes('math') || client.targetExam?.toLowerCase().includes('science'))
    ? ['gt-maths-science']
    : (client.targetExam?.toLowerCase().includes('humanities') || client.targetExam?.toLowerCase().includes('social'))
    ? ['gt-humanities']
    : ['prt'];

  const existingIdx = serverClients.findIndex((c) => c.email.toLowerCase() === normalizedEmail || c.id === client.id);
  const fullClient = {
    ...client,
    email: normalizedEmail,
    loginId: normalizedLoginId,
    password: clientPass,
    paidStreams: client.paidStreams || resolvedTrack,
    selectedExamTrack: client.selectedExamTrack || resolvedTrack[0],
  };

  if (existingIdx !== -1) {
    serverClients[existingIdx] = { ...serverClients[existingIdx], ...fullClient };
  } else {
    serverClients.unshift(fullClient);
  }

  // Also sync to serverUsers
  const userIdx = serverUsers.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  const syncUser = {
    id: `user-${Date.now()}`,
    name: fullClient.name,
    email: normalizedEmail,
    loginId: normalizedLoginId,
    phone: fullClient.phone,
    password: clientPass,
    authProvider: "password",
    role: fullClient.role || "candidate",
    targetExam: fullClient.targetExam || "Sikkim Primary Teacher (PRT - Paper I)",
    selectedExamTrack: fullClient.selectedExamTrack || resolvedTrack[0],
    createdAt: fullClient.registeredAt || Date.now(),
    status: fullClient.status || "trial",
    isPaid: fullClient.isPaid || false,
    paidStreams: fullClient.paidStreams || resolvedTrack,
  };

  if (userIdx !== -1) {
    serverUsers[userIdx] = { ...serverUsers[userIdx], ...syncUser, id: serverUsers[userIdx].id };
  } else {
    serverUsers.unshift(syncUser);
  }

  persistServerData();
  res.json({ success: true, clients: serverClients, client: fullClient });
});

// Explicit course allocation endpoint
app.post("/api/clients/:id/allocate", (req, res) => {
  const { id } = req.params;
  const { track, email, loginId, targetExam, paidStreams, selectedStream } = req.body;
  const decodedId = decodeURIComponent(id).trim().toLowerCase();
  const unPrefixedId = decodedId.replace(/^(client-|user-)+/, '');
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanLogin = (loginId || '').toLowerCase().trim();

  const resolvedTrack = track || (paidStreams && paidStreams[0]) || 'gt-maths-science';
  const streamMap: Record<string, string> = {
    'gt-maths-science': 'graduate-science',
    'gt-humanities': 'graduate-social',
    'prt': 'primary',
  };
  const resolvedStream = selectedStream || streamMap[resolvedTrack] || 'graduate-science';
  const titleMap: Record<string, string> = {
    'gt-maths-science': 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)',
    'gt-humanities': 'Sikkim Graduate Teacher (GT Humanities - Paper II)',
    'prt': 'Sikkim Primary Teacher (PRT - Paper I)',
  };
  const resolvedTitle = targetExam || titleMap[resolvedTrack] || 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)';

  const cIdx = serverClients.findIndex((c) =>
    c.id?.toLowerCase() === decodedId ||
    c.id?.toLowerCase().replace(/^(client-|user-)+/, '') === unPrefixedId ||
    (cleanEmail && c.email?.toLowerCase().trim() === cleanEmail) ||
    (cleanLogin && c.loginId?.toLowerCase().trim() === cleanLogin)
  );

  if (cIdx !== -1) {
    serverClients[cIdx] = {
      ...serverClients[cIdx],
      targetExam: resolvedTitle,
      paidStreams: [resolvedTrack],
      selectedStream: resolvedStream,
      selectedExamTrack: resolvedTrack,
      isPaid: true,
      status: 'active',
      trialDaysRemaining: Math.max(serverClients[cIdx].trialDaysRemaining || 0, 365),
    };
  }

  const uIdx = serverUsers.findIndex((u) =>
    u.id?.toLowerCase() === decodedId ||
    u.id?.toLowerCase().replace(/^(client-|user-)+/, '') === unPrefixedId ||
    (cleanEmail && u.email?.toLowerCase().trim() === cleanEmail) ||
    (cleanLogin && u.loginId?.toLowerCase().trim() === cleanLogin)
  );

  if (uIdx !== -1) {
    serverUsers[uIdx] = {
      ...serverUsers[uIdx],
      targetExam: resolvedTitle,
      paidStreams: [resolvedTrack],
      selectedExamTrack: resolvedTrack,
      isPaid: true,
      status: 'active',
    };
  }

  persistServerData();
  res.json({ success: true, client: cIdx !== -1 ? serverClients[cIdx] : null });
});

app.delete("/api/clients/:id", (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id).trim().toLowerCase();
  const unPrefixedId = decodedId.replace(/^(client-|user-)+/, '');
  const queryEmail = (req.query.email as string)?.trim().toLowerCase() || '';
  const queryLoginId = (req.query.loginId as string)?.trim().toLowerCase() || '';
  const queryName = (req.query.name as string)?.trim().toLowerCase() || '';

  const matchClient = serverClients.find(
    (c) =>
      c.id === id ||
      c.id?.toLowerCase() === decodedId ||
      c.id?.toLowerCase().replace(/^(client-|user-)+/, '') === unPrefixedId ||
      c.email?.toLowerCase().trim() === decodedId ||
      (queryEmail && c.email?.toLowerCase().trim() === queryEmail) ||
      (queryLoginId && c.loginId?.toLowerCase().trim() === queryLoginId) ||
      (queryName && queryName !== 'candidate learner' && c.name?.toLowerCase().trim() === queryName)
  );

  const targetEmail = queryEmail || matchClient?.email?.toLowerCase().trim() || (decodedId.includes('@') ? decodedId : '');
  const targetLoginId = queryLoginId || matchClient?.loginId?.toLowerCase().trim() || '';
  const targetName = queryName || (matchClient?.name && matchClient.name !== 'Candidate Learner' ? matchClient.name.toLowerCase().trim() : '');

  serverClients = serverClients.filter((c) => {
    const cId = c.id?.toLowerCase().trim();
    const cEmail = c.email?.toLowerCase().trim();
    const cLogin = c.loginId?.toLowerCase().trim();
    const cName = c.name?.toLowerCase().trim();
    if (cId === id.toLowerCase() || cId === decodedId || cId?.replace(/^(client-|user-)+/, '') === unPrefixedId) return false;
    if (targetEmail && cEmail === targetEmail) return false;
    if (targetLoginId && cLogin === targetLoginId) return false;
    if (targetName && cName === targetName) return false;
    return true;
  });

  serverUsers = serverUsers.filter((u) => {
    const uId = u.id?.toLowerCase().trim();
    const uEmail = u.email?.toLowerCase().trim();
    const uLogin = u.loginId?.toLowerCase().trim();
    const uName = u.name?.toLowerCase().trim();
    if (uId === id.toLowerCase() || uId === decodedId || uId?.replace(/^(client-|user-)+/, '') === unPrefixedId) return false;
    if (targetEmail && uEmail === targetEmail) return false;
    if (targetLoginId && uLogin === targetLoginId) return false;
    if (targetName && uName === targetName) return false;
    return true;
  });

  if (targetEmail) {
    serverLoginLogs = serverLoginLogs.filter((l) => l.userEmail?.toLowerCase().trim() !== targetEmail);
    serverActiveSessions.delete(targetEmail);
    if (!serverDeletedEmails.includes(targetEmail)) {
      serverDeletedEmails.push(targetEmail);
    }
  }
  if (targetLoginId && !serverDeletedEmails.includes(targetLoginId)) {
    serverDeletedEmails.push(targetLoginId);
  }
  if (targetName && !serverDeletedEmails.includes(targetName)) {
    serverDeletedEmails.push(targetName);
  }
  if (unPrefixedId && !serverDeletedEmails.includes(unPrefixedId)) {
    serverDeletedEmails.push(unPrefixedId);
  }
  if (decodedId && !serverDeletedEmails.includes(decodedId)) {
    serverDeletedEmails.push(decodedId);
  }

  persistServerData();
  res.json({ success: true, clients: serverClients });
});

// Users Endpoints
app.get("/api/users", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const filtered = serverUsers.filter(
    (u) => !isServerDummy(u) && !isServerDeleted(u.email) && !isServerDeleted(u.id) && !isServerDeleted(u.loginId) && !isServerDeleted(u.name)
  );
  res.json({ success: true, users: filtered });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id).trim().toLowerCase();
  const unPrefixedId = decodedId.replace(/^(client-|user-)+/, '');
  const queryEmail = (req.query.email as string)?.trim().toLowerCase() || '';
  const queryLoginId = (req.query.loginId as string)?.trim().toLowerCase() || '';
  const queryName = (req.query.name as string)?.trim().toLowerCase() || '';

  const matchUser = serverUsers.find(
    (u) =>
      u.id === id ||
      u.id?.toLowerCase() === decodedId ||
      u.id?.toLowerCase().replace(/^(client-|user-)+/, '') === unPrefixedId ||
      u.email?.toLowerCase().trim() === decodedId ||
      (queryEmail && u.email?.toLowerCase().trim() === queryEmail) ||
      (queryLoginId && u.loginId?.toLowerCase().trim() === queryLoginId) ||
      (queryName && queryName !== 'candidate learner' && u.name?.toLowerCase().trim() === queryName)
  );

  const targetEmail = queryEmail || matchUser?.email?.toLowerCase().trim() || (decodedId.includes('@') ? decodedId : '');
  const targetLoginId = queryLoginId || matchUser?.loginId?.toLowerCase().trim() || '';
  const targetName = queryName || (matchUser?.name && matchUser.name !== 'Candidate Learner' ? matchUser.name.toLowerCase().trim() : '');

  serverUsers = serverUsers.filter((u) => {
    const uId = u.id?.toLowerCase().trim();
    const uEmail = u.email?.toLowerCase().trim();
    const uLogin = u.loginId?.toLowerCase().trim();
    const uName = u.name?.toLowerCase().trim();
    if (uId === id.toLowerCase() || uId === decodedId || uId?.replace(/^(client-|user-)+/, '') === unPrefixedId) return false;
    if (targetEmail && uEmail === targetEmail) return false;
    if (targetLoginId && uLogin === targetLoginId) return false;
    if (targetName && uName === targetName) return false;
    return true;
  });

  serverClients = serverClients.filter((c) => {
    const cId = c.id?.toLowerCase().trim();
    const cEmail = c.email?.toLowerCase().trim();
    const cLogin = c.loginId?.toLowerCase().trim();
    const cName = c.name?.toLowerCase().trim();
    if (cId === id.toLowerCase() || cId === decodedId || cId?.replace(/^(client-|user-)+/, '') === unPrefixedId) return false;
    if (targetEmail && cEmail === targetEmail) return false;
    if (targetLoginId && cLogin === targetLoginId) return false;
    if (targetName && cName === targetName) return false;
    return true;
  });

  if (targetEmail) {
    serverLoginLogs = serverLoginLogs.filter((l) => l.userEmail?.toLowerCase().trim() !== targetEmail);
    serverActiveSessions.delete(targetEmail);
    if (!serverDeletedEmails.includes(targetEmail)) {
      serverDeletedEmails.push(targetEmail);
    }
  }
  if (targetLoginId && !serverDeletedEmails.includes(targetLoginId)) {
    serverDeletedEmails.push(targetLoginId);
  }
  if (targetName && !serverDeletedEmails.includes(targetName)) {
    serverDeletedEmails.push(targetName);
  }
  if (unPrefixedId && !serverDeletedEmails.includes(unPrefixedId)) {
    serverDeletedEmails.push(unPrefixedId);
  }
  if (decodedId && !serverDeletedEmails.includes(decodedId)) {
    serverDeletedEmails.push(decodedId);
  }

  persistServerData();
  res.json({ success: true, users: serverUsers });
});

app.post("/api/users", (req, res) => {
  const { user, users } = req.body;
  if (Array.isArray(users)) {
    users.forEach((u: any) => {
      if (u && u.email && !isServerDummy(u) && !isServerDeleted(u.email) && !isServerDeleted(u.id)) {
        const normEmail = u.email.toLowerCase().trim();
        const existingIdx = serverUsers.findIndex((su) => su.email.toLowerCase().trim() === normEmail);
        if (existingIdx !== -1) {
          serverUsers[existingIdx] = { ...serverUsers[existingIdx], ...u, email: normEmail };
        } else {
          serverUsers.push({ ...u, email: normEmail });
        }
      }
    });
    persistServerData();
    return res.json({ success: true, users: serverUsers });
  }
  if (!user || !user.email) {
    return res.status(400).json({ error: "Invalid user payload" });
  }
  const normalizedEmail = user.email.toLowerCase().trim();
  if (isServerDeleted(normalizedEmail)) {
    return res.json({ success: false, message: "User is in deleted registry" });
  }

  const normalizedLoginId = (user.loginId || normalizedEmail).toLowerCase().trim();
  const userPass = user.password || user.phone || "";
  const resolvedTrack = (user.paidStreams && user.paidStreams.length > 0)
    ? user.paidStreams
    : (user.targetExam?.toLowerCase().includes('math') || user.targetExam?.toLowerCase().includes('science'))
    ? ['gt-maths-science']
    : (user.targetExam?.toLowerCase().includes('humanities') || user.targetExam?.toLowerCase().includes('social'))
    ? ['gt-humanities']
    : ['prt'];

  const idx = serverUsers.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  const fullUser = {
    ...user,
    email: normalizedEmail,
    loginId: normalizedLoginId,
    password: userPass,
    paidStreams: user.paidStreams || resolvedTrack,
  };

  if (idx !== -1) {
    serverUsers[idx] = { ...serverUsers[idx], ...fullUser };
  } else {
    serverUsers.unshift(fullUser);
  }

  // Also sync to serverClients so admin sees new user in client list
  const clientIdx = serverClients.findIndex((c) => c.email.toLowerCase() === normalizedEmail);
  if (clientIdx !== -1) {
    serverClients[clientIdx] = {
      ...serverClients[clientIdx],
      name: fullUser.name || serverClients[clientIdx].name,
      loginId: normalizedLoginId,
      phone: fullUser.phone || serverClients[clientIdx].phone,
      password: userPass || serverClients[clientIdx].password,
      targetExam: fullUser.targetExam || serverClients[clientIdx].targetExam,
      paidStreams: fullUser.paidStreams || serverClients[clientIdx].paidStreams || resolvedTrack,
      isPaid: fullUser.isPaid !== undefined ? fullUser.isPaid : serverClients[clientIdx].isPaid,
      status: fullUser.status || serverClients[clientIdx].status,
    };
  } else {
    const syncClient = {
      id: `client-${Date.now()}`,
      name: fullUser.name,
      email: normalizedEmail,
      loginId: normalizedLoginId,
      phone: fullUser.phone || "",
      password: userPass,
      targetExam: fullUser.targetExam || (resolvedTrack[0] === 'gt-maths-science' ? 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)' : 'Sikkim Primary Teacher (PRT - Paper I)'),
      role: fullUser.role || "candidate",
      status: fullUser.status || "trial",
      trialDaysRemaining: fullUser.isPaid ? 365 : 1,
      registeredAt: Date.now(),
      lastLoginAt: Date.now(),
      testsCompleted: 0,
      avgScore: 0,
      notes: "Self-registered candidate via Register Now portal.",
      isPaid: fullUser.isPaid || false,
      paidStreams: fullUser.paidStreams || resolvedTrack,
    };
    serverClients.unshift(syncClient);
  }

  persistServerData();
  res.json({ success: true, users: serverUsers, user: fullUser });
});

// Direct Register API for Candidates (creates user & client in persistent store)
app.post("/api/auth/register", (req, res) => {
  const userData = req.body;
  if (!userData || !userData.email) {
    return res.status(400).json({ success: false, message: "Valid email is required" });
  }

  const normalizedEmail = String(userData.email).toLowerCase().trim();
  const normalizedLoginId = (userData.loginId || normalizedEmail).toLowerCase().trim();
  const userPass = userData.password || userData.phone || "";

  const existingIdx = serverUsers.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (existingIdx !== -1) {
    return res.status(400).json({ success: false, message: "Account already exists with this email." });
  }

  const regTrack = (userData.targetExam?.toLowerCase().includes('math') || userData.targetExam?.toLowerCase().includes('science'))
    ? ['gt-maths-science']
    : (userData.targetExam?.toLowerCase().includes('humanities') || userData.targetExam?.toLowerCase().includes('social'))
    ? ['gt-humanities']
    : ['prt'];

  const newUser = {
    id: `user-${Date.now()}`,
    name: (userData.name || "Aspirant").trim(),
    email: normalizedEmail,
    loginId: normalizedLoginId,
    phone: userData.phone || "",
    password: userPass,
    authProvider: "password",
    role: "candidate",
    targetExam: userData.targetExam || (regTrack[0] === 'gt-maths-science' ? 'Sikkim Graduate Teacher (GT Maths & Science - Paper II)' : 'Sikkim Primary Teacher (PRT - Paper I)'),
    createdAt: Date.now(),
    status: "trial",
    trialExpiresAt: Date.now() + 1 * 86400000,
    isPaid: false,
    paidStreams: regTrack,
  };

  serverUsers.unshift(newUser);

  const newClient = {
    id: `client-${Date.now()}`,
    name: newUser.name,
    email: normalizedEmail,
    loginId: normalizedLoginId,
    phone: newUser.phone,
    password: userPass,
    targetExam: newUser.targetExam,
    role: "candidate",
    status: "trial",
    trialDaysRemaining: 1,
    registeredAt: Date.now(),
    lastLoginAt: Date.now(),
    testsCompleted: 0,
    avgScore: 0,
    notes: "Self-registered candidate via Register Now portal.",
    isPaid: false,
    paidStreams: regTrack,
  };

  serverClients.unshift(newClient);
  persistServerData();

  res.json({ success: true, user: newUser, client: newClient });
});

// Auth Login API
app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: "Login ID and Password are required" });
  }

  const cleanId = String(identifier).toLowerCase().trim();
  const cleanPass = String(password).trim();
  const digitsId = cleanId.replace(/\D/g, "");
  const digitsPass = cleanPass.replace(/\D/g, "");

  // Special Master Administrator direct bypass for studeezoneapp@gmail.com
  if (
    (cleanId === "studeezoneapp@gmail.com" || cleanId === "studeezoneapp" || digitsId === "9876543210") &&
    (cleanPass === "9876543210" || digitsPass === "9876543210")
  ) {
    let adminAdmUser = serverUsers.find((u) => u.email.toLowerCase() === "studeezoneapp@gmail.com");
    if (!adminAdmUser) {
      adminAdmUser = {
        id: "user-admin-2",
        name: "studeezone Administrator",
        email: "studeezoneapp@gmail.com",
        loginId: "studeezoneapp@gmail.com",
        phone: "9876543210",
        password: "9876543210",
        authProvider: "password",
        role: "admin",
        targetExam: "Sikkim Graduate Teacher (GT Maths & Science - Paper II)",
        createdAt: Date.now() - 25 * 86400000,
        status: "active",
        isPaid: true,
        paidStreams: ["prt", "gt-maths-science", "gt-humanities"],
      };
      serverUsers.unshift(adminAdmUser);
    }
    adminAdmUser.password = "9876543210";
    adminAdmUser.phone = "9876543210";
    adminAdmUser.role = "admin";
    adminAdmUser.isPaid = true;
    adminAdmUser.status = "active";
    adminAdmUser.paidStreams = ["prt", "gt-maths-science", "gt-humanities"];
    adminAdmUser.lastLoginAt = Date.now();
    persistServerData();
    return res.json({ success: true, user: adminAdmUser });
  }

  // Find in serverUsers or serverClients
  let matchedUser = serverUsers.find((u) => {
    if (u.email.toLowerCase() === cleanId || (u.loginId && u.loginId.toLowerCase() === cleanId)) return true;
    if (digitsId.length >= 7 && u.phone && u.phone.replace(/\D/g, "").endsWith(digitsId)) return true;
    return false;
  });

  const matchedClient = serverClients.find((c) => {
    if (c.email.toLowerCase() === cleanId || (c.loginId && c.loginId.toLowerCase() === cleanId)) return true;
    if (digitsId.length >= 7 && c.phone && c.phone.replace(/\D/g, "").endsWith(digitsId)) return true;
    return false;
  });

  if (!matchedUser && matchedClient) {
    matchedUser = {
      id: `user-${matchedClient.id}`,
      name: matchedClient.name,
      email: matchedClient.email,
      loginId: matchedClient.loginId || matchedClient.email,
      phone: matchedClient.phone,
      password: matchedClient.password || matchedClient.phone,
      role: matchedClient.role,
      targetExam: matchedClient.targetExam,
      status: matchedClient.status,
      isPaid: Boolean(matchedClient.isPaid || matchedClient.status === 'active'),
      paidStreams: matchedClient.paidStreams,
    };
    serverUsers.unshift(matchedUser);
  }

  if (matchedUser && matchedClient) {
    // Keep user in sync with client paid state and targetExam
    if (matchedClient.isPaid || matchedClient.status === 'active') {
      matchedUser.isPaid = true;
      matchedUser.status = 'active';
    }
    if (matchedClient.paidStreams && matchedClient.paidStreams.length > 0) {
      matchedUser.paidStreams = matchedClient.paidStreams;
    }
    if (matchedClient.targetExam) {
      matchedUser.targetExam = matchedClient.targetExam;
    }
  }

  if (!matchedUser) {
    return res.status(401).json({
      success: false,
      message: "No registered account found with that Email or Login ID. Please verify your credentials or register.",
    });
  }

  const passOk = verifyPasswordMatch(matchedUser.password, matchedUser.phone, password);
  if (!passOk) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password. By default, your password is your registered phone number.",
    });
  }

  matchedUser.lastLoginAt = Date.now();
  return res.json({ success: true, user: matchedUser });
});

// Shared Server Store for Advisory Members, Council Settings & Fellowship Applications
let serverAdvisoryMembers: any[] = [
  {
    id: "adv-pemba-sharma",
    name: "Pemba Tshering Sharma",
    honorific: "Dr.",
    roleTitle: "Distinguished Contributing Author",
    category: "contributing-authors",
    affiliation: "Government College Rhenock, Sikkim",
    credentials: "Ph.D. in Himalayan History & Constitutional Law, 11+ years experience",
    bio: "Specializes in authentic Sikkim state chronicles, Yuksom heritage, and Paper II Social Science curriculum. Inducted into Council.",
    contributions: [
      "Sikkim Curricular Localization & Vernacular Context",
      "High-Yield Revision Notes Formulation",
      "Constitutional Writs & State History Question Vetting"
    ],
    badge: "Inducted Fellow",
    email: "pemba.sharma.history@sikkim.ac.in",
    featured: true,
    active: true,
    order: 1,
    createdAt: Date.now() - 86400000 * 5,
  }
];

let serverCouncilSettings = {
  showCouncilMembersSection: true,
  councilCharterNotice: "All advisory council members and contributing authors are strictly verified before listing.",
  lastUpdated: Date.now(),
};

let serverFellowshipApplications: any[] = [];

// Public & Admin Endpoints for Advisory Members
app.get("/api/advisory-members", (_req, res) => {
  res.json({
    members: serverAdvisoryMembers,
    settings: serverCouncilSettings,
  });
});

app.post("/api/advisory-members", (req, res) => {
  try {
    const { members, member } = req.body;
    if (Array.isArray(members)) {
      serverAdvisoryMembers = members;
      return res.json({ success: true, count: serverAdvisoryMembers.length, members: serverAdvisoryMembers });
    }
    if (member && member.name) {
      const existingIdx = serverAdvisoryMembers.findIndex((m) => m.id === member.id || m.email === member.email);
      if (existingIdx !== -1) {
        serverAdvisoryMembers[existingIdx] = { ...serverAdvisoryMembers[existingIdx], ...member, updatedAt: Date.now() };
      } else {
        serverAdvisoryMembers.push({ ...member, createdAt: Date.now() });
      }
      return res.json({ success: true, members: serverAdvisoryMembers });
    }
    return res.status(400).json({ error: "Invalid members payload" });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to save members" });
  }
});

app.delete("/api/advisory-members/:id", (req, res) => {
  const { id } = req.params;
  serverAdvisoryMembers = serverAdvisoryMembers.filter((m) => m.id !== id);
  res.json({ success: true, members: serverAdvisoryMembers });
});

app.post("/api/advisory/council-settings", (req, res) => {
  const { settings } = req.body;
  if (settings && typeof settings === "object") {
    serverCouncilSettings = { ...serverCouncilSettings, ...settings, lastUpdated: Date.now() };
  }
  res.json({ success: true, settings: serverCouncilSettings });
});

// Fellowship Applications Endpoints
app.get("/api/fellowship-applications", (_req, res) => {
  const isDummy = (a: any) => !a || a.id === 'app-seed-001' || a.id === 'app-seed-002' || a.id === 'app-seed-003' || (a.id && a.id.startsWith('app-seed-'));
  serverFellowshipApplications = serverFellowshipApplications.filter((a) => !isDummy(a));
  res.json({ applications: serverFellowshipApplications });
});

app.post("/api/fellowship-applications", (req, res) => {
  try {
    const { application, applications } = req.body;
    const isDummy = (a: any) => !a || a.id === 'app-seed-001' || a.id === 'app-seed-002' || a.id === 'app-seed-003' || (a.id && a.id.startsWith('app-seed-'));
    serverFellowshipApplications = serverFellowshipApplications.filter((a) => !isDummy(a));

    if (application && application.name && !isDummy(application)) {
      const existingIdx = serverFellowshipApplications.findIndex((a) => a.id === application.id);
      if (existingIdx !== -1) {
        serverFellowshipApplications[existingIdx] = { ...serverFellowshipApplications[existingIdx], ...application };
      } else {
        serverFellowshipApplications.unshift(application);
      }
    }

    if (Array.isArray(applications)) {
      applications.forEach((incoming) => {
        if (!incoming || isDummy(incoming)) return;
        const idx = serverFellowshipApplications.findIndex((a) => a.id === incoming.id);
        if (idx !== -1) {
          serverFellowshipApplications[idx] = { ...serverFellowshipApplications[idx], ...incoming };
        } else {
          serverFellowshipApplications.push(incoming);
        }
      });
    }

    serverFellowshipApplications.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    return res.json({ success: true, applications: serverFellowshipApplications });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to save application" });
  }
});

app.delete("/api/fellowship-applications/:id", (req, res) => {
  const { id } = req.params;
  serverFellowshipApplications = serverFellowshipApplications.filter((a) => a.id !== id);
  res.json({ success: true, applications: serverFellowshipApplications });
});

app.put("/api/fellowship-applications/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = serverFellowshipApplications.findIndex((a) => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Application not found" });
  }
  serverFellowshipApplications[idx] = {
    ...serverFellowshipApplications[idx],
    ...updates,
    reviewedAt: Date.now(),
  };

  // If approved or inducted, automatically create/activate advisory member in serverAdvisoryMembers
  const app = serverFellowshipApplications[idx];
  if (app.status === "approved" || app.status === "inducted") {
    const roleTitle = app.adminAssignedRoleTitle || app.preferredPosition || "Distinguished Contributing Author";
    const category = app.adminAssignedCategory || app.preferredCategory || "contributing-authors";
    const existingMemberIdx = serverAdvisoryMembers.findIndex((m) => m.email === app.email || m.name === app.name);

    const credsParts = [
      app.highestQualification,
      app.customCredentials ? `(${app.customCredentials})` : null,
      app.specializationDomain ? `in ${app.specializationDomain}` : null,
      app.experienceYears ? `${app.experienceYears}+ years experience` : null
    ].filter(Boolean);

    const memberData = {
      id: existingMemberIdx !== -1 ? serverAdvisoryMembers[existingMemberIdx].id : `adv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: app.name,
      honorific: app.honorific || "Dr.",
      roleTitle,
      category,
      affiliation: app.affiliation,
      credentials: credsParts.join(' '),
      bio: app.briefExperienceAndBio || app.statementOfPedagogy || `${app.honorific || ''} ${app.name} specializes in ${app.specializationDomain} and contributes to Sikkim STET syllabus development.`,
      avatarUrl: app.photoUrl || (existingMemberIdx !== -1 ? serverAdvisoryMembers[existingMemberIdx].avatarUrl : undefined),
      contributions: app.contributions && app.contributions.length > 0 ? app.contributions : ["Curriculum & Item Development"],
      badge: "Inducted Fellow",
      email: app.email,
      featured: false,
      active: true,
      order: serverAdvisoryMembers.length + 1,
      createdAt: Date.now(),
    };

    if (existingMemberIdx !== -1) {
      serverAdvisoryMembers[existingMemberIdx] = { ...serverAdvisoryMembers[existingMemberIdx], ...memberData, active: true };
    } else {
      serverAdvisoryMembers.push(memberData);
    }
  }

  res.json({
    success: true,
    application: serverFellowshipApplications[idx],
    advisoryMembers: serverAdvisoryMembers,
  });
});

// About & Mission Page Content Endpoints
let serverAboutMissionContent: any = null;

app.get("/api/about-mission", (_req, res) => {
  res.json({ success: true, content: serverAboutMissionContent });
});

app.put("/api/about-mission", (req, res) => {
  try {
    const content = req.body;
    if (content && typeof content === "object") {
      serverAboutMissionContent = {
        ...content,
        lastUpdated: Date.now(),
      };
      return res.json({ success: true, content: serverAboutMissionContent });
    }
    return res.status(400).json({ error: "Invalid content payload" });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Failed to save about-mission content" });
  }
});

// Password Reset / Forgot Password Email Dispatch API
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email, temporaryPassword: clientTempPassword } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    // Generate a temporary reset password if not provided
    const tempPassword = clientTempPassword || `STET-${Math.floor(100000 + Math.random() * 900000)}`;
    const senderEmail = process.env.SMTP_EMAIL || "studeezoneapp@gmail.com";
    const senderPassword = process.env.SMTP_PASSWORD || "Studyzone@09";

    // Setup nodemailer transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: senderPassword,
      },
      connectionTimeout: 9000,
      greetingTimeout: 9000,
      socketTimeout: 12000,
    });

    const mailOptions = {
      from: `"studeezone.com Support" <${senderEmail}>`,
      to: normalizedEmail,
      subject: `studeezone.com - Password Reset Request`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { background: #0f172a; padding: 24px 32px; text-align: center; }
            .brand { color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
            .brand-blue { color: #3b82f6; }
            .tagline { color: #94a3b8; font-size: 13px; margin-top: 4px; }
            .body { padding: 32px; }
            .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
            .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
            .password-box { background: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 12px; padding: 18px 24px; text-align: center; margin: 24px 0; }
            .password-label { font-size: 12px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
            .password-val { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 800; color: #1e40af; letter-spacing: 2px; }
            .instructions { background: #f8fafc; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 13px; color: #64748b; line-height: 1.5; }
            .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="brand">studee<span class="brand-blue">zone</span>.com</h1>
              <div class="tagline">STET Exam Preparation &amp; Adaptive Learning Platform</div>
            </div>
            <div class="body">
              <div class="greeting">Hello Aspirant,</div>
              <p class="text">
                We received a request to reset the password for your <strong>studeezone.com</strong> account associated with <strong>${normalizedEmail}</strong>.
              </p>
              
              <div class="password-box">
                <div class="password-label">Your Temporary Access Password</div>
                <div class="password-val">${tempPassword}</div>
              </div>

              <div class="instructions">
                <strong>Next steps:</strong>
                <ol style="margin-top: 6px; padding-left: 20px; margin-bottom: 0;">
                  <li>Return to the studeezone.com login screen.</li>
                  <li>Sign in with your email address and the temporary password above.</li>
                  <li>Your 7-Day Trial &amp; STET exam preparation history will remain completely intact.</li>
                </ol>
              </div>

              <p class="text" style="font-size: 12px; color: #94a3b8;">
                If you did not request this password reset, please secure your email account. This email was automatically generated and sent from <strong>${senderEmail}</strong>.
              </p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} studeezone.com &bull; STET Teacher Certification Platform
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email successfully sent from ${senderEmail} to ${normalizedEmail}`);
      return res.json({
        success: true,
        sentViaSmtp: true,
        temporaryPassword: tempPassword,
        senderEmail: "studeezone.com Support",
        message: `A temporary password has been dispatched to ${normalizedEmail}. Please check your inbox (and spam folder).`,
      });
    } catch (smtpError: any) {
      console.warn("SMTP send failed or Gmail 2FA restriction:", smtpError?.message || smtpError);
      // Return success with the temporary password so user can sign in immediately
      return res.json({
        success: true,
        sentViaSmtp: false,
        temporaryPassword: tempPassword,
        senderEmail,
        smtpNotice: smtpError?.message || "Google SMTP connection required App Password",
        message: `Password has been reset. Email dispatch was attempted from ${senderEmail}. Use your temporary password below to sign in directly.`,
      });
    }
  } catch (error: any) {
    console.error("Error in /api/auth/forgot-password:", error);
    return res.status(500).json({ error: "Failed to process password reset request" });
  }
});

async function startServer() {
  try {
    // Serve public static assets
    const publicPath = path.join(process.cwd(), "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath));
    }

    const distPath = path.join(process.cwd(), "dist");
    const distIndexHtml = path.join(distPath, "index.html");
    const hasDist = fs.existsSync(distIndexHtml);

    // Distinguish development mode from production mode
    const isDevMode =
      process.env.NODE_ENV === "development" ||
      process.env.npm_lifecycle_event === "dev" ||
      process.argv.includes("--dev") ||
      process.argv.some((arg) => arg.includes("tsx"));

    if (!isDevMode) {
      if (hasDist) {
        console.log("Serving pre-built production static files from:", distPath);
        app.use(
          express.static(distPath, {
            setHeaders: (res, filePath) => {
              if (filePath.endsWith(".html")) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.setHeader("Pragma", "no-cache");
                res.setHeader("Expires", "0");
              }
            },
          })
        );
        app.get("*", (_req, res, next) => {
          if (fs.existsSync(distIndexHtml)) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            res.sendFile(distIndexHtml, (err) => {
              if (err) {
                console.warn("Failed sending index.html:", err);
                next(err);
              }
            });
          } else {
            next();
          }
        });
      } else {
        console.warn("Production mode: dist/index.html not found, falling back to Vite runtime middleware...");
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      }
    } else {
      console.log("Starting Vite development middleware...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    }

    // Generic error handling middleware
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error("Express error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} signal received: closing HTTP server`);
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Fatal error starting server:", error);
    process.exit(1);
  }
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
