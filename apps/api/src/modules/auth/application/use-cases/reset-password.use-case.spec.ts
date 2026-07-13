import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { ResetPasswordUseCase } from './reset-password.use-case';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { passwordHashProof } from '../password-hash-proof';
import { RESET_PASSWORD_REQUESTED_EVENT } from '@contracts/auth/reset-password-requested.event';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let authRepository: jest.Mocked<
    Pick<AuthRepository, 'findForPasswordResetByEmail'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;
  let brokerClient: jest.Mocked<Pick<ClientProxy, 'emit'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;

  const configValues: Record<string, string> = {
    JWT_RESET_PASSWORD_SECRET: 'segredo-reset',
    FRONTEND_URL: 'https://loja.example.com',
  };

  const validRequest = { email: 'maria@example.com' };
  const passwordHash = '$2b$12$hashDaSenhaAtualDoUsuario00000000000000000000';

  const activeUser = {
    id: 7,
    name: 'Maria Silva',
    email: 'maria@example.com',
    password_hash: passwordHash,
    is_active: true,
    deleted_at: null,
  };

  beforeEach(() => {
    authRepository = { findForPasswordResetByEmail: jest.fn() };
    jwtService = { sign: jest.fn() };
    brokerClient = { emit: jest.fn() };
    configService = {
      get: jest.fn((key: string) => configValues[key]),
    };

    useCase = new ResetPasswordUseCase(
      authRepository as unknown as AuthRepository,
      jwtService as unknown as JwtService,
      brokerClient as unknown as ClientProxy,
      configService as unknown as ConfigService,
    );
  });

  it('assina o token com type reset-password, pwd igual ao proof do hash e expiração de 30m, e emite o evento com to/name/resetLink', async () => {
    authRepository.findForPasswordResetByEmail.mockResolvedValue(activeUser);
    jwtService.sign.mockReturnValue('token-reset-assinado');

    const result = await useCase.execute(validRequest);

    expect(authRepository.findForPasswordResetByEmail).toHaveBeenCalledWith(
      validRequest.email,
    );
    expect(jwtService.sign).toHaveBeenCalledWith(
      {
        sub: 7,
        type: 'reset-password',
        pwd: passwordHashProof(passwordHash),
      },
      { secret: 'segredo-reset', expiresIn: '30m' },
    );
    expect(brokerClient.emit).toHaveBeenCalledWith(
      RESET_PASSWORD_REQUESTED_EVENT,
      {
        to: 'maria@example.com',
        name: 'Maria Silva',
        resetLink:
          'https://loja.example.com/reset-password?token=token-reset-assinado',
      },
    );
    expect(result).toEqual({
      message: 'Acesse seu email para recuperar senha',
    });
  });

  it('retorna a mensagem genérica SEM assinar token nem emitir evento quando o usuário não existe (não revela existência de conta)', async () => {
    authRepository.findForPasswordResetByEmail.mockResolvedValue(null);

    const result = await useCase.execute(validRequest);

    expect(result).toEqual({
      message: 'Acesse seu email para recuperar senha',
    });
    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(brokerClient.emit).not.toHaveBeenCalled();
  });

  it('retorna a mensagem genérica SEM assinar token nem emitir evento quando o usuário está inativo (is_active=false)', async () => {
    authRepository.findForPasswordResetByEmail.mockResolvedValue({
      ...activeUser,
      is_active: false,
    });

    const result = await useCase.execute(validRequest);

    expect(result).toEqual({
      message: 'Acesse seu email para recuperar senha',
    });
    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(brokerClient.emit).not.toHaveBeenCalled();
  });

  it('retorna a mensagem genérica SEM assinar token nem emitir evento quando o usuário está deletado (deleted_at preenchido)', async () => {
    authRepository.findForPasswordResetByEmail.mockResolvedValue({
      ...activeUser,
      deleted_at: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await useCase.execute(validRequest);

    expect(result).toEqual({
      message: 'Acesse seu email para recuperar senha',
    });
    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(brokerClient.emit).not.toHaveBeenCalled();
  });
});
