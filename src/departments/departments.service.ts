import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompaniesService } from 'src/companies/companies.service';
import { UserService } from 'src/user/user.service';

import {
  AppendUserToDepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from './dto';
import { DepartmentEntity } from './entities';
import { DepartmentErrorCodes } from './errors';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    private readonly companiesService: CompaniesService,
    private readonly userService: UserService,
  ) {}

  async create(user: UserEntity, dto: CreateDepartmentDto) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    if (!userCompany) {
      if (!dto.companyId) {
        throw new BadRequestException(
          DepartmentErrorCodes.GlobalAdminsShouldProvideCompanyId,
        );
      }
      await this.companiesService.findOneOrFail(dto.companyId);
    }

    const department = this.departmentRepository.create({
      name: dto.name,
      company: {
        id: userCompany ? userCompany : dto.companyId,
      },
    });

    return await this.departmentRepository.save(department);
  }

  async findAll(user: UserEntity) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    return await this.departmentRepository.find({
      where: {
        company: {
          id: userCompany,
        },
      },
    });
  }

  async findOne(user: UserEntity, id: number) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    return await this.departmentRepository.findOne({
      where: {
        id,
        ...(userCompany ? { company: { id: userCompany } } : {}),
      },
    });
  }

  async findOneOrFail(user: UserEntity, id: number) {
    const company = await this.findOne(user, id);

    if (!company) {
      throw new BadRequestException(
        DepartmentErrorCodes.DepartmentNotFoundError,
      );
    }

    return company;
  }

  async update(user: UserEntity, id: number, dto: UpdateDepartmentDto) {
    const department = await this.findOneOrFail(user, id);

    department.name = dto.name;
    return await this.departmentRepository.save(department);
  }

  async remove(user: UserEntity, id: number) {
    const department = await this.findOneOrFail(user, id);

    return await this.departmentRepository.remove(department);
  }

  async appendUserToDepartment(
    user: UserEntity,
    dto: AppendUserToDepartmentDto,
  ) {
    const department = await this.findOneOrFail(user, dto.departmentId);
    const appendedUser = await this.userService.findOneOrFail(
      dto.userId,
      department.company.id,
    );

    if (!department?.users?.length) {
      department.users = [];
    }

    if (department.users.some((user) => user.id === appendedUser.id)) {
      throw new BadRequestException(
        DepartmentErrorCodes.UserAlreadyInDepartmentError,
      );
    }
    department.users.push(appendedUser);

    return await this.departmentRepository.save(department);
  }

  async removeUserFromDepartment(
    user: UserEntity,
    dto: AppendUserToDepartmentDto,
  ) {
    const department = await this.findOneOrFail(user, dto.departmentId);
    await this.userService.findOneOrFail(dto.userId, department.company.id);

    if (!department?.users?.length) {
      department.users = [];
    }

    if (!department.users.some((user) => user.id === dto.userId)) {
      throw new BadRequestException(
        DepartmentErrorCodes.UserNotInDepartmentError,
      );
    }

    department.users = department.users.filter(
      (user) => user.id !== dto.userId,
    );

    return await this.departmentRepository.save(department);
  }
}
