import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './login.use-case';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { passwordHashProof } from '../password-hash-proof';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const compareMock = bcrypt.compare as unknown as jest.Mock;

const TIMING_EQUALIZATION_DUMMY_PASSWORD_HASH =
  '$2b$12$XdQhqfqJ8VzTM7QuUHmXZ.YzePyHGc/FyC.2rBf4Ni8UTnsYgRs0q';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let authRepository: jest.Mocked<
    Pick<AuthRepository, 'getUserByEmail' | 'updateLastLogin'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;

  const configValues: Record<string, string> = {
    JWT_SECRET: 'segredo-access',
    JWT_REFRESH_SECRET: 'segredo-refresh',
  };

  const validRequest = {
    email: 'maria@example.com',
    password: 'Senha@123',
  };

  const passwordHash = '$2b$12$hashDaSenhaArmazenadaNoBancoParaMaria000000000';

  const activeUser = {
    id: 7,
    name: 'Maria Silva',
    email: 'maria@example.com',
    is_platform_admin: false,
    deleted_at: null,
    is_active: true,
    password_hash: passwordHash,
    profiles: [
      {
        profile: {
          id: 1,
          name: 'Vendas',
          permissions: [
            { permission: { key: 'users.read' } },
            { permission: { key: 'products.read' } },
          ],
        },
      },
      {
        profile: {
          id: 2,
          name: 'Estoque',
          permissions: [{ permission: { key: 'products.read' } }],
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authRepository = {
      getUserByEmail: jest.fn(),
      updateLastLogin: jest.fn(),
    };
    jwtService = { signAsync: jest.fn() };
    configService = {
      get: jest.fn((key: string) => configValues[key]),
    };

    useCase = new LoginUseCase(
      authRepository as unknown as AuthRepository,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  it('autentica, assina access e refresh token e retorna o contrato completo no caminho feliz', async () => {
    authRepository.getUserByEmail.mockResolvedValue(activeUser);
    compareMock.mockResolvedValue(true);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token-assinado')
      .mockResolvedValueOnce('refresh-token-assinado');

    const result = await useCase.execute(validRequest);

    expect(authRepository.getUserByEmail).toHaveBeenCalledWith(
      validRequest.email,
    );
    expect(compareMock).toHaveBeenCalledWith(
      validRequest.password,
      passwordHash,
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      {
        sub: 7,
        email: 'maria@example.com',
        permissions: ['users.read', 'products.read'],
        is_platform_admin: false,
      },
      { secret: 'segredo-access', expiresIn: '15m' },
    );
    expect(authRepository.updateLastLogin).toHaveBeenCalledWith(7);
    expect(result).toEqual({
      accessToken: 'access-token-assinado',
      refreshToken: 'refresh-token-assinado',
      user: {
        id: 7,
        email: 'maria@example.com',
        name: 'Maria Silva',
        is_platform_admin: false,
      },
      profiles: [
        { id: 1, name: 'Vendas', permissions: ['users.read', 'products.read'] },
        { id: 2, name: 'Estoque', permissions: ['products.read'] },
      ],
    });
  });

  it('assina o refresh token com type refresh, pwd igual ao proof do password_hash e o segredo JWT_REFRESH_SECRET', async () => {
    authRepository.getUserByEmail.mockResolvedValue(activeUser);
    compareMock.mockResolvedValue(true);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token-assinado')
      .mockResolvedValueOnce('refresh-token-assinado');

    await useCase.execute(validRequest);

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      {
        sub: 7,
        type: 'refresh',
        pwd: passwordHashProof(passwordHash),
      },
      { secret: 'segredo-refresh', expiresIn: '7d' },
    );
  });

  it('lança UnauthorizedException genérica e ainda executa bcrypt.compare (equalização de timing) quando o usuário não existe', async () => {
    authRepository.getUserByEmail.mockResolvedValue(null);

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Credenciais inválidas!');

    expect(compareMock).toHaveBeenCalledWith(
      validRequest.password,
      TIMING_EQUALIZATION_DUMMY_PASSWORD_HASH,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(authRepository.updateLastLogin).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException genérica com equalização de timing quando o usuário está deletado (deleted_at preenchido)', async () => {
    authRepository.getUserByEmail.mockResolvedValue({
      ...activeUser,
      deleted_at: new Date('2026-01-01T00:00:00.000Z'),
    });

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Credenciais inválidas!');

    expect(compareMock).toHaveBeenCalledWith(
      validRequest.password,
      TIMING_EQUALIZATION_DUMMY_PASSWORD_HASH,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(authRepository.updateLastLogin).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException genérica com equalização de timing quando o usuário está inativo (is_active=false)', async () => {
    authRepository.getUserByEmail.mockResolvedValue({
      ...activeUser,
      is_active: false,
    });

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Credenciais inválidas!');

    expect(compareMock).toHaveBeenCalledWith(
      validRequest.password,
      TIMING_EQUALIZATION_DUMMY_PASSWORD_HASH,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(authRepository.updateLastLogin).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException e não assina token nem registra last_login quando a senha está incorreta', async () => {
    authRepository.getUserByEmail.mockResolvedValue(activeUser);
    compareMock.mockResolvedValue(false);

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Credenciais inválidas!');

    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(authRepository.updateLastLogin).not.toHaveBeenCalled();
  });
});
