import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, PermissionsGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/dtos';
import { CheckPermissions } from 'src/auth/decorators';
import { PermissionAction, PermissionObject } from 'src/permissions/enums';

import { DepartmentsService } from './departments.service';
import {
  AppendUserToDepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from './dto';

@ApiBearerAuth('AccessToken')
@ApiTags('Departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @CheckPermissions([PermissionAction.Create, PermissionObject.Department])
  @Post()
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateDepartmentDto,
  ) {
    return await this.departmentsService.create(req.user, dto);
  }

  @CheckPermissions([PermissionAction.Read, PermissionObject.Department])
  @Get()
  async findAll(@Request() req: RequestWithUser) {
    return await this.departmentsService.findAll(req.user);
  }

  @CheckPermissions([PermissionAction.Read, PermissionObject.Department])
  @Get(':id')
  async findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return await this.departmentsService.findOne(req.user, +id);
  }

  @CheckPermissions([PermissionAction.Update, PermissionObject.Department])
  @Patch(':id')
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return await this.departmentsService.update(req.user, +id, dto);
  }

  @CheckPermissions([PermissionAction.Delete, PermissionObject.Department])
  @Delete(':id')
  async remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return await this.departmentsService.remove(req.user, +id);
  }

  @CheckPermissions([PermissionAction.Update, PermissionObject.Department])
  @Post('append-user')
  async addUserToDepartment(
    @Request() req: RequestWithUser,
    @Body() dto: AppendUserToDepartmentDto,
  ) {
    return await this.departmentsService.appendUserToDepartment(req.user, dto);
  }

  @CheckPermissions([PermissionAction.Update, PermissionObject.Department])
  @Post('remove-user')
  async removeUserFromDepartment(
    @Request() req: RequestWithUser,
    @Body() dto: AppendUserToDepartmentDto,
  ) {
    return await this.departmentsService.removeUserFromDepartment(
      req.user,
      dto,
    );
  }
}
