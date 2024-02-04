import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  yearlyAbsenceCount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  ownerContactEmail: string;
}
