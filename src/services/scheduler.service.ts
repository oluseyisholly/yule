import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WishlistEventService } from './wishlist-event.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly wishlistEventService: WishlistEventService) {}

  @Cron('0 1 * * *', { timeZone: 'Africa/Lagos' })
  async completeExpiredWishlistEvents() {
    const completedCount =
      await this.wishlistEventService.completeExpiredOngoingWishlistEvents();

    this.logger.log(
      `Completed ${completedCount} expired ongoing wishlist event(s)`,
    );
  }
}
