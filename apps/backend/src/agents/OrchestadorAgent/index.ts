import { ToolLoopAgent } from "ai";
import { modelAgent } from "src/shared/libs/models/model-ai";
import { ReviewAgent } from "../reviewAgent/index.";

export const OrchestadorAgent = new ToolLoopAgent({
    model: modelAgent,
    instructions: "You are a helpful assistant.",
    tools: {
        reviewAgent: ReviewAgent,
    },
});
