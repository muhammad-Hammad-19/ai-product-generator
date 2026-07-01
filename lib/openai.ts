import OpenAI from "openai"; // OpenAI import kiya

export const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});
