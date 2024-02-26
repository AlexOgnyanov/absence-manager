import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class AddAbsencesToUserDto {
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
}
