import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Throttles by client IP + the email in the request body. The Next.js
 * frontend proxies every user's request from one server IP, so keying on IP
 * alone would make all users share one bucket; adding the email keeps the
 * limit per-account (the thing brute-force attacks target).
 */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const email = String(req.body?.email ?? '').toLowerCase();
    return Promise.resolve(`${req.ip}:${email}`);
  }
}
