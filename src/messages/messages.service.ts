import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SafetyService } from '../safety/safety.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly safety: SafetyService,
    private readonly mail: MailService,
  ) {}

  /**
   * Find-or-create the thread for (listing, buyer) and append a message.
   * Used by both `POST /listings/:id/contact` and the first message from
   * the listing page.
   */
  async startOrAppend(listingId: string, buyerId: string, body: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId === buyerId) {
      throw new BadRequestException('You cannot message your own listing');
    }

    if (await this.safety.isBlockedEitherWay(buyerId, listing.sellerId)) {
      throw new ForbiddenException('You cannot message this seller');
    }

    const conversation = await this.prisma.conversation.upsert({
      where: { listingId_buyerId: { listingId, buyerId } },
      create: { listingId, buyerId, sellerId: listing.sellerId },
      update: {},
    });
    const message = await this.prisma.message.create({
      data: { conversationId: conversation.id, senderId: buyerId, body },
    });
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: message.createdAt, buyerReadAt: message.createdAt },
    });
    await this.notify(conversation.id, buyerId, listing.sellerId, body);
    return { conversationId: conversation.id, message };
  }

  private async getForUser(id: string, userId: string) {
    const c = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            partName: true,
            productName: true,
            brandName: true,
            price: true,
            currency: true,
            status: true,
          },
        },
        buyer: { select: { id: true, displayName: true, avatarUrl: true } },
        seller: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });
    if (!c) throw new NotFoundException('Conversation not found');
    if (c.buyerId !== userId && c.sellerId !== userId) {
      throw new ForbiddenException();
    }
    return c;
  }

  async list(userId: string) {
    const rows = await this.prisma.conversation.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        listing: {
          select: { id: true, partName: true, productName: true, brandName: true },
        },
        buyer: { select: { id: true, displayName: true, avatarUrl: true } },
        seller: { select: { id: true, displayName: true, avatarUrl: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    return Promise.all(
      rows.map(async (c) => {
        const isBuyer = c.buyerId === userId;
        const readAt = isBuyer ? c.buyerReadAt : c.sellerReadAt;
        const unread = await this.prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: { not: userId },
            ...(readAt ? { createdAt: { gt: readAt } } : {}),
          },
        });
        return {
          id: c.id,
          listing: c.listing,
          other: isBuyer ? c.seller : c.buyer,
          lastMessage: c.messages[0] ?? null,
          lastMessageAt: c.lastMessageAt,
          unread,
        };
      }),
    );
  }

  async unreadCount(userId: string) {
    const rows = await this.list(userId);
    return { count: rows.reduce((n, r) => n + r.unread, 0) };
  }

  async thread(id: string, userId: string) {
    const c = await this.getForUser(id, userId);
    const isBuyer = c.buyerId === userId;
    const now = new Date();
    await this.prisma.conversation.update({
      where: { id },
      data: isBuyer ? { buyerReadAt: now } : { sellerReadAt: now },
    });
    const messages = await this.prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    });
    return {
      id: c.id,
      listing: c.listing,
      other: isBuyer ? c.seller : c.buyer,
      me: userId,
      messages,
    };
  }

  async reply(id: string, userId: string, body: string) {
    const c = await this.getForUser(id, userId);
    const other = c.buyerId === userId ? c.sellerId : c.buyerId;
    if (await this.safety.isBlockedEitherWay(userId, other)) {
      throw new ForbiddenException('You cannot reply to this conversation');
    }
    const message = await this.prisma.message.create({
      data: { conversationId: id, senderId: userId, body },
    });
    await this.prisma.conversation.update({
      where: { id },
      data:
        c.buyerId === userId
          ? { lastMessageAt: message.createdAt, buyerReadAt: message.createdAt }
          : { lastMessageAt: message.createdAt, sellerReadAt: message.createdAt },
    });
    await this.notify(id, userId, other, body);
    return message;
  }

  /** Fire-and-forget email to the recipient (never blocks or fails the request). */
  private notify(conversationId: string, fromId: string, toId: string, body: string) {
    return (async () => {
      const [from, to, conv] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: fromId }, select: { displayName: true } }),
        this.prisma.user.findUnique({ where: { id: toId }, select: { email: true } }),
        this.prisma.conversation.findUnique({ where: { id: conversationId }, select: { listing: { select: { partName: true } } } }),
      ]);
      if (from && to && conv) {
        await this.mail.sendNewMessage(to.email, from.displayName, conv.listing.partName, body, conversationId);
      }
    })().catch(() => undefined);
  }
}
