import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global so every other module (Auth, Listings, NeedRequests, ...) can
 * inject PrismaService without importing PrismaModule itself each time -
 * it only needs to be imported once, in AppModule.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
