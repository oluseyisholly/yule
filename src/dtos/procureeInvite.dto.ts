import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Match } from 'src/decorators/match.decorator';
import { Trim } from 'src/decorators/trim.decorator';

export class CreateProcureeInviteDto {
  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @Trim()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ProcureeInviteResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  inviteId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  groupName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  inviteLink: string;

  @ApiProperty()
  expiresAt: Date;
}

export class ProcureeInvitePreviewDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  groupName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  expiresAt: Date;
}

export class ProcureeInvitePreviewQueryDto {
  @ApiPropertyOptional()
  @Trim()
  @ValidateIf((data: ProcureeInvitePreviewQueryDto) => !data.phone)
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @Trim()
  @ValidateIf((data: ProcureeInvitePreviewQueryDto) => !data.email)
  @IsNotEmpty()
  @IsString()
  phone?: string;
}

export class AcceptProcureeInviteDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class AcceptProcureeInviteSignupDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  token: string;

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
  @IsEmail()
  email: string;

  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
