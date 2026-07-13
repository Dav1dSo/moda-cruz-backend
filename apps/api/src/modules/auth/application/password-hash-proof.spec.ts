import { createHash } from 'node:crypto';
import {
  passwordHashProof,
  passwordHashProofMatches,
} from './password-hash-proof';

describe('passwordHashProof', () => {
  const passwordHash = '$2b$12$hashDaSenhaArmazenadaNoBanco0000000000000000';

  it('deriva os 16 primeiros caracteres do sha256 hex do password_hash (não expõe o hash completo)', () => {
    const expected = createHash('sha256')
      .update(passwordHash)
      .digest('hex')
      .slice(0, 16);

    expect(passwordHashProof(passwordHash)).toBe(expected);
    expect(passwordHashProof(passwordHash)).toHaveLength(16);
  });

  it('gera proofs diferentes para hashes diferentes', () => {
    expect(passwordHashProof(passwordHash)).not.toBe(
      passwordHashProof('$2b$12$outroHashDeSenhaQualquer00000000000000000000'),
    );
  });
});

describe('passwordHashProofMatches', () => {
  const passwordHash = '$2b$12$hashDaSenhaArmazenadaNoBanco0000000000000000';

  it('retorna true quando o proof corresponde ao hash atual', () => {
    const proof = passwordHashProof(passwordHash);

    expect(passwordHashProofMatches(proof, passwordHash)).toBe(true);
  });

  it('retorna false quando o proof tem o mesmo tamanho mas conteúdo divergente', () => {
    const proof = passwordHashProof(passwordHash);
    const tampered = (proof[0] === 'a' ? 'b' : 'a') + proof.slice(1);

    expect(tampered).toHaveLength(proof.length);
    expect(passwordHashProofMatches(tampered, passwordHash)).toBe(false);
  });

  it('retorna false quando o proof é de outro password_hash (senha trocada)', () => {
    const proofDeOutroHash = passwordHashProof(
      '$2b$12$outroHashDeSenhaQualquer00000000000000000000',
    );

    expect(passwordHashProofMatches(proofDeOutroHash, passwordHash)).toBe(
      false,
    );
  });

  it('retorna false quando o proof é undefined', () => {
    expect(passwordHashProofMatches(undefined, passwordHash)).toBe(false);
  });

  it('retorna false quando o proof tem tamanho diferente do esperado (não lança erro do timingSafeEqual)', () => {
    expect(passwordHashProofMatches('abc', passwordHash)).toBe(false);
    expect(
      passwordHashProofMatches(
        passwordHashProof(passwordHash) + 'ff',
        passwordHash,
      ),
    ).toBe(false);
  });
});
