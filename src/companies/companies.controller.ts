import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  GlobalAdminGuard,
  JwtAuthGuard,
  PermissionsGuard,
} from 'src/auth/guards';
import { CheckPermissions } from 'src/auth/decorators';
import { PermissionAction, PermissionObject } from 'src/permissions/enums';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';

@ApiBearerAuth('AccessToken')
@ApiTags('Companies')
@UseGuards(JwtAuthGuard, PermissionsGuard, GlobalAdminGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @CheckPermissions([PermissionAction.Create, PermissionObject.Company])
  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return await this.companiesService.create(dto);
  }

  @CheckPermissions([PermissionAction.Read, PermissionObject.Company])
  @Get()
  async findAll() {
    return await this.companiesService.findAll();
  }

  @CheckPermissions([PermissionAction.Read, PermissionObject.Company])
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.companiesService.findOneOrFail(id);
  }

  @CheckPermissions([PermissionAction.Update, PermissionObject.Company])
  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateCompanyDto) {
    return await this.companiesService.update(id, dto);
  }

  @CheckPermissions([PermissionAction.Delete, PermissionObject.Company])
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.companiesService.delete(id);
  }
}
