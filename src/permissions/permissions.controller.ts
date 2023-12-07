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
import { JwtAuthGuard } from 'src/auth/guard';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';

import { PermissionsService } from './permissions.service';
import { PermissionEntity } from './entities';
import { CreatePermissionDto, UpdatePermissionDto } from './dtos';

@ApiBearerAuth('AccessToken')
@UseGuards(JwtAuthGuard)
@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiResponse({
    status: 200,
    description: 'Create permission',
  })
  @ApiBearerAuth('AccessToken')
  @Post()
  async createPermission(
    @Body() dto: CreatePermissionDto,
  ): Promise<PermissionEntity> {
    return await this.permissionsService.createPermission(dto);
  }

  @ApiBearerAuth('AccessToken')
  @Get('options')
  async getPermissionOptions() {
    return this.permissionsService.getPermissionOptions();
  }

  @ApiResponse({
    status: 200,
    description: 'Get all permissions',
  })
  @ApiBearerAuth('AccessToken')
  @Get()
  async findAllPermission(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<PermissionEntity>> {
    return await this.permissionsService.findAllPermission(query);
  }

  @ApiResponse({
    status: 200,
    description: 'Get permission by id',
  })
  @ApiBearerAuth('AccessToken')
  @Get(':id')
  async findOnePermission(
    @Param('id') id: number,
  ): Promise<PermissionEntity | null> {
    return await this.permissionsService.findOnePermissionOrFail(id);
  }

  @ApiResponse({
    status: 200,
    description: 'Update permission',
  })
  @ApiBearerAuth('AccessToken')
  @Put(':id')
  async updatePermission(
    @Param('id') id: number,
    @Body() dto: UpdatePermissionDto,
  ): Promise<PermissionEntity> {
    return await this.permissionsService.updatePermission(id, dto);
  }

  @ApiResponse({
    status: 200,
    description: 'Delete permission',
  })
  @ApiBearerAuth('AccessToken')
  @Delete(':id')
  async deletePermission(@Param('id') id: number) {
    return await this.permissionsService.deletePermission(id);
  }
}
