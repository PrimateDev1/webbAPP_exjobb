// Enhanced run_test.js with file search chunk tracking
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { error } from "console";
import { json } from "stream/consumers";

dotenv.config();

const ITTERATIONS = 1;
const LARGE_TEST_PATH = "./large_tests/";
const OUTPUT_FILE = "./test_results.json";
const CHATBOT_URL = "http://localhost:5000/chat";

async function queryChatbot(message) {
    try {
        const response = await axios.post(CHATBOT_URL, { message });
        return response.data; // expects: { reply, thread_id, run_id }
    } catch (error) {
        console.error("Error querying chatbot:", error);
        return { reply: "Error retrieving response" };
    }
}

async function getFileSearchChunks(thread_id, run_id) {
    const headers = {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
    };

    try {
        const stepsUrl = `https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}/steps`;
        const stepsResponse = await axios.get(stepsUrl, { headers });
        const steps = stepsResponse.data.data;

        const fileSearchStep = steps.find(
            step => step.step_details?.tool_calls?.some(call => call.type === "file_search")
        );
        if (!fileSearchStep) return [];

        const step_id = fileSearchStep.id;
        const detailUrl = `https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}/steps/${step_id}?include[]=step_details.tool_calls[*].file_search.results[*].content`;
        const detailResponse = await axios.get(detailUrl, { headers });

        const toolCalls = detailResponse.data.step_details.tool_calls || [];

        const chunks = [];

        for (const call of toolCalls) {
            if (call.type !== "file_search") continue;
        
            for (const result of call.file_search.results || []) {
                let fileName = "unknown";
                try {
                    const fileMeta = await axios.get(`https://api.openai.com/v1/files/${result.file_id}`, { headers });
                    fileName = fileMeta.data.filename;
                } catch (err) {
                    console.warn("⚠️ Could not fetch file name for", result.file_id);
                }
        
                chunks.push({
                    file_id: result.file_id,
                    document_name: fileName,
                    score: result.score
                    // content: result.content  // leave out to reduce output size
                });
            }
        }
        

        return chunks;
    } catch (err) {
        console.error("Error fetching file search chunks:", err.message);
        return [];
    }
}

async function runTestJsonl(isBatch, newRun, testfile) {
    let testData = JSON.parse(fs.readFileSync(testfile, "utf-8"));
    let large_test_dir = fs.readdirSync(LARGE_TEST_PATH);
    let batchNr = large_test_dir.length;
    let filecounter = 0;

    for (let test of testData) {
        console.log(`testing: ${test.input}\n`);
        let currentfile = isBatch ? `batchtest_${batchNr}.jsonl` : `testdata_${test.input}s.jsonl`;
        let currentpath = path.join(LARGE_TEST_PATH, currentfile);
        process.stdout.write("\nloading: " + currentpath + "\n");

        for (let i = 0; i < ITTERATIONS; i++) {
            process.stdout.write(".");
            let chatbotResponse = await queryChatbot(test.input);
            let file_chunks = [];

            if (chatbotResponse.thread_id && chatbotResponse.run_id) {
                file_chunks = await getFileSearchChunks(chatbotResponse.thread_id, chatbotResponse.run_id);
            }

            let result = {
                iteration: filecounter,
                input: test.input,
                ground_truth: test.ground_truth,
                response: chatbotResponse.reply,
                file_chunks: file_chunks
            };

            let jsonlObj = await obj2jsonl(result);
            fs.appendFileSync(currentpath, jsonlObj);
        }
    }
}

async function obj2jsonl(obj) {
    let builder = new StringBuilder();
    builder.append("{");
    Object.entries(obj).forEach(([key, value]) => {
        builder.append('"' + key + '"');
        builder.append(":");
        builder.append(JSON.stringify(value));
        builder.append(",");
    });
    let jsonl = await removeLastChar(",", builder.toString());
    jsonl = await removeAllChar('\n', jsonl);
    return jsonl + "}\n";
}

async function removeLastChar(aChar, aString) {
    const lastindex = aString.lastIndexOf(aChar);
    return lastindex !== -1 ? aString.slice(0, lastindex) + aString.slice(lastindex + 1) : aString;
}

async function removeAllChar(aChar, aString) {
    return aString.split(aChar).join('');
}

class StringBuilder {
    constructor() {
        this.parts = [];
    }
    append(str) {
        this.parts.push(str);
        return this;
    }
    toString() {
        return this.parts.join("");
    }
}

let isBatch = false;
let newRun = false;
let testfile = "";
const arr = process.argv.slice(2);
if (arr.length > 0) {
    arr.forEach(str => {
        if (str === "batch") isBatch = true;
        else if (str === "new") newRun = true;
        else if (str.search(".js") !== -1) testfile = "./" + str;
        else console.log(`Unrecognized arg ${str}`);
    });
}

runTestJsonl(isBatch, newRun, testfile).catch(console.error);
