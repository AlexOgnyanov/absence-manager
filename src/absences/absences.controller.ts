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
import { RequestWithUser } from 'src/auth/dtos';
import { Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, PermissionsGuard } from 'src/auth/guards';
import { CheckPermissions } from 'src/auth/decorators';
import { PermissionAction, PermissionObject } from 'src/permissions/enums';

import { CreateAbsenceTypeDto, UpdateAbsenceTypeDto } from './dto';
import { AbsencesService } from './absences.service';

@ApiTags('Absences')
@ApiBearerAuth('AccessToken')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('absences')
export class AbsenceTypesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @CheckPermissions([PermissionAction.Create, PermissionObject.AbsenceType])
  @Post('/types')
  async createType(
    @Request() req: RequestWithUser,
    @Body() dto: CreateAbsenceTypeDto,
  ) {
    return await this.absencesService.createType(req.user, dto);
  }

  @CheckPermissions([PermissionAction.Read, PermissionObject.AbsenceType])
  @Get('/types')
  async findAllTypes(@Request() req: RequestWithUser) {
    return await this.absencesService.findAllTypes(req.user);
  }

  @CheckPermissions([PermissionAction.Read, PermissionObject.AbsenceType])
  @Get('/types/:id')
  async findOneType(@Request() req: RequestWithUser, @Param('id') id: string) {
    return await this.absencesService.findOneTypeOrFail(req.user, +id);
  }

  @CheckPermissions([PermissionAction.Update, PermissionObject.AbsenceType])
  @Patch('/types/:id')
  async updateType(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateAbsenceTypeDto,
  ) {
    return await this.absencesService.updateType(req.user, +id, dto);
  }

  @CheckPermissions([PermissionAction.Delete, PermissionObject.AbsenceType])
  @Delete('/types/:id')
  async removeType(@Request() req: RequestWithUser, @Param('id') id: string) {
    return await this.absencesService.removeType(req.user, +id);
  }
}
