import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messages: MessagesService,
  ) {}

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

    const request = await this.prisma.contactRequest.create({
      data: {
        listingId,
        buyerId,
        message: dto.message,
        contactInfo: dto.contactInfo,
      },
    });
    // Also open (or append to) the buyer<->seller conversation so the
    // seller sees it in their inbox. Response shape stays the same plus
    // the conversationId.
    const body = dto.contactInfo
      ? `${dto.message}\n\nContact: ${dto.contactInfo}`
      : dto.message;
    const { conversationId } = await this.messages.startOrAppend(
      listingId,
      buyerId,
      body,
    );
    return { ...request, conversationId };
  }
}
