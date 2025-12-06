import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
  };

  const mockUserModel = {
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn(),
    }),
    findById: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn(),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn(),
    }),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve retornar array de usuários sem senha', async () => {
      const users = [mockUser];
      mockUserModel.find().select().exec.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUserModel.find).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuário quando email existe', async () => {
      mockUserModel.findOne().exec.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando email não existe', async () => {
      mockUserModel.findOne().exec.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('deve retornar usuário quando ID é válido', async () => {
      mockUserModel.findById().select().exec.mockResolvedValue(mockUser);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockUserModel.findById().select().exec.mockResolvedValue(null);

      await expect(service.findOne('invalidId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('deve criar usuário com senha hasheada', async () => {
      const createDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockUserModel.findOne().exec.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        ...createDto,
        password: hashedPassword,
      });

      const result = await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...createDto,
        password: hashedPassword,
      });
    });

    it('deve lançar ConflictException quando email já existe', async () => {
      const createDto = {
        name: 'New User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne().exec.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar usuário com nova senha hasheada', async () => {
      const updateDto = {
        name: 'Updated Name',
        password: 'newPassword123',
      };

      const hashedPassword = 'newHashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockUserModel.findByIdAndUpdate().exec.mockResolvedValue({
        ...mockUser,
        ...updateDto,
        password: hashedPassword,
      });

      await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });
  });

  describe('remove', () => {
    it('deve remover usuário com sucesso', async () => {
      mockUserModel.findByIdAndDelete().exec.mockResolvedValue(mockUser);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });
  });
});