import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedService {
  constructor(private readonly prisma: PrismaService) {}

  async save(userId: string, listingId: string) {
    const l = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!l) throw new NotFoundException('Listing not found');
    await this.prisma.savedListing.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: { userId, listingId },
      update: {},
    });
    return { saved: true };
  }

  async unsave(userId: string, listingId: string) {
    await this.prisma.savedListing.deleteMany({ where: { userId, listingId } });
    return { saved: false };
  }

  async ids(userId: string) {
    const rows = await this.prisma.savedListing.findMany({
      where: { userId },
      select: { listingId: true },
    });
    return rows.map((r) => r.listingId);
  }

  async list(userId: string) {
    const rows = await this.prisma.savedListing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
        },
      },
    });
    return rows.map((r) => r.listing);
  }
}
