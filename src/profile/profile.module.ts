import { Module } from '@nestjs/common';
import { PushModule } from '../push/push.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [PushModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
