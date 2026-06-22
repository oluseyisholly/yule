import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import { DrawNameMetricsResponseDto } from 'src/dtos/dashboard.dto';
import { WishlistMetricsResponseDto } from 'src/dtos/dashboard.dto';

type DrawNameMetricsRawRow = {
  total_gifts: string | number;
  active_draw_names: string | number;
  total_names: string | number;
  active_members: string | number;
  total_gifts_this_month: string | number;
  total_gifts_previous_month: string | number;
  active_draw_names_created_this_week: string | number;
};

type WishlistMetricsRawRow = {
  total_items: string | number;
  reserved_items: string | number;
  total_participants: string | number;
  active_wishlists: string | number;
  total_items_this_month: string | number;
  total_items_previous_month: string | number;
  active_wishlists_created_this_week: string | number;
};

const DRAW_NAME_STATUS = {
  ONGOING: 'ongoing',
} as const;

const PARTICIPANT_ROLE = {
  CREATOR: 'creator',
} as const;

@Injectable()
export class DashboardService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getDrawNameMetrics(): Promise<
    StandardResopnse<DrawNameMetricsResponseDto>
  > {
    const currentContactId = RequestContext.getCurrentContactId();
    const row = await this.fetchDrawNameMetrics(currentContactId);
    const currentMonthGifts = this.toNumber(row.total_gifts_this_month);
    const previousMonthGifts = this.toNumber(row.total_gifts_previous_month);

    return {
      code: HttpStatus.OK,
      message: 'Draw name metrics fetched successfully',
      data: {
        totalGifts: {
          value: this.toNumber(row.total_gifts),
          percentageChangeThisMonth: this.getPercentageChange(
            currentMonthGifts,
            previousMonthGifts,
          ),
          currentMonth: currentMonthGifts,
          previousMonth: previousMonthGifts,
        },
        activeDrawNames: {
          value: this.toNumber(row.active_draw_names),
          newThisWeek: this.toNumber(row.active_draw_names_created_this_week),
        },
        totalNames: {
          value: this.toNumber(row.total_names),
        },
        activeMembers: {
          value: this.toNumber(row.active_members),
        },
      },
    };
  }

  async getWishlistMetrics(): Promise<
    StandardResopnse<WishlistMetricsResponseDto>
  > {
    const currentContactId = RequestContext.getCurrentContactId();

    console.log('Fetching wishlist metrics for contact ID:', currentContactId);
    const row = await this.fetchWishlistMetrics(currentContactId);

    const currentMonthItems = this.toNumber(row.total_items_this_month);
    const previousMonthItems = this.toNumber(row.total_items_previous_month);

    console.log('Wishlist raw metrics row:', row);

    return {
      code: HttpStatus.OK,
      message: 'Wishlist metrics fetched successfully',
      data: {
        totalItems: {
          value: this.toNumber(row.total_items),
          percentageChangeThisMonth: this.getPercentageChange(
            currentMonthItems,
            previousMonthItems,
          ),
          currentMonth: currentMonthItems,
          previousMonth: previousMonthItems,
        },
        activeWishlists: {
          value: this.toNumber(row.active_wishlists),
          newThisWeek: this.toNumber(row.active_wishlists_created_this_week),
        },
        totalParticipants: { value: this.toNumber(row.total_participants) },
        reservedItems: { value: this.toNumber(row.reserved_items) },
      },
    };
  }

  private async fetchWishlistMetrics(
    contactId: string,
  ): Promise<WishlistMetricsRawRow> {
    // No wishlist_items table usage: compute wishlist metrics solely from
    // wishlist_events and event_participants. Item-based metrics are set to 0
    // because item records are not available.
    const [metrics] = await this.dataSource.query<WishlistMetricsRawRow[]>(
      `
        WITH scoped_wishlist_events AS (
          SELECT DISTINCT
            event.id AS event_id,
            event.created_at
          FROM wishlist_events wishlist_event
          INNER JOIN events event
            ON event.id = wishlist_event.event_id
            AND event.deleted_at IS NULL
          INNER JOIN event_participants current_participant
            ON current_participant.event_id = event.id
            AND current_participant.event_contact_id = $1
            AND current_participant.deleted_at IS NULL
          WHERE wishlist_event.deleted_at IS NULL
        )
        SELECT
          (
            SELECT COUNT(*)
            FROM event_gifts gift
            INNER JOIN scoped_wishlist_events scoped_event
              ON scoped_event.event_id = gift.event_id
            WHERE gift.deleted_at IS NULL
          ) AS total_items,
          (
            -- Reserved fallback: consider a gift "reserved" when a giver is set
            -- (giver_participant_id is not null). This uses fields present on
            -- the EventGift entity instead of relying on the DB-only status column.
            SELECT COUNT(*)
            FROM event_gifts gift
            INNER JOIN scoped_wishlist_events scoped_event
              ON scoped_event.event_id = gift.event_id
            WHERE gift.deleted_at IS NULL
              AND gift.giver_participant_id IS NOT NULL
          ) AS reserved_items,
          (
            SELECT COUNT(*)
            FROM event_participants participant
            INNER JOIN scoped_wishlist_events scoped_event
              ON scoped_event.event_id = participant.event_id
            WHERE participant.deleted_at IS NULL
              AND participant.event_contact_id IS NOT NULL
              AND participant.role != 'creator'
          ) AS total_participants,
          (
            SELECT COUNT(DISTINCT scoped_event.event_id)
            FROM scoped_wishlist_events scoped_event
          ) AS active_wishlists,
          (
            SELECT COUNT(*)
            FROM event_gifts gift
            INNER JOIN scoped_wishlist_events scoped_event
              ON scoped_event.event_id = gift.event_id
            WHERE gift.deleted_at IS NULL
              AND gift.created_at >= date_trunc('month', CURRENT_DATE)
          ) AS total_items_this_month,
          (
            SELECT COUNT(*)
            FROM event_gifts gift
            INNER JOIN scoped_wishlist_events scoped_event
              ON scoped_event.event_id = gift.event_id
            WHERE gift.deleted_at IS NULL
              AND gift.created_at >= date_trunc('month', CURRENT_DATE) - interval '1 month'
              AND gift.created_at < date_trunc('month', CURRENT_DATE)
          ) AS total_items_previous_month,
          (
            SELECT COUNT(*)
            FROM scoped_wishlist_events scoped_event
            WHERE scoped_event.created_at >= date_trunc('week', CURRENT_DATE)
          ) AS active_wishlists_created_this_week
      `,
      [contactId],
    );

    return metrics ?? this.getEmptyWishlistRawMetrics();
  }

  private getEmptyWishlistRawMetrics(): WishlistMetricsRawRow {
    return {
      total_items: 0,
      reserved_items: 0,
      total_participants: 0,
      active_wishlists: 0,
      total_items_this_month: 0,
      total_items_previous_month: 0,
      active_wishlists_created_this_week: 0,
    };
  }

  private async fetchDrawNameMetrics(
    contactId: string,
  ): Promise<DrawNameMetricsRawRow> {
    const [metrics] = await this.dataSource.query<DrawNameMetricsRawRow[]>(
      `
        WITH scoped_draw_name_events AS (
          SELECT DISTINCT
            event.id AS event_id,
            event.status,
            event.created_at
          FROM draw_name_events draw_name_event
          INNER JOIN events event
            ON event.id = draw_name_event.event_id
            AND event.deleted_at IS NULL
          INNER JOIN event_participants current_participant
            ON current_participant.event_id = event.id
            AND current_participant.event_contact_id = $1
            AND current_participant.deleted_at IS NULL
          WHERE draw_name_event.deleted_at IS NULL
        ),
        active_draw_name_events AS (
          SELECT event_id
          FROM scoped_draw_name_events
          WHERE LOWER(status) = $2
        )
        SELECT
          (
            SELECT COUNT(*)
            FROM event_gifts gift
            INNER JOIN scoped_draw_name_events scoped_event
              ON scoped_event.event_id = gift.event_id
            WHERE gift.deleted_at IS NULL
          ) AS total_gifts,
          (
            SELECT COUNT(*)
            FROM active_draw_name_events
          ) AS active_draw_names,
          (
           SELECT COUNT(*)
            FROM scoped_draw_name_events
          ) AS total_names,
          (
            SELECT COUNT(DISTINCT participant.event_contact_id)
            FROM event_participants participant
            INNER JOIN active_draw_name_events active_event
              ON active_event.event_id = participant.event_id
            WHERE participant.deleted_at IS NULL
              AND participant.event_contact_id IS NOT NULL
              AND participant.role != $3
          ) AS active_members,
          (
            SELECT COUNT(*)
            FROM event_gifts gift
            INNER JOIN scoped_draw_name_events scoped_event
              ON scoped_event.event_id = gift.event_id
            WHERE gift.deleted_at IS NULL
              AND gift.created_at >= date_trunc('month', CURRENT_DATE)
          ) AS total_gifts_this_month,
          (
            SELECT COUNT(*)
            FROM event_gifts gift
            INNER JOIN scoped_draw_name_events scoped_event
              ON scoped_event.event_id = gift.event_id
            WHERE gift.deleted_at IS NULL
              AND gift.created_at >= date_trunc('month', CURRENT_DATE) - interval '1 month'
              AND gift.created_at < date_trunc('month', CURRENT_DATE)
          ) AS total_gifts_previous_month,
          (
            SELECT COUNT(*)
            FROM scoped_draw_name_events scoped_event
            WHERE LOWER(scoped_event.status) = $2
              AND scoped_event.created_at >= date_trunc('week', CURRENT_DATE)
          ) AS active_draw_names_created_this_week
      `,
      [contactId, DRAW_NAME_STATUS.ONGOING, PARTICIPANT_ROLE.CREATOR],
    );

    return metrics ?? this.getEmptyRawMetrics();
  }

  private getPercentageChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  private toNumber(value: string | number | null | undefined): number {
    return Number(value ?? 0);
  }

  private getEmptyRawMetrics(): DrawNameMetricsRawRow {
    return {
      total_gifts: 0,
      active_draw_names: 0,
      total_names: 0,
      active_members: 0,
      total_gifts_this_month: 0,
      total_gifts_previous_month: 0,
      active_draw_names_created_this_week: 0,
    };
  }
}
