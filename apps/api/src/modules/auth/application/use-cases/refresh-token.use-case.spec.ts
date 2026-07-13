import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { passwordHashProof } from '../password-hash-proof';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let authRepository: jest.Mocked<Pick<AuthRepository, 'findForRefreshById'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'verifyAsync' | 'signAsync'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;

  const configValues: Record<string, string> = {
    JWT_SECRET: 'segredo-access',
    JWT_REFRESH_SECRET: 'segredo-refresh',
  };

  const refreshToken = 'refresh-token-recebido';
  const passwordHash = '$2b$12$hashDaSenhaAtualDoUsuario00000000000000000000';

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

  const validPayload = {
    sub: 7,
    type: 'refresh',
    pwd: passwordHashProof(passwordHash),
  };

  beforeEach(() => {
    authRepository = { findForRefreshById: jest.fn() };
    jwtService = { verifyAsync: jest.fn(), signAsync: jest.fn() };
    configService = {
      get: jest.fn((key: string) => configValues[key]),
    };

    useCase = new RefreshTokenUseCase(
      jwtService as unknown as JwtService,
      authRepository as unknown as AuthRepository,
      configService as unknown as ConfigService,
    );
  });

  it('verifica o token com o segredo JWT_REFRESH_SECRET e retorna um novo accessToken no caminho feliz', async () => {
    jwtService.verifyAsync.mockResolvedValue(validPayload);
    authRepository.findForRefreshById.mockResolvedValue(activeUser);
    jwtService.signAsync.mockResolvedValue('novo-access-token');

    const result = await useCase.execute(refreshToken);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
      secret: 'segredo-refresh',
    });
    expect(authRepository.findForRefreshById).toHaveBeenCalledWith(7);
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      {
        sub: 7,
        email: 'maria@example.com',
        permissions: ['users.read', 'products.read'],
        is_platform_admin: false,
      },
      { secret: 'segredo-access', expiresIn: '15m' },
    );
    expect(result).toEqual({ accessToken: 'novo-access-token' });
  });

  it('lança UnauthorizedException e não verifica o token quando o refreshToken é undefined', async () => {
    const promise = useCase.execute(undefined);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Refresh token não encontrado');

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    expect(authRepository.findForRefreshById).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException quando a assinatura do token é inválida (verifyAsync rejeita)', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    const promise = useCase.execute(refreshToken);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Refresh token inválido');

    expect(authRepository.findForRefreshById).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException e não consulta o usuário quando o payload não tem type refresh (ex.: access token reaproveitado)', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      ...validPayload,
      type: undefined,
    });

    const promise = useCase.execute(refreshToken);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Refresh token inválido');

    expect(authRepository.findForRefreshById).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException quando o payload não tem sub', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      ...validPayload,
      sub: undefined,
    });

    const promise = useCase.execute(refreshToken);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Refresh token inválido');

    expect(authRepository.findForRefreshById).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException e não assina novo token quando o pwd do payload diverge do proof do hash atual (senha trocada)', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      ...validPayload,
      pwd: passwordHashProof(
        '$2b$12$outroHashDeSenhaTrocada000000000000000000',
      ),
    });
    authRepository.findForRefreshById.mockResolvedValue(activeUser);

    const promise = useCase.execute(refreshToken);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Refresh token inválido');

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException e não assina novo token quando o payload não tem a claim pwd', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 7,
      type: 'refresh',
    });
    authRepository.findForRefreshById.mockResolvedValue(activeUser);

    const promise = useCase.execute(refreshToken);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Refresh token inválido');

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException quando o usuário do token não existe mais', async () => {
    jwtService.verifyAsync.mockResolvedValue(validPayload);
    authRepository.findForRefreshById.mockResolvedValue(null);

    const promise = useCase.execute(refreshToken);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Refresh token inválido');

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException quando o usuário está inativo (is_active=false)', async () => {
    jwtService.verifyAsync.mockResolvedValue(validPayload);
    authRepository.findForRefreshById.mockResolvedValue({
      ...activeUser,
      is_active: false,
    });

    const promise = useCase.execute(refreshToken);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Refresh token inválido');

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException quando o usuário está deletado (deleted_at preenchido)', async () => {
    jwtService.verifyAsync.mockResolvedValue(validPayload);
    authRepository.findForRefreshById.mockResolvedValue({
      ...activeUser,
      deleted_at: new Date('2026-01-01T00:00:00.000Z'),
    });

    const promise = useCase.execute(refreshToken);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Refresh token inválido');

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
