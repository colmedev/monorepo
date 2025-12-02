import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { streamText, convertToModelMessages, type UIMessage, pipeAgentUIStreamToResponse } from 'ai';
import { OrchestadorAgent } from 'src/agents/OrchestadorAgent';
import { Kafka } from 'kafkajs';


@Controller('ai')
export class AIController {

  private readonly kafka: Kafka;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'kafka-test-app',
      brokers: ['localhost:9092'],
    });
  }

  @Post('chat')
  async chat(@Body() body: { messages: UIMessage[] }, @Res() res: Response) {
    // Pipe agent UI stream to response (compatible with useChat)

    console.log(
      body.messages.map((message) =>
        message.parts
          .filter((part) => part.type === 'text')
          .map((part) => part.text)
      ),
    );

    const messageText = body.messages.map((message) =>
      message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
    );

    const producer = this.kafka.producer();
    await producer.connect();
    const topicMessages = messageText.map((message) => ({
      topic: 'topic-a',
      messages: [{ key: 'key-1', value: message.join('') }],
    }));
    await producer.sendBatch({ topicMessages });
    await producer.disconnect();

    return pipeAgentUIStreamToResponse({
      agent: OrchestadorAgent,
      messages: body.messages,
      response: res,
    });
  }
}