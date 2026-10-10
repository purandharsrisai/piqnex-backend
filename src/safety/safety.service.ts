import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class SafetyService {
  constructor(private readonly prisma: PrismaService) {}

  async report(reporterId: string, dto: CreateReportDto) {
    if (dto.targetType === 'listing') {
      const l = await this.prisma.listing.findUnique({
        where: { id: dto.targetId },
        select: { id: true },
      });
      if (!l) throw new NotFoundException('Listing not found');
    } else {
      if (dto.targetId === reporterId) {
        throw new BadRequestException('You cannot report yourself');
      }
      const u = await this.prisma.user.findUnique({
        where: { id: dto.targetId },
        select: { id: true },
      });
      if (!u) throw new NotFoundException('User not found');
    }
    // One open report per reporter+target; repeat reports are a no-op.
    const existing = await this.prisma.report.findFirst({
      where: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        status: 'open',
      },
    });
    if (existing) return existing;
    return this.prisma.report.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
        details: dto.details,
      },
    });
  }

  async block(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('You cannot block yourself');
    }
    const u = await this.prisma.user.findUnique({
      where: { id: blockedId },
      select: { id: true },
    });
    if (!u) throw new NotFoundException('User not found');
    await this.prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId, blockedId } },
      create: { blockerId, blockedId },
      update: {},
    });
    return { blocked: true };
  }

  async unblock(blockerId: string, blockedId: string) {
    await this.prisma.block.deleteMany({ where: { blockerId, blockedId } });
    return { blocked: false };
  }

  listBlocks(blockerId: string) {
    return this.prisma.block.findMany({
      where: { blockerId },
      orderBy: { createdAt: 'desc' },
      include: {
        blocked: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  /** True if either user has blocked the other. */
  async isBlockedEitherWay(a: string, b: string) {
    const n = await this.prisma.block.count({
      where: {
        OR: [
          { blockerId: a, blockedId: b },
          { blockerId: b, blockedId: a },
        ],
      },
    });
    return n > 0;
  }

  // ---- admin moderation queue ----
  async adminList(status?: string) {
    const reports = await this.prisma.report.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { reporter: { select: { id: true, displayName: true, email: true } } },
    });
    return Promise.all(
      reports.map(async (r) => {
        let target: unknown = null;
        if (r.targetType === 'listing') {
          target = await this.prisma.listing.findUnique({
            where: { id: r.targetId },
            select: { id: true, partName: true, productName: true, brandName: true, status: true, sellerId: true },
          });
        } else {
          target = await this.prisma.user.findUnique({
            where: { id: r.targetId },
            select: { id: true, displayName: true, email: true },
          });
        }
        return { ...r, target };
      }),
    );
  }

  async adminSetStatus(id: string, status: string) {
    const r = await this.prisma.report.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Report not found');
    return this.prisma.report.update({ where: { id }, data: { status } });
  }
}
