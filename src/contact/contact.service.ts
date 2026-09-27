import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    listingId: string,
    buyerId: string,
    dto: CreateContactRequestDto,
  ) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return this.prisma.contactRequest.create({
      data: {
        listingId,
        buyerId,
        message: dto.message,
        contactInfo: dto.contactInfo,
      },
    });
  }
}
