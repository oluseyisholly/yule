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
import {
  DeleteResponseDto,
  PaginationDto,
  createPaginatedDto,
  createResponseDto,
} from './general.dto';

function transformBoolean(value: unknown) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

export class CreateRelationshipDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional()
  @Trim({ emptyToNull: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateRelationshipDto extends PartialType(CreateRelationshipDto) {}

export class RelationshipResponseDto {
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

export class RelationshipFilterDto extends BaseFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => transformBoolean(value))
  @IsBoolean()
  isActive?: boolean;
}

export class FindRelationshipsQueryDto extends IntersectionType(
  PaginationDto,
  RelationshipFilterDto,
) {}

export class PaginatedRelationshipsDto extends createPaginatedDto(
  RelationshipResponseDto,
) {}

export class CreatedRelationshipResponseEnvelopeDto extends createResponseDto(
  RelationshipResponseDto,
  {
    codeExample: 201,
    messageExample: 'Relationship created successfully',
  },
) {}

export class RelationshipResponseEnvelopeDto extends createResponseDto(
  RelationshipResponseDto,
  {
    codeExample: 200,
    messageExample: 'Relationship fetched successfully',
  },
) {}

export class PaginatedRelationshipsResponseEnvelopeDto extends createResponseDto(
  PaginatedRelationshipsDto,
  {
    codeExample: 200,
    messageExample: 'Relationships fetched successfully',
  },
) {}

export class RelationshipDeleteResponseEnvelopeDto extends createResponseDto(
  DeleteResponseDto,
  {
    codeExample: 200,
    messageExample: 'Relationship deleted successfully',
  },
) {}
