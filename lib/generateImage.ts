import fs from "fs";
import path from "path";
import {GoogleGenAI} from "@google/genai";

// Fix SSL cert issue: Remove NODE_EXTRA_CA_CERTS if file doesn't exist
const certPath = process.env.NODE_EXTRA_CA_CERTS;
if (certPath && !fs.existsSync(certPath)) {
    console.warn(`[Gemini] Removing invalid NODE_EXTRA_CA_CERTS: ${certPath}`);
    delete process.env.NODE_EXTRA_CA_CERTS;
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({apiKey});

export async function generateCuteImageForWord(word: string): Promise<Buffer> {
    try {
        const prompt = `
Create a single cute, colorful 1:1 illustration representing the English word: "${word}".

Style:
- Very cute, friendly, rounded shapes
- Simple, clean or pastel background
- Cartoon-like, bright colors
- Clear focus on the concept of the word
- Child-friendly and educational
`;

        console.log(`[Gemini] Generating image for word: ${word}`);

        let response = null;
        try {
            response = await ai.models.generateContent({
                model: "gemini-2.5-flash-image",
                contents: prompt,
            });
        } catch (e) {
            console.error(e);
            throw e;
        }

        console.log(`[Gemini] Response received for: ${word}`);

        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts ?? [];

        let imageBase64: string | undefined;

        // Find the image in the response parts
        for (const part of parts) {
            if (part.inlineData?.data) {
                imageBase64 = part.inlineData.data;
                break;
            }
        }

        if (!imageBase64) {
            console.error(`[Gemini] No image data in response for: ${word}`);
            console.error(`[Gemini] Response structure:`, JSON.stringify(parts, null, 2));
            throw new Error("No image data returned from Gemini");
        }

        const imageBuffer = Buffer.from(imageBase64, "base64");

        console.log(`[Gemini] Successfully generated image for: ${word}, size: ${imageBuffer.length} bytes`);
        return imageBuffer;
    } catch (error) {
        console.error(`[Gemini] Error generating image for "${word}":`, error);
        throw error;
    }
}

export function getImagePath(word: string): string {
    const safeWord = word.toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
    return path.join(process.cwd(), "public", "images", `${safeWord}.png`);
}

export function getImagePublicPath(word: string): string {
    const safeWord = word.toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
    return `/images/${safeWord}.png`;
}

export function imageExists(word: string): boolean {
    const imagePath = getImagePath(word);
    return fs.existsSync(imagePath);
}

export async function getOrGenerateImage(word: string): Promise<Buffer> {
    const imagePath = getImagePath(word);

    // Check if image already exists
    if (fs.existsSync(imagePath)) {
        return fs.readFileSync(imagePath);
    }

    // Generate new image
    const imageBuffer = await generateCuteImageForWord(word);

    // Save to disk for future use
    fs.writeFileSync(imagePath, imageBuffer);

    return imageBuffer;
}
