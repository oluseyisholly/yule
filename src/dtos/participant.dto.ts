import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { EventParticipantRole } from 'src/entities/event-participant.entity';
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';
import {
  DeleteResponseDto,
  PaginationDto,
  createPaginatedDto,
  createResponseDto,
} from './general.dto';

export class CreateParticipantDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  eventId: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  contactId: string;

  @ApiPropertyOptional({
    enum: EventParticipantRole,
    default: EventParticipantRole.PARTICIPANT,
  })
  @IsOptional()
  @IsEnum(EventParticipantRole)
  role?: EventParticipantRole = EventParticipantRole.PARTICIPANT;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isNotified?: boolean = false;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPairActive?: boolean = false;
}

export class UpdateParticipantDto extends PartialType(CreateParticipantDto) {}

export class UpdateMyParticipantByEventDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isNotified?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isPairActive?: boolean;
}

export class BulkParticipantContactDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  contactId: string;
}

export class CreateBulkParticipantDto {
  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsUUID()
  drawNameEventId?: string;

  @ApiPropertyOptional({
    enum: EventParticipantRole,
    default: EventParticipantRole.PARTICIPANT,
  })
  @IsOptional()
  @IsEnum(EventParticipantRole)
  role?: EventParticipantRole = EventParticipantRole.PARTICIPANT;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  contactIds: string[];
}

export class AssignParticipantGiverDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  participantId: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  giftGiverParticipantId: string;
}

export class BulkAssignParticipantGiversDto {
  @ApiProperty({ type: [AssignParticipantGiverDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AssignParticipantGiverDto)
  assignments: AssignParticipantGiverDto[];
}

export class ParticipantFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ enum: EventParticipantRole })
  @IsOptional()
  @IsEnum(EventParticipantRole)
  role?: EventParticipantRole;

  @ApiPropertyOptional({
    description: 'When true, only returns participants without an assigned giver',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  unpairedOnly?: boolean;
}

export class FindParticipantsQueryDto extends IntersectionType(
  PaginationDto,
  ParticipantFilterDto,
) {}

export class FindMyGiftRecipientQueryDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  drawNameEventId: string;
}

export class ParticipantContactResponseDto {
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

export class ParticipantGiftGiverResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ type: ParticipantContactResponseDto })
  eventContact?: ParticipantContactResponseDto;
}

export class ParticipantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiPropertyOptional()
  eventContactId?: string;

  @ApiPropertyOptional({ type: ParticipantContactResponseDto })
  eventContact?: ParticipantContactResponseDto;

  @ApiPropertyOptional()
  giftGiverParticipantId?: string;

  @ApiPropertyOptional({ type: ParticipantGiftGiverResponseDto })
  giftGiverParticipant?: ParticipantGiftGiverResponseDto;

  @ApiProperty({ enum: EventParticipantRole })
  role: EventParticipantRole;

  @ApiProperty()
  isNotified: boolean;

  @ApiProperty()
  isPairActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class PaginatedParticipantsDto extends createPaginatedDto(
  ParticipantResponseDto,
) {}

export class CreatedParticipantResponseEnvelopeDto extends createResponseDto(
  ParticipantResponseDto,
  {
    codeExample: 201,
    messageExample: 'Participant created successfully',
  },
) {}

export class BulkCreatedParticipantsResponseEnvelopeDto {
  @ApiProperty({ example: 201 })
  code: number;

  @ApiProperty({ example: 'Participants created successfully' })
  message: string;

  @ApiProperty({ type: [ParticipantResponseDto] })
  data: ParticipantResponseDto[];
}

export class BulkAssignedParticipantGiversResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 'Participant givers assigned successfully' })
  message: string;

  @ApiProperty({ type: [ParticipantResponseDto] })
  data: ParticipantResponseDto[];
}

export class ParticipantResponseEnvelopeDto extends createResponseDto(
  ParticipantResponseDto,
  {
    codeExample: 200,
    messageExample: 'Participant fetched successfully',
  },
) {}

export class MyParticipantByEventResponseEnvelopeDto extends createResponseDto(
  ParticipantResponseDto,
  {
    codeExample: 200,
    messageExample: 'Participant fetched successfully',
  },
) {}

export class MyGiftRecipientResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 'Gift recipient fetched successfully' })
  message: string;

  @ApiPropertyOptional({
    type: ParticipantResponseDto,
    nullable: true,
  })
  data?: ParticipantResponseDto | null;
}

export class PaginatedParticipantsResponseEnvelopeDto extends createResponseDto(
  PaginatedParticipantsDto,
  {
    codeExample: 200,
    messageExample: 'Participants fetched successfully',
  },
) {}

export class ParticipantContactIdsResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({
    example: 'Draw name event participant contact ids fetched successfully',
  })
  message: string;

  @ApiProperty({
    type: [String],
    example: ['82027271-39ca-45df-95c2-3dfa2e571fb5'],
  })
  data: string[];
}

export class ParticipantDeleteResponseEnvelopeDto extends createResponseDto(
  DeleteResponseDto,
  {
    codeExample: 200,
    messageExample: 'Participant deleted successfully',
  },
) {}
