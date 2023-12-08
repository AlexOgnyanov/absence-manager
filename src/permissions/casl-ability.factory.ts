import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PureAbility } from '@casl/ability';
import { PermissionEntity } from 'src/permissions/entities';

import { AppAbility, CaslPermission } from './types';
import { PermissionAction, PermissionObject } from './enums';
import { PermissionsService } from './permissions.service';

@Injectable()
export class CaslAbilityFactory {
  constructor(
    @Inject(forwardRef(() => PermissionsService))
    private permissionsService: PermissionsService,
  ) {}

  async createForUser(userId: string): Promise<AppAbility> {
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
