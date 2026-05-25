import {
  ApiProperty,
  IntersectionType,
} from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from 'src/decorators/match.decorator';
import { Trim } from 'src/decorators/trim.decorator';
import { BaseFilterDto } from './baseFilter.dto';
import { PaginationDto } from './pagination.dto';
import { createPaginatedDto, createResponseDto } from './response.dto';

class UserCredentialsDto {
  @ApiProperty()
  @Trim()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 7 })
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  password: string;
}

export class LoginUserDto extends UserCredentialsDto {}

export class CreateUserDto extends UserCredentialsDto {
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

  @ApiProperty({ minLength: 7 })
  @IsNotEmpty()
  @IsString()
  @MinLength(7)
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

export class UserResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class AuthResponseDto extends UserResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class UserFilterDto extends BaseFilterDto {}

export class FindUsersQueryDto extends IntersectionType(
  PaginationDto,
  UserFilterDto,
) {}

export class PaginatedUsersDto extends createPaginatedDto(UserResponseDto) {}

export class UserResponseEnvelopeDto extends createResponseDto(UserResponseDto, {
  codeExample: 201,
  messageExample: 'User created successfully',
}) {}

export class AuthResponseEnvelopeDto extends createResponseDto(AuthResponseDto, {
  codeExample: 200,
  messageExample: 'Login successful',
}) {}

export class PaginatedUsersResponseEnvelopeDto extends createResponseDto(
  PaginatedUsersDto,
  {
    codeExample: 200,
    messageExample: 'Users fetched successfully',
  },
) {}
