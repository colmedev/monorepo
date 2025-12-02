import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { KafkaService } from '../kafka/kafka.service';

@Module({
  controllers: [AIController],
  providers: [KafkaService],
})
export class AIModule { }
