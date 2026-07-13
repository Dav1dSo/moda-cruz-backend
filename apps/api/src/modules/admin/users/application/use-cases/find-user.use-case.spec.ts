import { NotFoundException } from '@nestjs/common';
import { FindUserUseCase } from './find-user.use-case';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

describe('FindUserUseCase', () => {
  let useCase: FindUserUseCase;
  let userRepository: jest.Mocked<Pick<UserRepository, 'findById'>>;

  const userId = 10;

  const fullUser = {
    id: userId,
    name: 'Maria Silva',
    email: 'maria@example.com',
    phone: '11999999999',
    is_active: true,
    is_platform_admin: false,
    last_login_at: new Date('2026-03-01T10:00:00.000Z'),
    created_at: new Date('2026-01-10T12:00:00.000Z'),
    profiles: [
      { profile: { id: 1, name: 'Vendas' } },
      { profile: { id: 2, name: 'Estoque' } },
    ],
  };

  beforeEach(() => {
    userRepository = { findById: jest.fn() };

    useCase = new FindUserUseCase(userRepository as unknown as UserRepository);
  });

  it('lança NotFoundException quando o usuário não existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    const promise = useCase.execute(userId);

    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
    await expect(promise).rejects.toThrow('Usuário não encontrado');
  });

  it('mapeia todos os campos, formata datas em ISO e achata os perfis', async () => {
    userRepository.findById.mockResolvedValue(fullUser);

    const result = await useCase.execute(userId);

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(result).toEqual({
      id: userId,
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '11999999999',
      is_active: true,
      is_platform_admin: false,
      last_login_at: '2026-03-01T10:00:00.000Z',
      created_at: '2026-01-10T12:00:00.000Z',
      profiles: [
        { id: 1, name: 'Vendas' },
        { id: 2, name: 'Estoque' },
      ],
    });
  });

  it('mapeia last_login_at null explicitamente quando o usuário nunca logou', async () => {
    userRepository.findById.mockResolvedValue({
      ...fullUser,
      last_login_at: null,
    });

    const result = await useCase.execute(userId);

    expect(result.last_login_at).toBeNull();
  });

  it('não expõe campos sensíveis fora do contrato de resposta (ex.: password_hash), mesmo que o repositório os retorne', async () => {
    userRepository.findById.mockResolvedValue({
      ...fullUser,
      password_hash: '$2b$12$naoDeveVazarNoContrato',
    } as never);

    const result = await useCase.execute(userId);

    expect(result).not.toHaveProperty('password_hash');
    expect(Object.keys(result).sort()).toEqual(
      [
        'id',
        'name',
        'email',
        'phone',
        'is_active',
        'is_platform_admin',
        'last_login_at',
        'created_at',
        'profiles',
      ].sort(),
    );
  });
});
