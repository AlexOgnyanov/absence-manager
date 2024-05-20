import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, PermissionsGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/dtos';
import { CheckPermissions } from 'src/auth/decorators';
import { PermissionAction, PermissionObject } from 'src/permissions/enums';

import { CreateEmployeeDto, CreateUserDto, UpdateUserDto } from './dtos';
import { UserService } from './user.service';

@ApiBearerAuth('AccessToken')
@ApiTags('Users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Request() req: RequestWithUser) {
    return await this.userService.findOne(req.user.id);
  }

  @CheckPermissions([PermissionAction.Create, PermissionObject.User])
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @Get(':id')
  async findOne(@Request() req: RequestWithUser) {
    return await this.userService.findOneOrFail(
      req.user.id,
      req?.user?.company?.id || req?.user?.ownedCompany?.id,
    );
  }

  @Get()
  async findAll(@Request() req: RequestWithUser) {
    return await this.userService.findAll(req.user);
  }

  @CheckPermissions([PermissionAction.Update, PermissionObject.User])
  @Patch(':id')
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(req.user, id, updateUserDto);
  }

  @CheckPermissions([PermissionAction.Delete, PermissionObject.User])
  @Delete(':id')
  async remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return await this.userService.delete(req.user, id);
  }

  @ApiBody({ type: CreateEmployeeDto })
  @CheckPermissions([PermissionAction.Create, PermissionObject.User])
  @Post('create-employee')
  async createEmployee(
    @Request() req: RequestWithUser,
    @Body() dto: CreateEmployeeDto,
  ) {
    return await this.userService.createEmployee(req.user, dto);
  }
}
