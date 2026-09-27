import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PROFILE_SELECT = {
  id: true,
  email: true,
  displayName: true,
  location: true,
  avatarUrl: true,
  isAdmin: true,
  createdAt: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: PROFILE_SELECT,
    });
  }

  updateMe(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        location: dto.location,
      },
      select: PROFILE_SELECT,
    });
  }

  getMyListings(userId: string) {
    // Every status, not just active - unlike the public browse endpoint,
    // an owner needs to see their own sold/removed listings too.
    return this.prisma.listing.findMany({
      where: { sellerId: userId },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  getMyNeedRequests(userId: string) {
    return this.prisma.needRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
