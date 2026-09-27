import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

// NOTE: this suite needs `@prisma/client`'s generated types to exist
// (`npm run prisma:generate`) before it will even compile - see the
// Prisma setup section in README.md. It can't run inside the sandbox this
// project was originally scaffolded in (no network access to Prisma's
// engine download host), but works normally anywhere with a real network.

describe('AuthService', () => {
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed.jwt.token') },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe('signup', () => {
    it('hashes the password and creates a user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'user-1',
          isAdmin: false,
          ...data,
        }),
      );

      const result = await authService.signup({
        email: 'seller@example.com',
        password: 'correct-horse-battery-staple',
        displayName: 'Priya',
      });

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      const createdData = prismaMock.user.create.mock.calls[0][0].data;
      // the raw password must never be stored
      expect(createdData.passwordHash).not.toBe('correct-horse-battery-staple');
      expect(
        await bcrypt.compare(
          'correct-horse-battery-staple',
          createdData.passwordHash,
        ),
      ).toBe(true);

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).toEqual({
        id: 'user-1',
        email: 'seller@example.com',
        displayName: 'Priya',
        isAdmin: false,
      });
    });

    it('rejects a duplicate email', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.signup({
          email: 'seller@example.com',
          password: 'correct-horse-battery-staple',
          displayName: 'Priya',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('logs in with the correct password', async () => {
      const passwordHash = await bcrypt.hash('correct-horse', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'seller@example.com',
        displayName: 'Priya',
        isAdmin: false,
        passwordHash,
      });

      const result = await authService.login({
        email: 'seller@example.com',
        password: 'correct-horse',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe('seller@example.com');
    });

    it('rejects a wrong password without revealing which part was wrong', async () => {
      const passwordHash = await bcrypt.hash('correct-horse', 10);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'seller@example.com',
        displayName: 'Priya',
        isAdmin: false,
        passwordHash,
      });

      await expect(
        authService.login({
          email: 'seller@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an email that does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nobody@example.com',
          password: 'whatever',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
