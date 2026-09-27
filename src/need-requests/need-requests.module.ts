import { Module } from '@nestjs/common';
import { NeedRequestsController } from './need-requests.controller';
import { NeedRequestsService } from './need-requests.service';

@Module({
  controllers: [NeedRequestsController],
  providers: [NeedRequestsService],
})
export class NeedRequestsModule {}
