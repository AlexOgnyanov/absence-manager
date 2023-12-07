import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PermissionAction, PermissionObject } from 'src/casl/enums';

export class CreatePermissionDto {
  @ApiProperty()
  @IsEnum(PermissionAction)
  @IsNotEmpty()
  action: PermissionAction;

  @ApiProperty()
  @IsEnum(PermissionObject)
  @IsNotEmpty()
  object: PermissionObject;
}
