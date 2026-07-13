import { createHash, timingSafeEqual } from 'node:crypto';

export function passwordHashProof(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('hex').slice(0, 16);
}

export function passwordHashProofMatches(
  proof: string | undefined,
  passwordHash: string,
): boolean {
  if (!proof) return false;

  const expected = Buffer.from(passwordHashProof(passwordHash));
  const received = Buffer.from(proof);

  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}
