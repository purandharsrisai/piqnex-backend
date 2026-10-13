import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const OFFER_RE = /^Offer: (\S+)(?: \(listed at (\S+)\))?$/;
const PHOTO_RE = /^Photo: (\S+)$/;

/** Same idea as the apps' previewOf(): short text for a notification body. */
export function pushPreview(body: string): string {
  if (PHOTO_RE.test(body)) return 'Photo';
  const offer = OFFER_RE.exec(body);
  if (offer) return `Offer: ${offer[1]}`;
  return body.length > 100 ? `${body.slice(0, 99)}…` : body;
}

interface PushTokenDelegate {
  upsert(args: {
    where: { token: string };
    create: { userId: string; token: string; platform: string };
    update: { userId: string; platform: string };
  }): Promise<unknown>;
  findMany(args: {
    where: { userId: string };
    select: { token: true };
  }): Promise<{ token: string }[]>;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private readonly prisma: PrismaService) {}

  // TODO: remove this cast (and PushTokenDelegate) after running
  // `npx prisma generate` - the PushToken model was added by hand, so the
  // generated client doesn't know about it yet; use `this.prisma.pushToken`.
  private get tokens(): PushTokenDelegate {
    return (this.prisma as unknown as { pushToken: PushTokenDelegate })
      .pushToken;
  }

  /** Saves (or moves) a device token for the user. */
  async register(userId: string, token: string, platform: string) {
    await this.tokens.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform },
    });
    return { ok: true };
  }

  /**
   * Fire-and-forget: tells the recipient's devices about a new message.
   * Never throws, so it can never break sending a message.
   */
  async notifyNewMessage(
    conversationId: string,
    fromId: string,
    toId: string,
    body: string,
  ): Promise<void> {
    try {
      const [from, rows] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: fromId },
          select: { displayName: true },
        }),
        this.tokens.findMany({
          where: { userId: toId },
          select: { token: true },
        }),
      ]);
      if (!from || rows.length === 0) return;
      const messages = rows.map((r) => ({
        to: r.token,
        title: from.displayName,
        body: pushPreview(body),
        sound: 'default',
        channelId: 'messages',
        data: { conversationId },
      }));
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
      if (!res.ok) this.logger.warn(`Expo push responded ${res.status}`);
    } catch (e) {
      this.logger.warn(`Push notification failed: ${String(e)}`);
    }
  }
}
