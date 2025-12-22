
import { GoogleGenAI } from "@google/genai";

export async function getStudyAdvice(prompt: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful student academic advisor. Provide concise, encouraging, and actionable study advice based on the student's input. Use markdown formatting for clarity.",
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my academic records right now. Please try again later!";
  }
}
