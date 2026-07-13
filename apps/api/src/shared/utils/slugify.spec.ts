import { slugify } from './slugify';

describe('slugify', () => {
  it('remove acentos e converte para minúsculas', () => {
    expect(slugify('Calçados', 'categoria')).toBe('calcados');
  });

  it('colapsa múltiplos espaços e caracteres especiais em um único hífen', () => {
    expect(slugify('Roupas   & Acessórios!!', 'categoria')).toBe(
      'roupas-acessorios',
    );
  });

  it('remove hífens de borda gerados por espaços/caracteres especiais nas extremidades', () => {
    expect(slugify('  --Ofertas--  ', 'categoria')).toBe('ofertas');
  });

  it('usa o fallback quando o nome só contém caracteres especiais', () => {
    expect(slugify('!!!___***', 'categoria')).toBe('categoria');
  });

  it('usa o fallback quando o nome só contém emoji', () => {
    expect(slugify('😀😀', 'categoria')).toBe('categoria');
  });

  it('usa o fallback quando o valor é uma string vazia', () => {
    expect(slugify('', 'categoria')).toBe('categoria');
  });

  it('preserva números e letras sem acento', () => {
    expect(slugify('Tênis 10', 'categoria')).toBe('tenis-10');
  });
});
