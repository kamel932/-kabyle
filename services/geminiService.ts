
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async transformToKabyle(base64Image: string, userPrompt?: string): Promise<{ imageUrl: string; text: string }> {
    const mimeType = base64Image.split(';')[0].split(':')[1];
    const base64Data = base64Image.split(',')[1];

    const prompt = `
      Task: Sophisticated Image Editing & Face Generation.
      Target: Add a WHOLE, COMPLETE, and beautiful Amazigh Kabyle face to the woman in the provided image.
      
      CRITICAL INSTRUCTIONS:
      - The woman in the original image does not show her face (it is obscured, turned away, or missing).
      - You must generate and add a FULL FACE—including eyes, nose, lips, and full facial structure. Do not just add parts; create a whole identity.
      - The face should have distinct, beautiful Kabyle features (Mediterranean skin tone, expressive eyes).
      - Ensure the face is perfectly aligned and integrated with the woman's head, hair, and body posture in the original photo.
      - Incorporate high-quality traditional Kabyle silver jewelry (Thajmilt/Tabzimt) with colorful enamel work.
      - Maintain a professional, artistic, and culturally respectful aesthetic.
      
      User Specific Instruction: ${userPrompt || "Focus on a complete, authentic transformation with traditional jewelry."}
    `;

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const textPart = {
      text: prompt
    };

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [imagePart, textPart] },
      });

      let imageUrl = '';
      let text = '';

      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          } else if (part.text) {
            text = part.text;
          }
        }
      }

      if (!imageUrl) {
        throw new Error("No image was returned from the AI.");
      }

      return { imageUrl, text: text || "Your Kabyle transformation is complete. A full face has been generated and integrated." };
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
