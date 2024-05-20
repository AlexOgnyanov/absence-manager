import { PartialType } from '@nestjs/swagger';

import { CreateAbsenceTypeDto } from './create-absence-type.dto';

export class UpdateAbsenceTypeDto extends PartialType(CreateAbsenceTypeDto) {}
