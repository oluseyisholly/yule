import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { StandardResopnse } from 'src/common';
import {
  CreateUserDto,
  FindUsersQueryDto,
  PaginatedUsersDto,
  UserResponseDto,
} from 'src/dtos/user.dto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user.repositoty';

@Injectable()
export class UserService {
  private static readonly SALT_ROUNDS = 10;

  constructor(private readonly userRepository: UserRepository) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<StandardResopnse<UserResponseDto>> {
    const normalizedEmail = this.normalizeEmail(createUserDto.email);
    const existingUser =
      await this.userRepository.findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      UserService.SALT_ROUNDS,
    );

    const user = await this.userRepository.create(
      {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phoneNumber: createUserDto.phoneNumber,
        email: normalizedEmail,
        password: hashedPassword,
      },
      false,
    );

    return {
      code: HttpStatus.CREATED,
      message: 'User created successfully',
      data: this.toUserResponse(user),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findUserByEmail(this.normalizeEmail(email));
  }

  async findAllUsers(
    query: FindUsersQueryDto,
  ): Promise<StandardResopnse<PaginatedUsersDto>> {
    const paginatedUsers = await this.userRepository.findAllUsers(query);

    return {
      code: HttpStatus.OK,
      message: 'Users fetched successfully',
      data: {
        ...paginatedUsers,
        data: paginatedUsers.data.map((user) => this.toUserResponse(user)),
      },
    };
  }

  toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      email: user.email,
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
