import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StandardResopnse } from 'src/common';
import { RequestContext } from 'src/common/context/requestContext';
import {
  DrawNameMetricsResponseDto,
  GiftMetricsResponseDto,
  GiftTrendMetricDto,
  WishlistMetricsResponseDto,
} from 'src/dtos/dashboard.dto';

type DrawNameMetricsRawRow = {
  total_gifts: string | number;
  active_draw_names: string | number;
  total_draw_names_participated: string | number;
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

type GiftMetricsRawKey =
  | 'total_gifts'
  | 'total_amount_spent'
  | 'total_people'
  | 'total_sellers'
  | 'total_gifts_this_month'
  | 'total_gifts_previous_month'
  | 'total_gifts_this_week'
  | 'total_amount_spent_this_month'
  | 'total_amount_spent_previous_month'
  | 'total_amount_spent_this_week'
  | 'total_people_this_month'
  | 'total_people_previous_month'
  | 'total_people_this_week'
  | 'total_sellers_this_month'
  | 'total_sellers_previous_month'
  | 'total_sellers_this_week';

type GiftMetricsRawRow = Record<GiftMetricsRawKey, string | number>;

const DRAW_NAME_STATUS = {
  ONGOING: 'ongoing',
} as const;

const WISHLIST_STATUS = {
  ONGOING: 'ongoing',
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
        totalDrawNamesParticipated: {
          value: this.toNumber(row.total_draw_names_participated),
        },
        totalNames: {
          value: this.toNumber(row.total_draw_names_participated),
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

    const row = await this.fetchWishlistMetrics(currentContactId);

    const currentMonthItems = this.toNumber(row.total_items_this_month);
    const previousMonthItems = this.toNumber(row.total_items_previous_month);

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

  async getGiftMetrics(): Promise<StandardResopnse<GiftMetricsResponseDto>> {
    const currentContactId = RequestContext.getCurrentContactId();
    const row = await this.fetchGiftMetrics(currentContactId);

    return {
      code: HttpStatus.OK,
      message: 'Gift metrics fetched successfully',
      data: {
        totalGifts: this.toTrendMetric(
          row.total_gifts,
          row.total_gifts_this_month,
          row.total_gifts_previous_month,
          row.total_gifts_this_week,
        ),
        totalAmountSpent: this.toTrendMetric(
          row.total_amount_spent,
          row.total_amount_spent_this_month,
          row.total_amount_spent_previous_month,
          row.total_amount_spent_this_week,
        ),
        totalPeople: this.toTrendMetric(
          row.total_people,
          row.total_people_this_month,
          row.total_people_previous_month,
          row.total_people_this_week,
        ),
        totalSellers: this.toTrendMetric(
          row.total_sellers,
          row.total_sellers_this_month,
          row.total_sellers_previous_month,
          row.total_sellers_this_week,
        ),
      },
    };
  }

  private async fetchGiftMetrics(
    contactId: string,
  ): Promise<GiftMetricsRawRow> {
    const [metrics] = await this.dataSource.query<GiftMetricsRawRow[]>(
      `
        WITH given_gifts AS (
          SELECT
            gift.id,
            gift.amount,
            gift.seller_id,
            gift.created_at,
            recipient_participant.event_contact_id AS recipient_contact_id
          FROM event_gifts gift
          INNER JOIN event_participants giver_participant
            ON giver_participant.id = gift.giver_participant_id
            AND giver_participant.event_contact_id = $1
            AND giver_participant.deleted_at IS NULL
          LEFT JOIN event_participants recipient_participant
            ON recipient_participant.id = gift.recipient_participant_id
            AND recipient_participant.deleted_at IS NULL
          WHERE gift.deleted_at IS NULL
        )
        SELECT
          COUNT(*) AS total_gifts,
          COALESCE(SUM(amount), 0) AS total_amount_spent,
          COUNT(DISTINCT recipient_contact_id)
            FILTER (WHERE recipient_contact_id IS NOT NULL) AS total_people,
          COUNT(DISTINCT NULLIF(TRIM(seller_id), '')) AS total_sellers,

          COUNT(*)
            FILTER (
              WHERE created_at >= date_trunc('month', CURRENT_DATE)
            ) AS total_gifts_this_month,
          COUNT(*)
            FILTER (
              WHERE created_at >= date_trunc('month', CURRENT_DATE) - interval '1 month'
                AND created_at < date_trunc('month', CURRENT_DATE)
            ) AS total_gifts_previous_month,
          COUNT(*)
            FILTER (
              WHERE created_at >= date_trunc('week', CURRENT_DATE)
            ) AS total_gifts_this_week,

          COALESCE(
            SUM(amount)
              FILTER (
                WHERE created_at >= date_trunc('month', CURRENT_DATE)
              ),
            0
          ) AS total_amount_spent_this_month,
          COALESCE(
            SUM(amount)
              FILTER (
                WHERE created_at >= date_trunc('month', CURRENT_DATE) - interval '1 month'
                  AND created_at < date_trunc('month', CURRENT_DATE)
              ),
            0
          ) AS total_amount_spent_previous_month,
          COALESCE(
            SUM(amount)
              FILTER (
                WHERE created_at >= date_trunc('week', CURRENT_DATE)
              ),
            0
          ) AS total_amount_spent_this_week,

          COUNT(DISTINCT recipient_contact_id)
            FILTER (
              WHERE recipient_contact_id IS NOT NULL
                AND created_at >= date_trunc('month', CURRENT_DATE)
            ) AS total_people_this_month,
          COUNT(DISTINCT recipient_contact_id)
            FILTER (
              WHERE recipient_contact_id IS NOT NULL
                AND created_at >= date_trunc('month', CURRENT_DATE) - interval '1 month'
                AND created_at < date_trunc('month', CURRENT_DATE)
            ) AS total_people_previous_month,
          COUNT(DISTINCT recipient_contact_id)
            FILTER (
              WHERE recipient_contact_id IS NOT NULL
                AND created_at >= date_trunc('week', CURRENT_DATE)
            ) AS total_people_this_week,

          COUNT(DISTINCT NULLIF(TRIM(seller_id), ''))
            FILTER (
              WHERE created_at >= date_trunc('month', CURRENT_DATE)
            ) AS total_sellers_this_month,
          COUNT(DISTINCT NULLIF(TRIM(seller_id), ''))
            FILTER (
              WHERE created_at >= date_trunc('month', CURRENT_DATE) - interval '1 month'
                AND created_at < date_trunc('month', CURRENT_DATE)
            ) AS total_sellers_previous_month,
          COUNT(DISTINCT NULLIF(TRIM(seller_id), ''))
            FILTER (
              WHERE created_at >= date_trunc('week', CURRENT_DATE)
            ) AS total_sellers_this_week
        FROM given_gifts
      `,
      [contactId],
    );

    return metrics ?? this.getEmptyGiftRawMetrics();
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
            event.status,
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
        ),
        active_wishlist_events AS (
          SELECT event_id, created_at
          FROM scoped_wishlist_events
          WHERE LOWER(status) = $2
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
            SELECT COUNT(DISTINCT active_event.event_id)
            FROM active_wishlist_events active_event
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
            FROM active_wishlist_events active_event
            WHERE active_event.created_at >= date_trunc('week', CURRENT_DATE)
          ) AS active_wishlists_created_this_week
      `,
      [contactId, WISHLIST_STATUS.ONGOING],
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
        ),
        given_draw_name_gifts AS (
          SELECT
            gift.id,
            gift.created_at
          FROM event_gifts gift
          INNER JOIN event_participants giver_participant
            ON giver_participant.id = gift.giver_participant_id
            AND giver_participant.event_contact_id = $1
            AND giver_participant.deleted_at IS NULL
          INNER JOIN scoped_draw_name_events scoped_event
            ON scoped_event.event_id = gift.event_id
          WHERE gift.deleted_at IS NULL
        )
        SELECT
          (
            SELECT COUNT(*)
            FROM given_draw_name_gifts
          ) AS total_gifts,
          (
            SELECT COUNT(*)
            FROM active_draw_name_events
          ) AS active_draw_names,
          (
           SELECT COUNT(*)
            FROM scoped_draw_name_events
          ) AS total_draw_names_participated,
          (
            SELECT COUNT(DISTINCT participant.event_contact_id)
            FROM event_participants participant
            INNER JOIN active_draw_name_events active_event
              ON active_event.event_id = participant.event_id
            WHERE participant.deleted_at IS NULL
              AND participant.event_contact_id IS NOT NULL
              AND participant.event_contact_id != $1
          ) AS active_members,
          (
            SELECT COUNT(*)
            FROM given_draw_name_gifts gift
            WHERE gift.created_at >= date_trunc('month', CURRENT_DATE)
          ) AS total_gifts_this_month,
          (
            SELECT COUNT(*)
            FROM given_draw_name_gifts gift
            WHERE gift.created_at >= date_trunc('month', CURRENT_DATE) - interval '1 month'
              AND gift.created_at < date_trunc('month', CURRENT_DATE)
          ) AS total_gifts_previous_month,
          (
            SELECT COUNT(*)
            FROM scoped_draw_name_events scoped_event
            WHERE LOWER(scoped_event.status) = $2
              AND scoped_event.created_at >= date_trunc('week', CURRENT_DATE)
          ) AS active_draw_names_created_this_week
      `,
      [contactId, DRAW_NAME_STATUS.ONGOING],
    );

    return metrics ?? this.getEmptyRawMetrics();
  }

  private getPercentageChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  private toTrendMetric(
    value: string | number,
    currentMonth: string | number,
    previousMonth: string | number,
    currentWeek: string | number,
  ): GiftTrendMetricDto {
    const currentMonthValue = this.toNumber(currentMonth);
    const previousMonthValue = this.toNumber(previousMonth);

    return {
      value: this.toNumber(value),
      percentageChangeThisMonth: this.getPercentageChange(
        currentMonthValue,
        previousMonthValue,
      ),
      currentMonth: currentMonthValue,
      previousMonth: previousMonthValue,
      currentWeek: this.toNumber(currentWeek),
    };
  }

  private toNumber(value: string | number | null | undefined): number {
    return Number(value ?? 0);
  }

  private getEmptyRawMetrics(): DrawNameMetricsRawRow {
    return {
      total_gifts: 0,
      active_draw_names: 0,
      total_draw_names_participated: 0,
      active_members: 0,
      total_gifts_this_month: 0,
      total_gifts_previous_month: 0,
      active_draw_names_created_this_week: 0,
    };
  }

  private getEmptyGiftRawMetrics(): GiftMetricsRawRow {
    return {
      total_gifts: 0,
      total_amount_spent: 0,
      total_people: 0,
      total_sellers: 0,
      total_gifts_this_month: 0,
      total_gifts_previous_month: 0,
      total_gifts_this_week: 0,
      total_amount_spent_this_month: 0,
      total_amount_spent_previous_month: 0,
      total_amount_spent_this_week: 0,
      total_people_this_month: 0,
      total_people_previous_month: 0,
      total_people_this_week: 0,
      total_sellers_this_month: 0,
      total_sellers_previous_month: 0,
      total_sellers_this_week: 0,
    };
  }
}
