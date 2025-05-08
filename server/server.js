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
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  if (!assistantId) {
      return res.status(500).json({ error: "Assistant is still initializing. Please try again later." });
  }

  try {
    const threadId = await createThread(message);
    const { reply, run_id } = await runAssistant(threadId, assistantId);
    
    res.json({
        reply,
        thread_id: threadId,
        run_id: run_id
    });
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
        instructions: `You are a helpful and knowledgeable AI assistant trained to answer questions about blood donation eligibility in Sweden. Your purpose is to deliver short, factual, regulation-based answers to individuals who want to know whether they can donate blood under specific circumstances.

        GENERAL:
        - Always respond briefly, clearly, and professionally.
        - Provide only factual information sourced from the assigned files.
        - If you're uncertain or data is missing, reply: "Jag har tyvärr inte svaret på din fråga, var god kontakta blodcentralen för mer information."
        - If the question is unrelated to blood donation eligibility, respond: "Jag har tyvärr ingen information om detta" or "Jag kan bara hjälpa till med regler för blodgivning."
        - Avoid speculation and never guess.
        - Ask for clarification if the user's input is vague.
        - If the condition itself is approved, always include a note that any medication or treatment may still affect blood donation eligibility (No reminder for vaccine-related questions).
        
        VACCINATION-RELATED QUESTIONS:
        - Search exclusively in: vacciner_text_istallet.txt.
        - Respond with all relevant deferral (karens) periods.
        - Include all applicable deferral periods when there are multiple.
        - Only state when blood donation is allowed again.
        - If no info found: "Jag har tyvärr inte svaret på din fråga, var god kontakta blodcentralen för mer information."
        - If unclear which vaccine: "Kan du förtydliga vilken vaccination du har tagit?"
        
        ILLNESS OR TREATMENT-RELATED QUESTIONS:
        - First, search in: förenkladeReglerLättFormat.txt.
        - If no relevant information is found there, then search in: sjukdomar-och-åtgärder.txt.
        - Never answer from outside the documents.
        - Use the fallback message if nothing is found.
        
        OUTPUT FORMAT:
        - Respond in swedish.
        - Respond in plain text, not markdown or XML.
        - Be informative but avoid unnecessary detail (e.g. do not explain what a disease is).
        - Do not include unrelated facts or general medical descriptions.
        - The length of the response may vary depending on context, but aim to keep it efficient and focused.
        - Clearly state eligibility and any waiting period.
        - IF approved for blod donation, include a reminder that any ongoing or recent medication may influence eligibility (No reminder for vaccine-related questions).
        
        CLARIFICATION PROMPTS:
        - If vague, ask: "Kan du förtydliga vilken vaccination du har tagit?"
        
        CONTEXT:
        - vacciner_text_istallet.txt: Rules for vaccination-related deferral.
        - förenkladeReglerLättFormat.txt: Primary rules for illness and treatment-related eligibility.
        - sjukdomar-och-åtgärder.txt: Secondary source for illness and treatment eligibility if not found in the simplified rules.
        
        FINAL REMINDER:
        - Be concise.
        - Stick to known rules.
        - Do not speculate.
        - Ask for clarification if necessary.
        - Use fallback phrase if no rule applies.
        - If the question is unrelated to donation rules, respond with: "Jag kan bara hjälpa till med regler för blodgivning."
        - Always mention that ongoing or recent medications may affect eligibility, even for approved conditions.
        - Avoid elaborating on background medical information unless it directly affects eligibility.`
        
        ,
        model: "gpt-4o-mini",
         tools: [{
               type: "file_search",
               file_search: {
                 ranking_options: {
                   ranker: "auto",            // or "default_2024_08_21"
                   score_threshold: 0.1        // Adjust between 0.0 and 1.0 (higher = stricter)
                 }
               }
             }],
    });

    console.log("✅ Assistant Created:", assistant.id);
    return assistant.id;
}


// ✅ Upload Files to Vector Store
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
    });

    const messages = await openai.beta.threads.messages.list(threadId, {
        run_id: run.id,
    });

    let aiResponse = messages.data.pop().content[0].text.value;
    aiResponse = aiResponse.replace(/【\d+:\d+†[a-zA-Z]+】/g, '');
    return {
        reply: aiResponse,
        run_id: run.id
    };
}

// ✅ Run Setup (Assistant + Vector Store)
async function setup() {
    assistantId = await createAssistant();
    const vectorStoreId = await uploadFiles();
    await updateAssistant(assistantId, vectorStoreId);
    console.log("✅ Assistant & Vector Store Ready!");
}

setup();
