// Enhanced run_test.js with file search chunk tracking
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { error } from "console";
import { json } from "stream/consumers";

dotenv.config(); // Load API key from .env
//const TEST_FILE = "./small_test.json"; // Correct relative path
const ITTERATIONS = 10; //n 
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

async function runTestJsonl(isBatch,newRun,testfile){
    let testData = JSON.parse(fs.readFileSync(testfile,"utf-8" ));
    let currentpath;
    let filecounter = 0;
    for (let test of testData){
        console.log(`testing: ${test.input} \n`);
        let currentfile = (isBatch) ? "batchtest.jsonl":`testdata_${test.input}s.jsonl`;
        currentpath = path.join(LARGE_TEST_PATH, currentfile);
        process.stdout.write("\nloading: " + currentpath.toString() + "\n");
        for(let i = 0; i< ITTERATIONS; i++){
            process.stdout.write(".");
            let response = await queryChatbot(test.input);
            let result = {
                iteration:filecounter,
                input:test.input,
                ground_truth: test.ground_truth,
                response: response
            };
            let jsonlObj = await obj2jsonl(result);
            fs.appendFileSync(currentpath, jsonlObj);


        }

        
    }
}

async function obj2jsonl(obj){
    let builder = new StringBuilder();
    builder.append("{");
    Object.entries(obj).forEach(([key,value]) =>{
        builder.append('"' + key + '"' );
        builder.append(":")
        builder.append('"' + value + '"');
        builder.append(",");
    });
    let jsonl = await removeLastChar(",", builder.toString());
    jsonl = await removeAllChar('\n', jsonl);
    return jsonl +"}\n";
    
}

async function removeSpecialWhitespace(aString) {
    return aString.replace(/[\t\n\r\f\v]/g, ' ');
}

async function removeAllChar(aChar, aString) {
    return aString.split(aChar).join('');
}

async function removeLastChar(aChar, aString){
    const lastindex = aString.lastIndexOf(aChar);
    return lastindex !== -1 ? aString.slice(0,lastindex) + aString.slice(lastindex+1): aString;
}

async function runTests(isBatch, newRun, testfile) {
    let testData = JSON.parse(fs.readFileSync(testfile, "utf-8"));
    let filecounter = 1;
    let currentpath;
    let flag = true;
    for (let test of testData) {
        console.log(`Testing: ${test.input} \n`);
        let currentfile = `testdata_${test.input}.json`;
        if(isBatch){
            currentfile = "batchtest.json";
        }
        currentpath = path.join(LARGE_TEST_PATH, currentfile);
        console.log(newRun);
        console.log(flag);
        if(newRun && flag){
            fs.writeFileSync(currentpath, "[\n");
            flag = false;
        }
        else if(!newRun){
            removeLastOccurance("]", currentpath);
        }
            
        for (let i = 0; i<ITTERATIONS; i++){
            if(i % 2 == 0){
                console.log("loading....");
            }
            let response = await queryChatbot(test.input);
            let result = {
                iteration:filecounter,
                input:test.input,
                ground_truth: test.ground_truth,
                response: response
            };
            console.log(currentpath);
            fs.appendFileSync(currentpath, JSON.stringify(result, null, 2));
            fs.appendFileSync(currentpath, ",\n");
            console.log( `Wrote to: ${currentpath} `);
        }
        ++filecounter;
        console.log(`Testing: ${test.input} is done...`);
        if(!isBatch){
            removeLastOccurance(",", currentpath);
            fs.appendFileSync(currentpath, "\n]");
        }
    flag = true;
    }
    
    if(isBatch){
        removeLastOccurance(",", currentpath);
        fs.appendFileSync(currentpath, "\n]");
    }
    console.log("all tests done in this run");
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

class StringBuilder {
    constructor() {
      this.parts = [];
    }
  
    append(str) {
      this.parts.push(str);
      return this; // For method chaining
    }
  
    toString() {
      return this.parts.join("");
    }
  }


runTestJsonl(isBatch,newRun, testfile).catch(console.error);
