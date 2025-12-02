import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'kafka-test-app',
      brokers: ['localhost:9092'],
    });

    this.consumer = this.kafka.consumer({ groupId: 'test-group' });
  }

  async onModuleInit() {
    await this.connect();
    await this.consumeMessages();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect() {
    await this.consumer.connect();
  }

  async disconnect() {
    await this.consumer.disconnect();
  }

  async consumeMessages() {
    await this.consumer.subscribe({ topic: 'topic-a', fromBeginning: true });

    // await this.consumer.run({
    //   eachMessage: async ({ topic, partition, message }) => {
    //     console.log({
    //       topic,
    //       partition,
    //       offset: message.offset,
    //       value: message.value?.toString(),
    //     });
    //   },
    // });
  }
}
