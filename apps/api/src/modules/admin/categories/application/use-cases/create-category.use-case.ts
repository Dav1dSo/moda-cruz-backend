import { ConflictException, Injectable } from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import { isPrismaUniqueConstraintError } from '@shared/utils/prisma-errors';
import { slugify } from '@shared/utils/slugify';
import { CreateCategoryRequestDTO } from '../../dtos/request/category-request';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

const MAX_SLUG_CREATE_ATTEMPTS = 3;
const MAX_CATEGORY_SLUG_LENGTH = 140;

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(req: CreateCategoryRequestDTO): Promise<ResponseDefaultDTO> {
    for (let attempt = 1; attempt <= MAX_SLUG_CREATE_ATTEMPTS; attempt += 1) {
      const slug = await this.generateUniqueSlug(req.name);

      try {
        await this.categoryRepository.createCategory(req, slug);
        return { message: 'Categoria criada com sucesso' };
      } catch (error) {
        if (isPrismaUniqueConstraintError(error)) {
          if (attempt < MAX_SLUG_CREATE_ATTEMPTS) {
            continue;
          }

          throw new ConflictException('Slug já cadastrado.');
        }

        throw error;
      }
    }

    throw new ConflictException('Slug já cadastrado.');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = slugify(name, 'categoria')
      .slice(0, MAX_CATEGORY_SLUG_LENGTH)
      .replace(/-+$/, '');
    let candidate = baseSlug;
    let suffix = 1;

    while (await this.categoryRepository.findBySlug(candidate)) {
      suffix += 1;
      const suffixText = `-${suffix}`;
      const truncatedBase = baseSlug
        .slice(0, MAX_CATEGORY_SLUG_LENGTH - suffixText.length)
        .replace(/-+$/, '');
      candidate = `${truncatedBase}${suffixText}`.replace(/-{2,}/g, '-');
    }

    return candidate;
  }
}
