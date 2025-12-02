import { tool, generateText } from "ai";
import { modelAgent } from "src/shared/libs/models/model-ai";
import { z } from "zod";

export const ReviewAgent = tool({
    description: "You are a tracking agent. You will be given a conversation context (review) and you will have to analyze the interaction between the user and the agent.",
    inputSchema: z.object({
        review: z.string().describe("The conversation context or review to be analyzed."),
    }),
    execute: async ({ review }) => {
        const { text } = await generateText({
            model: modelAgent,
            prompt: `You are a tracking agent (agente de seguimiento). Analyze the following interaction/review and provide a detailed response about the quality and content of the interaction: ${review}`,
        });
        console.log(text);
        return text;
    },
});
