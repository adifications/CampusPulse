import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for high-resolution mobile camera pictures
app.use(express.json({ limit: "35mb" }));
app.use(express.urlencoded({ extended: true, limit: "35mb" }));

// Lazy GoogleGenAI client helper
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to your environment variables or Secrets panel.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// JSON Schema for structured notice board summary
const NoticeBoardResponseSchema = {
  type: Type.OBJECT,
  properties: {
    boardTitle: {
      type: Type.STRING,
      description: "A descriptive title for this notice board or circular scan (e.g., 'Department Notice Board - Autumn 2026' or 'Controller of Examinations Circular')",
    },
    scanTimestamp: {
      type: Type.STRING,
      description: "ISO timestamp of the scan",
    },
    totalNoticesFound: {
      type: Type.INTEGER,
      description: "Total count of distinct circulars/notices detected on the board",
    },
    criticalCount: {
      type: Type.INTEGER,
      description: "Number of notices marked as CRITICAL importance",
    },
    highCount: {
      type: Type.INTEGER,
      description: "Number of notices marked as HIGH importance",
    },
    executiveSummary: {
      type: Type.STRING,
      description: "A 2-3 sentence clear, high-level summary of what was found on this board and what students must act on first.",
    },
    urgentBroadcastMessage: {
      type: Type.STRING,
      description: "A student-friendly WhatsApp/Telegram broadcast message format with emojis, bullet points, and clear urgency markers that a Class Representative can copy-paste to the class group.",
    },
    notices: {
      type: Type.ARRAY,
      description: "List of all distinct notices found on the circular or notice board",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique slug identifier (e.g. notice-exam-fees)" },
          title: { type: Type.STRING, description: "Short, student-friendly punchy title (e.g. 'End-Sem Exam Fee & Hall Ticket Cutoff')" },
          officialTitle: { type: Type.STRING, description: "Full formal title or subject line printed on the circular" },
          department: { type: Type.STRING, description: "Issuing department, cell, or authority (e.g. 'Office of Controller of Examinations')" },
          referenceNumber: { type: Type.STRING, description: "Official circular reference number or notification code if printed, else empty" },
          issueDate: { type: Type.STRING, description: "Date of circular issuance if legible" },
          category: {
            type: Type.STRING,
            description: "Must be exactly one of: 'Exams & Fees', 'Academics & Classes', 'Placements & Internships', 'Hostel & Mess', 'Scholarships & Aid', 'Events & Clubs', 'General Administration'",
          },
          importance: {
            type: Type.STRING,
            description: "Must be exactly one of: 'CRITICAL', 'HIGH', 'NORMAL', 'LOW'. Use CRITICAL for fee deadlines, hall ticket revocation, exam rules, or imminent attendance penalties.",
          },
          whyItMatters: { type: Type.STRING, description: "One direct, plain sentence explaining why a student cannot ignore this notice." },
          oneLineTLDR: { type: Type.STRING, description: "A one-sentence ultra-crisp takeaway." },
          bulletPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Bulleted student-friendly highlights with zero unnecessary bureaucratic fluff.",
          },
          actionItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Action to take" },
                deadline: { type: Type.STRING, description: "Action deadline if specified" },
                isUrgent: { type: Type.BOOLEAN, description: "Whether this action is urgent" },
                feeAmount: { type: Type.STRING, description: "Any fee amount mentioned" },
                linkOrVenue: { type: Type.STRING, description: "Portal link or physical office venue" },
              },
              required: ["text"],
            },
          },
          deadlines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "Date (YYYY-MM-DD or readable date string)" },
                time: { type: Type.STRING, description: "Time of day (e.g. 5:00 PM)" },
                description: { type: Type.STRING, description: "What expires on this date" },
                isStrictCutoff: { type: Type.BOOLEAN, description: "True if non-extendable strict cutoff" },
                penaltyIfMissed: { type: Type.STRING, description: "Fine or penalty if missed" },
              },
              required: ["date", "description"],
            },
          },
          targetAudience: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Who this applies to (e.g., 'Final Year B.Tech', 'All Hostel Residents', 'Backlog Students')",
          },
          relevantDepartments: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Department codes this notice applies to. Standard college branches are: ['CS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MCA', 'MTECH']. Return ['ALL'] if the notice is college-wide / general.",
          },
          feesAndFines: {
            type: Type.OBJECT,
            properties: {
              hasFee: { type: Type.BOOLEAN },
              amount: { type: Type.STRING },
              lateFine: { type: Type.STRING },
              paymentMode: { type: Type.STRING },
            },
            required: ["hasFee"],
          },
          contactPerson: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              designation: { type: Type.STRING },
              office: { type: Type.STRING },
              emailOrPhone: { type: Type.STRING },
            },
          },
          noticePositionOnBoard: {
            type: Type.OBJECT,
            properties: {
              locationDescription: { type: Type.STRING, description: "e.g. 'Top Left', 'Center Right', 'Full Page'" },
              estimatedBoundingBox: {
                type: Type.OBJECT,
                properties: {
                  ymin: { type: Type.INTEGER },
                  xmin: { type: Type.INTEGER },
                  ymax: { type: Type.INTEGER },
                  xmax: { type: Type.INTEGER },
                },
                required: ["ymin", "xmin", "ymax", "xmax"],
              },
            },
            required: ["locationDescription"],
          },
          originalSnippet: { type: Type.STRING, description: "Key verbatim sentence or clause from the notice" },
        },
        required: [
          "id",
          "title",
          "officialTitle",
          "department",
          "category",
          "importance",
          "whyItMatters",
          "oneLineTLDR",
          "bulletPoints",
          "actionItems",
          "deadlines",
          "targetAudience",
        ],
      },
    },
  },
  required: [
    "boardTitle",
    "scanTimestamp",
    "totalNoticesFound",
    "criticalCount",
    "highCount",
    "executiveSummary",
    "urgentBroadcastMessage",
    "notices",
  ],
};

// API Endpoint to process image or text notice board
app.post("/api/summarize-notice-board", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, rawText, scanMode } = req.body;

    if (!imageBase64 && !rawText) {
      res.status(400).json({ error: "Please provide an image of the notice/board or circular text." });
      return;
    }

    const ai = getAIClient();

    const systemInstruction = `You are a Smart Campus Notice Board Summarizer & University Circular Assistant designed for college students.
Your job is to read pictures of physical campus notice boards (which frequently have 2 to 6 multiple pinned papers/circulars on corkboards or walls) OR high-resolution pictures of single official circulars/documents.

CRITICAL INSTRUCTIONS:
1. Detect ALL distinct circulars or notices present on the notice board. If it is a photo of an entire board with multiple papers, segregate each paper into a distinct item in the 'notices' array!
2. Prioritize by Importance:
   - 'CRITICAL': Notices involving exam fee deadlines, hall ticket revocation, debarment from exams, attendance condonation cutoff, scholarship biometric verification deadline, or fines.
   - 'HIGH': Important registration windows (e.g. placement drive, course registration, semester registration, major electives).
   - 'NORMAL': General administrative notices, hostel room clearance, club events, sports, hackathons, guest lectures.
   - 'LOW': General flyers, lost & found, survey notices.
3. Student-Friendly Tone: Long academic circulars are filled with bureaucratic clauses, legal disclaimers, and formal greetings. Cut through all noise! Provide sharp, concise bullet points telling students:
   - What happened?
   - What do they need to do?
   - What is the hard deadline?
   - What is the penalty/fine if they miss it?
   - Who is eligible / who does this affect?
4. Accurate Date & Financial Details: Carefully parse all dates, times, late fee schedules, and account links.
5. Department Classification: College departments are: CS (Computer Science), ECE (Electronics & Comm), EEE (Electrical & Electronics), MECH (Mechanical), CIVIL (Civil), MCA (Master of Computer Applications), MTECH (Master of Technology), or ALL (College-Wide / General). Explicitly assign relevantDepartments for each notice (e.g. ['CS'], ['ECE'], ['MECH'], ['CIVIL'], ['EEE'], ['MCA'], ['MTECH'], or ['ALL'] if university-wide).
6. Location Description: For multi-notice boards, describe where each paper is pinned (e.g., 'Top Left with blue pushpin', 'Bottom Center', 'Top Right') and provide estimated bounding box coordinates (ymin, xmin, ymax, xmax on a 0-1000 scale).
7. Always return clean, validated JSON adhering strictly to the response schema.`;

    const contents: Array<any> = [];

    if (imageBase64) {
      // Clean base64 header if present (handles any data:image/*;base64, or other MIME prefixes)
      let cleanBase64 = imageBase64;
      const commaIdx = imageBase64.indexOf(",");
      if (imageBase64.startsWith("data:") && commaIdx !== -1) {
        cleanBase64 = imageBase64.substring(commaIdx + 1);
      } else {
        cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
      }
      const actualMime = mimeType || "image/jpeg";

      contents.push({
        inlineData: {
          mimeType: actualMime,
          data: cleanBase64.trim(),
        },
      });
    }

    const userPromptText = `Analyze this ${scanMode === 'single' ? 'single official campus circular' : 'campus notice board / circulars'}.
${rawText ? `Additional document text extracted:\n${rawText}\n` : ''}
Extract all distinct notices, categorize them, assess their importance level (especially CRITICAL items like exam fees or hall tickets), extract all deadlines, action items, and create a student-friendly bulleted digest.`;

    contents.push({ text: userPromptText });

    // Candidate models to try in order of preference if high demand (503/429) occurs
    const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let lastError: any = null;
    let responseText: string | null = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`Attempting notice board analysis with model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: NoticeBoardResponseSchema,
          },
        });

        if (response.text) {
          responseText = response.text;
          console.log(`Successfully generated analysis using ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err.message || err.toString() || "").toLowerCase();
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("unavailable") ||
          errMsg.includes("overloaded") ||
          errMsg.includes("429") ||
          errMsg.includes("resource_exhausted");

        console.warn(`Model ${modelName} encountered error:`, err.message || err);
        if (isTransient) {
          // Wait briefly before trying fallback model
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        } else {
          // Non-transient error, try next model as safety net
          continue;
        }
      }
    }

    if (!responseText) {
      let friendlyError = "AI Vision model is currently experiencing high demand. Please retry in a few moments.";
      if (lastError?.message) {
        try {
          const parsed = typeof lastError.message === "string" && lastError.message.startsWith("{")
            ? JSON.parse(lastError.message)
            : null;
          if (parsed?.error?.message) {
            friendlyError = parsed.error.message;
          } else {
            friendlyError = lastError.message;
          }
        } catch {
          friendlyError = lastError.message;
        }
      }
      throw new Error(friendlyError);
    }

    const parsedData = JSON.parse(responseText);
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Error analyzing notice board:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze notice board.",
      details: error.toString(),
    });
  }
});

// Q&A endpoint to ask questions about the notice board
app.post("/api/ask-notice", async (req: Request, res: Response) => {
  try {
    const { question, noticeContext } = req.body;

    if (!question) {
      res.status(400).json({ error: "Question is required." });
      return;
    }

    const ai = getAIClient();

    const prompt = `You are a helpful Campus Student Assistant answering a student's question about the following campus notices:
Context:
${JSON.stringify(noticeContext, null, 2)}

Student's Question: "${question}"

Instructions:
- Provide a direct, reassuring, and completely student-friendly answer in 2-4 sentences or a short bulleted list.
- Highlight specific deadlines, office numbers, portal links, or fee amounts if relevant to the question.
- If the circular does not contain the answer, specify who they should contact based on the circular's contact person or issuing authority.`;

    const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let answer: string | null = null;
    let lastErr: any = null;

    for (const m of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: prompt,
        });
        if (response.text) {
          answer = response.text;
          break;
        }
      } catch (err) {
        lastErr = err;
        continue;
      }
    }

    if (!answer) {
      throw lastErr || new Error("Unable to answer at this moment.");
    }

    res.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    console.error("Error answering notice question:", error);
    res.status(500).json({
      error: error.message || "Failed to process query.",
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
