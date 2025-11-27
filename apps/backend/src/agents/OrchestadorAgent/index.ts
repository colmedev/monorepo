import { ToolLoopAgent } from "ai";
import { modelAgent } from "src/shared/libs/models/model-ai";

export const OrchestadorAgent = new ToolLoopAgent({
    model: modelAgent,
    instructions: "You are a helpful assistant.",
    tools: {},
});
