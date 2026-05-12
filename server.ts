import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { execFile } from "child_process";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG_PATH = path.join(process.cwd(), "data", "email_config.json");
const DATA_PATH = path.join(process.cwd(), "data", "processed_emails.csv");

const DEMO_EMAILS = [
  {
    date: "2026-05-11 09:14:00",
    sender: "Sarah Chen <sarah.chen@acmecorp.com>",
    subject: "Re: Ottochive proposal — loved it",
    label: "POSITIVE_REPLY",
    text: "Hi Nick, I showed this to our VP and honestly we're really excited. The zero-cloud angle is exactly what our compliance team has been asking for. Can we get a call this week? Thursday or Friday works best for me. Looking forward to seeing a full demo.",
  },
  {
    date: "2026-05-11 08:47:00",
    sender: "James Okafor <james@meridiangroup.io>",
    subject: "Re: Following up on your outreach",
    label: "POSITIVE_REPLY",
    text: "Hey — yes, this is timely. We've been evaluating tools for exactly this problem. Let's set up a call. I can do Mon/Wed/Fri afternoons. Send me a calendar link and we'll get something on the books.",
  },
  {
    date: "2026-05-11 11:02:00",
    sender: "Priya Nair <p.nair@vantagelogistics.com>",
    subject: "Re: AI email triage for your team",
    label: "POSITIVE_REPLY",
    text: "This looks really promising. Our sales team deals with 300+ replies per week and triaging them manually is a mess. Would love to see how the classification works in practice. Can you do a live demo next Tuesday?",
  },
  {
    date: "2026-05-10 16:33:00",
    sender: "Tom Weller <t.weller@brightscale.co>",
    subject: "Re: Ottochive — not the right time",
    label: "SOFT_NO",
    text: "Thanks for reaching out. We're actually mid-way through another implementation right now and can't take on anything new for at least 90 days. Feel free to check back in Q3 — could be interesting then.",
  },
  {
    date: "2026-05-10 14:18:00",
    sender: "Danielle Marsh <dmarsh@foundryventures.com>",
    subject: "Re: Quick question about your outreach",
    label: "SOFT_NO",
    text: "Appreciate the note. Budget's locked for H1 so we'd need to revisit in the fall. Not a no — just bad timing. Put me on your list to follow up in September.",
  },
  {
    date: "2026-05-11 07:55:00",
    sender: "Carlos Mendes <carlos@pulseretail.com>",
    subject: "Re: AI-powered inbox triage",
    label: "INTERESTED_NOT_READY",
    text: "Looks interesting — do you have any case studies or data on accuracy rates? We'd need to see benchmarks before bringing this to leadership. Also curious how it handles non-English emails.",
  },
  {
    date: "2026-05-10 15:40:00",
    sender: "Aiko Tanaka <a.tanaka@nexahealth.jp>",
    subject: "Re: Ottochive for enterprise teams",
    label: "INTERESTED_NOT_READY",
    text: "Hi, this looks relevant. Can you send over a one-pager and pricing sheet? I want to share it internally before we arrange a call. Also — do you have a SOC 2 report available?",
  },
  {
    date: "2026-05-11 08:01:00",
    sender: "Marcus Flynn <mflynn@flynncapital.com>",
    subject: "Out of Office: Back May 19th",
    label: "OOO",
    text: "Thanks for your email. I'm currently out of the office attending an off-site until May 19th and have limited access to email. I'll respond when I return. For urgent matters please contact my assistant at assistant@flynncapital.com.",
  },
  {
    date: "2026-05-10 13:22:00",
    sender: "newsletter@industrydigest.com",
    subject: "Re: Please remove me from your list",
    label: "UNSUBSCRIBE",
    text: "Hi, please remove me from your mailing list. I'm not the right contact for this. Thanks.",
  },
];

function readConfig(): Record<string, string> | null {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Config endpoints ---

  app.get("/api/config", (req, res) => {
    const config = readConfig();
    if (!config) return res.json({ configured: false });
    res.json({
      configured: true,
      email: config.email,
      provider: config.provider,
      demo: config.demo === "true",
    });
  });

  app.post("/api/config", (req, res) => {
    const { email, password, imapServer, imapPort, provider, demo } = req.body;
    if (demo) {
      fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
      fs.writeFileSync(
        CONFIG_PATH,
        JSON.stringify({ email: "demo@ottochive.com", provider: "demo", demo: "true" }, null, 2)
      );
      return res.json({ success: true });
    }
    if (!email || !password || !imapServer) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(
      CONFIG_PATH,
      JSON.stringify({ email, password, imapServer, imapPort: imapPort || 993, provider }, null, 2)
    );
    res.json({ success: true });
  });

  app.delete("/api/config", (req, res) => {
    if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH);
    res.json({ success: true });
  });

  app.post("/api/test-connection", (req, res) => {
    const { email, password, imapServer } = req.body;
    if (!email || !password || !imapServer) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }
    const script = `
import imaplib, sys
try:
    m = imaplib.IMAP4_SSL(sys.argv[1], 993)
    m.login(sys.argv[2], sys.argv[3])
    m.logout()
    print("ok")
except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)
`;
    execFile("python3", ["-c", script, imapServer, email, password], { timeout: 15000 }, (error, _stdout, stderr) => {
      if (error) {
        const msg = stderr?.trim() || error.message;
        return res.json({ success: false, error: msg });
      }
      res.json({ success: true });
    });
  });

  // --- Email data endpoints ---

  app.get("/api/emails", (req, res) => {
    const config = readConfig();
    if (config?.demo === "true") return res.json(DEMO_EMAILS);

    if (!fs.existsSync(DATA_PATH)) return res.json([]);
    try {
      const content = fs.readFileSync(DATA_PATH, "utf-8");
      const records = parse(content, { columns: true, skip_empty_lines: true });
      res.json(records);
    } catch (error) {
      console.error("Error reading emails:", error);
      res.status(500).json({ error: "Failed to read emails" });
    }
  });

  app.post("/api/classify", (req, res) => {
    const { text } = req.body;
    const lowerText = text.toLowerCase();
    let label = "INTERESTED_NOT_READY";
    let confidence = 0.85;
    if (lowerText.includes("yes") || lowerText.includes("interested") || lowerText.includes("call") || lowerText.includes("demo")) {
      label = "POSITIVE_REPLY"; confidence = 1.2;
    } else if (lowerText.includes("unsubscribe") || lowerText.includes("remove") || lowerText.includes("stop")) {
      label = "UNSUBSCRIBE"; confidence = 2.1;
    } else if (lowerText.includes("out of office") || lowerText.includes("ooo") || lowerText.includes("away")) {
      label = "OOO"; confidence = 1.8;
    } else if (lowerText.includes("not the right time") || lowerText.includes("not ready") || lowerText.includes("pass")) {
      label = "SOFT_NO"; confidence = 0.95;
    }
    res.json({ label, confidence });
  });

  // --- Draft reply via Gemini ---

  const TONE_INSTRUCTIONS: Record<string, string> = {
    POSITIVE_REPLY: `The recipient has shown clear buying intent and wants to book a call or demo.
Write a warm, enthusiastic, and confident reply. Thank them for their interest, confirm
enthusiasm, and propose two or three specific time slots this week for a call.
Keep it concise — 3 short paragraphs max. End with a clear call to action.`,

    SOFT_NO: `The recipient isn't ready right now but hasn't closed the door.
Write a polite, understanding reply that respects their timeline, briefly highlights
one key benefit they may find useful when they revisit, and suggests a specific
follow-up date (e.g. "I'll check back in 6 weeks"). No pressure, no hard sell.
2–3 short paragraphs.`,

    INTERESTED_NOT_READY: `The recipient is curious but wants more information before committing.
Write a helpful, educational reply. Offer to send a one-pager or case study,
briefly answer any implied questions in their email, and make it easy to take
the next small step. Warm and low-pressure. 2–3 short paragraphs.`,

    OOO: `This is an out-of-office auto-reply. Write a very brief, friendly note
acknowledging they are away and that you'll follow up when they return.
One short paragraph only.`,

    UNSUBSCRIBE: `The recipient has asked to be removed from your list.
Write a respectful, gracious reply confirming their removal with no pushback or
persuasion attempt. Wish them well and leave the door open if they ever want to reconnect.
2 sentences maximum.`,
  };

  app.post("/api/draft-reply", async (req, res) => {
    const { emailBody, label, senderName } = req.body;
    if (!emailBody || !label) {
      return res.status(400).json({ error: "Missing emailBody or label" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.status(503).json({ error: "Gemini API key not configured. Add GEMINI_API_KEY to your .env file." });
    }

    const toneInstruction = TONE_INSTRUCTIONS[label] ?? TONE_INSTRUCTIONS["INTERESTED_NOT_READY"];

    const prompt = `You are an expert B2B sales professional drafting an email reply.

ORIGINAL EMAIL FROM ${senderName || "the recipient"}:
---
${emailBody}
---

CLASSIFICATION: ${label}

INSTRUCTIONS:
${toneInstruction}

Write ONLY the email body — no subject line, no "Subject:", no meta-commentary.
Start directly with the greeting (e.g. "Hi Sarah,").
Sign off with "Best," on its own line, then a blank line, then "[Your Name]".
Keep it professional, human, and concise.`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: prompt,
      });
      const draft = response.text ?? "";
      res.json({ draft });
    } catch (err: any) {
      console.error("Gemini error:", err?.message);
      res.status(500).json({ error: err?.message || "Failed to generate draft" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", model: "ottochive_reader_bridge" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n  Ottochive running → http://localhost:${PORT}\n`);
  });
}

startServer();
