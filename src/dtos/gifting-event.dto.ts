import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { DateNotAfter } from 'src/decorators/date-not-after.decorator';
import { Trim } from 'src/decorators/trim.decorator';
import { EventOption } from 'src/common/index.enum';
import { BaseFilterDto } from './baseFilter.dto';
import {
  DeleteResponseDto,
  PaginationDto,
  createPaginatedDto,
  createResponseDto,
} from './general.dto';

export class CreateGiftingEventBaseEventDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  eventTypeId: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsDateString()
  eventDate?: Date;
}

export class CreateGiftingEventDetailsDto {
  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  giftBudget?: number;

  @ApiPropertyOptional({ default: 'NGN' })
  @Trim()
  @IsOptional()
  @IsString()
  currency?: string = 'NGN';

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsDateString()
  @DateNotAfter('event.eventDate', {
    message: 'giftDeadline cannot be after event.eventDate',
  })
  giftDeadline?: Date;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allowAnonymousGifting?: boolean = false;
}

export class CreateGiftingEventDto extends CreateGiftingEventDetailsDto {
  @ApiProperty({ type: CreateGiftingEventBaseEventDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateGiftingEventBaseEventDto)
  event: CreateGiftingEventBaseEventDto;
}

export class UpdateGiftingEventBaseEventDto extends PartialType(
  CreateGiftingEventBaseEventDto,
) {}

export class UpdateGiftingEventDetailsDto extends PartialType(
  CreateGiftingEventDetailsDto,
) {}

export class UpdateGiftingEventDto extends UpdateGiftingEventDetailsDto {
  @ApiPropertyOptional({ type: UpdateGiftingEventBaseEventDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateGiftingEventBaseEventDto)
  event?: UpdateGiftingEventBaseEventDto;
}

export class GiftingEventFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsString()
  status?: string;
}

export class FindGiftingEventsQueryDto extends IntersectionType(
  PaginationDto,
  GiftingEventFilterDto,
) {}

export class GiftingEventParticipantPersonResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class GiftingEventParticipantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiPropertyOptional()
  eventContactId?: string;

  @ApiPropertyOptional()
  giftGiverParticipantId?: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  isNotified: boolean;

  @ApiProperty()
  isPairActive: boolean;

  @ApiPropertyOptional({ type: GiftingEventParticipantPersonResponseDto })
  eventContact?: GiftingEventParticipantPersonResponseDto;
}

export class GiftingEventCreatorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class GiftingEventBaseEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  eventTypeId: string;

  @ApiPropertyOptional({ enum: EventOption })
  eventOption?: EventOption | null;

  @ApiPropertyOptional()
  eventDate?: Date;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ type: GiftingEventCreatorResponseDto })
  createdBy?: GiftingEventCreatorResponseDto;

  @ApiPropertyOptional({ type: [GiftingEventParticipantResponseDto] })
  participants?: GiftingEventParticipantResponseDto[];
}

export class GiftingEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiPropertyOptional()
  giftBudget?: number;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  giftDeadline?: Date;

  @ApiProperty()
  allowAnonymousGifting: boolean;

  @ApiProperty({ type: GiftingEventBaseEventResponseDto })
  event: GiftingEventBaseEventResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class PaginatedGiftingEventsDto extends createPaginatedDto(
  GiftingEventResponseDto,
) {}

export class CreatedGiftingEventResponseEnvelopeDto extends createResponseDto(
  GiftingEventResponseDto,
  {
    codeExample: 201,
    messageExample: 'Gifting event created successfully',
  },
) {}

export class GiftingEventResponseEnvelopeDto extends createResponseDto(
  GiftingEventResponseDto,
  {
    codeExample: 200,
    messageExample: 'Gifting event fetched successfully',
  },
) {}

export class PaginatedGiftingEventsResponseEnvelopeDto extends createResponseDto(
  PaginatedGiftingEventsDto,
  {
    codeExample: 200,
    messageExample: 'Gifting events fetched successfully',
  },
) {}

export class GiftingEventDeleteResponseEnvelopeDto extends createResponseDto(
  DeleteResponseDto,
  {
    codeExample: 200,
    messageExample: 'Gifting event deleted successfully',
  },
) {}
