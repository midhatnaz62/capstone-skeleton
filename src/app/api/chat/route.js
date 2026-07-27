import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req) {
  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages,
  });

  return result.toDataStreamResponse();
}