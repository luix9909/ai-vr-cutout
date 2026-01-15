
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function processImageWithAI(base64Image: string): Promise<{ suggestion: string; isPerson: boolean }> {
  try {
    // Using the recommended generateContent parameters and responseSchema for Gemini 3
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: "Analyze this image. Is there a prominent person or object in the center? Provide a short description of the subject and confirm if it's a person.",
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestion: {
              type: Type.STRING,
              description: 'A short description of the subject found in the image.',
            },
            isPerson: {
              type: Type.BOOLEAN,
              description: 'Whether the subject is identified as a person.',
            }
          },
          required: ['suggestion', 'isPerson'],
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      suggestion: result.suggestion || 'Object identified',
      isPerson: result.isPerson || false
    };
  } catch (error) {
    console.error("Gemini processing error:", error);
    return { suggestion: 'Error processing', isPerson: false };
  }
}

/**
 * Note: Real-time background removal is best done with CSS/Canvas techniques 
 * because Gemini doesn't return raw transparent bytes easily. 
 * We use Gemini to "validate" the content and optimize the placement context.
 */
