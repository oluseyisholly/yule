import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Trim } from 'src/decorators/trim.decorator';
import { EventOption } from 'src/common/index.enum';
import { BaseFilterDto } from './baseFilter.dto';
import {
  DeleteResponseDto,
  PaginatedRecordsDto,
  PaginationDto,
  createPaginatedDto,
  createResponseDto,
} from './general.dto';

function transformNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return value;
  return Number(value);
}

export class GiftDetailsDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  participantGiftId: string;

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

  @ApiProperty({ minimum: 0 })
  @Transform(({ value }) => transformNumber(value))
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ default: 'NGN' })
  @Trim()
  @IsOptional()
  @IsString()
  currency?: string = 'NGN';

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  categorySlug?: string | null;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  subCategorySlug?: string | null;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  condition?: string | null;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  locationState?: string | null;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  locationCity?: string | null;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  sellerId?: string | null;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  productSlug?: string | null;
}

export class CreateGiftDto extends GiftDetailsDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  recipientParticipantId: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsUUID()
  giverParticipantId?: string;
}

export class CreateBulkGiftsDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  recipientParticipantId: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsUUID()
  giverParticipantId?: string;

  @ApiProperty({ type: [GiftDetailsDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GiftDetailsDto)
  gifts: GiftDetailsDto[];
}

export class CreateBulkGiftAssignmentsDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @ApiPropertyOptional({
    description:
      'Defaults to the signed-in contact participant for this event when omitted.',
  })
  @Trim()
  @IsOptional()
  @IsUUID()
  giverParticipantId?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  recipientParticipantIds: string[];

  @ApiProperty({ type: [GiftDetailsDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GiftDetailsDto)
  gifts: GiftDetailsDto[];
}

export class UpdateGiftDto extends PartialType(CreateGiftDto) {}

export class GiftFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsUUID()
  recipientParticipantId?: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsUUID()
  giverParticipantId?: string;
}

export class FindGiftsQueryDto extends IntersectionType(
  PaginationDto,
  GiftFilterDto,
) {}

export class GiftParticipantContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  profileUrl?: string;
}

export class GiftParticipantResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  eventContactId?: string;

  @ApiPropertyOptional({ type: GiftParticipantContactResponseDto })
  eventContact?: GiftParticipantContactResponseDto;
}

export class GiftEventResponseDto {
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
}

export class GiftRecipientPersonResponseDto {
  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  profileUrl?: string;
}

export class GroupedGivenGiftResponseDto {
  @ApiProperty()
  participantGiftId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  imageUrl?: string | null;

  @ApiPropertyOptional()
  categorySlug?: string | null;

  @ApiPropertyOptional()
  subCategorySlug?: string | null;

  @ApiPropertyOptional()
  condition?: string | null;

  @ApiPropertyOptional()
  locationState?: string | null;

  @ApiPropertyOptional()
  locationCity?: string | null;

  @ApiPropertyOptional()
  sellerId?: string | null;

  @ApiPropertyOptional()
  productSlug?: string | null;

  @ApiProperty()
  recipientCount: number;

  @ApiProperty({ type: [GiftRecipientPersonResponseDto] })
  people: GiftRecipientPersonResponseDto[];

  @ApiPropertyOptional({ type: GiftEventResponseDto })
  event?: GiftEventResponseDto;
}

export class GroupedGivenGiftItemResponseDto {
  @ApiProperty()
  participantGiftId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  imageUrl?: string | null;

  @ApiPropertyOptional()
  categorySlug?: string | null;

  @ApiPropertyOptional()
  subCategorySlug?: string | null;

  @ApiPropertyOptional()
  condition?: string | null;

  @ApiPropertyOptional()
  locationState?: string | null;

  @ApiPropertyOptional()
  locationCity?: string | null;

  @ApiPropertyOptional()
  sellerId?: string | null;

  @ApiPropertyOptional()
  productSlug?: string | null;

  @ApiProperty()
  recipientCount: number;

  @ApiProperty({ type: [GiftRecipientPersonResponseDto] })
  people: GiftRecipientPersonResponseDto[];
}

export class GroupedGivenGiftsByEventResponseDto {
  @ApiProperty({ type: GiftEventResponseDto })
  event: GiftEventResponseDto;

  @ApiProperty({ type: [GroupedGivenGiftItemResponseDto] })
  gifts: GroupedGivenGiftItemResponseDto[];
}

export class GiftResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiPropertyOptional()
  recipientParticipantId?: string;

  @ApiPropertyOptional()
  giverParticipantId?: string;

  @ApiProperty()
  participantGiftId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  categorySlug?: string;

  @ApiPropertyOptional()
  subCategorySlug?: string;

  @ApiPropertyOptional()
  condition?: string;

  @ApiPropertyOptional()
  locationState?: string;

  @ApiPropertyOptional()
  locationCity?: string;

  @ApiPropertyOptional()
  sellerId?: string;

  @ApiPropertyOptional()
  productSlug?: string;

  @ApiPropertyOptional({ type: GiftParticipantResponseDto })
  recipientParticipant?: GiftParticipantResponseDto;

  @ApiPropertyOptional({ type: GiftParticipantResponseDto })
  giverParticipant?: GiftParticipantResponseDto;

  @ApiPropertyOptional({ type: GiftEventResponseDto })
  event?: GiftEventResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class GiftSelectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  participantGiftId: string;
}

export class FindParticipantGiftSelectionsQueryDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  eventId: string;
}

export class PaginatedGiftsDto extends createPaginatedDto(GiftResponseDto) {}

export class PaginatedGroupedGivenGiftsDto extends createPaginatedDto(
  GroupedGivenGiftResponseDto,
) {}

export class PaginatedGroupedGivenGiftsByEventDto extends createPaginatedDto(
  GroupedGivenGiftsByEventResponseDto,
) {}

export class CreatedGiftResponseEnvelopeDto extends createResponseDto(
  GiftResponseDto,
  {
    codeExample: 201,
    messageExample: 'Gift created successfully',
  },
) {}

export class BulkCreatedGiftsResponseEnvelopeDto {
  @ApiProperty({ example: 201 })
  code: number;

  @ApiProperty({ example: 'Gifts created successfully' })
  message: string;

  @ApiProperty({ type: [GiftResponseDto] })
  data: GiftResponseDto[];
}

export class BulkAssignedGiftsResponseEnvelopeDto {
  @ApiProperty({ example: 201 })
  code: number;

  @ApiProperty({ example: 'Gifts assigned successfully' })
  message: string;

  @ApiProperty({ type: [GiftResponseDto] })
  data: GiftResponseDto[];
}

export class GiftResponseEnvelopeDto extends createResponseDto(
  GiftResponseDto,
  {
    codeExample: 200,
    messageExample: 'Gift fetched successfully',
  },
) {}

export class PaginatedGiftsResponseEnvelopeDto extends createResponseDto(
  PaginatedGiftsDto,
  {
    codeExample: 200,
    messageExample: 'Gifts fetched successfully',
  },
) {}

export class GiftSelectionsResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 'Participant gift selections fetched successfully' })
  message: string;

  @ApiProperty({ type: [GiftSelectionResponseDto] })
  data: GiftSelectionResponseDto[];
}

export class ClaimedGiftIdsResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 'Claimed gift ids fetched successfully' })
  message: string;

  @ApiProperty({
    type: [String],
    example: ['8b2dd47f-2c53-43d9-a806-1c44d0f142e7'],
  })
  data: string[];
}

export class GroupedGivenGiftsResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 'Grouped given gifts fetched successfully' })
  message: string;

  @ApiProperty({ type: [GroupedGivenGiftResponseDto] })
  data: GroupedGivenGiftResponseDto[];
}

export class PaginatedGroupedGivenGiftsResponseEnvelopeDto extends createResponseDto(
  PaginatedGroupedGivenGiftsDto,
  {
    codeExample: 200,
    messageExample: 'Grouped given gifts fetched successfully',
  },
) {}

export class PaginatedGroupedGivenGiftsByEventResponseEnvelopeDto extends createResponseDto(
  PaginatedGroupedGivenGiftsByEventDto,
  {
    codeExample: 200,
    messageExample: 'Grouped given gifts fetched successfully',
  },
) {}

export class GiftDeleteResponseEnvelopeDto extends createResponseDto(
  DeleteResponseDto,
  {
    codeExample: 200,
    messageExample: 'Gift deleted successfully',
  },
) {}
