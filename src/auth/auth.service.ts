import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

import { ContextUser, LoginDto } from './dtos';
import { AuthErrorCodes } from './errors';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new BadRequestException(
        AuthErrorCodes.UserWithThisEmailWasNotFound,
      );
    }
    console.log(user);
    const isPasswordMatching = await argon2.verify(user.password, dto.password);
    if (!isPasswordMatching) {
      throw new BadRequestException(AuthErrorCodes.IncorrectPassword);
    }

    const payload: ContextUser = {
      id: user.id,
    };
    console.log(payload);

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
