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
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';
import {
  DeleteResponseDto,
  PaginationDto,
  createPaginatedDto,
  createResponseDto,
} from './general.dto';

export class CreateDrawNameEventBaseEventDto {
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

export class CreateDrawNameEventDetailsDto {
  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsDateString()
  drawDate?: Date;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumSpend?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allowSelfDraw?: boolean = false;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDrawCompleted?: boolean = false;
}

export class CreateDrawNameEventDto extends CreateDrawNameEventDetailsDto {
  @ApiProperty({ type: CreateDrawNameEventBaseEventDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateDrawNameEventBaseEventDto)
  event: CreateDrawNameEventBaseEventDto;
}

export class UpdateDrawNameEventBaseEventDto extends PartialType(
  CreateDrawNameEventBaseEventDto,
) {}

export class UpdateDrawNameEventDetailsDto extends PartialType(
  CreateDrawNameEventDetailsDto,
) {}

export class UpdateDrawNameEventDto extends UpdateDrawNameEventDetailsDto {
  @ApiPropertyOptional({ type: UpdateDrawNameEventBaseEventDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDrawNameEventBaseEventDto)
  event?: UpdateDrawNameEventBaseEventDto;
}

export class DrawNameEventFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsString()
  status?: string;
}

export class FindDrawNameEventsQueryDto extends IntersectionType(
  PaginationDto,
  DrawNameEventFilterDto,
) {}

export class DrawNameEventParticipantPersonResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class DrawNameEventParticipantResponseDto {
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

  @ApiPropertyOptional({ type: DrawNameEventParticipantPersonResponseDto })
  eventContact?: DrawNameEventParticipantPersonResponseDto;
}

export class DrawNameEventCreatorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class DrawNameEventBaseEventResponseDto {
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

  @ApiPropertyOptional({ type: DrawNameEventCreatorResponseDto })
  createdBy?: DrawNameEventCreatorResponseDto;

  @ApiPropertyOptional({ type: [DrawNameEventParticipantResponseDto] })
  participants?: DrawNameEventParticipantResponseDto[];
}

export class DrawNameEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  drawDate?: Date;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  maximumSpend?: number;

  @ApiPropertyOptional()
  budget?: number;

  @ApiProperty()
  allowSelfDraw: boolean;

  @ApiProperty()
  isDrawCompleted: boolean;

  @ApiProperty({ type: DrawNameEventBaseEventResponseDto })
  event: DrawNameEventBaseEventResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class PaginatedDrawNameEventsDto extends createPaginatedDto(
  DrawNameEventResponseDto,
) {}

export class CreatedDrawNameEventResponseEnvelopeDto extends createResponseDto(
  DrawNameEventResponseDto,
  {
    codeExample: 201,
    messageExample: 'Draw name event created successfully',
  },
) {}

export class DrawNameEventResponseEnvelopeDto extends createResponseDto(
  DrawNameEventResponseDto,
  {
    codeExample: 200,
    messageExample: 'Draw name event fetched successfully',
  },
) {}

export class DrawNameEventDrawResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 'Draw names assigned successfully' })
  message: string;

  @ApiProperty({ type: [DrawNameEventParticipantResponseDto] })
  data: DrawNameEventParticipantResponseDto[];
}

export class PaginatedDrawNameEventsResponseEnvelopeDto extends createResponseDto(
  PaginatedDrawNameEventsDto,
  {
    codeExample: 200,
    messageExample: 'Draw name events fetched successfully',
  },
) {}

export class DrawNameEventDeleteResponseEnvelopeDto extends createResponseDto(
  DeleteResponseDto,
  {
    codeExample: 200,
    messageExample: 'Draw name event deleted successfully',
  },
) {}
