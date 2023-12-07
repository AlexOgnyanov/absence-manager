import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from 'src/permissions/entities/permission.entity';
import { UserEntity } from 'src/user/entities';
import { UserModule } from 'src/user/user.module';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleEntity } from './entities';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([UserEntity, PermissionEntity, RoleEntity]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
