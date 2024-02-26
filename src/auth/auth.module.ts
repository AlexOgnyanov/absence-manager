import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { UserModule } from 'src/user/user.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { AbsenceAmountEntity } from 'src/absences/entities';
import { CompanyEntity } from 'src/companies/entities';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy, LocalStrategy, RefreshTokenStrategy } from './strategy';
import {
  JwtAuthGuard,
  LocalAuthGuard,
  PermissionsGuard,
  RefreshAuthGuard,
} from './guards';
import { SessionEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      SessionEntity,
      AbsenceAmountEntity,
      CompanyEntity,
    ]),
    JwtModule,
    PassportModule,
    UserModule,
    PermissionsModule,
    SendgridModule,
    TokensModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    LocalAuthGuard,
    RefreshTokenStrategy,
    RefreshAuthGuard,
    JwtStrategy,
    JwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
