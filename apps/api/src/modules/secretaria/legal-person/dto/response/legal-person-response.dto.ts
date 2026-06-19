import { PaginationResponseDTO } from '../../../../../shared/shared.dtos';

export class LegalPersonResponseDTO {
  id!: number;
  organization_id!: number;
  legal_name!: string;
  trade_name!: string | null;
  fantasy_name!: string | null;
  cnpj!: string | null;
  status!: string;
  is_supplier!: boolean;
  created_at!: string;
}

export class GetAllLegalPersonsResponseDTO {
  data!: LegalPersonResponseDTO[];
  pagination!: PaginationResponseDTO;
}
