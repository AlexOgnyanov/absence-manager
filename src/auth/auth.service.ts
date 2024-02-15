import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from 'src/tokens/tokens.service';

import { LoginDto, ContextUser, VerifyUserDto } from './dtos';
import { AuthErrorCodes } from './errors';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokensService,
  ) {}

  async verify(dto: VerifyUserDto) {
    const token = await this.tokenService.findEmailConfirmationTokenOrFail(
      dto.token,
    );

    token.user.password = dto.password;
    token.user.isVerified = true;

    await this.tokenService.deleteEmailConfirmationToken(token);

    return await this.userRepository.save(token.user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new BadRequestException(
        AuthErrorCodes.UserWithThisEmailWasNotFoundError,
      );
    }
    if (!user.isVerified) {
      throw new BadRequestException(AuthErrorCodes.AccountNotVerifiedError);
    }
    const isPasswordMatching = await argon2.verify(user.password, dto.password);
    if (!isPasswordMatching) {
      throw new BadRequestException(AuthErrorCodes.IncorrectPasswordError);
    }

    const payload: ContextUser = {
      id: user.id,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
