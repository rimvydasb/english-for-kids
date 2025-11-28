const { GoogleGenAI } = require("@google/genai");

const apiKey = "AIzaSyBxy9CiaVztWmUAOvprvOCA9vBaLBmUlm4";

async function testText() {
  console.log("Testing text generation with gemini-2.0-flash...\n");

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say hello in 3 words",
    });

    console.log("✅ Text generation works!");
    console.log("Response:", response.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (error) {
    console.error("❌ Text generation failed:", error.message);
  }
}

async function testImageList() {
  console.log("\n\nListing available models...\n");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const models = await ai.models.list();

    console.log("Available models:");
    models.forEach(model => {
      if (model.name.includes('image') || model.name.includes('flash')) {
        console.log(`  - ${model.name}`);
      }
    });
  } catch (error) {
    console.error("❌ Failed to list models:", error.message);
  }
}

async function run() {
  await testText();
  await testImageList();
}

run();
