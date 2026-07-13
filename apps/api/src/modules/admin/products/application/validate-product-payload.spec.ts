import { BadRequestException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import {
  assertNoDuplicateColorNames,
  assertNoDuplicateColorSizeCombos,
  assertNoDuplicateSkus,
  assertPublishedProductHasStock,
  assertVariantColorsExist,
} from './validate-product-payload';

describe('assertNoDuplicateColorNames', () => {
  it('não lança quando não há cores repetidas', () => {
    expect(() =>
      assertNoDuplicateColorNames([
        { name: 'Azul', hex: '#0000FF' },
        { name: 'Vermelho', hex: '#FF0000' },
      ]),
    ).not.toThrow();
  });

  it('não lança quando a lista de cores é vazia', () => {
    expect(() => assertNoDuplicateColorNames([])).not.toThrow();
  });

  it('lança BadRequestException quando há nomes de cor idênticos', () => {
    expect(() =>
      assertNoDuplicateColorNames([
        { name: 'Azul', hex: '#0000FF' },
        { name: 'Azul', hex: '#0000AA' },
      ]),
    ).toThrow(
      new BadRequestException('Existem cores repetidas no mesmo produto.'),
    );
  });

  it('lança BadRequestException quando os nomes diferem apenas por espaço e caixa', () => {
    expect(() =>
      assertNoDuplicateColorNames([
        { name: ' Azul ', hex: '#0000FF' },
        { name: 'azul', hex: '#0000AA' },
      ]),
    ).toThrow(BadRequestException);
  });
});

describe('assertNoDuplicateSkus', () => {
  const variant = (overrides: Partial<{ sku: string }> = {}) => ({
    color_name: 'Azul',
    size: 'M',
    sku: 'SKU-1',
    ...overrides,
  });

  it('não lança quando os SKUs são únicos', () => {
    expect(() =>
      assertNoDuplicateSkus([
        variant({ sku: 'SKU-1' }),
        variant({ sku: 'SKU-2' }),
      ]),
    ).not.toThrow();
  });

  it('lança BadRequestException quando há SKUs idênticos', () => {
    expect(() =>
      assertNoDuplicateSkus([
        variant({ sku: 'SKU-1' }),
        variant({ sku: 'SKU-1' }),
      ]),
    ).toThrow(
      new BadRequestException('Existem SKUs repetidos no mesmo produto.'),
    );
  });

  it('lança BadRequestException quando os SKUs diferem apenas por espaço e caixa', () => {
    expect(() =>
      assertNoDuplicateSkus([
        variant({ sku: ' sku-1 ' }),
        variant({ sku: 'SKU-1' }),
      ]),
    ).toThrow(BadRequestException);
  });
});

describe('assertNoDuplicateColorSizeCombos', () => {
  const variant = (
    overrides: Partial<{ color_name: string; size: string }> = {},
  ) => ({
    color_name: 'Azul',
    size: 'M',
    sku: 'SKU-1',
    ...overrides,
  });

  it('não lança quando cor e tamanho combinados são únicos', () => {
    expect(() =>
      assertNoDuplicateColorSizeCombos([
        variant({ color_name: 'Azul', size: 'M' }),
        variant({ color_name: 'Azul', size: 'G' }),
        variant({ color_name: 'Vermelho', size: 'M' }),
      ]),
    ).not.toThrow();
  });

  it('lança BadRequestException quando a combinação cor+tamanho se repete', () => {
    expect(() =>
      assertNoDuplicateColorSizeCombos([
        variant({ color_name: 'Azul', size: 'M' }),
        variant({ color_name: 'Azul', size: 'M' }),
      ]),
    ).toThrow(
      new BadRequestException(
        'Existem variações repetidas com a mesma cor e tamanho.',
      ),
    );
  });

  it('lança BadRequestException quando a cor difere apenas por caixa/espaço mas o tamanho trimado coincide', () => {
    expect(() =>
      assertNoDuplicateColorSizeCombos([
        variant({ color_name: ' Azul ', size: ' P ' }),
        variant({ color_name: 'azul', size: 'P' }),
      ]),
    ).toThrow(BadRequestException);
  });

  it('não lança quando o tamanho difere apenas por caixa (size não é normalizado por case)', () => {
    expect(() =>
      assertNoDuplicateColorSizeCombos([
        variant({ color_name: 'Azul', size: 'P' }),
        variant({ color_name: 'Azul', size: 'p' }),
      ]),
    ).not.toThrow();
  });
});

describe('assertVariantColorsExist', () => {
  const variant = (color_name: string) => ({
    color_name,
    size: 'M',
    sku: 'SKU-1',
  });

  it('não lança quando não há variações', () => {
    expect(() => assertVariantColorsExist([], new Set(['Azul']))).not.toThrow();
  });

  it('não lança quando todas as cores das variações existem no conjunto (ignorando caixa/espaço)', () => {
    expect(() =>
      assertVariantColorsExist([variant(' azul ')], new Set(['Azul'])),
    ).not.toThrow();
  });

  it('lança BadRequestException com o nome da cor ausente quando a variação referencia cor inexistente', () => {
    expect(() =>
      assertVariantColorsExist(
        [variant('Verde')],
        new Set(['Azul', 'Vermelho']),
      ),
    ).toThrow(
      new BadRequestException(
        'A cor "Verde" informada em uma variação não corresponde a nenhuma cor do produto.',
      ),
    );
  });
});

describe('assertPublishedProductHasStock', () => {
  it('não lança quando o status é undefined, independente do estoque', () => {
    expect(() =>
      assertPublishedProductHasStock(undefined, [{ stock: 0 }]),
    ).not.toThrow();
  });

  it('não lança quando o status não é PUBLICADO, mesmo sem estoque', () => {
    expect(() =>
      assertPublishedProductHasStock(ProductStatus.RASCUNHO, [{ stock: 0 }]),
    ).not.toThrow();
  });

  it('lança BadRequestException quando PUBLICADO e nenhuma variação tem estoque > 0', () => {
    expect(() =>
      assertPublishedProductHasStock(ProductStatus.PUBLICADO, [
        { stock: 0 },
        { stock: null },
        { stock: undefined },
      ]),
    ).toThrow(
      new BadRequestException(
        'Produto com status PUBLICADO deve ter ao menos uma variação com estoque disponível.',
      ),
    );
  });

  it('lança BadRequestException quando PUBLICADO e a lista de variações é vazia', () => {
    expect(() =>
      assertPublishedProductHasStock(ProductStatus.PUBLICADO, []),
    ).toThrow(BadRequestException);
  });

  it('não lança quando PUBLICADO e ao menos uma variação tem estoque > 0', () => {
    expect(() =>
      assertPublishedProductHasStock(ProductStatus.PUBLICADO, [
        { stock: 0 },
        { stock: 5 },
      ]),
    ).not.toThrow();
  });
});
