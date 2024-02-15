import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokensService } from './tokens.service';
import {
  PasswordResetTokenEntity,
  PasswordChangeTokenEntity,
  EmailConfirmationTokenEntity,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PasswordResetTokenEntity,
      PasswordChangeTokenEntity,
      EmailConfirmationTokenEntity,
    ]),
  ],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
