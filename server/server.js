// Import Required Modules
import path from "path";
import OpenAI from "openai";
import fs from "fs";
import { WebSocketServer } from "ws";
import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

// Load Environment Variables
dotenv.config();

// OpenAI API Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let assistantId = null;

// ✅ Express App Setup
const app = express();
const PORT = 5000;

// ✅ Enable CORS for frontend (React on port 3000)
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST",
    allowedHeaders: "Content-Type"
}));

app.use(express.json());
// ✅ Chatbot API Endpoint (Fix for 404 Error)
app.post("/chat", async (req, res) => {
    console.log("Activating chatbot...");
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  if (!assistantId) {
      return res.status(500).json({ error: "Assistant is still initializing. Please try again later." });
  }

  try {
      const threadId = await createThread(message);
      const response = await runAssistant(threadId, assistantId);

      res.json({ reply: response });
  } catch (error) {
      console.error("OpenAI API Error:", error);
      res.status(500).json({ error: "Failed to fetch chatbot response" });
  }
});

// ✅ WebSocket Server Setup
const server = app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    console.log("✅ Client connected");

    ws.on("message", async (message) => {
        console.log("📩 Received from client:", message.toString());

        if (!assistantId) {
            console.log("⚠️ Assistant not ready yet.");
            ws.send("⚠️ Assistant is still initializing. Please wait...");
            return;
        }

        try {
            const threadId = await createThread(message.toString());
            const response = await runAssistant(threadId, assistantId);

            console.log("🤖 AI Response:", response);
            ws.send(response);
        } catch (error) {
            console.error("❌ Error processing AI request:", error);
            ws.send("⚠️ Error communicating with AI. Please try again.");
        }
    });

    ws.on("close", () => console.log("❌ Client disconnected"));
});

// ✅ Create an Assistant
async function createAssistant() {
    const assistant = await openai.beta.assistants.create({
        name: "Real-Time AI Assistant",
        instructions: "  Du är en hjälpsam AI-assistent. Följ alltid riktlinjerna i 'instructions.txt'. Använd endast verifierad information från dokumenten som finns tillgängliga via file_search. Om relevant information inte finns tillgänglig, säg att informationen inte finns. Svara alltid på svenska.",
        model: "gpt-4o-mini",
        tools: [{ type: "file_search" }],
       
    });

    console.log("✅ Assistant Created:", assistant.id);
    return assistant.id;
}

// ✅ Upload Files to Vector Store. not really needed right know cuz its managed online
  async function uploadFiles() {
    const existingStores = await openai.beta.vectorStores.list();
    let vectorStoreId;

    if (existingStores.data.length > 0) {
        vectorStoreId = existingStores.data[0].id;
        console.log("🔍 Using Existing Vector Store:", vectorStoreId);
    } else {
        vectorStoreId = (await openai.beta.vectorStores.create({ name: "Knowledge Base" })).id;
        console.log("📂 Created new Vector Store:", vectorStoreId);
    }

    /*
    const filePath = path.resolve("sjukdomar-och-åtgärder.txt");
    if (!fs.existsSync(filePath)) {
        console.error("❌ File does not exist at path:", filePath);
        return vectorStoreId;
    }
    
    let uploadedFile;
    try {
        uploadedFile = await openai.files.create({
            file: fs.createReadStream(filePath),
            purpose: "assistants",
        });
        console.log("✅ File uploaded to OpenAI storage:", uploadedFile.id);
    } catch (error) {
        console.error("❌ File upload to OpenAI failed:", error);
        return vectorStoreId;
    }

    await openai.beta.vectorStores.files.createAndPoll(vectorStoreId, {
        file_id: uploadedFile.id,
    });
    console.log("✅ File successfully linked to Vector Store.");
    */
    return vectorStoreId;
}

// ✅ Attach Vector Store to Assistant
async function updateAssistant(assistantId, vectorStoreId) {
    await openai.beta.assistants.update(assistantId, {
        tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
    });

    console.log("✅ Assistant Updated to Use Vector Store");
}

// ✅ Create a Thread for Messages
async function createThread(userQuestion) {
    const thread = await openai.beta.threads.create({
        messages: [{ role: "user", content: userQuestion }],
    });

    console.log("✅ Thread Created:", thread.id);
    return thread.id;
}

// ✅ Run Assistant to Get AI Response
async function runAssistant(threadId, assistantId) {
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
        tools: [{ type: "file_search" }],
        temperature: 0.3, 
    });
    
    console.log("🛠 AI Run Details:", JSON.stringify(run, null, 2));
    
    if (run.status !== "completed") {
        console.error("❌ Assistant run failed:", run);
        return `⚠️ AI run failed with status: ${run.status} - ${run.last_error?.message || "Unknown error"}`;
    }
    

    const messages = await openai.beta.threads.messages.list(threadId, {
        run_id: run.id,
        limit: 5 // ✅ Only fetch last 5 messages
    });
    

    if (!messages.data.length) {
        console.error("❌ No response messages found in AI output.");
        return "⚠️ No response from AI.";
    }

    let aiResponse = messages.data.pop().content[0].text?.value || "⚠️ No valid response.";
    aiResponse = aiResponse.replace(/【\d+:\d+†[a-zA-Z]+】/g, '');

    return aiResponse;
}
//memory structure for answers
let currentAnswers = {};

// Store answer from frontend
app.post("/api/answer", (req, res) => {
    const { questionId, answer } = req.body;
    currentAnswers[questionId] = answer;
    console.log("Answer saved:", currentAnswers);
    res.sendStatus(200);
  });
  
  // Reset answers at start of form
  app.post("/api/reset", (req, res) => {
    currentAnswers = {};
    console.log("Answers reset.");
    res.sendStatus(200);
  });
  
  app.get("/api/answers", (req, res) => {
    console.log("SENDING ANSWERS::::::::");
    res.json(currentAnswers);
  });
  
// ✅ Run Setup (Assistant + Vector Store)
async function setup() {
    assistantId = await createAssistant();
    const vectorStoreId = await uploadFiles();
    await updateAssistant(assistantId, vectorStoreId);
    console.log("✅ Assistant & Vector Store Ready!");
}

setup();
