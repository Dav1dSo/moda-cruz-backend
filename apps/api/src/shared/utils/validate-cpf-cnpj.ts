import { cpf, cnpj } from 'cpf-cnpj-validator';

export type DocumentType = 'CPF' | 'CNPJ';

export class DocumentValidator {
  static validate(
    document: string,
    type: DocumentType,
    isBrazil = true,
  ): boolean {
    if (!isBrazil) {
      return true;
    }

    return type === 'CPF'
      ? cpf.isValid(document)
      : cnpj.isValid(document);
      
  }
}