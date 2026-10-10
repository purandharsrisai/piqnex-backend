import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Provider-agnostic mail sender. MAIL_PROVIDER selects the transport:
 *  - "resend"  -> Resend HTTPS API (needs RESEND_API_KEY, MAIL_FROM)
 *  - "smtp"    -> any SMTP server (Gmail, Zoho, Brevo, SES...). Needs
 *                SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM.
 *  - anything else / unset -> "console": logs the email instead of sending
 *    (local development and CI; nothing leaves the machine).
 * Sending never throws into request handlers: failures are logged.
 */
@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  /** True when real emails are delivered (so secrets must not be echoed in API responses). */
  get isLive(): boolean {
    const p = this.config.get('MAIL_PROVIDER');
    return p === 'resend' || p === 'smtp';
  }

  get frontendUrl(): string {
    return this.config.get('FRONTEND_ORIGIN') ?? 'http://localhost:3000';
  }

  async send(msg: MailMessage): Promise<void> {
    if (!this.isLive) {
      this.log.log(`[console mail] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
      return;
    }
    if (this.config.get('MAIL_PROVIDER') === 'smtp') {
      await this.sendSmtp(msg);
      return;
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.config.get('MAIL_FROM') ?? 'Piqnex <no-reply@piqnex.com>',
          to: [msg.to],
          subject: msg.subject,
          text: msg.text,
          html: msg.html ?? this.wrap(msg.text),
        }),
      });
      if (!res.ok) {
        this.log.error(`Mail send failed: ${res.status} ${await res.text()}`);
      }
    } catch (e) {
      this.log.error(`Mail send error: ${(e as Error).message}`);
    }
  }

  private transporter?: nodemailer.Transporter;

  private async sendSmtp(msg: MailMessage) {
    try {
      if (!this.transporter) {
        const port = Number(this.config.get('SMTP_PORT') ?? 587);
        this.transporter = nodemailer.createTransport({
          host: this.config.get('SMTP_HOST'),
          port,
          // 465 = implicit TLS; 587/25 upgrade with STARTTLS automatically.
          secure: port === 465,
          auth: this.config.get('SMTP_USER')
            ? {
                user: this.config.get('SMTP_USER'),
                pass: this.config.get('SMTP_PASS'),
              }
            : undefined,
        });
      }
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM') ?? this.config.get('SMTP_USER'),
        to: msg.to,
        subject: msg.subject,
        text: msg.text,
        html: msg.html ?? this.wrap(msg.text),
      });
    } catch (e) {
      this.log.error(`SMTP send error: ${(e as Error).message}`);
    }
  }

  private wrap(text: string) {
    const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const body = esc
      .replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>')
      .replace(/\n/g, '<br>');
    return `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0f1228">${body}<p style="color:#888;font-size:12px;margin-top:24px">Piqnex - replace the missing piece.</p></div>`;
  }

  sendPasswordReset(to: string, token: string) {
    const link = `${this.frontendUrl}/reset-password?token=${token}`;
    return this.send({
      to,
      subject: 'Reset your Piqnex password',
      text: `Use this link to choose a new password (valid for one hour):\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
    });
  }

  sendNewMessage(to: string, fromName: string, partName: string, preview: string, conversationId: string) {
    const link = `${this.frontendUrl}/messages/${conversationId}`;
    return this.send({
      to,
      subject: `New message about "${partName}"`,
      text: `${fromName} wrote:\n\n"${preview.slice(0, 200)}"\n\nReply here: ${link}`,
    });
  }

  sendPartAlert(to: string, product: string, part: string, listingId: string) {
    const link = `${this.frontendUrl}/parts/${listingId}`;
    return this.send({
      to,
      subject: `Good news: "${part}" for your ${product} is listed`,
      text: `Someone just listed the part you were looking for: ${part} (${product}).\n\nTake a look: ${link}`,
    });
  }
}
