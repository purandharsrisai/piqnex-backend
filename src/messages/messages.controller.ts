import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.messages.list(user.id);
  }

  // Declared before ':id' so "unread-count" isn't parsed as a UUID.
  @Get('unread-count')
  unread(@CurrentUser() user: AuthenticatedUser) {
    return this.messages.unreadCount(user.id);
  }

  @Get(':id')
  thread(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.messages.thread(id, user.id);
  }

  @Post(':id/messages')
  reply(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendMessageDto,
  ) {
    return this.messages.reply(id, user.id, dto.body);
  }
}
