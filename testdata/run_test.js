import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load API key from .env
const TEST_FILE = "./testData.json"; // Correct relative path
 

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

// Run tests
async function runTests() {
    let testData = JSON.parse(fs.readFileSync(TEST_FILE, "utf-8"));

    for (let test of testData) {
        console.log(`Testing: ${test.input}`);
        test.response = await queryChatbot(test.input);
    }

    // Save results
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(testData, null, 2));
    console.log(`✅ Test results saved to ${OUTPUT_FILE}`);
}

// Run test script
runTests().catch(console.error);
