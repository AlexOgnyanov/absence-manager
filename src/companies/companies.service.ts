import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyEntity } from './entities';
import { CompanyErrorCodes } from './errors';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyEntityRepository: Repository<CompanyEntity>,
    private userService: UserService,
  ) {}

  async create(dto: CreateCompanyDto) {
    const owner = await this.userService.createOwnerUser(dto.ownerContactEmail);
    const company = this.companyEntityRepository.create({
      ...dto,
      owner,
    });

    return await this.companyEntityRepository.save(company);
  }

  async findAll() {
    return await this.companyEntityRepository.find();
  }

  async findOne(id: number) {
    return await this.companyEntityRepository.findOne({
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
    return await this.companyEntityRepository.update(id, { ...dto });
  }

  async delete(id: number) {
    return await this.companyEntityRepository.delete(id);
  }
}
