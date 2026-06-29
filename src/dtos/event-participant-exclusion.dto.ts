import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Trim } from 'src/decorators/trim.decorator';

export class CreateParticipantExclusionDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  participantId: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  excludedParticipantId: string;
}

export class CreateBulkParticipantExclusionsDto {
  @ApiProperty({ type: [CreateParticipantExclusionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateParticipantExclusionDto)
  exclusions: CreateParticipantExclusionDto[];
}

export class ParticipantExclusionQueryDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsUUID()
  eventId: string;
}

export class ParticipantExclusionContactDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiPropertyOptional()
  profileUrl?: string;
}

export class ParticipantExclusionParticipantDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ required: false })
  eventContactId?: string;

  @ApiProperty({ type: ParticipantExclusionContactDto, required: false })
  eventContact?: ParticipantExclusionContactDto;
}

export class ParticipantExclusionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  participantOneId: string;

  @ApiProperty()
  participantTwoId: string;

  @ApiProperty({ type: ParticipantExclusionParticipantDto })
  participantOne: ParticipantExclusionParticipantDto;

  @ApiProperty({ type: ParticipantExclusionParticipantDto })
  participantTwo: ParticipantExclusionParticipantDto;

  @ApiProperty()
  createdAt: Date;
}

export class ParticipantExclusionPairResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    type: [String],
    example: [
      '1b10bb02-7b31-4f6a-a5cc-78eb1dad45ed',
      'd37970fd-c9db-43ed-ac2d-1f846c9b7012',
    ],
  })
  participantIds: string[];
}

export class BulkParticipantExclusionsResponseEnvelopeDto {
  @ApiProperty({ example: 201 })
  code: number;

  @ApiProperty({ example: 'Participant exclusions created successfully' })
  message: string;

  @ApiProperty({ type: [ParticipantExclusionResponseDto] })
  data: ParticipantExclusionResponseDto[];
}

export class ParticipantExclusionsResponseEnvelopeDto {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 'Participant exclusions fetched successfully' })
  message: string;

  @ApiProperty({ type: [ParticipantExclusionPairResponseDto] })
  data: ParticipantExclusionPairResponseDto[];
}
