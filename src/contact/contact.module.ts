import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { MessagesModule } from '../messages/messages.module';
import { ContactService } from './contact.service';

@Module({
  imports: [MessagesModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
