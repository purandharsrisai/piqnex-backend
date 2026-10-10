import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { ProfileModule } from './profile/profile.module';
import { ListingsModule } from './listings/listings.module';
import { NeedRequestsModule } from './need-requests/need-requests.module';
import { ContactModule } from './contact/contact.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SavedModule } from './saved/saved.module';
import { MailModule } from './mail/mail.module';
import { SafetyModule } from './safety/safety.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    ProfileModule,
    ListingsModule,
    NeedRequestsModule,
    ContactModule,
    UploadsModule,
    AdminModule,
    MessagesModule,
    SafetyModule,
    MailModule,
    SavedModule,
    ReviewsModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
