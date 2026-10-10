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
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { SafetyService } from './safety.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class SafetyController {
  constructor(private readonly safety: SafetyService) {}

  @Post('reports')
  report(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReportDto) {
    return this.safety.report(user.id, dto);
  }

  @Get('blocks')
  blocks(@CurrentUser() user: AuthenticatedUser) {
    return this.safety.listBlocks(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('blocks/:userId')
  block(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.safety.block(user.id, userId);
  }

  @Delete('blocks/:userId')
  unblock(
    @CurrentUser() user: AuthenticatedUser,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.safety.unblock(user.id, userId);
  }

  @UseGuards(AdminGuard)
  @Get('admin/reports')
  adminList(@Query('status') status?: string) {
    return this.safety.adminList(status);
  }

  @UseGuards(AdminGuard)
  @Patch('admin/reports/:id')
  adminSet(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.safety.adminSetStatus(id, dto.status);
  }
}
