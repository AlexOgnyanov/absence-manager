import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

export const JwtAsyncConfig: JwtModuleAsyncOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<JwtModuleOptions> => ({
    secret: configService.get('JWT_ACCESS_SECRET'),
    signOptions: {
      expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    },
  }),
  inject: [ConfigService],
};
