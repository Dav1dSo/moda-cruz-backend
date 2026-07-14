import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DeleteCouponUseCase } from './delete-coupon.use-case';
import { CouponRepository } from '../../infrastructure/repositories/coupon.repository';

function prismaError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('erro prisma', {
    code,
    clientVersion: '6.19.3',
  });
}

describe('DeleteCouponUseCase', () => {
  let useCase: DeleteCouponUseCase;
  let couponRepository: jest.Mocked<
    Pick<CouponRepository, 'findById' | 'delete'>
  >;

  const couponId = 5;

  beforeEach(() => {
    couponRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteCouponUseCase(
      couponRepository as unknown as CouponRepository,
    );

    couponRepository.findById.mockResolvedValue({
      id: couponId,
      uses_count: 0,
    } as never);
  });

  it('remove o cupom nunca utilizado e retorna mensagem de sucesso', async () => {
    const result = await useCase.execute(couponId);

    expect(couponRepository.delete).toHaveBeenCalledWith(couponId);
    expect(result).toEqual({ message: 'Cupom removido com sucesso' });
  });

  it('lança NotFoundException quando o cupom não existe', async () => {
    couponRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(couponId)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(couponRepository.delete).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não remove quando o cupom já foi utilizado', async () => {
    couponRepository.findById.mockResolvedValue({
      id: couponId,
      uses_count: 8,
    } as never);

    const promise = useCase.execute(couponId);

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow(
      'Não é possível remover um cupom já utilizado. Desative-o em vez de remover.',
    );

    expect(couponRepository.delete).not.toHaveBeenCalled();
  });

  it('lança NotFoundException quando a escrita falha com P2025 (removido entre a checagem e o delete)', async () => {
    couponRepository.delete.mockRejectedValue(prismaError('P2025'));

    await expect(useCase.execute(couponId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('propaga erros desconhecidos da escrita', async () => {
    const unknownError = new Error('falha inesperada de infraestrutura');
    couponRepository.delete.mockRejectedValue(unknownError);

    await expect(useCase.execute(couponId)).rejects.toBe(unknownError);
  });
});
