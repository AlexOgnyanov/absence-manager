import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseEnumPipe,
} from '@nestjs/common';
import { RequestWithUser } from 'src/auth/dtos';
import { Request } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, PermissionsGuard } from 'src/auth/guards';
import { CheckPermissions } from 'src/auth/decorators';
import { PermissionAction, PermissionObject } from 'src/permissions/enums';

import {
  ChangeAbsenceAmountsForUserDto,
  CreateAbsenceTypeDto,
  RequestAbsenceDto,
  UpdateAbsenceTypeDto,
} from './dtos';
import { AbsencesService } from './absences.service';
import { AbsenceStatusesEnum } from './enums';
import { UpdateAbsenceDto } from './dtos/update-absence.dto';

@ApiTags('Absences')
@ApiBearerAuth('AccessToken')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('absences')
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @CheckPermissions([PermissionAction.Create, PermissionObject.AbsenceType])
  @Post('/types')
  async createType(
    @Request() req: RequestWithUser,
    @Body() dto: CreateAbsenceTypeDto,
  ) {
    return await this.absencesService.createType(req.user, dto);
  }

  @Get('/types')
  async findAllTypes(@Request() req: RequestWithUser) {
    return await this.absencesService.findAllTypes(req.user);
  }

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

  @Post('request-absence')
  async requestAbsence(
    @Request() req: RequestWithUser,
    @Body() dto: RequestAbsenceDto,
  ) {
    return await this.absencesService.requestAbsence(req.user, dto);
  }

  @CheckPermissions([PermissionAction.Read, PermissionObject.Absence])
  @ApiQuery({ name: 'status', enum: AbsenceStatusesEnum, required: false })
  @Get()
  async findAll(
    @Request() req: RequestWithUser,
    @Query('status', new ParseEnumPipe(AbsenceStatusesEnum, { optional: true }))
    status: AbsenceStatusesEnum,
  ) {
    return await this.absencesService.findAll(req.user, status);
  }

  @ApiQuery({ name: 'status', enum: AbsenceStatusesEnum, required: false })
  @Get('/me')
  async findAbsencesForUser(
    @Request() req: RequestWithUser,
    @Query('status', new ParseEnumPipe(AbsenceStatusesEnum, { optional: true }))
    status: AbsenceStatusesEnum,
  ) {
    return await this.absencesService.findAbsencesForUser(req.user, status);
  }

  @Get('/balance')
  async getBalanceForUser(
    @Request() req: RequestWithUser,
    @Query('absenceTypeId') absenceTypeId: string,
  ) {
    return await this.absencesService.getBalanceForUser(
      req.user,
      +absenceTypeId,
    );
  }

  @CheckPermissions([PermissionAction.Update, PermissionObject.Absence])
  @Post('approve/:absenceId')
  async approveAbsence(
    @Request() req: RequestWithUser,
    @Param('absenceId') absenceId: string,
  ) {
    return await this.absencesService.updateAbsenceStatus(
      req.user,
      +absenceId,
      AbsenceStatusesEnum.Approved,
    );
  }

  @CheckPermissions([PermissionAction.Update, PermissionObject.Absence])
  @Post('reject/:absenceId')
  async rejectAbsence(
    @Request() req: RequestWithUser,
    @Param('absenceId') absenceId: string,
  ) {
    return await this.absencesService.updateAbsenceStatus(
      req.user,
      +absenceId,
      AbsenceStatusesEnum.Rejected,
    );
  }

  @Patch('/:absenceId')
  async updateAbsence(
    @Request() req: RequestWithUser,
    @Param('absenceId') absenceId: string,
    @Body() dto: UpdateAbsenceDto,
  ) {
    return await this.absencesService.updateAbsence(req.user, +absenceId, dto);
  }

  @Delete('/:absenceId')
  async removeAbsence(
    @Request() req: RequestWithUser,
    @Param('absenceId') absenceId: string,
  ) {
    return await this.absencesService.removeAbsence(req.user, +absenceId);
  }

  @CheckPermissions(
    [PermissionAction.Update, PermissionObject.Absence],
    [PermissionAction.Update, PermissionObject.User],
  )
  @Post('change-absence-amounts')
  async addAbsences(
    @Request() req: RequestWithUser,
    @Body() dto: ChangeAbsenceAmountsForUserDto,
  ) {
    return await this.absencesService.changeAbsenceAmount(req.user, dto);
  }
}
