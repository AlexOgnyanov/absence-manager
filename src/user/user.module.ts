import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { AbsenceAmountEntity } from 'src/absences/entities';
import { CompaniesModule } from 'src/companies/companies.module';
import { RolesModule } from 'src/roles/roles.module';
import { CompanyEntity } from 'src/companies/entities';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AbsenceAmountEntity, CompanyEntity]),
    PermissionsModule,
    SendgridModule,
    TokensModule,
    forwardRef(() => RolesModule),
    forwardRef(() => CompaniesModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
