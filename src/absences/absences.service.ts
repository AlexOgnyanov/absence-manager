import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { Repository } from 'typeorm';

import { CreateAbsenceTypeDto, UpdateAbsenceTypeDto } from './dto';
import { AbsenceAmountEntity, AbsenceTypeEntity } from './entities';
import { AbsencesErrorCodes } from './errors';

@Injectable()
export class AbsencesService {
  constructor(
    @InjectRepository(AbsenceTypeEntity)
    private readonly absenceTypeRepository: Repository<AbsenceTypeEntity>,
    @InjectRepository(AbsenceAmountEntity)
    private readonly absenceAmountRepository: Repository<AbsenceAmountEntity>,
    private readonly companiesService: CompaniesService,
  ) {}

  async createType(user: UserEntity, dto: CreateAbsenceTypeDto) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    if (!userCompany && !dto.companyId) {
      throw new BadRequestException(
        AbsencesErrorCodes.GlobalAdminsMustProvideCompanyIdError,
      );
    }

    const company = await this.companiesService.findOneOrFail(
      userCompany || dto.companyId,
    );

    const absenceType = this.absenceTypeRepository.create({
      ...dto,
      company,
    });

    const absenceTypeEntity =
      await this.absenceTypeRepository.save(absenceType);

    const absenceAmounts: AbsenceAmountEntity[] = [];

    for (let i = 0; i < company?.employees?.length; i++) {
      absenceAmounts.push(
        this.absenceAmountRepository.create({
          absenceType: absenceTypeEntity,
          user: company?.employees[i],
          amount: dto.yealyCount,
        }),
      );
    }

    await this.absenceAmountRepository.save(absenceAmounts);

    return absenceTypeEntity;
  }

  async findAllTypes(user: UserEntity) {
    return await this.absenceTypeRepository.find({
      relations: {
        company: true,
      },
      where: {
        company: {
          id: user?.company?.id || user?.ownedCompany?.id,
        },
      },
    });
  }

  async findOneType(user: UserEntity, id: number) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    return await this.absenceTypeRepository.findOne({
      relations: {
        company: true,
      },
      where: {
        id,
        ...(userCompany ? { company: { id: userCompany } } : {}),
      },
    });
  }

  async findOneTypeOrFail(user: UserEntity, id: number) {
    const absenceType = await this.findOneType(user, id);

    if (!absenceType) {
      throw new BadRequestException(
        AbsencesErrorCodes.AbsenceTypeNotFoundError,
      );
    }

    return absenceType;
  }

  async updateType(user: UserEntity, id: number, dto: UpdateAbsenceTypeDto) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    if (!userCompany && !dto.companyId) {
      throw new BadRequestException(
        AbsencesErrorCodes.GlobalAdminsMustProvideCompanyIdError,
      );
    }

    const absenceType = await this.findOneTypeOrFail(user, id);

    return await this.absenceTypeRepository.save({
      ...absenceType,
      ...dto,
    });
  }

  async removeType(user: UserEntity, id: number) {
    const absenceType = await this.findOneTypeOrFail(user, id);

    return await this.absenceTypeRepository.remove(absenceType);
  }

  async appendAllAbsenceAmountsToUserType(user: UserEntity) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    const company = await this.companiesService.findOneOrFail(userCompany);

    const absenceAmounts: AbsenceAmountEntity[] = [];

    for (let i = 0; i < company?.absenceTypes?.length; i++) {
      absenceAmounts.push(
        this.absenceAmountRepository.create({
          absenceType: company.absenceTypes[i],
          user,
          amount: company.absenceTypes[i].yealyCount,
        }),
      );
    }

    return await this.absenceAmountRepository.save(absenceAmounts);
  }
}
