import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req) {
  try {
    console.log("API HIT");

    const { messages } = await req.json();

    const result = await generateText({
      model: google("gemini-3.5-flash-lite"),
      messages,
    });

    return Response.json({
      text: result.text,
    });
  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return Response.json(
      {
        error: error?.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}