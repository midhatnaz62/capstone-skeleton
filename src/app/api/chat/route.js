import { generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(req) {
  try {
    console.log("API HIT");

    const { messages } = await req.json();

    const lastMessage = messages[messages.length - 1];

    // Check lead values before sending them to the AI
    if (lastMessage?.role === "user") {
      const content = lastMessage.content || "";

      const match = content.match(
        /interest\s*(?:is|of|:)?\s*(\d+(?:\.\d+)?)\D+budget\s*(?:is|of|:)?\s*(\d+(?:\.\d+)?)/i
      );

      if (match) {
        const interest = Number(match[1]);
        const budget = Number(match[2]);

        if (
          interest < 0 ||
          interest > 10 ||
          budget < 0 ||
          budget > 10
        ) {
          return Response.json({
            text: `Invalid lead information.

Interest and budget must both be between 0 and 10.

You entered:

- Interest: ${interest}
- Budget: ${budget}

Please provide values between 0 and 10.`,
            toolResults: [],
          });
        }
      }
    }

    const result = await generateText({
      model: google("gemini-3.5-flash-lite"),

      system: `You are a helpful AI assistant and lead qualification assistant.

Answer normal questions normally.

When the user asks to calculate, score, qualify, rate, or evaluate a lead, you MUST use the leadScore tool.

Never calculate the lead score yourself.

The leadScore tool accepts interest and budget values only from 0 to 10.`,

      messages,

      tools: {
        leadScore: tool({
          description:
            "Calculate a lead score from 0 to 100 based on lead information.",

          inputSchema: z.object({
            name: z.string(),
            company: z.string(),
            interest: z.number().min(0).max(10),
            budget: z.number().min(0).max(10),
          }),

          execute: async ({
            name,
            company,
            interest,
            budget,
          }) => {
            const score = Math.round(
              ((interest + budget) / 20) * 100
            );

            return {
              name,
              company,
              score,
              label:
                score >= 70
                  ? "High potential"
                  : score >= 40
                  ? "Medium potential"
                  : "Low potential",
            };
          },
        }),
      },

      maxOutputTokens: 500,
    });

    console.log("TEXT:", result.text);
    console.log("TOOL RESULTS:", result.toolResults);

    let finalText = result.text;

    if (!finalText && result.toolResults?.length > 0) {
      const toolData = result.toolResults[0];

      finalText = `
### Lead Qualification Result

**Name:** ${toolData.output.name}

**Company:** ${toolData.output.company}

**Score:** ${toolData.output.score}/100

**Status:** ${toolData.output.label}
`;
    }

    return Response.json({
      text: finalText || "No response generated.",
      toolResults: result.toolResults || [],
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