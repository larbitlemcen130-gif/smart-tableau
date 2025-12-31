
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBoardSuggestion = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a short, inspiring, or funny quote or sentence to write on a board. 
      The user context or theme is: "${prompt}". 
      Respond ONLY with the text of the suggestion. 
      If the user prompt is in Arabic, provide an Arabic suggestion. 
      Keep it under 15 words.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    return response.text.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return "The pen is mightier than the sword.";
  }
};
