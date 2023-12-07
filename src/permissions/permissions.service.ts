import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { AuthErrorCodes } from 'src/auth/errors';
import { PermissionAction, PermissionObject } from 'src/casl/enums';
import { Repository } from 'typeorm';

import { PermissionEntity } from './entities';
import { CreatePermissionDto, UpdatePermissionDto } from './dtos';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async findUserPermissions(userId: number): Promise<PermissionEntity[]> {
    return await this.permissionRepository
      .createQueryBuilder('permission')
      .select(['permission.id', 'permission.action', 'permission.object'])
      .innerJoin('permission.roles', 'role')
      .innerJoin('role.users', 'user')
      .where('user.id = :userId', { userId: userId })
      .getMany();
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

  async createPermission(dto: CreatePermissionDto): Promise<PermissionEntity> {
    await this.validatePermissionDoesNotExist(dto.action, dto.object);
    const newPermission = this.permissionRepository.create(dto);

    return await this.permissionRepository.save(newPermission);
  }

  async updatePermission(
    id: number,
    dto: UpdatePermissionDto,
  ): Promise<PermissionEntity> {
    await this.validatePermissionDoesNotExist(dto.action, dto.object);
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
