import { tool, generateText } from "ai";
import { modelAgent } from "src/shared/libs/models/model-ai";


import { Kafka } from "kafkajs";

export const startReviewAgent = async () => {
    const kafka = new Kafka({
        clientId: 'review-agent',
        brokers: ['localhost:9092'],
    });
    const consumer = kafka.consumer({ groupId: 'review-agent' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'topic-a', fromBeginning: false });
    const activeChats = new Map<string, { timer: NodeJS.Timeout, messages: string[] }>();

    await consumer.run({
        eachBatch: async ({ batch }) => {
            for (const message of batch.messages) {
                const messageValue = message.value?.toString();
                if (!messageValue) continue;

                // Try to parse chatId from message, otherwise use default
                let chatId = 'default';
                try {
                    const parsed = JSON.parse(messageValue);
                    if (parsed.chatId) chatId = parsed.chatId;
                } catch (e) {
                    // Not JSON, treat as plain text
                }

                // Get or create chat buffer
                if (!activeChats.has(chatId)) {
                    activeChats.set(chatId, { timer: null!, messages: [] });
                }
                const chatData = activeChats.get(chatId)!;

                // Add message to buffer
                chatData.messages.push(messageValue);

                // Clear existing timer
                if (chatData.timer) {
                    clearTimeout(chatData.timer);
                }

                // Set new heartbeat timer (10 seconds)
                chatData.timer = setTimeout(async () => {
                    const fullContext = chatData.messages.join('\n');
                    activeChats.delete(chatId); // Clear buffer after processing

                    console.log(`[ReviewAgent] Analyzing context for chat ${chatId}...`);

                    try {
                        const { text } = await generateText({
                            model: modelAgent,
                            prompt: `You are a tracking agent (agente de seguimiento). Analyze the following interaction/review and provide a detailed response about the quality and content of the interaction:\n\n${fullContext}`,
                        });
                        console.log(`[ReviewAgent] Analysis result for ${chatId}:`, text);
                    } catch (error) {
                        console.error(`[ReviewAgent] Error generating analysis for ${chatId}:`, error);
                    }
                }, 20000);
            }
        },
    });
};
