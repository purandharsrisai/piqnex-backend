import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNeedRequestDto } from './dto/create-need-request.dto';
import { MatchNeedRequestsQueryDto } from './dto/match-need-requests-query.dto';
import { NeedRequestStatus } from './need-request.constants';

@Injectable()
export class NeedRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  create(requesterId: string, dto: CreateNeedRequestDto) {
    return this.prisma.needRequest.create({
      data: {
        requesterId,
        categoryId: dto.categoryId,
        brandName: dto.brandName,
        productName: dto.productName,
        modelLabel: dto.modelLabel,
        partName: dto.partName,
        description: dto.description,
        location: dto.location,
      },
    });
  }

  /** Open need requests matching a listing that was just published. */
  getOpenMatches(query: MatchNeedRequestsQueryDto) {
    return this.prisma.needRequest.findMany({
      where: {
        status: 'open',
        brandName: { equals: query.brandName, mode: 'insensitive' },
        productName: { equals: query.productName, mode: 'insensitive' },
        partName: { equals: query.partName, mode: 'insensitive' },
        ...(query.modelLabel
          ? { modelLabel: { equals: query.modelLabel, mode: 'insensitive' } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    requesterId: string,
    status: NeedRequestStatus,
  ) {
    await this.assertOwner(id, requesterId);
    return this.prisma.needRequest.update({ where: { id }, data: { status } });
  }

  async remove(id: string, requesterId: string): Promise<void> {
    await this.assertOwner(id, requesterId);
    await this.prisma.needRequest.delete({ where: { id } });
  }

  private async assertOwner(id: string, requesterId: string): Promise<void> {
    const needRequest = await this.prisma.needRequest.findUnique({
      where: { id },
      select: { requesterId: true },
    });
    if (!needRequest) {
      throw new NotFoundException('Need request not found');
    }
    if (needRequest.requesterId !== requesterId) {
      throw new ForbiddenException('You do not own this need request');
    }
  }
}
