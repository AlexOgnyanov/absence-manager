import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { UserModule } from 'src/user/user.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { RolesModule } from 'src/roles/roles.module';

import { AbsencesService } from './absences.service';
import { AbsencesController } from './absences.controller';
import {
  AbsenceAmountEntity,
  AbsenceTypeEntity,
  AbsenceEntity,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AbsenceTypeEntity,
      AbsenceAmountEntity,
      AbsenceEntity,
    ]),
    PermissionsModule,
    UserModule,
    CompaniesModule,
    SendgridModule,
    RolesModule,
  ],
  controllers: [AbsencesController],
  providers: [AbsencesService],
  exports: [AbsencesService],
})
export class AbsencesModule {}
