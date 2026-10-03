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
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateListingStatusDto } from '../listings/dto/update-listing-status.dto';
import { UpdateNeedRequestStatusDto } from '../need-requests/dto/update-need-request-status.dto';
import { AdminService } from './admin.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  overview() {
    return this.adminService.getOverview();
  }

  @Get('listings')
  listings(@Query() query: PaginationQueryDto) {
    return this.adminService.getAllListings(query.page);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('listings/:id/status')
  setListingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateListingStatusDto,
  ) {
    return this.adminService.setListingStatus(id, dto.status);
  }

  @Get('need-requests')
  needRequests(@Query() query: PaginationQueryDto) {
    return this.adminService.getAllNeedRequests(query.page);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('need-requests/:id/status')
  setNeedRequestStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNeedRequestStatusDto,
  ) {
    return this.adminService.setNeedRequestStatus(id, dto.status);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('need-requests/:id')
  deleteNeedRequest(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteNeedRequest(id);
  }

  // Users, roles, and the catalog are Admin-only - a Moderator can act on
  // listings/need requests (above) but can't see the users list, change
  // anyone's role, or manage categories/brands. Enforced here with
  // RolesGuard, not just hidden in the UI.
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('users')
  users() {
    return this.adminService.getAllUsers();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('users/:id/role')
  setUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.setUserRole(id, dto.role, actor.id);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('categories')
  categories() {
    return this.adminService.getCategories();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('brands')
  brands() {
    return this.adminService.getBrands();
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('brands')
  createBrand(@Body() dto: CreateBrandDto) {
    return this.adminService.createBrand(dto);
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('brands/:id')
  deleteBrand(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteBrand(id);
  }
}
