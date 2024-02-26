import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { SendgridService } from 'src/sendgrid/sendgrid.service';

import {
  AddAbsencesToUserDto,
  CreateAbsenceTypeDto,
  RequestAbsenceDto,
  UpdateAbsenceTypeDto,
} from './dto';
import {
  AbsenceAmountEntity,
  AbsenceTypeEntity,
  AbsenceEntity,
} from './entities';
import { AbsencesErrorCodes } from './errors';
import { AbsenceStatusesEnum } from './enums';
import { UpdateAbsenceDto } from './dto/update-absence.dto';

@Injectable()
export class AbsencesService {
  constructor(
    @InjectRepository(AbsenceTypeEntity)
    private readonly absenceTypeRepository: Repository<AbsenceTypeEntity>,
    @InjectRepository(AbsenceAmountEntity)
    private readonly absenceAmountRepository: Repository<AbsenceAmountEntity>,
    @InjectRepository(AbsenceEntity)
    private readonly absencesRepository: Repository<AbsenceEntity>,
    private readonly sendgridService: SendgridService,
    private readonly companiesService: CompaniesService,
    private readonly usersService: UserService,
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

  countWeekdays(startDate: Date, endDate: Date) {
    const currentDate = new Date(startDate);

    let weekdaysCount = 0;

    while (currentDate <= endDate) {
      if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
        weekdaysCount++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weekdaysCount;
  }

  async requestAbsence(user: UserEntity, dto: RequestAbsenceDto) {
    if (dto.startDate.valueOf() >= dto.endDate.valueOf()) {
      throw new BadRequestException(
        AbsencesErrorCodes.StartDateMustBeGreaterThanEndDateError,
      );
    }
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    const absenceType = await this.findOneTypeOrFail(user, dto.absenceTypeId);
    if (dto.replacementUserId === user.id) {
      throw new BadRequestException(
        AbsencesErrorCodes.UserCannotBeHisOwnReplacementError,
      );
    }

    const replacementUser = dto.replacementUserId
      ? await this.usersService.findOneOrFail(
          dto.replacementUserId,
          userCompany,
        )
      : null;

    const count = this.countWeekdays(dto.startDate, dto.endDate);

    if (count < 1) {
      throw new BadRequestException(
        AbsencesErrorCodes.AbsenceMustBeAtLeastOneDayError,
      );
    }

    const absenceAmount = await this.findAmountForUserOrFail(
      user,
      dto.absenceTypeId,
    );

    if (absenceAmount?.amount && absenceAmount.amount < count) {
      throw new BadRequestException(
        AbsencesErrorCodes.AbsenceBalanceNotSufficientError,
      );
    }

    const takenAbsence = this.absencesRepository.create({
      ...dto,
      status: AbsenceStatusesEnum.Requested,
      user,
      absenceType,
      count,
      replacementUser,
    });

    const takenAbsencesEntity =
      await this.absencesRepository.save(takenAbsence);

    //send email to all approvers

    return takenAbsencesEntity;
  }

  async findAmountForUser(user: UserEntity, id: number, companyId?: number) {
    return await this.absenceAmountRepository.findOne({
      relations: {
        user: {
          company: true,
        },
      },
      where: {
        id,
        user: {
          id: user.id,
          ...(companyId
            ? { company: { id: companyId } }
            : { company: { id: user.company.id } }),
        },
      },
    });
  }

  async findAmountForUserOrFail(
    user: UserEntity,
    id: number,
    companyId?: number,
  ) {
    const absenceAmount = await this.findAmountForUser(user, id, companyId);

    if (!absenceAmount) {
      throw new BadRequestException(
        AbsencesErrorCodes.AbsenceAmountNotFoundError,
      );
    }

    return absenceAmount;
  }

  async findOne(
    user: UserEntity,
    id: number,
    status: AbsenceStatusesEnum | null,
  ) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    return await this.absencesRepository.findOne({
      relations: {
        user: {
          company: true,
        },
      },
      where: {
        id,
        user: {
          company: {
            id: userCompany,
          },
        },
        ...(status ? { status } : {}),
      },
    });
  }

  async findOneOrFail(
    user: UserEntity,
    id: number,
    status: AbsenceStatusesEnum = null,
  ) {
    const absence = await this.findOne(user, id, status);

    if (!absence) {
      throw new BadRequestException(AbsencesErrorCodes.AbsenceNotFoundError);
    }

    return absence;
  }

  async findAll(user: UserEntity, status: AbsenceStatusesEnum) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    return await this.absencesRepository.find({
      relations: {
        user: {
          company: true,
        },
        absenceType: true,
        replacementUser: true,
      },
      where: {
        status,
        user: {
          company: {
            id: userCompany,
          },
        },
      },
    });
  }

  async findAbsencesForUser(user: UserEntity, status: AbsenceStatusesEnum) {
    return await this.absencesRepository.find({
      relations: {
        user: true,
        absenceType: true,
        replacementUser: true,
      },
      where: {
        status,
        user: {
          id: user.id,
        },
      },
    });
  }

  async updateAbsenceStatus(
    user: UserEntity,
    id: number,
    status: AbsenceStatusesEnum,
  ) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;
    const absence = await this.findOneOrFail(
      user,
      id,
      AbsenceStatusesEnum.Requested,
    );

    if (!absence) {
      throw new BadRequestException(AbsencesErrorCodes.AbsenceNotFoundError);
    }

    if (status === AbsenceStatusesEnum.Approved) {
      const absenceAmount = await this.findAmountForUserOrFail(
        absence.user,
        absence.absenceType.id,
        userCompany,
      );
      if (absenceAmount?.amount) {
        absenceAmount.amount -= absence.count;
        await this.absenceAmountRepository.save(absenceAmount);
      }
      //send email to everyone in all departments
    } else if (status === AbsenceStatusesEnum.Rejected) {
      //send email to user
    }

    return await this.absencesRepository.save({
      ...absence,
      status,
    });
  }

  async updateAbsence(user: UserEntity, id: number, dto: UpdateAbsenceDto) {
    const absence = await this.findOneOrFail(
      user,
      id,
      AbsenceStatusesEnum.Requested,
    );

    if (absence.user.id !== user.id) {
      throw new BadRequestException(
        AbsencesErrorCodes.UserCannotUpdateOthersAbsenceError,
      );
    }

    return await this.absencesRepository.save({
      ...absence,
      ...dto,
    });
  }

  async addAbsences(user: UserEntity, dto: AddAbsencesToUserDto) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    const userEntity = await this.usersService.findOneOrFail(
      dto.userId,
      userCompany,
    );

    const absenceAmount = await this.findAmountForUserOrFail(
      userEntity,
      dto.absenceTypeId,
    );

    absenceAmount.amount += dto.amount;

    return await this.absenceAmountRepository.save(absenceAmount);
  }

  async removeAbsences(user: UserEntity, dto: AddAbsencesToUserDto) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    const userEntity = await this.usersService.findOneOrFail(
      dto.userId,
      userCompany,
    );

    const absenceAmount = await this.findAmountForUserOrFail(
      userEntity,
      dto.absenceTypeId,
    );

    absenceAmount.amount = Math.max(0, absenceAmount.amount - dto.amount);

    return await this.absenceAmountRepository.save(absenceAmount);
  }

  async getBalanceForUser(user: UserEntity, absenceTypeId: number) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    return await this.findAmountForUserOrFail(user, absenceTypeId, userCompany);
  }
}
