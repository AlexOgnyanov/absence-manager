import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RequestWithUser } from '../dtos';

@Injectable()
export class GlobalAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();
    console.log(!!(req.user?.company?.id || req.user?.ownedCompany?.id));

    return !(req.user?.company?.id || req.user?.ownedCompany?.id);
  }
}
