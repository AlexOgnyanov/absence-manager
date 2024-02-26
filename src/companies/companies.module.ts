import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { UserModule } from 'src/user/user.module';
import { RolesModule } from 'src/roles/roles.module';
import { RoleEntity } from 'src/roles/entities';

import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanyEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, RoleEntity]),
    forwardRef(() => RolesModule),
    forwardRef(() => PermissionsModule),
    forwardRef(() => UserModule),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
