import { randomBytes } from 'crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthErrorCodes } from 'src/auth/errors';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { TokensService } from 'src/tokens/tokens.service';

import { CreateEmployeeDto, CreateUserDto, UpdateUserDto } from './dtos';
import { UserEntity } from './entities';
import { UserErrorCodes } from './errors/user-errors.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private tokensService: TokensService,
    private sendgridService: SendgridService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    await this.checkCredentialsOrFail(dto.email, dto.phone);
    const user = this.userRepository.create({ ...dto });

    return await this.userRepository.save(user);
  }

  async findOne(id: string, companyId?: number): Promise<UserEntity> {
    return this.userRepository.findOne({
      relations: {
        role: {
          permissions: {
            roles: false,
          },
        },
        company: true,
        ownedCompany: {
          owner: false,
        },
      },
      where: {
        id,
        ...(companyId ? { company: { id: companyId } } : {}),
      },
    });
  }

  async findOneOrFail(id: string, companyId?: number): Promise<UserEntity> {
    const user = await this.findOne(id, companyId);
    if (!user) {
      throw new NotFoundException(AuthErrorCodes.UserNotFoundError);
    }
    return user;
  }

  async findAll(user?: UserEntity) {
    const query = this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .leftJoinAndSelect('u.company', 'company')
      .leftJoinAndSelect('u.ownedCompany', 'ownedCompany');

    if (user.company || user.ownedCompany) {
      query.andWhere(
        '"ownedCompany".id = :companyId OR company.id = :companyId',
        {
          companyId: user?.company?.id || user?.ownedCompany?.id,
        },
      );
    }

    return await query.getMany();
  }

  async update(id: string, dto: UpdateUserDto): Promise<void> {
    await this.userRepository.update(id, { ...dto });
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async checkCredentialsOrFail(email: string, phone: string): Promise<void> {
    await this.checkEmailOrFail(email);
    await this.checkPhoneOrFail(phone);
  }

  async checkEmailOrFail(email: string): Promise<void> {
    if (await this.isEmailTaken(email)) {
      throw new BadRequestException(UserErrorCodes.EmailTakenError);
    }
  }

  async checkPhoneOrFail(phone: string): Promise<void> {
    if (await this.isPhoneTaken(phone)) {
      throw new BadRequestException(UserErrorCodes.PhoneTakenError);
    }
  }

  async isEmailTaken(email: string): Promise<boolean> {
    return await this.userRepository.exist({
      where: {
        email,
      },
    });
  }

  async isPhoneTaken(phone: string): Promise<boolean> {
    if (!phone) return false;
    return await this.userRepository.exist({
      where: {
        phone,
      },
    });
  }

  async createOwnerUser(contactEmail: string) {
    await this.checkEmailOrFail(contactEmail);
    const randomPassword = randomBytes(10).toString('hex');
    const user = this.userRepository.create({
      email: contactEmail,
      password: randomPassword,
    });

    return await this.userRepository.save(user);
  }

  async createEmployee(user: UserEntity, dto: CreateEmployeeDto) {
    if (!user.ownedCompany && !user.company) {
      throw new UnauthorizedException(
        UserErrorCodes.YouMustBePartOfACompanyToCreateEmployeesError,
      );
    }
    await this.checkCredentialsOrFail(dto.email, dto.phone);

    const employee = this.userRepository.create({
      ...dto,
      company: {
        id: user.ownedCompany ? user.ownedCompany.id : user.company.id,
      },
    });

    const employeeEntity = await this.userRepository.save(employee);

    const token = await this.tokensService.generateEmailConfirmationToken(
      employeeEntity.id,
    );

    await this.sendgridService.sendEmailVerification(dto.email, token.token);

    return employeeEntity;
  }
}
