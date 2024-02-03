import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AuthErrorCodes } from 'src/auth/errors';

import { CreateUserDto, UpdateUserDto } from './dtos';
import { UserEntity } from './entities';
import { UserErrorCodes } from './errors/user-errors.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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
      },
      where: {
        id,
        ...(companyId ? { company: { id: companyId } } : { company: IsNull() }),
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
}
