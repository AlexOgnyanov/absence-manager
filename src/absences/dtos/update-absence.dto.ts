import { PartialType } from '@nestjs/swagger';

import { RequestAbsenceDto } from './request-absence.dto';

export class UpdateAbsenceDto extends PartialType(RequestAbsenceDto) {}
