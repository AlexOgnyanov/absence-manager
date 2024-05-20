import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AbsenceAmountEntity } from 'src/absences/entities';
import { CompanyEntity } from 'src/companies/entities';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { TokensService } from 'src/tokens/tokens.service';

import { CreateUserDto, UpdateUserDto } from './dtos';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let absenceAmountRepository: Repository<AbsenceAmountEntity>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let companyRepository: Repository<CompanyEntity>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let tokensService: TokensService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sendgridService: SendgridService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(AbsenceAmountEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CompanyEntity),
          useClass: Repository,
        },
        {
          provide: TokensService,
          useValue: {
            generateEmailConfirmationToken: jest.fn(),
          },
        },
        {
          provide: SendgridService,
          useValue: {
            sendEmailVerification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    absenceAmountRepository = module.get<Repository<AbsenceAmountEntity>>(
      getRepositoryToken(AbsenceAmountEntity),
    );
    companyRepository = module.get<Repository<CompanyEntity>>(
      getRepositoryToken(CompanyEntity),
    );
    tokensService = module.get<TokensService>(TokensService);
    sendgridService = module.get<SendgridService>(SendgridService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
        email: 'test@example.com',
        password: '123456789',
      };
      jest
        .spyOn(service, 'checkCredentialsOrFail')
        .mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'create').mockReturnValue(dto as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(dto as any);

      expect(await service.create(dto)).toEqual(dto);
      expect(service.checkCredentialsOrFail).toHaveBeenCalledWith(
        dto.email,
        dto.phone,
      );
      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const user = { id: '1' } as UserEntity;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      expect(await service.findOne('1')).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        relations: {
          role: { permissions: { roles: false } },
          company: true,
          ownedCompany: { owner: false },
        },
        where: { id: '1' },
      });
    });
  });

  describe('findOneOrFail', () => {
    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOneOrFail('1')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith('1', undefined);
    });

    it('should return the user if found', async () => {
      const user = { id: '1' } as UserEntity;
      jest.spyOn(service, 'findOne').mockResolvedValue(user);

      expect(await service.findOneOrFail('1')).toEqual(user);
      expect(service.findOne).toHaveBeenCalledWith('1', undefined);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto: UpdateUserDto = {
        firstName: 'newFirstName',
        lastName: 'newLastName',
      };
      jest.spyOn(service, 'findOneOrFail').mockResolvedValue({} as UserEntity);
      jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

      await service.update({} as UserEntity, '1', dto);
      expect(service.findOneOrFail).toHaveBeenCalledWith('1', undefined);
      expect(userRepository.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = { id: '1' } as UserEntity;
      jest.spyOn(service, 'findOneOrFail').mockResolvedValue(user);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(user);

      expect(await service.delete({} as UserEntity, '1')).toEqual(user);
      expect(service.findOneOrFail).toHaveBeenCalledWith('1', undefined);
      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });
  });

  describe('checkEmailOrFail', () => {
    it('should throw BadRequestException if email is taken', async () => {
      jest.spyOn(service, 'isEmailTaken').mockResolvedValue(true);

      await expect(
        service.checkEmailOrFail('test@example.com'),
      ).rejects.toThrow(BadRequestException);
      expect(service.isEmailTaken).toHaveBeenCalledWith('test@example.com');
    });

    it('should not throw if email is not taken', async () => {
      jest.spyOn(service, 'isEmailTaken').mockResolvedValue(false);

      await expect(
        service.checkEmailOrFail('test@example.com'),
      ).resolves.not.toThrow();
      expect(service.isEmailTaken).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('checkPhoneOrFail', () => {
    it('should throw BadRequestException if phone is taken', async () => {
      jest.spyOn(service, 'isPhoneTaken').mockResolvedValue(true);

      await expect(service.checkPhoneOrFail('123456789')).rejects.toThrow(
        BadRequestException,
      );
      expect(service.isPhoneTaken).toHaveBeenCalledWith('123456789');
    });

    it('should not throw if phone is not taken', async () => {
      jest.spyOn(service, 'isPhoneTaken').mockResolvedValue(false);

      await expect(
        service.checkPhoneOrFail('123456789'),
      ).resolves.not.toThrow();
      expect(service.isPhoneTaken).toHaveBeenCalledWith('123456789');
    });
  });

  // Add more tests for other methods following the same pattern
});
