import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfirmResetPasswordUseCase } from './confirm-reset-password.use-case';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { passwordHashProof } from '../password-hash-proof';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

const hashMock = bcrypt.hash as unknown as jest.Mock;

describe('ConfirmResetPasswordUseCase', () => {
  let useCase: ConfirmResetPasswordUseCase;
  let authRepository: jest.Mocked<
    Pick<AuthRepository, 'findPasswordHashByIdAndEmail' | 'updatePassword'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'verify'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;

  const configValues: Record<string, string> = {
    JWT_RESET_PASSWORD_SECRET: 'segredo-reset',
  };

  const validRequest = {
    token: 'token-reset-recebido',
    email: 'maria@example.com',
    new_password: 'NovaSenha@123',
  };

  const passwordHash = '$2b$12$hashDaSenhaAtualDoUsuario00000000000000000000';

  const activeUser = {
    id: 7,
    password_hash: passwordHash,
    is_active: true,
    deleted_at: null,
  };

  const validPayload = {
    sub: 7,
    type: 'reset-password',
    pwd: passwordHashProof(passwordHash),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authRepository = {
      findPasswordHashByIdAndEmail: jest.fn(),
      updatePassword: jest.fn(),
    };
    jwtService = { verify: jest.fn() };
    configService = {
      get: jest.fn((key: string) => configValues[key]),
    };

    useCase = new ConfirmResetPasswordUseCase(
      jwtService as unknown as JwtService,
      authRepository as unknown as AuthRepository,
      configService as unknown as ConfigService,
    );
  });

  it('atualiza a senha com o hash bcrypt (não a senha em claro) e retorna a mensagem de sucesso no caminho feliz', async () => {
    jwtService.verify.mockReturnValue(validPayload);
    authRepository.findPasswordHashByIdAndEmail.mockResolvedValue(activeUser);
    hashMock.mockResolvedValue('$2b$12$hashBcryptDaNovaSenha');

    const result = await useCase.execute(validRequest);

    expect(jwtService.verify).toHaveBeenCalledWith(validRequest.token, {
      secret: 'segredo-reset',
    });
    expect(authRepository.findPasswordHashByIdAndEmail).toHaveBeenCalledWith(
      7,
      validRequest.email,
    );
    expect(hashMock).toHaveBeenCalledWith(validRequest.new_password, 12);
    expect(authRepository.updatePassword).toHaveBeenCalledWith(
      7,
      '$2b$12$hashBcryptDaNovaSenha',
    );
    expect(authRepository.updatePassword).not.toHaveBeenCalledWith(
      7,
      validRequest.new_password,
    );
    expect(result).toEqual({ message: 'Senha atualizada com sucesso' });
  });

  it('lança UnauthorizedException unificada e não atualiza a senha quando o token é inválido/expirado (verify lança)', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow(
      'Solicite um novo email e tente novamente.',
    );

    expect(authRepository.findPasswordHashByIdAndEmail).not.toHaveBeenCalled();
    expect(authRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException e não atualiza a senha quando o payload não tem type reset-password', async () => {
    jwtService.verify.mockReturnValue({
      ...validPayload,
      type: 'refresh',
    });

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow('Token inválido');

    expect(authRepository.findPasswordHashByIdAndEmail).not.toHaveBeenCalled();
    expect(authRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException unificada quando o usuário não existe para o sub+email informados', async () => {
    jwtService.verify.mockReturnValue(validPayload);
    authRepository.findPasswordHashByIdAndEmail.mockResolvedValue(null);

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow(
      'Solicite um novo email e tente novamente.',
    );

    expect(authRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException unificada quando o usuário está inativo (is_active=false)', async () => {
    jwtService.verify.mockReturnValue(validPayload);
    authRepository.findPasswordHashByIdAndEmail.mockResolvedValue({
      ...activeUser,
      is_active: false,
    });

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow(
      'Solicite um novo email e tente novamente.',
    );

    expect(authRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException unificada quando o usuário está deletado (deleted_at preenchido)', async () => {
    jwtService.verify.mockReturnValue(validPayload);
    authRepository.findPasswordHashByIdAndEmail.mockResolvedValue({
      ...activeUser,
      deleted_at: new Date('2026-01-01T00:00:00.000Z'),
    });

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow(
      'Solicite um novo email e tente novamente.',
    );

    expect(authRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException e não atualiza a senha quando o pwd do token diverge do hash atual (token já usado / senha trocada)', async () => {
    jwtService.verify.mockReturnValue({
      ...validPayload,
      pwd: passwordHashProof(
        '$2b$12$hashDeSenhaJaTrocada0000000000000000000000',
      ),
    });
    authRepository.findPasswordHashByIdAndEmail.mockResolvedValue(activeUser);

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow(
      'Solicite um novo email e tente novamente.',
    );

    expect(hashMock).not.toHaveBeenCalled();
    expect(authRepository.updatePassword).not.toHaveBeenCalled();
  });

  it('lança UnauthorizedException e não atualiza a senha quando o token não tem a claim pwd', async () => {
    jwtService.verify.mockReturnValue({
      sub: 7,
      type: 'reset-password',
    });
    authRepository.findPasswordHashByIdAndEmail.mockResolvedValue(activeUser);

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(promise).rejects.toThrow(
      'Solicite um novo email e tente novamente.',
    );

    expect(authRepository.updatePassword).not.toHaveBeenCalled();
  });
});
