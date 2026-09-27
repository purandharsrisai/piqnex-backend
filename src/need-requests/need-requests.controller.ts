import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNeedRequestDto } from './dto/create-need-request.dto';
import { MatchNeedRequestsQueryDto } from './dto/match-need-requests-query.dto';
import { UpdateNeedRequestStatusDto } from './dto/update-need-request-status.dto';
import { NeedRequestsService } from './need-requests.service';

@Controller('need-requests')
export class NeedRequestsController {
  constructor(private readonly needRequestsService: NeedRequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateNeedRequestDto,
  ) {
    return this.needRequestsService.create(user.id, dto);
  }

  @Get('match')
  match(@Query() query: MatchNeedRequestsQueryDto) {
    return this.needRequestsService.getOpenMatches(query);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNeedRequestStatusDto,
  ) {
    return this.needRequestsService.updateStatus(id, user.id, dto.status);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.needRequestsService.remove(id, user.id);
  }
}
