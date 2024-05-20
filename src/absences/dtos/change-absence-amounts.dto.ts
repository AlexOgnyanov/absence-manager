import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class ChangeAbsenceAmountsForUserDto {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  absenceTypeId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  append: boolean;
}
