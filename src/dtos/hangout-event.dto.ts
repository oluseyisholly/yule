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
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { EventOption } from 'src/common/index.enum';
import { DateNotAfter } from 'src/decorators/date-not-after.decorator';
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';
import {
  DeleteResponseDto,
  PaginationDto,
  createPaginatedDto,
  createResponseDto,
} from './general.dto';

export class CreateHangoutEventBaseEventDto {
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

export class CreateHangoutEventDetailsDto {
  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  location?: string | null;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  hangoutEventId?: string | null;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  eventCenterName?: string | null;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsDateString()
  @DateNotAfter('checkOutDate', {
    message: 'checkInDate cannot be after checkOutDate',
  })
  checkInDate?: Date;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsDateString()
  checkOutDate?: Date;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfGuests?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttendees?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allowPlusOne?: boolean = false;
}

export class CreateHangoutEventDto extends CreateHangoutEventDetailsDto {
  @ApiProperty({ type: CreateHangoutEventBaseEventDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateHangoutEventBaseEventDto)
  event: CreateHangoutEventBaseEventDto;
}

export class UpdateHangoutEventBaseEventDto extends PartialType(
  CreateHangoutEventBaseEventDto,
) {}

export class UpdateHangoutEventDetailsDto extends PartialType(
  CreateHangoutEventDetailsDto,
) {}

export class UpdateHangoutEventDto extends UpdateHangoutEventDetailsDto {
  @ApiPropertyOptional({ type: UpdateHangoutEventBaseEventDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateHangoutEventBaseEventDto)
  event?: UpdateHangoutEventBaseEventDto;
}

export class HangoutEventFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsString()
  status?: string;
}

export class FindHangoutEventsQueryDto extends IntersectionType(
  PaginationDto,
  HangoutEventFilterDto,
) {}

export class HangoutEventContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  profileUrl?: string;
}

export class HangoutEventParticipantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiPropertyOptional()
  eventContactId?: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  isNotified: boolean;

  @ApiProperty()
  isPairActive: boolean;

  @ApiPropertyOptional({ type: HangoutEventContactResponseDto })
  eventContact?: HangoutEventContactResponseDto;
}

export class HangoutEventBaseEventResponseDto {
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

  @ApiPropertyOptional({ type: HangoutEventContactResponseDto })
  createdBy?: HangoutEventContactResponseDto;

  @ApiPropertyOptional({ type: [HangoutEventParticipantResponseDto] })
  participants?: HangoutEventParticipantResponseDto[];
}

export class HangoutEventResponseDto {
  @ApiProperty()
  eventId: string;

  @ApiPropertyOptional()
  location?: string | null;

  @ApiPropertyOptional()
  hangoutEventId?: string | null;

  @ApiPropertyOptional()
  eventCenterName?: string | null;

  @ApiPropertyOptional()
  checkInDate?: Date;

  @ApiPropertyOptional()
  checkOutDate?: Date;

  @ApiPropertyOptional()
  numberOfGuests?: number;

  @ApiPropertyOptional()
  amount?: number;

  @ApiPropertyOptional()
  imageUrl?: string | null;

  @ApiPropertyOptional()
  maxAttendees?: number;

  @ApiProperty()
  allowPlusOne: boolean;

  @ApiProperty({ type: HangoutEventBaseEventResponseDto })
  event: HangoutEventBaseEventResponseDto;
}

export class PaginatedHangoutEventsDto extends createPaginatedDto(
  HangoutEventResponseDto,
) {}

export class CreatedHangoutEventResponseEnvelopeDto extends createResponseDto(
  HangoutEventResponseDto,
  {
    codeExample: 201,
    messageExample: 'Hangout event created successfully',
  },
) {}

export class HangoutEventResponseEnvelopeDto extends createResponseDto(
  HangoutEventResponseDto,
  {
    codeExample: 200,
    messageExample: 'Hangout event fetched successfully',
  },
) {}

export class PaginatedHangoutEventsResponseEnvelopeDto extends createResponseDto(
  PaginatedHangoutEventsDto,
  {
    codeExample: 200,
    messageExample: 'Hangout events fetched successfully',
  },
) {}

export class HangoutEventDeleteResponseEnvelopeDto extends createResponseDto(
  DeleteResponseDto,
  {
    codeExample: 200,
    messageExample: 'Hangout event deleted successfully',
  },
) {}
