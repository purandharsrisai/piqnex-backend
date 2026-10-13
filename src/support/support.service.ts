import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ContactFormDto } from './dto/contact-form.dto';

const TOPIC_LABELS: Record<string, string> = {
  account: 'Account help',
  listing: 'Listings and requests',
  report: 'Reporting a problem',
  feedback: 'Feedback and ideas',
  other: 'Something else',
};

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async submitContactForm(dto: ContactFormDto) {
    // Honeypot filled in -> pretend it worked, send nothing.
    if (dto.website?.trim()) return { ok: true };

    // Save first so the message is never lost, even if the email fails.
    await this.prisma.supportMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        topic: dto.topic,
        message: dto.message.trim(),
      },
    });

    const to = this.config.get<string>('SUPPORT_EMAIL') ?? 'support@piqnex.com';
    const topic = TOPIC_LABELS[dto.topic] ?? dto.topic;
    await this.mail.send({
      to,
      replyTo: dto.email,
      subject: `[Contact] ${topic} - ${dto.name}`,
      text: `From: ${dto.name} <${dto.email}>\nTopic: ${topic}\n\n${dto.message}`,
    });
    return { ok: true };
  }
}
