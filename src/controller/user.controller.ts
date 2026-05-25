import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerApiEnumTags } from '../common/index.enum';
import { StandardResopnse } from 'src/common';
import { Public } from 'src/decorators/skipAuth.decorator';
import {
  AuthResponseEnvelopeDto,
  AuthResponseDto,
  CreateUserDto,
  FindUsersQueryDto,
  LoginUserDto,
  PaginatedUsersDto,
  PaginatedUsersResponseEnvelopeDto,
  UserResponseEnvelopeDto,
  UserResponseDto,
} from 'src/dtos/user.dto';
import { SortOrder } from 'src/dtos/pagination.dto';
import { AuthService } from 'src/services/auth.service';
import { UserService } from 'src/services/user.services';

@Controller('user')
@ApiTags(SwaggerApiEnumTags.USER)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiCreatedResponse({ type: UserResponseEnvelopeDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({
    description: 'A user with this email already exists',
  })
  createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<StandardResopnse<UserResponseDto>> {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    type: Number,
    example: 25,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @ApiQuery({
    name: 'searchQuery',
    required: false,
    type: String,
    example: 'john',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2026-12-31',
  })
  @ApiOkResponse({ type: PaginatedUsersResponseEnvelopeDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  findAllUsers(
    @Query() query: FindUsersQueryDto,
  ): Promise<StandardResopnse<PaginatedUsersDto>> {
    return this.userService.findAllUsers(query);
  }

  @Post('signin')
  @Public()
  @ApiOperation({ summary: 'Authenticate a user and return a JWT token' })
  @ApiOkResponse({ type: AuthResponseEnvelopeDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  signIn(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<StandardResopnse<AuthResponseDto>> {
    return this.authService.login(loginUserDto);
  }
}
