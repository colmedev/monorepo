// Kafka service removed per user request. Implement later when ready.
import { Injectable } from '@nestjs/common';

@Injectable()
export class KafkaService {
  // Placeholder: no-op service until Kafka is implemented.
  connect(): Promise<string> {
    return Promise.resolve('Kafka removed - reimplement when ready');
  }

  consumer(): Promise<string> {
    return Promise.resolve('Kafka removed - reimplement when ready');
  }

  getKafkaInstance(): unknown {
    return null;
  }
}
