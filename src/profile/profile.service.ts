import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PROFILE_SELECT = {
  id: true,
  email: true,
  displayName: true,
  location: true,
  phone: true,
  avatarUrl: true,
  isAdmin: true,
  role: true,
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
        phone: dto.phone,
      },
      select: PROFILE_SELECT,
    });
  }

  /** Permanently deletes the account; all owned rows cascade (listings, messages, ...). */
  async deleteMe(userId: string, password: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { passwordHash: true, isAdmin: true },
    });
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Password does not match our records');
    }
    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
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
