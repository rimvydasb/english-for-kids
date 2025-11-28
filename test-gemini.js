const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyBxy9CiaVztWmUAOvprvOCA9vBaLBmUlm4";
const genAI = new GoogleGenerativeAI(apiKey);

async function testTextGeneration() {
  console.log("Testing Gemini TEXT generation...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Say hello in 3 words");
    const response = result.response;
    const text = response.text();
    console.log("✅ TEXT generation works:", text);
  } catch (error) {
    console.error("❌ TEXT generation failed:", error.message);
  }
}

async function testImageGeneration() {
  console.log("\nTesting Gemini IMAGE generation...");
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Generate a cute car" }] }],
      generationConfig: {
        responseMimeType: "image/png",
      },
    });
    console.log("✅ IMAGE generation works!");
    console.log("Response:", JSON.stringify(result.response, null, 2));
  } catch (error) {
    console.error("❌ IMAGE generation failed:", error.message);
    console.error("Full error:", error);
  }
}

async function run() {
  await testTextGeneration();
  await testImageGeneration();
}

run();
