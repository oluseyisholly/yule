import { ApiProperty } from '@nestjs/swagger';
import { createResponseDto } from './general.dto';

export class DrawNameGiftMetricDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  percentageChangeThisMonth: number;

  @ApiProperty()
  currentMonth: number;

  @ApiProperty()
  previousMonth: number;
}

export class DrawNameActiveMetricDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  newThisWeek: number;
}

export class DrawNameCountMetricDto {
  @ApiProperty()
  value: number;
}

export class DrawNameMetricsResponseDto {
  @ApiProperty({ type: DrawNameGiftMetricDto })
  totalGifts: DrawNameGiftMetricDto;

  @ApiProperty({ type: DrawNameActiveMetricDto })
  activeDrawNames: DrawNameActiveMetricDto;

  @ApiProperty({ type: DrawNameCountMetricDto })
  totalDrawNamesParticipated: DrawNameCountMetricDto;

  @ApiProperty({ type: DrawNameCountMetricDto })
  totalNames: DrawNameCountMetricDto;

  @ApiProperty({ type: DrawNameCountMetricDto })
  activeMembers: DrawNameCountMetricDto;
}

export class DrawNameMetricsResponseEnvelopeDto extends createResponseDto(
  DrawNameMetricsResponseDto,
  {
    codeExample: 200,
    messageExample: 'Draw name metrics fetched successfully',
  },
) {}

export class WishlistItemsMetricDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  percentageChangeThisMonth: number;

  @ApiProperty()
  currentMonth: number;

  @ApiProperty()
  previousMonth: number;
}

export class WishlistActiveMetricDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  newThisWeek: number;
}

export class WishlistMetricsResponseDto {
  @ApiProperty({ type: WishlistItemsMetricDto })
  totalItems: WishlistItemsMetricDto;

  @ApiProperty({ type: WishlistActiveMetricDto })
  activeWishlists: WishlistActiveMetricDto;

  @ApiProperty({ type: DrawNameCountMetricDto })
  totalParticipants: DrawNameCountMetricDto;

  @ApiProperty({ type: DrawNameCountMetricDto })
  reservedItems: DrawNameCountMetricDto;
}

export class WishlistMetricsResponseEnvelopeDto extends createResponseDto(
  WishlistMetricsResponseDto,
  {
    codeExample: 200,
    messageExample: 'Wishlist metrics fetched successfully',
  },
) {}

export class GiftTrendMetricDto {
  @ApiProperty()
  value: number;

  @ApiProperty()
  percentageChangeThisMonth: number;

  @ApiProperty()
  currentMonth: number;

  @ApiProperty()
  previousMonth: number;

  @ApiProperty()
  currentWeek: number;
}

export class GiftMetricsResponseDto {
  @ApiProperty({ type: GiftTrendMetricDto })
  totalGifts: GiftTrendMetricDto;

  @ApiProperty({ type: GiftTrendMetricDto })
  totalAmountSpent: GiftTrendMetricDto;

  @ApiProperty({ type: GiftTrendMetricDto })
  totalPeople: GiftTrendMetricDto;

  @ApiProperty({ type: GiftTrendMetricDto })
  totalSellers: GiftTrendMetricDto;
}

export class GiftMetricsResponseEnvelopeDto extends createResponseDto(
  GiftMetricsResponseDto,
  {
    codeExample: 200,
    messageExample: 'Gift metrics fetched successfully',
  },
) {}
