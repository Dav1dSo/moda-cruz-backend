import { BadRequestException, ConflictException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { CreateUserUseCase } from './create-user.use-case';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { CreateUserRequestDTO } from '../../dtos/request/user-request';
import { USER_CREATED_EVENT } from '@contracts/users/user-created.event';

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

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<
    Pick<
      UserRepository,
      'getUserByEmail' | 'findExistingProfileIds' | 'createUser'
    >
  >;
  let brokerClient: jest.Mocked<Pick<ClientProxy, 'emit'>>;

  const validRequest: CreateUserRequestDTO = {
    name: 'Maria Silva',
    email: 'maria@example.com',
    phone: '11999999999',
    password: 'Senha@123',
    profile_ids: [2, 1],
  };

  beforeEach(() => {
    userRepository = {
      getUserByEmail: jest.fn(),
      findExistingProfileIds: jest.fn(),
      createUser: jest.fn(),
    };
    brokerClient = { emit: jest.fn() };

    useCase = new CreateUserUseCase(
      userRepository as unknown as UserRepository,
      brokerClient as unknown as ClientProxy,
    );

    userRepository.getUserByEmail.mockResolvedValue(null);
    userRepository.findExistingProfileIds.mockResolvedValue([2, 1]);
  });

  it('cria o usuário e emite user.created quando o email não existe e os perfis são válidos', async () => {
    const result = await useCase.execute(validRequest);

    expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
      validRequest.email,
    );
    expect(userRepository.createUser).toHaveBeenCalledWith(
      validRequest,
      [2, 1],
    );
    expect(brokerClient.emit).toHaveBeenCalledWith(USER_CREATED_EVENT, {
      name: validRequest.name,
      email: validRequest.email,
      phone: validRequest.phone,
    });
    expect(result).toEqual({ message: 'Usuário criado com sucesso' });
  });

  it('deduplica profile_ids repetidos antes de validar e persistir', async () => {
    const req: CreateUserRequestDTO = {
      ...validRequest,
      profile_ids: [2, 1, 2, 1, 2],
    };

    await useCase.execute(req);

    expect(userRepository.findExistingProfileIds).toHaveBeenCalledWith([2, 1]);
    expect(userRepository.createUser).toHaveBeenCalledWith(req, [2, 1]);
  });

  it('lança ConflictException e não valida perfis, não persiste e não emite evento quando o email já existe', async () => {
    userRepository.getUserByEmail.mockResolvedValue({ id: 99 });

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow('Email já cadastrado.');

    expect(userRepository.findExistingProfileIds).not.toHaveBeenCalled();
    expect(userRepository.createUser).not.toHaveBeenCalled();
    expect(brokerClient.emit).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste nem emite evento quando algum profile_id não existe', async () => {
    userRepository.findExistingProfileIds.mockResolvedValue([2]);

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow(
      'Um ou mais perfis informados não existem.',
    );

    expect(userRepository.createUser).not.toHaveBeenCalled();
    expect(brokerClient.emit).not.toHaveBeenCalled();
  });

  it('lança ConflictException de email e não emite evento quando a escrita falha com P2002 em email (corrida entre a checagem e o insert)', async () => {
    userRepository.createUser.mockRejectedValue(
      prismaError('P2002', { target: ['email'] }),
    );

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow('Email já cadastrado.');

    expect(brokerClient.emit).not.toHaveBeenCalled();
  });

  it('propaga o erro original (não vira 409 de email) quando o P2002 é de outro alvo, ex.: user_id+profile_id', async () => {
    const error = prismaError('P2002', { target: ['user_id', 'profile_id'] });
    userRepository.createUser.mockRejectedValue(error);

    await expect(useCase.execute(validRequest)).rejects.toBe(error);

    expect(brokerClient.emit).not.toHaveBeenCalled();
  });

  it('lança BadRequestException de perfis e não emite evento quando a escrita falha com P2003 (perfil removido entre a checagem e o insert)', async () => {
    userRepository.createUser.mockRejectedValue(prismaError('P2003'));

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow(
      'Um ou mais perfis informados não existem.',
    );

    expect(brokerClient.emit).not.toHaveBeenCalled();
  });

  it('propaga erros desconhecidos da escrita sem emitir evento', async () => {
    const unknownError = new Error('falha inesperada de infraestrutura');
    userRepository.createUser.mockRejectedValue(unknownError);

    await expect(useCase.execute(validRequest)).rejects.toBe(unknownError);

    expect(brokerClient.emit).not.toHaveBeenCalled();
  });
});
