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
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';
import {
  DeleteResponseDto,
  PaginationDto,
  createPaginatedDto,
  createResponseDto,
} from './general.dto';

export class CreateWishlistEventBaseEventDto {
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

export class CreateWishlistEventDetailsDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowMultipleItems?: boolean;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsDateString()
  eventDeadline?: Date;

  @ApiPropertyOptional({ example: 'private', default: 'private' })
  @Trim()
  @IsOptional()
  @IsString()
  visibility?: string;
}

export class CreateWishlistEventDto extends CreateWishlistEventDetailsDto {
  @ApiProperty({ type: CreateWishlistEventBaseEventDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateWishlistEventBaseEventDto)
  event: CreateWishlistEventBaseEventDto;
}

export class UpdateWishlistEventBaseEventDto extends PartialType(
  CreateWishlistEventBaseEventDto,
) {}

export class UpdateWishlistEventDetailsDto extends PartialType(
  CreateWishlistEventDetailsDto,
) {}

export class UpdateWishlistEventDto extends UpdateWishlistEventDetailsDto {
  @ApiPropertyOptional({ type: UpdateWishlistEventBaseEventDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateWishlistEventBaseEventDto)
  event?: UpdateWishlistEventBaseEventDto;
}

export class WishlistEventFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsString()
  visibility?: string;
}

export class FindWishlistEventsQueryDto extends IntersectionType(
  PaginationDto,
  WishlistEventFilterDto,
) {}

export class WishlistEventCreatorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class WishlistEventParticipantPersonResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class WishlistEventParticipantResponseDto {
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

  @ApiPropertyOptional({ type: WishlistEventParticipantPersonResponseDto })
  eventContact?: WishlistEventParticipantPersonResponseDto;
}

export class WishlistEventBaseEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  eventTypeId: string;

  @ApiPropertyOptional()
  eventDate?: Date;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ type: WishlistEventCreatorResponseDto })
  createdBy?: WishlistEventCreatorResponseDto;

  @ApiPropertyOptional({ type: [WishlistEventParticipantResponseDto] })
  participants?: WishlistEventParticipantResponseDto[];
}

export class WishlistEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  allowMultipleItems: boolean;

  @ApiPropertyOptional()
  eventDeadline?: Date;

  @ApiProperty()
  visibility: string;

  @ApiProperty({ type: WishlistEventBaseEventResponseDto })
  event: WishlistEventBaseEventResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class PublicWishlistEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  eventDate?: Date;

  @ApiProperty()
  visibility: string;

  @ApiProperty()
  allowMultipleItems: boolean;

  @ApiPropertyOptional()
  eventDeadline?: Date;

  @ApiProperty()
  redirectPath: string;
}

export class PaginatedWishlistEventsDto extends createPaginatedDto(
  WishlistEventResponseDto,
) {}

export class CreatedWishlistEventResponseEnvelopeDto extends createResponseDto(
  WishlistEventResponseDto,
  {
    codeExample: 201,
    messageExample: 'Wishlist event created successfully',
  },
) {}

export class WishlistEventResponseEnvelopeDto extends createResponseDto(
  WishlistEventResponseDto,
  {
    codeExample: 200,
    messageExample: 'Wishlist event fetched successfully',
  },
) {}

export class PaginatedWishlistEventsResponseEnvelopeDto extends createResponseDto(
  PaginatedWishlistEventsDto,
  {
    codeExample: 200,
    messageExample: 'Wishlist events fetched successfully',
  },
) {}

export class WishlistEventDeleteResponseEnvelopeDto extends createResponseDto(
  DeleteResponseDto,
  {
    codeExample: 200,
    messageExample: 'Wishlist event deleted successfully',
  },
) {}

export class PublicWishlistEventResponseEnvelopeDto extends createResponseDto(
  PublicWishlistEventResponseDto,
  {
    codeExample: 200,
    messageExample: 'Wishlist event fetched successfully',
  },
) {}
