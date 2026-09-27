import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class UploadsService {
  /**
   * STUB. Replaces Supabase Storage's upload call inside the original
   * `createListingAction`. To make this real:
   *   1. `npm install @aws-sdk/client-s3` (works for both AWS S3 and
   *      Cloudflare R2, which is S3-compatible).
   *   2. Add an interceptor to the controller (`@UseInterceptors(FileInterceptor('file'))`
   *      from `@nestjs/platform-express`) so an actual file lands here.
   *   3. Stream it to your bucket, then return the storage path/URL - that's
   *      what `imagePaths` in CreateListingDto expects.
   * Left throwing rather than faking a URL, since a fake success here would
   * silently break every listing's photos.
   */
  uploadListingImage(): never {
    throw new NotImplementedException(
      'Image upload storage is not configured yet - see UploadsService for what to wire up (S3/R2).',
    );
  }
}
