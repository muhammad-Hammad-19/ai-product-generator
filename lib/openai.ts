import OpenAI from "openai"; // OpenAI import kiya

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dbbc0c8701msh0a74ca02f94c68ap16d88ejsnd71a2d04f8b4',
});