import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RequestWithUser } from '../dtos';

@Injectable()
export class GlobalAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();

    return !(req.user?.company?.id || req.user?.ownedCompany?.id);
  }
}
