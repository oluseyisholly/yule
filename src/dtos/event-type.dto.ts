import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';
import { PaginationDto } from './pagination.dto';
import {
  IdResponseDto,
  createPaginatedDto,
  createResponseDto,
} from './response.dto';

function transformBoolean(value: unknown) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

export class CreateEventTypeDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateEventTypeDto extends PartialType(CreateEventTypeDto) {}

export class EventTypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class EventTypeDeleteDto extends IdResponseDto {}

export class EventTypeFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => transformBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}

export class FindEventTypesQueryDto extends IntersectionType(
  PaginationDto,
  EventTypeFilterDto,
) {}

export class PaginatedEventTypesDto extends createPaginatedDto(
  EventTypeResponseDto,
) {}

export class CreatedEventTypeResponseEnvelopeDto extends createResponseDto(
  EventTypeResponseDto,
  {
    codeExample: 201,
    messageExample: 'Event type created successfully',
  },
) {}

export class EventTypeResponseEnvelopeDto extends createResponseDto(
  EventTypeResponseDto,
  {
    codeExample: 200,
    messageExample: 'Event type fetched successfully',
  },
) {}

export class PaginatedEventTypesResponseEnvelopeDto extends createResponseDto(
  PaginatedEventTypesDto,
  {
    codeExample: 200,
    messageExample: 'Event types fetched successfully',
  },
) {}

export class EventTypeDeleteResponseEnvelopeDto extends createResponseDto(
  EventTypeDeleteDto,
  {
    codeExample: 200,
    messageExample: 'Event type deleted successfully',
  },
) {}
