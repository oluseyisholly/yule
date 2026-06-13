import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { StandardResopnse } from 'src/common';
import { LoginUserDto } from 'src/dtos/user.dto';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.services';

type AuthenticatedUser = User & { token: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<StandardResopnse<AuthenticatedUser>> {
    const user = await this.userService.findByEmail(loginUserDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      code: HttpStatus.OK,
      message: 'Login successful',
      data: Object.assign(user, { token }),
    };
  }
}
