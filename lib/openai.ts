import OpenAI from "openai";

// 1. Typo fixed (OPENAI_API_KEY) aur build crash se bachne ke liye fallback lagaya
const apiKey = process.env.OPENAI_API_KEY || "placeholder_key_for_build";

export const openai = new OpenAI({
  apiKey: apiKey,
});