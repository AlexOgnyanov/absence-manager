import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from 'src/tokens/tokens.service';
import { UserErrorCodes } from 'src/user/errors/user-errors.enum';
import { SendgridService } from 'src/sendgrid/sendgrid.service';

import {
  LoginDto,
  ContextUser,
  VerifyUserDto,
  RequestPasswordChangeDto,
  PasswordChangeDto,
} from './dtos';
import { AuthErrorCodes } from './errors';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokensService,
    private readonly sendgridService: SendgridService,
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

  async requestPasswordReset(dto: RequestPasswordChangeDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new NotFoundException(UserErrorCodes.UserNotFoundError);
    }

    const token = await this.tokenService.generatePasswordResetToken(user.id);

    await this.sendgridService.sendPasswordReset(user.email, token.token);
    return 'Success';
  }

  async passwordReset(dto: PasswordChangeDto) {
    const token = await this.tokenService.findPasswordResetTokenOrFail(
      dto.token,
    );

    token.user.password = dto.newPassword;

    const user = await this.userRepository.save(token.user);

    await this.tokenService.deletePasswordResetToken(token);

    return user;
  }

  async requestPasswordChange(user: UserEntity) {
    const token = await this.tokenService.generatePasswordChangeToken(user);

    await this.sendgridService.sendPasswordChange(user.email, token.token);
    return 'Success';
  }

  async passwordChange(dto: PasswordChangeDto) {
    const token = await this.tokenService.findPasswordChangeTokenOrFail(
      dto.token,
    );

    token.user.password = dto.newPassword;

    const user = await this.userRepository.save(token.user);

    await this.tokenService.deletePasswordChangeToken(token);

    return user;
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
