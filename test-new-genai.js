const { GoogleGenAI } = require("@google/genai");

const apiKey = "AIzaSyBxy9CiaVztWmUAOvprvOCA9vBaLBmUlm4";

async function test() {
  console.log("Testing @google/genai with gemini-2.5-flash-image model...\n");

  try {
    const ai = new GoogleGenAI({ apiKey });

    console.log("Sending request to Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: "Generate a cute cartoon car",
    });

    console.log("\n✅ SUCCESS! Response received:");
    console.log("Candidates:", response.candidates?.length || 0);

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    console.log("Parts in response:", parts.length);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      console.log(`\nPart ${i + 1}:`);
      if (part.text) {
        console.log("  - Has text:", part.text.substring(0, 100));
      }
      if (part.inlineData) {
        console.log("  - Has inline data (image)");
        console.log("  - MIME type:", part.inlineData.mimeType);
        console.log("  - Data length:", part.inlineData.data?.length || 0, "chars (base64)");
      }
    }
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error("\nFull error:", error);
  }
}

test();
