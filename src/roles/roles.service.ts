import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
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

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly usersService: UserService,
    @Inject(forwardRef(() => CompaniesService))
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

  async findAllRoles(
    user: UserEntity,
    query: PaginateQuery,
  ): Promise<Paginated<RoleEntity>> {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;
    return await paginate(query, this.roleRepository, {
      where: {
        ...(userCompany
          ? { company: { id: userCompany } }
          : { company: IsNull() }),
      },
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

  async create(user: UserEntity, dto: CreateRoleDto): Promise<RoleEntity> {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;
    if (userCompany) {
      await this.companiesService.findOneOrFail(userCompany);
    }

    await this.checkRoleNameAvailabilityAndFail(null, dto.name, userCompany);

    const permissions = await this.permissionsService.findBulkPermissionsOrFail(
      dto.permissionIds,
    );
    await this.permissionsService.doesUserExceeedPermissionsBulkOrFail(
      user,
      permissions,
    );

    const role = this.roleRepository.create({
      ...dto,
      permissions,
      ...(userCompany ? { company: { id: userCompany } } : { company: null }),
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
      user,
      permissions,
    );

    const userCompany = user?.company?.id || user?.ownedCompany?.id;
    const beforeRole = await this.findOneRoleOrFail(id, userCompany);
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
    await this.findOneRoleOrFail(
      id,
      user?.company?.id || user?.ownedCompany?.id,
    );
    return await this.roleRepository.delete({ id });
  }

  async assignRole(user: UserEntity, dto: AssignRoleToUserDto) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;
    const assignee = await this.usersService.findOneOrFail(
      dto.userId,
      userCompany,
    );
    const role = await this.findOneRoleOrFail(dto.roleId, userCompany);
    assignee.role = role;
    await this.permissionsService.doesUserExceeedPermissionsBulkOrFail(
      user,
      assignee.role.permissions,
    );
    return await this.usersRepository.save(assignee);
  }
}
