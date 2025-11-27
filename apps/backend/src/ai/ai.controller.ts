import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { streamText, convertToModelMessages, type UIMessage, pipeAgentUIStreamToResponse } from 'ai';
import { OrchestadorAgent } from 'src/agents/OrchestadorAgent';


@Controller('ai')
export class AIController {

  @Post('chat')
  async chat(@Body() body: { messages: UIMessage[] }, @Res() res: Response) {
    // Pipe agent UI stream to response (compatible with useChat)

    return pipeAgentUIStreamToResponse({
      agent: OrchestadorAgent,
      messages: body.messages,
      response: res,
    });
  }
}