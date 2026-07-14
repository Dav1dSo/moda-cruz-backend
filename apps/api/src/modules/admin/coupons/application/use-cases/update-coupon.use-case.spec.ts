import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CouponDiscountType, Prisma } from '@prisma/client';
import { UpdateCouponUseCase } from './update-coupon.use-case';
import { CouponRepository } from '../../infrastructure/repositories/coupon.repository';
import { UpdateCouponRequestDTO } from '../../dtos/request/coupon-request';

function prismaError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('erro prisma', {
    code,
    clientVersion: '6.19.3',
  });
}

describe('UpdateCouponUseCase', () => {
  let useCase: UpdateCouponUseCase;
  let couponRepository: jest.Mocked<
    Pick<
      CouponRepository,
      'findById' | 'findByCode' | 'userExists' | 'updateCoupon'
    >
  >;

  const couponId = 5;

  const validRequest: UpdateCouponRequestDTO = {
    code: 'BLACKFRIDAY10',
    description: 'Desconto de 10% na Black Friday',
    discount_type: CouponDiscountType.PERCENTUAL,
    discount_value: 10,
    is_active: true,
  };

  beforeEach(() => {
    couponRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      userExists: jest.fn(),
      updateCoupon: jest.fn(),
    };

    useCase = new UpdateCouponUseCase(
      couponRepository as unknown as CouponRepository,
    );

    couponRepository.findById.mockResolvedValue({
      id: couponId,
      code: 'BLACKFRIDAY10',
      uses_count: 0,
    } as never);
    couponRepository.findByCode.mockResolvedValue(null);
    couponRepository.userExists.mockResolvedValue(true);
  });

  it('atualiza o cupom quando o payload é válido', async () => {
    const result = await useCase.execute(validRequest, couponId);

    expect(couponRepository.updateCoupon).toHaveBeenCalledWith(
      couponId,
      validRequest,
    );
    expect(result).toEqual({ message: 'Cupom atualizado com sucesso' });
  });

  it('lança NotFoundException quando o cupom não existe', async () => {
    couponRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(validRequest, couponId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(couponRepository.updateCoupon).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando tenta alterar o código de um cupom já utilizado', async () => {
    couponRepository.findById.mockResolvedValue({
      id: couponId,
      code: 'BLACKFRIDAY10',
      uses_count: 3,
    } as never);

    const promise = useCase.execute(
      { ...validRequest, code: 'OUTROCODIGO' },
      couponId,
    );

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow(
      'Não é possível alterar o código de um cupom já utilizado.',
    );

    expect(couponRepository.updateCoupon).not.toHaveBeenCalled();
  });

  it('permite atualizar um cupom já utilizado quando o código é mantido', async () => {
    couponRepository.findById.mockResolvedValue({
      id: couponId,
      code: 'BLACKFRIDAY10',
      uses_count: 3,
    } as never);

    await useCase.execute(validRequest, couponId);

    expect(couponRepository.updateCoupon).toHaveBeenCalled();
  });

  it('lança ConflictException quando o código pertence a outro cupom', async () => {
    couponRepository.findByCode.mockResolvedValue({ id: 99 });

    const promise = useCase.execute(validRequest, couponId);

    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow('Código de cupom já cadastrado.');

    expect(couponRepository.updateCoupon).not.toHaveBeenCalled();
  });

  it('não trata como conflito quando o código encontrado é do próprio cupom', async () => {
    couponRepository.findByCode.mockResolvedValue({ id: couponId });

    await useCase.execute(validRequest, couponId);

    expect(couponRepository.updateCoupon).toHaveBeenCalled();
  });

  it('lança BadRequestException quando desconto percentual excede 100', async () => {
    await expect(
      useCase.execute({ ...validRequest, discount_value: 101 }, couponId),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(couponRepository.updateCoupon).not.toHaveBeenCalled();
  });

  it('lança BadRequestException quando o usuário do cupom pessoal não existe', async () => {
    couponRepository.userExists.mockResolvedValue(false);

    await expect(
      useCase.execute({ ...validRequest, user_id: 42 }, couponId),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(couponRepository.updateCoupon).not.toHaveBeenCalled();
  });

  it('lança NotFoundException quando a escrita falha com P2025 (removido entre a checagem e o update)', async () => {
    couponRepository.updateCoupon.mockRejectedValue(prismaError('P2025'));

    await expect(
      useCase.execute(validRequest, couponId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('propaga erros desconhecidos da escrita', async () => {
    const unknownError = new Error('falha inesperada de infraestrutura');
    couponRepository.updateCoupon.mockRejectedValue(unknownError);

    await expect(useCase.execute(validRequest, couponId)).rejects.toBe(
      unknownError,
    );
  });
});
