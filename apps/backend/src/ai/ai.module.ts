import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { KafkaService } from '../kafka/kafka.service';
import { ReviewAgentModule } from '../agents/reviewAgent/review-agent.module';

@Module({
  controllers: [AIController],
  providers: [KafkaService, ReviewAgentModule],
})
export class AIModule { }
