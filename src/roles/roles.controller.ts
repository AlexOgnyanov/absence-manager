import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { JwtAuthGuard } from 'src/auth/guard';
import { UpdateResult } from 'typeorm';

import { RolesService } from './roles.service';
import { AssignRoleToUserDto, CreateRoleDto } from './dtos';
import { UpdateRoleDto } from './dtos/update-role.dto';

@ApiTags('Roles')
@ApiBearerAuth('AccessToken')
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiResponse({
    status: 200,
    description: 'Create role',
  })
  @ApiBearerAuth('AccessToken')
  @ApiTags('Roles')
  @Post()
  async createRole(@Body() dto: CreateRoleDto): Promise<RoleEntity> {
    return await this.rolesService.createRoleOrFail(dto);
  }

  @ApiResponse({
    status: 200,
    description: 'Get role by id',
  })
  @ApiBearerAuth('AccessToken')
  @ApiTags('Roles')
  @Get(':id')
  async findOneRole(@Param('id') id: number): Promise<RoleEntity | null> {
    return await this.rolesService.findOneRoleOrFail(id);
  }

  @ApiResponse({
    status: 200,
    description: 'Get all roles',
  })
  @ApiBearerAuth('AccessToken')
  @ApiTags('Roles')
  @Get()
  async findAllRoles(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<RoleEntity>> {
    return await this.rolesService.findAllRoles(query);
  }

  @ApiResponse({
    status: 200,
    description: 'Update role',
  })
  @ApiBearerAuth('AccessToken')
  @ApiTags('Roles')
  @Put(':id')
  async updateRole(
    @Param('id') id: number,
    @Body() dto: UpdateRoleDto,
  ): Promise<UpdateResult> {
    return await this.rolesService.update(id, dto);
  }

  @ApiResponse({
    status: 200,
    description: 'Delete role',
  })
  @ApiBearerAuth('AccessToken')
  @ApiTags('Roles')
  @Delete(':id')
  async deleteRole(@Param('id') id: number) {
    return await this.rolesService.delete(id);
  }

  @Post('assign')
  async assignRole(@Body() dto: AssignRoleToUserDto) {
    return await this.rolesService.assignRole(dto);
  }
}
