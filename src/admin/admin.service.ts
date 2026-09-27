import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PAGE_SIZE } from '../common/dto/pagination-query.dto';
import { NeedRequestStatus } from '../need-requests/need-request.constants';
import { PrismaService } from '../prisma/prisma.service';
import { ListingStatus } from '../listings/listing.constants';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

// Postgres error code for a foreign-key violation - thrown when deleting a
// category/brand that a product still references (`on delete restrict` in
// the original schema; Prisma surfaces it as this known-request error).
const FOREIGN_KEY_VIOLATION = 'P2003';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [totalListings, activeListings, openNeedRequests, users] =
      await Promise.all([
        this.prisma.listing.count(),
        this.prisma.listing.count({ where: { status: 'active' } }),
        this.prisma.needRequest.count({ where: { status: 'open' } }),
        this.prisma.user.count(),
      ]);
    return { totalListings, activeListings, openNeedRequests, users };
  }

  async getAllListings(page = 1) {
    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        include: {
          seller: { select: { id: true, displayName: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.listing.count(),
    ]);
    return { items, total, page, pageSize: PAGE_SIZE };
  }

  setListingStatus(id: string, status: ListingStatus) {
    return this.prisma.listing.update({ where: { id }, data: { status } });
  }

  async getAllNeedRequests(page = 1) {
    const [items, total] = await Promise.all([
      this.prisma.needRequest.findMany({
        include: { requester: { select: { id: true, displayName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.needRequest.count(),
    ]);
    return { items, total, page, pageSize: PAGE_SIZE };
  }

  setNeedRequestStatus(id: string, status: NeedRequestStatus) {
    return this.prisma.needRequest.update({ where: { id }, data: { status } });
  }

  async deleteNeedRequest(id: string): Promise<void> {
    await this.prisma.needRequest.delete({ where: { id } });
  }

  getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        location: true,
        isAdmin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getCategories() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        icon: dto.icon,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      if (this.isForeignKeyViolation(error)) {
        throw new ConflictException(
          'This category is still used by one or more brands/products and cannot be deleted.',
        );
      }
      throw error;
    }
  }

  getBrands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  createBrand(dto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: { categoryId: dto.categoryId, slug: dto.slug, name: dto.name },
    });
  }

  async deleteBrand(id: string): Promise<void> {
    try {
      await this.prisma.brand.delete({ where: { id } });
    } catch (error) {
      if (this.isForeignKeyViolation(error)) {
        throw new ConflictException(
          'This brand is still used by one or more products and cannot be deleted.',
        );
      }
      throw error;
    }
  }

  private isForeignKeyViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === FOREIGN_KEY_VIOLATION
    );
  }
}
