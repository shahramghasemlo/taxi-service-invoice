import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LineItem } from "../types";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const lineItemsSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING, description: "Description of the service, route, or car type" },
      quantity: { type: Type.NUMBER, description: "Number of trips or hours" },
      rate: { type: Type.NUMBER, description: "Unit price per trip or hour" },
    },
    required: ["description", "quantity", "rate"],
  },
};

export const generateLineItemsFromText = async (prompt: string): Promise<Omit<LineItem, 'id'>[]> => {
  if (!ai) {
    console.warn("Google Gemini API Key is missing.");
    throw new Error("API Key تنظیم نشده است. لطفاً کلید API را در فایل .env اضافه کنید.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract invoice line items for a taxi or airport transfer service from this text. Identify routes (Origin to Destination), car types (e.g., Toyota, Van), waiting times, or extra services. If no specific quantity is given, assume 1. If no currency/price is given, estimate a reasonable placeholder value in Rials. Translate descriptions to Persian. Text: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: lineItemsSchema,
        systemInstruction: "You are a helpful accounting assistant for a transportation and taxi company that extracts structured invoice data from unstructured text.",
      },
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text) as Omit<LineItem, 'id'>[];
  } catch (error) {
    console.error("Error generating line items:", error);
    throw error;
  }
};