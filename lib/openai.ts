import OpenAI from "openai"; // OpenAI import kiya

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});