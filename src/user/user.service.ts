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
import { AbsenceAmountEntity } from 'src/absences/entities';
import { CompanyErrorCodes } from 'src/companies/errors';
import { CompanyEntity } from 'src/companies/entities';

import { CreateEmployeeDto, CreateUserDto, UpdateUserDto } from './dtos';
import { UserEntity } from './entities';
import { UserErrorCodes } from './errors/user-errors.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AbsenceAmountEntity)
    private readonly absenceAmountRepository: Repository<AbsenceAmountEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly tokensService: TokensService,
    private readonly sendgridService: SendgridService,
  ) {}

  async create(dto: CreateUserDto) {
    await this.checkCredentialsOrFail(dto.email, dto.phone);
    const user = this.userRepository.create({ ...dto });

    return await this.userRepository.save(user);
  }

  async findOne(id: string, companyId?: number) {
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

  async findOneOrFail(id: string, companyId?: number) {
    const user = await this.findOne(id, companyId);
    if (!user) {
      throw new NotFoundException(AuthErrorCodes.UserNotFoundError);
    }
    return user;
  }

  async findAll(user: UserEntity) {
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

  async update(user: UserEntity, id: string, dto: UpdateUserDto) {
    await this.findOneOrFail(id, user?.company?.id || user?.ownedCompany?.id);

    await this.userRepository.update(id, dto);
  }

  async delete(user: UserEntity, id: string) {
    const userEntity = await this.findOneOrFail(
      id,
      user?.company?.id || user?.ownedCompany?.id,
    );
    return await this.userRepository.remove(userEntity);
  }

  async checkCredentialsOrFail(email: string, phone: string) {
    await this.checkEmailOrFail(email);
    await this.checkPhoneOrFail(phone);
  }

  async checkEmailOrFail(email: string) {
    if (await this.isEmailTaken(email)) {
      throw new BadRequestException(UserErrorCodes.EmailTakenError);
    }
  }

  async checkPhoneOrFail(phone: string) {
    if (await this.isPhoneTaken(phone)) {
      throw new BadRequestException(UserErrorCodes.PhoneTakenError);
    }
  }

  async isEmailTaken(email: string) {
    return await this.userRepository.exist({
      where: {
        email,
      },
    });
  }

  async isPhoneTaken(phone: string) {
    if (!phone) return false;
    return await this.userRepository.exist({
      where: {
        phone,
      },
    });
  }

  async createOwnerUser(contactEmail: string) {
    await this.checkEmailOrFail(contactEmail);
    const user = this.userRepository.create({
      email: contactEmail,
      password: null,
    });

    const userEntity = await this.userRepository.save(user);
    const token = await this.tokensService.generateEmailConfirmationToken(
      userEntity.id,
    );

    await this.sendgridService.sendEmailVerification(user.email, token.token);

    return userEntity;
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

    await this.appendAllAbsenceAmountsToUser(employeeEntity);

    return employeeEntity;
  }

  async findCompanyOrFail(id: number) {
    const company = await this.companyRepository.findOne({
      relations: {
        employees: true,
      },
      where: {
        id,
      },
    });

    if (!company) {
      throw new NotFoundException(CompanyErrorCodes.CompanyNotFoundError);
    }

    return company;
  }

  async appendAllAbsenceAmountsToUser(user: UserEntity) {
    const userCompany = user?.company?.id || user?.ownedCompany?.id;

    const company = await this.findCompanyOrFail(userCompany);

    const absenceAmounts: AbsenceAmountEntity[] = [];

    for (let i = 0; i < company?.absenceTypes?.length; i++) {
      absenceAmounts.push(
        this.absenceAmountRepository.create({
          absenceType: company.absenceTypes[i],
          user,
          amount: company.absenceTypes[i].yealyCount,
        }),
      );
    }

    return await this.absenceAmountRepository.save(absenceAmounts);
  }

  async getDepartmentEmails(user: UserEntity) {
    const userEntity = await this.userRepository.findOne({
      relations: {
        departments: {
          users: true,
        },
      },
      where: {
        id: user.id,
      },
    });

    const emails: string[] = [];
    for (let i = 0; i < userEntity.departments.length; i++) {
      for (let j = 0; j < userEntity.departments[i].users.length; j++) {
        const userEmail = userEntity.departments[i].users[j].email;
        if (userEmail !== userEntity.email) {
          emails.push(userEmail);
        }
      }
    }

    return emails;
  }
}
