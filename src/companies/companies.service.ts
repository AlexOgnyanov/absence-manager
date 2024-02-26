import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { PermissionAction, PermissionObject } from 'src/permissions/enums';
import { RoleEntity } from 'src/roles/entities';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyEntity } from './entities';
import { CompanyErrorCodes } from './errors';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly userService: UserService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(dto: CreateCompanyDto) {
    const owner = await this.userService.createOwnerUser(dto.ownerContactEmail);
    const company = this.companyRepository.create({
      ...dto,
      owner,
    });

    const companyEntity = await this.companyRepository.save(company);

    const permission =
      await this.permissionsService.findPermissionByActionAndObject(
        PermissionAction.Manage,
        PermissionObject.All,
      );

    const role = this.roleRepository.create({
      name: 'owner',
      company: {
        id: companyEntity.id,
      },
      permissions: [permission],
      users: [owner],
    });

    await this.roleRepository.save(role);

    return companyEntity;
  }

  async findAll() {
    return await this.companyRepository.find();
  }

  async findOne(id: number) {
    return await this.companyRepository.findOne({
      relations: {
        employees: true,
      },
      where: {
        id,
      },
    });
  }

  async findOneOrFail(id: number) {
    const company = await this.findOne(id);

    if (!company) {
      throw new NotFoundException(CompanyErrorCodes.CompanyNotFoundError);
    }

    return company;
  }

  async update(id: number, dto: UpdateCompanyDto) {
    return await this.companyRepository.update(id, { ...dto });
  }

  async delete(id: number) {
    return await this.companyRepository.delete(id);
  }
}
