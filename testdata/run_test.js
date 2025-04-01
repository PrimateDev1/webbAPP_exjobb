
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { error } from "console";
import { json } from "stream/consumers";

dotenv.config(); // Load API key from .env
//const TEST_FILE = "./small_test.json"; // Correct relative path
const ITTERATIONS = 50; //n 
const LARGE_TEST_PATH = "./large_tests/";
const BATCH_PATH = "batch/";
const OUTPUT_FILE = "./test_results.json";
const CHATBOT_URL = "http://localhost:5000/chat";  //  chatbot's local API

// Function to query the chatbot
async function queryChatbot(message) {
    try {
        const response = await axios.post(CHATBOT_URL, { message });
        return response.data.reply;  // Adjust based on API response format
    } catch (error) {
        console.error("Error querying chatbot:", error);
        return "Error retrieving response";
    }
}
/*
async function runTests() {
    let testData = JSON.parse(fs.readFileSync(TEST_FILE, "utf-8"));
    let results = [];

    for (let i = 0; i < 4; i++) {
        console.log(`🔄 Iteration ${i + 1} of 4`);

        for (let test of testData) {
            console.log(`  ➤ Testing: ${test.input}`);
            let response = await queryChatbot(test.input);

            results.push({
                iteration: i + 1,
                input: test.input,
                ground_truth: test.ground_truth, // Keeping same naming
                response: response
            });
        }
    }

    // Save results
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`✅ Test results saved to ${OUTPUT_FILE}`);
}
*/

async function removeLastOccurance(aChar, currentpath) {
    console.log("removing " + aChar);
    let data = fs.readFileSync(currentpath, 'utf-8');
            const lastindex = data.lastIndexOf(aChar);
            if(lastindex !== -1){
                let replacement = "";
                if(aChar == "]"){
                    replacement = ",";
                }
                data = data.substring(0,lastindex) + replacement +  data.substring(lastindex+1);
                fs.writeFileSync(currentpath, data, 'utf-8');
                console.log("ready to append file with new tests...");
            }
            else{
                console.log("This file seem empty or broken... Need a manual check before proceeding");
                throw error;
            }


}

async function runTestJsonl(isBatch,newRun,testfile){
    let testData = JSON.parse(fs.readFileSync(testfile,"utf-8" ));
    let large_test_dir = fs.readdirSync(LARGE_TEST_PATH);
    let batchNr = large_test_dir.length;
    let currentpath;
    let filecounter = 0;
    for (let test of testData){
        console.log(`testing: ${test.input} \n`);
        let currentfile = (isBatch) ? `batchtest_${batchNr}.jsonl`:`testdata_${test.input}s.jsonl`;
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
if(arr.length > 0){
    const str1 = "batch";
    const str2 = "new";
    arr.forEach(str => {
        if(str == str1){
            isBatch = true;
        }
        else if(str == str2){
            newRun = true;
        }
        else if(str.search(".js") != -1){
            testfile = "./" + str;
        }
        else{
            console.log(`Unrecognized arg ${str}`);
        }
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
