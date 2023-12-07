import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { PermissionEntity } from 'src/permissions/entities';

import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  imports: [PermissionsModule, TypeOrmModule.forFeature([PermissionEntity])],
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
