import { BadRequestException, ConflictException } from '@nestjs/common';
import { CouponDiscountType, Prisma } from '@prisma/client';
import { CreateCouponUseCase } from './create-coupon.use-case';
import { CouponRepository } from '../../infrastructure/repositories/coupon.repository';
import { CreateCouponRequestDTO } from '../../dtos/request/coupon-request';

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

describe('CreateCouponUseCase', () => {
  let useCase: CreateCouponUseCase;
  let couponRepository: jest.Mocked<
    Pick<CouponRepository, 'findByCode' | 'userExists' | 'createCoupon'>
  >;

  const validRequest: CreateCouponRequestDTO = {
    code: 'BLACKFRIDAY10',
    description: 'Desconto de 10% na Black Friday',
    discount_type: CouponDiscountType.PERCENTUAL,
    discount_value: 10,
    minimum_purchase: 100,
    max_uses: 500,
    per_customer_limit: 1,
    starts_at: '2026-11-20T00:00:00.000Z',
    ends_at: '2026-11-30T23:59:59.000Z',
    is_active: true,
  };

  beforeEach(() => {
    couponRepository = {
      findByCode: jest.fn(),
      userExists: jest.fn(),
      createCoupon: jest.fn(),
    };

    useCase = new CreateCouponUseCase(
      couponRepository as unknown as CouponRepository,
    );

    couponRepository.findByCode.mockResolvedValue(null);
    couponRepository.userExists.mockResolvedValue(true);
  });

  it('cria o cupom quando o payload é válido', async () => {
    const result = await useCase.execute(validRequest);

    expect(couponRepository.findByCode).toHaveBeenCalledWith('BLACKFRIDAY10');
    expect(couponRepository.createCoupon).toHaveBeenCalledWith(validRequest);
    expect(result).toEqual({ message: 'Cupom criado com sucesso' });
  });

  it('não consulta usuário quando user_id não é informado', async () => {
    await useCase.execute(validRequest);

    expect(couponRepository.userExists).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando desconto percentual excede 100', async () => {
    const promise = useCase.execute({
      ...validRequest,
      discount_type: CouponDiscountType.PERCENTUAL,
      discount_value: 150,
    });

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow(
      'Desconto percentual deve ser no máximo 100.',
    );

    expect(couponRepository.createCoupon).not.toHaveBeenCalled();
  });

  it('permite desconto acima de 100 quando o tipo é VALOR_FIXO', async () => {
    await useCase.execute({
      ...validRequest,
      discount_type: CouponDiscountType.VALOR_FIXO,
      discount_value: 150,
    });

    expect(couponRepository.createCoupon).toHaveBeenCalled();
  });

  it('lança BadRequestException quando ends_at não é posterior a starts_at', async () => {
    const promise = useCase.execute({
      ...validRequest,
      starts_at: '2026-11-30T00:00:00.000Z',
      ends_at: '2026-11-20T00:00:00.000Z',
    });

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow(
      'A data de término deve ser posterior à data de início.',
    );

    expect(couponRepository.createCoupon).not.toHaveBeenCalled();
  });

  it('permite vigência com apenas uma das datas informada', async () => {
    await useCase.execute({
      ...validRequest,
      starts_at: undefined,
      ends_at: '2026-11-30T00:00:00.000Z',
    });

    expect(couponRepository.createCoupon).toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando o usuário do cupom pessoal não existe', async () => {
    couponRepository.userExists.mockResolvedValue(false);

    const promise = useCase.execute({ ...validRequest, user_id: 99 });

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow('Usuário informado não existe.');

    expect(couponRepository.createCoupon).not.toHaveBeenCalled();
  });

  it('lança ConflictException e não persiste quando o código já existe', async () => {
    couponRepository.findByCode.mockResolvedValue({ id: 7 });

    const promise = useCase.execute(validRequest);

    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow('Código de cupom já cadastrado.');

    expect(couponRepository.createCoupon).not.toHaveBeenCalled();
  });

  it('lança ConflictException quando a escrita falha com P2002 em code (corrida entre a checagem e o insert)', async () => {
    couponRepository.createCoupon.mockRejectedValue(
      prismaError('P2002', { target: ['code'] }),
    );

    await expect(useCase.execute(validRequest)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('lança BadRequestException quando a escrita falha com P2003 (usuário removido entre a checagem e o insert)', async () => {
    couponRepository.createCoupon.mockRejectedValue(prismaError('P2003'));

    await expect(
      useCase.execute({ ...validRequest, user_id: 99 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('propaga erros desconhecidos da escrita', async () => {
    const unknownError = new Error('falha inesperada de infraestrutura');
    couponRepository.createCoupon.mockRejectedValue(unknownError);

    await expect(useCase.execute(validRequest)).rejects.toBe(unknownError);
  });
});
