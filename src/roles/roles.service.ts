import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { AuthErrorCodes } from 'src/auth/errors';
import { Repository, Not } from 'typeorm';
import { UserEntity } from 'src/user/entities';
import { UserService } from 'src/user/user.service';
import { PermissionsService } from 'src/permissions/permissions.service';

import { AssignRoleToUserDto, CreateRoleDto } from './dtos';
import { RoleEntity } from './entities';
import { UpdateRoleDto } from './dtos/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly usersService: UserService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async findOneRoleOrFail(id: number): Promise<RoleEntity | null> {
    const role = await this.roleRepository.findOne({
      relations: {
        permissions: true,
      },
      where: { id: id },
    });
    if (!role) {
      throw new NotFoundException(AuthErrorCodes.RoleNotFoundError);
    }
    return role;
  }

  async findAllRoles(query: PaginateQuery): Promise<Paginated<RoleEntity>> {
    return await paginate(query, this.roleRepository, {
      defaultSortBy: [['name', 'ASC']],
      sortableColumns: ['name'],
      searchableColumns: ['name'],
      relations: {
        permissions: true,
      },
    });
  }

  async checkRoleNameAvailability(
    id: number | null,
    name: string,
  ): Promise<boolean> {
    return await this.roleRepository.exist({
      where: {
        ...(id ? { id: Not(id) } : {}),
        name,
      },
    });
  }

  async checkRoleNameAvailabilityAndFail(
    id: number | null,
    name: string,
  ): Promise<void> {
    const roleExists = await this.checkRoleNameAvailability(id, name);

    if (roleExists) {
      throw new BadRequestException(AuthErrorCodes.RoleNameAlreadyExistsError);
    }
  }

  async createRoleOrFail(
    userId: string,
    dto: CreateRoleDto,
  ): Promise<RoleEntity> {
    await this.checkRoleNameAvailabilityAndFail(null, dto.name);
    const permissions = await this.permissionsService.findBulkPermissions(
      dto.permissionIds,
    );
    await this.permissionsService.doesUserExceeedPermissionsBulkOrFail(
      userId,
      permissions,
    );
    const role = this.roleRepository.create({
      ...dto,
      permissions,
    });

    const role1 = await this.roleRepository.save(role);
    return role1;
  }

  async update(
    userId: string,
    id: number,
    dto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    dto.name ? await this.checkRoleNameAvailabilityAndFail(id, dto.name) : {};

    const permissions = await this.permissionsService.findBulkPermissions(
      dto.permissionIds,
    );
    await this.permissionsService.doesUserExceeedPermissionsBulkOrFail(
      userId,
      permissions,
    );

    const beforeRole = await this.findOneRoleOrFail(id);
    const role = this.roleRepository.create({
      ...beforeRole,
      ...dto,
      ...(dto.permissionIds
        ? { permissions: dto.permissionIds.map((id) => ({ id })) }
        : { permissions: beforeRole.permissions }),
    });

    return await this.roleRepository.save(role);
  }

  async delete(id: number) {
    await this.findOneRoleOrFail(id);
    return await this.roleRepository.delete({ id });
  }

  async assignRole(userId: string, dto: AssignRoleToUserDto) {
    const user = await this.usersService.findOneOrFail(dto.userId);
    const role = await this.findOneRoleOrFail(dto.roleId);
    user.role = role;
    await this.permissionsService.doesUserExceeedPermissionsBulkOrFail(
      userId,
      user.role.permissions,
    );
    return await this.usersRepository.save(user);
  }
}
