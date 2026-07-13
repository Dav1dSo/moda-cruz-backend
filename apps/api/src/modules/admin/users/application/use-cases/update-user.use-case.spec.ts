import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateUserUseCase } from './update-user.use-case';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { UpdateUserRequestDTO } from '../../dtos/request/user-request';

function prismaError(
  code: string,
  meta?: Record<string, unknown>,
): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('erro prisma', {
    code,
    clientVersion: '6.19.3',
    meta,
  });
}

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<
    Pick<
      UserRepository,
      | 'findById'
      | 'findByEmailOrPhoneExcludingId'
      | 'findExistingProfileIds'
      | 'updateUserWithProfiles'
    >
  >;

  const userId = 10;

  const validRequest: UpdateUserRequestDTO = {
    name: 'Maria Silva',
    email: 'maria@example.com',
    phone: '11999999999',
    is_active: true,
    profile_ids: [3, 4],
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmailOrPhoneExcludingId: jest.fn(),
      findExistingProfileIds: jest.fn(),
      updateUserWithProfiles: jest.fn(),
    };

    useCase = new UpdateUserUseCase(
      userRepository as unknown as UserRepository,
    );

    userRepository.findById.mockResolvedValue({ id: userId } as never);
    userRepository.findByEmailOrPhoneExcludingId.mockResolvedValue(null);
    userRepository.findExistingProfileIds.mockResolvedValue([3, 4]);
  });

  it('atualiza o usuário com os perfis validados no caminho feliz', async () => {
    const result = await useCase.execute(validRequest, userId);

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(userRepository.findByEmailOrPhoneExcludingId).toHaveBeenCalledWith(
      userId,
      validRequest.email,
      validRequest.phone,
    );
    expect(userRepository.updateUserWithProfiles).toHaveBeenCalledWith(
      userId,
      validRequest,
      [3, 4],
    );
    expect(result).toEqual({ message: 'Usuário atualizado com sucesso' });
  });

  it('deduplica profile_ids repetidos antes de validar e persistir', async () => {
    const req: UpdateUserRequestDTO = {
      ...validRequest,
      profile_ids: [3, 3, 4, 3],
    };

    await useCase.execute(req, userId);

    expect(userRepository.findExistingProfileIds).toHaveBeenCalledWith([3, 4]);
    expect(userRepository.updateUserWithProfiles).toHaveBeenCalledWith(
      userId,
      req,
      [3, 4],
    );
  });

  it('não valida perfis e repassa profileIds undefined quando profile_ids não é enviado (perfis preservados)', async () => {
    const req: UpdateUserRequestDTO = {
      ...validRequest,
      profile_ids: undefined,
    };

    const result = await useCase.execute(req, userId);

    expect(userRepository.findExistingProfileIds).not.toHaveBeenCalled();
    expect(userRepository.updateUserWithProfiles).toHaveBeenCalledWith(
      userId,
      req,
      undefined,
    );
    expect(result).toEqual({ message: 'Usuário atualizado com sucesso' });
  });

  it('lança NotFoundException e não escreve quando o usuário não existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    const promise = useCase.execute(validRequest, userId);

    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
    await expect(promise).rejects.toThrow('Usuário não encontrado');

    expect(userRepository.findByEmailOrPhoneExcludingId).not.toHaveBeenCalled();
    expect(userRepository.updateUserWithProfiles).not.toHaveBeenCalled();
  });

  it('lança ConflictException e não escreve quando email ou telefone já pertencem a outro usuário', async () => {
    userRepository.findByEmailOrPhoneExcludingId.mockResolvedValue({
      id: 99,
    });

    const promise = useCase.execute(validRequest, userId);

    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow('Email ou telefone já cadastrados.');

    expect(userRepository.updateUserWithProfiles).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não escreve quando algum profile_id não existe', async () => {
    userRepository.findExistingProfileIds.mockResolvedValue([3]);

    const promise = useCase.execute(validRequest, userId);

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow(
      'Um ou mais perfis informados não existem.',
    );

    expect(userRepository.updateUserWithProfiles).not.toHaveBeenCalled();
  });

  it('lança ConflictException quando a escrita falha com P2002 em email (corrida entre a checagem e o update)', async () => {
    userRepository.updateUserWithProfiles.mockRejectedValue(
      prismaError('P2002', { target: ['email'] }),
    );

    const promise = useCase.execute(validRequest, userId);

    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow('Email ou telefone já cadastrados.');
  });

  it('lança ConflictException quando a escrita falha com P2002 em phone', async () => {
    userRepository.updateUserWithProfiles.mockRejectedValue(
      prismaError('P2002', { target: ['phone'] }),
    );

    const promise = useCase.execute(validRequest, userId);

    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow('Email ou telefone já cadastrados.');
  });

  it('propaga o erro original (não vira 409) quando o P2002 é de outro alvo, ex.: user_id+profile_id', async () => {
    const error = prismaError('P2002', { target: ['user_id', 'profile_id'] });
    userRepository.updateUserWithProfiles.mockRejectedValue(error);

    await expect(useCase.execute(validRequest, userId)).rejects.toBe(error);
  });

  it('lança BadRequestException de perfis quando a escrita falha com P2003 (perfil removido entre a checagem e o update)', async () => {
    userRepository.updateUserWithProfiles.mockRejectedValue(
      prismaError('P2003'),
    );

    const promise = useCase.execute(validRequest, userId);

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow(
      'Um ou mais perfis informados não existem.',
    );
  });

  it('propaga erros desconhecidos da escrita sem convertê-los em exception HTTP', async () => {
    const unknownError = new Error('falha inesperada de infraestrutura');
    userRepository.updateUserWithProfiles.mockRejectedValue(unknownError);

    await expect(useCase.execute(validRequest, userId)).rejects.toBe(
      unknownError,
    );
  });
});
