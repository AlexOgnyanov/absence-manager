import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { customAlphabet } from 'nanoid';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { UserEntity } from 'src/user/entities';

import { TokenErrorCodes } from './errors';
import {
  PasswordResetTokenEntity,
  PasswordChangeTokenEntity,
  EmailConfirmationTokenEntity,
} from './entities';

@Injectable()
export class TokensService {
  private alphabet = '0123456789';
  private customNanoid: ((size?: number) => string) | (() => any);

  constructor(
    @InjectRepository(PasswordResetTokenEntity)
    private passwordResetTokenRepository: Repository<PasswordResetTokenEntity>,
    @InjectRepository(PasswordChangeTokenEntity)
    private passwordChangeTokenRepository: Repository<PasswordChangeTokenEntity>,
    @InjectRepository(EmailConfirmationTokenEntity)
    private emailConfirmationTokenRepository: Repository<EmailConfirmationTokenEntity>,
    private configService: ConfigService,
  ) {
    this.customNanoid = customAlphabet(this.alphabet, 8);
  }

  async findEmailConfirmationToken(token: string) {
    return await this.emailConfirmationTokenRepository.findOne({
      where: {
        token,
      },
    });
  }

  async findEmailConfirmationTokenOrFail(token: string) {
    const tokenEntity = await this.findEmailConfirmationToken(token);

    if (!tokenEntity) {
      throw new BadRequestException(
        TokenErrorCodes.TokenNotFoundOrExpiredError,
      );
    }

    return tokenEntity;
  }

  async generateEmailConfirmationToken(userId: string) {
    const token = this.customNanoid();
    const tokenEntity = this.emailConfirmationTokenRepository.create({
      token,
      user: {
        id: userId,
      },
      expiresAt: new Date(
        Date.now() +
          ms(
            this.configService.get<string>(
              'EMAIL_CONFIRMATION_TOKEN_EXPIRATION',
            ),
          ),
      ),
    });

    return await this.emailConfirmationTokenRepository.save(tokenEntity);
  }

  async deleteEmailConfirmationToken(token: EmailConfirmationTokenEntity) {
    return await this.emailConfirmationTokenRepository.delete(token);
  }

  async findPasswordResetToken(token: string) {
    return await this.passwordResetTokenRepository.findOne({
      where: {
        token,
      },
    });
  }

  async findPasswordResetTokenOrFail(token: string) {
    const tokenEntity = await this.findPasswordResetToken(token);

    if (!tokenEntity) {
      throw new BadRequestException(
        TokenErrorCodes.TokenNotFoundOrExpiredError,
      );
    }

    return tokenEntity;
  }

  async generatePasswordResetToken(userId: string) {
    const token = this.customNanoid();
    const tokenEntity = this.passwordResetTokenRepository.create({
      token,
      user: {
        id: userId,
      },
      expiresAt: new Date(
        Date.now() +
          ms(this.configService.get<string>('PASSWORD_RESET_TOKEN_EXPIRATION')),
      ),
    });

    return await this.passwordResetTokenRepository.save(tokenEntity);
  }

  async deletePasswordResetToken(token: PasswordResetTokenEntity) {
    return await this.passwordResetTokenRepository.delete(token);
  }

  async findPasswordChangeToken(token: string) {
    return await this.passwordChangeTokenRepository.findOne({
      where: {
        token,
      },
    });
  }

  async findPasswordChangeTokenOrFail(token: string) {
    const tokenEntity = await this.findPasswordChangeToken(token);

    if (!tokenEntity) {
      throw new BadRequestException(
        TokenErrorCodes.TokenNotFoundOrExpiredError,
      );
    }

    return tokenEntity;
  }

  async generatePasswordChangeToken(user: UserEntity) {
    const token = this.customNanoid();
    const tokenEntity = this.passwordChangeTokenRepository.create({
      token,
      user: {
        id: user.id,
      },
      expiresAt: new Date(
        Date.now() +
          ms(
            this.configService.get<string>('PASSWORD_CHANGE_TOKEN_EXPIRATION'),
          ),
      ),
    });

    return await this.passwordChangeTokenRepository.save(tokenEntity);
  }

  async deletePasswordChangeToken(token: PasswordChangeTokenEntity) {
    return await this.passwordChangeTokenRepository.delete(token);
  }
}
