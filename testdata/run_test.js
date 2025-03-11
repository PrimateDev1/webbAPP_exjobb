import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load API key from .env

const TEST_FILE = "./testData.json"; // Correct relative path
const OUTPUT_FILE = "./test_results.json";
const CHATBOT_URL = "http://localhost:5000/chat"; // Chatbot's local API
const ITERATIONS = 100; // Number of times to run the test

// Function to query the chatbot
async function queryChatbot(message) {
    try {
        const response = await axios.post(CHATBOT_URL, { message });
        return response.data.reply; // Adjust based on API response format
    } catch (error) {
        console.error("Error querying chatbot:", error);
        return "Error retrieving response";
    }
}

// Run tests multiple times
async function runTests() {
    let testData = JSON.parse(fs.readFileSync(TEST_FILE, "utf-8"));
    let results = [];

    for (let i = 0; i < ITERATIONS; i++) {
        console.log(`🔄 Iteration ${i + 1} of ${ITERATIONS}`);

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

// Run test script
runTests().catch(console.error);
