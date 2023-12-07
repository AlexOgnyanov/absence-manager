import { Injectable } from '@nestjs/common';
import { PureAbility } from '@casl/ability';
import { PermissionsService } from 'src/permissions/permissions.service';
import { PermissionEntity } from 'src/permissions/entities';

import { PermissionAction, PermissionObject } from './enums';
import { AppAbility, CaslPermission } from './types';

@Injectable()
export class CaslAbilityFactory {
  constructor(private permissionsService: PermissionsService) {}

  async createForUser(userId: number): Promise<AppAbility> {
    const dbPermissions: PermissionEntity[] =
      await this.permissionsService.findUserPermissions(userId);

    const caslPermissions: CaslPermission[] = dbPermissions.map((p) => ({
      action: p.action,
      subject: p.object,
    }));

    return new PureAbility<[PermissionAction, PermissionObject]>(
      caslPermissions,
    );
  }
}
