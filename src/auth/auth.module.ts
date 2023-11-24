import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities';
import { JwtModule } from '@nestjs/jwt';
import { JwtAsyncConfig } from 'src/config';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy';
import { JwtAuthGuard } from './guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync(JwtAsyncConfig),
    PassportModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
