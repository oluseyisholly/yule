import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Match } from 'src/decorators/match.decorator';
import { Trim } from 'src/decorators/trim.decorator';
import {
  InvitationChannel,
  InvitationStatus,
} from 'src/entities/invitation.entity';
import {
  PaginationDto,
  createPaginatedDto,
  createResponseDto,
} from './general.dto';

export class SendInvitationDto {
  @ApiProperty({ enum: InvitationChannel, example: InvitationChannel.EMAIL })
  @IsEnum(InvitationChannel)
  channel: InvitationChannel;
}

export class ClaimInvitationDto {
  @ApiProperty({ example: 'Olusola' })
  @Trim()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Owoyemi' })
  @Trim()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ minLength: 7, example: 'Olusola@123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  password: string;

  @ApiProperty({ minLength: 7, example: 'Olusola@123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

export class InvitationContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  phoneNumber?: string;
}

export class InvitationUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class InvitationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  drawNameEventId: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  participantId: string;

  @ApiPropertyOptional()
  eventContactId?: string | null;

  @ApiProperty({ enum: InvitationStatus })
  status: InvitationStatus;

  @ApiProperty({ enum: InvitationChannel })
  channel: InvitationChannel;

  @ApiProperty()
  inviteUrl: string;

  @ApiPropertyOptional()
  eventTitle?: string;

  @ApiPropertyOptional({ type: InvitationContactResponseDto })
  eventContact?: InvitationContactResponseDto | null;

  @ApiPropertyOptional()
  sentAt?: Date | null;

  @ApiPropertyOptional()
  acceptedAt?: Date | null;
}

export class InvitationSkippedResponseDto {
  @ApiProperty()
  participantId: string;

  @ApiProperty()
  reason: string;
}

export class SendInvitationsResponseDto {
  @ApiProperty({ type: [InvitationResponseDto] })
  sent: InvitationResponseDto[];

  @ApiProperty({ type: [InvitationSkippedResponseDto] })
  skipped: InvitationSkippedResponseDto[];
}

export class PublicInvitationResponseDto extends InvitationResponseDto {
  @ApiProperty()
  redirectPath: string;
}

export class ClaimInvitationResponseDto {
  @ApiProperty({ type: InvitationResponseDto })
  invitation: InvitationResponseDto;

  @ApiProperty({ type: InvitationContactResponseDto })
  contact: InvitationContactResponseDto;

  @ApiProperty({ type: InvitationUserResponseDto })
  user: InvitationUserResponseDto;

  @ApiProperty()
  redirectPath: string;
}

export class FindInvitationsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by invited contact first name, last name, or email',
    example: 'rita',
  })
  @Trim()
  @IsOptional()
  @IsString()
  searchQuery?: string;
}

export class PaginatedInvitationsDto extends createPaginatedDto(
  InvitationResponseDto,
) {}

export class SendInvitationsResponseEnvelopeDto extends createResponseDto(
  SendInvitationsResponseDto,
  {
    codeExample: 200,
    messageExample: 'Invitations sent successfully',
  },
) {}

export class SendInvitationResponseEnvelopeDto extends createResponseDto(
  InvitationResponseDto,
  {
    codeExample: 200,
    messageExample: 'Invitation sent successfully',
  },
) {}

export class PublicInvitationResponseEnvelopeDto extends createResponseDto(
  PublicInvitationResponseDto,
  {
    codeExample: 200,
    messageExample: 'Invitation fetched successfully',
  },
) {}

export class ClaimInvitationResponseEnvelopeDto extends createResponseDto(
  ClaimInvitationResponseDto,
  {
    codeExample: 200,
    messageExample: 'Invitation claimed successfully',
  },
) {}

export class PaginatedInvitationsResponseEnvelopeDto extends createResponseDto(
  PaginatedInvitationsDto,
  {
    codeExample: 200,
    messageExample: 'Invitations fetched successfully',
  },
) {}
