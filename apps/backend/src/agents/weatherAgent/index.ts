import { google } from '@ai-sdk/google';
import { ToolLoopAgent } from 'ai';

export const weatherAgent = new ToolLoopAgent({
    model: google('gemini'),
    instructions: 'You are a helpful weather assistant.',

});

