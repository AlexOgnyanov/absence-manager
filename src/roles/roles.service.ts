import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { AuthErrorCodes } from 'src/auth/errors';
import { Repository, Not, UpdateResult } from 'typeorm';
import { UserEntity } from 'src/user/entities';
import { UserService } from 'src/user/user.service';

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

  async createRoleOrFail(dto: CreateRoleDto): Promise<RoleEntity> {
    await this.checkRoleNameAvailabilityAndFail(null, dto.name);
    const user = this.roleRepository.create({
      ...dto,
      permissions: dto.permissionIds.map((id) => ({ id: id })),
    });

    return await this.roleRepository.save(user);
  }

  async update(id: number, dto: UpdateRoleDto): Promise<UpdateResult> {
    await this.findOneRoleOrFail(id);
    await this.checkRoleNameAvailabilityAndFail(id, dto.name);

    return await this.roleRepository.update(id, { ...dto });
  }

  async delete(id: number) {
    await this.findOneRoleOrFail(id);
    return await this.roleRepository.delete({ id });
  }

  async assignRole(dto: AssignRoleToUserDto) {
    const user = await this.usersService.findOneOrFail(dto.userId);
    const role = await this.findOneRoleOrFail(dto.roleId);
    user.role = role;
    return await this.usersRepository.save(user);
  }
}
