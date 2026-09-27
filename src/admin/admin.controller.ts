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
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UpdateListingStatusDto } from '../listings/dto/update-listing-status.dto';
import { UpdateNeedRequestStatusDto } from '../need-requests/dto/update-need-request-status.dto';
import { AdminService } from './admin.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

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

  @Get('users')
  users() {
    return this.adminService.getAllUsers();
  }

  @Get('categories')
  categories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Get('brands')
  brands() {
    return this.adminService.getBrands();
  }

  @Post('brands')
  createBrand(@Body() dto: CreateBrandDto) {
    return this.adminService.createBrand(dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('brands/:id')
  deleteBrand(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteBrand(id);
  }
}
