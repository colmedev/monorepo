import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AIModule } from './ai/ai.module';
import { ReviewAgentModule } from './agents/reviewAgent/review-agent.module';

@Module({
  imports: [AIModule, ReviewAgentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
