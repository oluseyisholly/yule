import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardController } from './controller/dashboard.controller';
import { DrawNameEventController } from './controller/draw-name-event.controller';
import { EventController } from './controller/event.controller';
import { EventContactController } from './controller/event-contact.controller';
import { EventParticipantExclusionController } from './controller/event-participant-exclusion.controller';
import { EventTypeController } from './controller/event-type.controller';
import { GiftController } from './controller/gift.controller';
import { GiftingEventController } from './controller/gifting-event.controller';
import { InvitationController } from './controller/invitation.controller';
import { ParticipantController } from './controller/participant.controller';
import { UserController } from './controller/user.controller';
import { WishlistEventController } from './controller/wishlist-event.controller';
import { Contact } from './entities/contact.entity';
import { ContactConnection } from './entities/contact-connection.entity';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';
import { EventType } from './entities/event-type.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { EventParticipantExclusion } from './entities/event-participant-exclusion.entity';
import { EventGift } from './entities/gift.entity';
import { Invitation } from './entities/invitation.entity';
import { HangoutEvent } from './entities/hangout-event.entity';
import { GiftingEvent } from './entities/gifting-event.entity';
import { WishlistEvent } from './entities/wishlist-event.entity';
import { DrawNameEvent } from './entities/draw-name-event.entity';
import { DrawNameEventRepository } from './repositories/draw-name-event.repository';
import { EventContactRepository } from './repositories/event-contact.repository';
import { EventParticipantExclusionRepository } from './repositories/event-participant-exclusion.repository';
import { EventRepository } from './repositories/event.repository';
import { EventTypeRepository } from './repositories/event-type.repository';
import { GiftRepository } from './repositories/gift.repository';
import { GiftingEventRepository } from './repositories/gifting-event.repository';
import { InvitationRepository } from './repositories/invitation.repository';
import { ParticipantRepository } from './repositories/participant.repository';
import { UserRepository } from './repositories/user.repositoty';
import { WishlistEventRepository } from './repositories/wishlist-event.repository';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './middleware/exception.filter';
import { RequestContextInterceptor } from './common/interceptor/requestContext';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/authGuard';
import { RolesGuard } from './guards/roleGuard';

import { MailModule } from './mail/mail.module';
import { EventLog } from './entities/event-log.entity';
import { AuthService } from './services/auth.service';
import { DashboardService } from './services/dashboard.service';
import { DrawNameEventService } from './services/draw-name-event.service';
import { EventContactService } from './services/event-contact.service';
import { EventParticipantExclusionService } from './services/event-participant-exclusion.service';
import { EventService } from './services/event.service';
import { EventTypeService } from './services/event-type.service';
import { GiftService } from './services/gift.service';
import { GiftingEventService } from './services/gifting-event.service';
import { InvitationService } from './services/invitation.service';
import { ParticipantService } from './services/participant.service';
import { UserService } from './services/user.services';
import { EmailService } from './services/email.service';
import { WishlistEventService } from './services/wishlist-event.service';
import { SchedulerService } from './services/scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...configService.createTypeOrmOptions(),
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      Contact,
      ContactConnection,
      Event,
      EventType,
      EventParticipant,
      EventParticipantExclusion,
      EventGift,
      Invitation,
      HangoutEvent,
      GiftingEvent,
      WishlistEvent,
      DrawNameEvent,
      EventLog,
    ]),
    JwtModule.register({
      global: true,
      secret: configService.getJwtSecret(),
      signOptions: { expiresIn: configService.getJwtExpiration() },
    }),
    MailModule,
  ],
  controllers: [
    AppController,
    UserController,
    DashboardController,
    EventController,
    EventTypeController,
    DrawNameEventController,
    EventContactController,
    EventParticipantExclusionController,
    ParticipantController,
    InvitationController,
    GiftController,
    GiftingEventController,
    WishlistEventController,
  ],
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
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    AuthService,
    DashboardService,
    DrawNameEventService,
    DrawNameEventRepository,
    EventService,
    EventRepository,
    EventContactService,
    EventContactRepository,
    EventParticipantExclusionService,
    EventParticipantExclusionRepository,
    EventTypeService,
    EventTypeRepository,
    GiftService,
    GiftingEventService,
    EmailService,
    GiftRepository,
    GiftingEventRepository,
    InvitationService,
    InvitationRepository,
    ParticipantService,
    ParticipantRepository,
    UserService,
    UserRepository,
    WishlistEventService,
    WishlistEventRepository,
    SchedulerService,
  ],
})
export class AppModule {}
