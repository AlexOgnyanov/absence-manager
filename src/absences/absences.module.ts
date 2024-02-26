import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { UserModule } from 'src/user/user.module';

import { AbsencesService } from './absences.service';
import { AbsenceTypesController } from './absences.controller';
import { AbsenceAmountEntity, AbsenceTypeEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([AbsenceTypeEntity, AbsenceAmountEntity]),
    PermissionsModule,
    UserModule,
    CompaniesModule,
  ],
  controllers: [AbsenceTypesController],
  providers: [AbsencesService],
  exports: [AbsencesService],
})
export class AbsencesModule {}
