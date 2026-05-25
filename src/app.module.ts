import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventTypeController } from './controller/event-type.controller';
import { UserController } from './controller/user.controller';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';
import { EventType } from './entities/event-type.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { HangoutEvent } from './entities/hangout-event.entity';
import { GiftingEvent } from './entities/gifting-event.entity';
import { WishlistEvent } from './entities/wishlist-event.entity';
import { DrawNameEvent } from './entities/draw-name-event.entity';
import { DrawNameAssignment } from './entities/draw-name-assignment.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { EventTypeRepository } from './repositories/event-type.repository';
import { UserRepository } from './repositories/user.repositoty';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './middleware/exception.filter';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/authGuard';
import { RolesGuard } from './guards/roleGuard';

import { MailModule } from './mail/mail.module';
import { EventLog } from './entities/event-log.entity';
import { AuthService } from './services/auth.service';
import { EventTypeService } from './services/event-type.service';
import { UserService } from './services/user.services';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.createTypeOrmOptions()),
    TypeOrmModule.forFeature([
      User,
      Event,
      EventType,
      EventParticipant,
      HangoutEvent,
      GiftingEvent,
      WishlistEvent,
      DrawNameEvent,
      DrawNameAssignment,
      WishlistItem,
      EventLog,
    ]),
    JwtModule.register({
      global: true,
      secret: configService.getJwtSecret(),
      signOptions: { expiresIn: configService.getJwtExpiration() },
    }),
    MailModule,
  ],
  controllers: [AppController, UserController, EventTypeController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AuthService,
    EventTypeService,
    EventTypeRepository,
    UserService,
    UserRepository,
  ],
})
export class AppModule {}
