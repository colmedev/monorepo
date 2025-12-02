import { Module, OnModuleInit } from '@nestjs/common';
import { startReviewAgent } from './index';

@Module({})
export class ReviewAgentModule implements OnModuleInit {
    async onModuleInit() {
        await startReviewAgent().catch(err =>
            console.error('Failed to start ReviewAgent:', err)
        );
    }
}
