import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseFilterDto } from './baseFilter.dto';
import { Trim } from 'src/decorators/trim.decorator';
import { EventOption } from 'src/common/index.enum';
import {
  createPaginatedDto,
  createResponseDto,
  PaginationDto,
} from './general.dto';

export class EventDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Trim()
  @IsDate()
  date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  time: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  duration: number;
}


export class EventFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @Trim()
  @IsString()
  @IsOptional()
  searchQuery?: string;

  @ApiPropertyOptional()
  @Trim()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: EventOption })
  @IsEnum(EventOption)
  @IsOptional()
  eventOption?: EventOption;
}

export class FindParticipatedEventsQueryDto extends IntersectionType(
  PaginationDto,
  EventFilterDto,
) {}

export class EventContactSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class EventTypeSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  key?: string | null;

  @ApiPropertyOptional()
  description?: string | null;
}

export class RelatedEventIdentifierResponseDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiProperty()
  eventId: string;
}

export class EventParticipantSummaryResponseDto {
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

  @ApiPropertyOptional({ type: EventContactSummaryResponseDto })
  eventContact?: EventContactSummaryResponseDto;
}

export class EventResponseDto {
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

  @ApiPropertyOptional({ type: EventTypeSummaryResponseDto })
  eventType?: EventTypeSummaryResponseDto;

  @ApiPropertyOptional({ type: RelatedEventIdentifierResponseDto })
  drawNameEvent?: RelatedEventIdentifierResponseDto;

  @ApiPropertyOptional({ type: RelatedEventIdentifierResponseDto })
  wishlistEvent?: RelatedEventIdentifierResponseDto;

  @ApiPropertyOptional({ type: RelatedEventIdentifierResponseDto })
  giftingEvent?: RelatedEventIdentifierResponseDto;

  @ApiPropertyOptional({ type: RelatedEventIdentifierResponseDto })
  hangoutEvent?: RelatedEventIdentifierResponseDto;

  @ApiPropertyOptional({ type: EventContactSummaryResponseDto })
  createdBy?: EventContactSummaryResponseDto;

  @ApiPropertyOptional({ type: [EventParticipantSummaryResponseDto] })
  participants?: EventParticipantSummaryResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class PaginatedEventsDto extends createPaginatedDto(EventResponseDto) {}

export class PaginatedEventsResponseEnvelopeDto extends createResponseDto(
  PaginatedEventsDto,
  {
    codeExample: 200,
    messageExample: 'Participated events fetched successfully',
  },
) {}
