import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { AuthErrorCodes } from 'src/auth/errors';
import { Repository, Not, IsNull } from 'typeorm';
import { UserEntity } from 'src/user/entities';
import { UserService } from 'src/user/user.service';
import { PermissionsService } from 'src/permissions/permissions.service';
import { CompaniesService } from 'src/companies/companies.service';

import { AssignRoleToUserDto, CreateRoleDto } from './dtos';
import { RoleEntity } from './entities';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { RoleErrorCodes } from './errors';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly usersService: UserService,
    private readonly companiesService: CompaniesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async findOneRoleOrFail(
    id: number,
    companyId?: number,
  ): Promise<RoleEntity | null> {
    const role = await this.roleRepository.findOne({
      relations: {
        permissions: true,
      },
      where: {
        id,
        ...(companyId ? { company: { id: companyId } } : { company: IsNull() }),
      },
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
    companyId?: number,
  ): Promise<boolean> {
    return await this.roleRepository.exist({
      where: {
        ...(id ? { id: Not(id) } : {}),
        ...(companyId ? { company: { id: companyId } } : { company: IsNull() }),
        name,
      },
    });
  }

  async checkRoleNameAvailabilityAndFail(
    id: number | null,
    name: string,
    companyId?: number,
  ): Promise<void> {
    const roleExists = await this.checkRoleNameAvailability(
      id,
      name,
      companyId,
    );

    if (roleExists) {
      throw new BadRequestException(AuthErrorCodes.RoleNameAlreadyExistsError);
    }
  }

  async createRoleOrFail(
    userId: string,
    dto: CreateRoleDto,
  ): Promise<RoleEntity> {
    await this.companiesService.findOneOrFail(dto.companyId);
    await this.checkRoleNameAvailabilityAndFail(null, dto.name, dto.companyId);
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
      ...(dto.companyId
        ? { company: { id: dto.companyId } }
        : { company: null }),
    });

    return await this.roleRepository.save(role);
  }

  async update(
    user: UserEntity,
    id: number,
    dto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    dto.name ? await this.checkRoleNameAvailabilityAndFail(id, dto.name) : {};

    const permissions = await this.permissionsService.findBulkPermissions(
      dto.permissionIds,
    );
    await this.permissionsService.doesUserExceeedPermissionsBulkOrFail(
      user.id,
      permissions,
    );

    const beforeRole = await this.findOneRoleOrFail(id);
    if (beforeRole.company.id !== user.company.id) {
      throw new NotFoundException(RoleErrorCodes.RoleNotFoundError);
    }
    const role = this.roleRepository.create({
      ...beforeRole,
      ...dto,
      ...(dto.permissionIds
        ? { permissions: dto.permissionIds.map((id) => ({ id })) }
        : { permissions: beforeRole.permissions }),
    });

    return await this.roleRepository.save(role);
  }

  async delete(user: UserEntity, id: number) {
    await this.findOneRoleOrFail(id, user.company.id);
    return await this.roleRepository.delete({ id });
  }

  async assignRole(user: UserEntity, dto: AssignRoleToUserDto) {
    const assignee = await this.usersService.findOneOrFail(
      dto.userId,
      user.company.id,
    );
    const role = await this.findOneRoleOrFail(dto.roleId, user.company.id);
    assignee.role = role;
    await this.permissionsService.doesUserExceeedPermissionsBulkOrFail(
      user.id,
      assignee.role.permissions,
    );
    return await this.usersRepository.save(user);
  }
}
