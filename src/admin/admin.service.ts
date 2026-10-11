import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PAGE_SIZE } from '../common/dto/pagination-query.dto';
import { NeedRequestStatus } from '../need-requests/need-request.constants';
import { PrismaService } from '../prisma/prisma.service';
import { ListingStatus } from '../listings/listing.constants';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import type { AdminRoleAssignment, UserStatus } from './admin.constants';
import type { SupportMessageStatus } from '../support/dto/support-message-status.dto';

// Postgres error code for a foreign-key violation - thrown when deleting a
// category/brand that a product still references (`on delete restrict` in
// the original schema; Prisma surfaces it as this known-request error).
const FOREIGN_KEY_VIOLATION = 'P2003';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalListings,
      activeListings,
      openNeedRequests,
      users,
      openReports,
      newSupportMessages,
    ] = await Promise.all([
      this.prisma.listing.count(),
      this.prisma.listing.count({ where: { status: 'active' } }),
      this.prisma.needRequest.count({ where: { status: 'open' } }),
      this.prisma.user.count(),
      this.prisma.report.count({ where: { status: 'open' } }),
      this.prisma.supportMessage.count({ where: { status: 'new' } }),
    ]);
    return {
      totalListings,
      activeListings,
      openNeedRequests,
      users,
      openReports,
      newSupportMessages,
    };
  }

  /** Contact Us inbox, newest first. Optional status filter ('new' | 'handled'). */
  async getSupportMessages(page = 1, status?: SupportMessageStatus) {
    const where = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.prisma.supportMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.supportMessage.count({ where }),
    ]);
    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async getSupportMessage(id: string) {
    const message = await this.prisma.supportMessage.findUnique({
      where: { id },
    });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async setSupportMessageStatus(id: string, status: SupportMessageStatus) {
    const existing = await this.prisma.supportMessage.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Message not found');
    return this.prisma.supportMessage.update({
      where: { id },
      data: { status },
    });
  }

  async getAllListings(
    page = 1,
    q?: string,
    status?: string,
    userId?: string,
  ) {
    const where: Prisma.ListingWhereInput = {
      ...(status ? { status } : {}),
      ...(userId ? { sellerId: userId } : {}),
      ...(q
        ? {
            OR: [
              { brandName: { contains: q, mode: 'insensitive' } },
              { productName: { contains: q, mode: 'insensitive' } },
              { modelLabel: { contains: q, mode: 'insensitive' } },
              { partName: { contains: q, mode: 'insensitive' } },
              { seller: { displayName: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          seller: { select: { id: true, displayName: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.listing.count({ where }),
    ]);
    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async getListingDetail(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, displayName: true, email: true, phone: true },
        },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  setListingStatus(id: string, status: ListingStatus) {
    return this.prisma.listing.update({ where: { id }, data: { status } });
  }

  async getAllNeedRequests(
    page = 1,
    q?: string,
    status?: string,
    userId?: string,
  ) {
    const where: Prisma.NeedRequestWhereInput = {
      ...(status ? { status } : {}),
      ...(userId ? { requesterId: userId } : {}),
      ...(q
        ? {
            OR: [
              { brandName: { contains: q, mode: 'insensitive' } },
              { productName: { contains: q, mode: 'insensitive' } },
              { modelLabel: { contains: q, mode: 'insensitive' } },
              { partName: { contains: q, mode: 'insensitive' } },
              {
                requester: { displayName: { contains: q, mode: 'insensitive' } },
              },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.needRequest.findMany({
        where,
        include: { requester: { select: { id: true, displayName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.needRequest.count({ where }),
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
        role: true,
        status: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** One user's full profile plus activity counts and their latest listings/requests. */
  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        location: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        isAdmin: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            needRequests: true,
            reportsMade: true,
            reviewsReceived: true,
          },
        },
        listings: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            brandName: true,
            productName: true,
            partName: true,
            price: true,
            status: true,
            createdAt: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { storagePath: true, sortOrder: true },
            },
          },
        },
        needRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            brandName: true,
            productName: true,
            partName: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const reportsAgainst = await this.prisma.report.count({
      where: { targetType: 'user', targetId: id },
    });
    return { ...user, reportsAgainst };
  }

  /**
   * Suspends or reactivates an account. A suspended user can't log in and
   * their existing tokens stop working (JwtStrategy checks status). An
   * admin can't suspend themselves - same lock-out guard as setUserRole.
   */
  async setUserStatus(id: string, status: UserStatus, actingAdminId: string) {
    if (id === actingAdminId) {
      throw new BadRequestException('You cannot suspend your own account');
    }
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, email: true, displayName: true, status: true },
    });
  }

  /**
   * Sets a user's admin role. 'NONE' revokes admin access entirely
   * (isAdmin=false, role=null); 'ADMIN'/'MODERATOR' grants it
   * (isAdmin=true, role=<that value>) - the two columns are always kept in
   * sync here so AdminGuard (isAdmin) and RolesGuard (role) never disagree.
   *
   * An admin can't change their OWN role - a simple guard against someone
   * accidentally demoting themselves (or revoking their own access) and
   * getting locked out, with no one else able to undo it from the UI.
   */
  setUserRole(
    userId: string,
    role: AdminRoleAssignment,
    actingAdminId: string,
  ) {
    if (userId === actingAdminId) {
      throw new BadRequestException('You cannot change your own role');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data:
        role === 'NONE'
          ? { isAdmin: false, role: null }
          : { isAdmin: true, role },
      select: {
        id: true,
        email: true,
        displayName: true,
        isAdmin: true,
        role: true,
      },
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
