import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { AuthErrorCodes } from 'src/auth/errors';
import { PermissionAction, PermissionObject } from 'src/permissions/enums';
import { In, Repository } from 'typeorm';
import { CaslAbilityFactory } from 'src/permissions/casl-ability.factory';

import { PermissionEntity } from './entities';
import { CreatePermissionDto, UpdatePermissionDto } from './dtos';
import { PermissionErrorCodes } from './errors';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @Inject(forwardRef(() => CaslAbilityFactory))
    private abilityFactory: CaslAbilityFactory,
  ) {}

  async findUserPermissions(userId: string): Promise<PermissionEntity[]> {
    return await this.permissionRepository
      .createQueryBuilder('permission')
      .select(['permission.id', 'permission.action', 'permission.object'])
      .innerJoin('permission.roles', 'role')
      .innerJoin('role.users', 'user')
      .where('user.id = :userId', { userId: userId })
      .getMany();
  }

  async findBulkPermissions(permissionIds: number[]) {
    return await this.permissionRepository.find({
      where: {
        id: In(permissionIds),
      },
    });
  }

  async doesUserExceedPermissions(userId: string, dto: CreatePermissionDto) {
    const ability = await this.abilityFactory.createForUser(userId);
    return ability.can(dto.action, dto.object);
  }

  async doesUserExceedPermissionsBulk(
    userId: string,
    permissions: PermissionEntity[],
  ) {
    const ability = await this.abilityFactory.createForUser(userId);

    return permissions.every((permission) =>
      ability.can(permission.action, permission.object),
    );
  }

  async doesUserExceeedPermissionsBulkOrFail(
    userId: string,
    permissions: PermissionEntity[],
  ) {
    if (!(await this.doesUserExceedPermissionsBulk(userId, permissions))) {
      throw new UnauthorizedException(
        PermissionErrorCodes.PermissionExceedsYourGrantedPermissions,
      );
    }
  }

  async doesUserExceedPermissionsOrFail(
    userId: string,
    dto: CreatePermissionDto,
  ) {
    if (!(await this.doesUserExceedPermissions(userId, dto))) {
      throw new UnauthorizedException(
        PermissionErrorCodes.PermissionExceedsYourGrantedPermissions,
      );
    }
  }

  getPermissionOptions() {
    return {
      actions: Object.values(PermissionAction),
      objects: Object.values(PermissionObject),
    };
  }

  async findOnePermissionOrFail(id: number): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(AuthErrorCodes.PermissionNotFoundError);
    }
    return permission;
  }

  async findAllPermission(
    query: PaginateQuery,
  ): Promise<Paginated<PermissionEntity>> {
    const permissions = await paginate(query, this.permissionRepository, {
      defaultSortBy: [
        ['action', 'ASC'],
        ['object', 'ASC'],
      ],
      sortableColumns: ['action', 'object'],
      searchableColumns: ['action', 'object'],
    });
    if (!permissions) {
      throw new NotFoundException(AuthErrorCodes.PermissionNotFoundError);
    }
    return permissions;
  }

  async validatePermissionDoesNotExist(
    action: PermissionAction,
    object: PermissionObject,
  ): Promise<null> {
    const permission = await this.permissionRepository.exist({
      where: { action, object },
    });
    if (permission) {
      throw new BadRequestException(AuthErrorCodes.PermissionExistsError);
    } else {
      return null;
    }
  }

  async createPermission(
    userId: string,
    dto: CreatePermissionDto,
  ): Promise<PermissionEntity> {
    await this.validatePermissionDoesNotExist(dto.action, dto.object);
    await this.doesUserExceedPermissionsOrFail(userId, dto);
    const newPermission = this.permissionRepository.create(dto);

    return await this.permissionRepository.save(newPermission);
  }

  async updatePermission(
    userId: string,
    id: number,
    dto: UpdatePermissionDto,
  ): Promise<PermissionEntity> {
    await this.validatePermissionDoesNotExist(dto.action, dto.object);
    await this.doesUserExceedPermissionsOrFail(userId, dto);
    const updatedPermission = this.permissionRepository.create({
      ...dto,
      id,
    });

    return await this.permissionRepository.save(updatedPermission);
  }

  async deletePermission(id: number) {
    await this.findOnePermissionOrFail(id);
    return await this.permissionRepository.delete({ id });
  }
}
