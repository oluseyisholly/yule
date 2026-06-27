import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEmail,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender } from 'src/common/index.enum';
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';
import {
  DeleteResponseDto,
  PaginationDto,
  createPaginatedDto,
  createResponseDto,
} from './general.dto';

export class CreateEventContactDto {
  @ApiProperty({ enum: Gender })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @Trim()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class UpdateEventContactDto extends PartialType(CreateEventContactDto) {}

export class CreateBulkEventContactsDto {
  @ApiProperty({ type: [CreateEventContactDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateEventContactDto)
  contacts: CreateEventContactDto[];
}

export class SyncEventContactDto extends CreateEventContactDto {
  @ApiProperty({
    description: 'External auth user id to link to this contact',
  })
  @Trim()
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class EventContactFilterDto extends BaseFilterDto {
  @ApiPropertyOptional({ enum: Gender })
  @Trim()
  @IsOptional()
  @IsString()
  gender?: Gender;
}

export class FindEventContactsQueryDto extends IntersectionType(
  PaginationDto,
  EventContactFilterDto,
) {}

export class EventContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  userId?: string;

  @ApiPropertyOptional()
  note?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class PaginatedEventContactsDto extends createPaginatedDto(
  EventContactResponseDto,
) {}

export class PaginatedEventContactsResponseEnvelopeDto extends createResponseDto(
  PaginatedEventContactsDto,
  {
    codeExample: 200,
    messageExample: 'Event contacts fetched successfully',
  },
) {}

export class CreatedEventContactResponseEnvelopeDto extends createResponseDto(
  EventContactResponseDto,
  {
    codeExample: 201,
    messageExample: 'Event contact created successfully',
  },
) {}

export class BulkCreatedEventContactsResponseEnvelopeDto {
  @ApiProperty({ example: 201 })
  code: number;

  @ApiProperty({ example: 'Event contacts created successfully' })
  message: string;

  @ApiProperty({ type: [EventContactResponseDto] })
  data: EventContactResponseDto[];
}

export class UpdatedEventContactResponseEnvelopeDto extends createResponseDto(
  EventContactResponseDto,
  {
    codeExample: 200,
    messageExample: 'Event contact updated successfully',
  },
) {}

export class SyncedEventContactResponseEnvelopeDto extends createResponseDto(
  EventContactResponseDto,
  {
    codeExample: 200,
    messageExample: 'Event contact synced successfully',
  },
) {}

export class DeletedEventContactResponseEnvelopeDto extends createResponseDto(
  DeleteResponseDto,
  {
    codeExample: 200,
    messageExample: 'Event contact deleted successfully',
  },
) {}

export class CurrentContactIdResponseDto {
  @ApiProperty()
  contactId: string;
}

export class CurrentContactIdResponseEnvelopeDto extends createResponseDto(
  CurrentContactIdResponseDto,
  {
    codeExample: 200,
    messageExample: 'Current contact id fetched successfully',
  },
) {}

export class EnsuredMeContactResponseEnvelopeDto extends createResponseDto(
  EventContactResponseDto,
  {
    codeExample: 200,
    messageExample: 'Logged-in user contact ensured successfully',
  },
) {}
