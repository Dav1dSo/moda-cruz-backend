-- CreateEnum
CREATE TYPE "coupon_discount_type" AS ENUM ('PERCENTUAL', 'VALOR_FIXO');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "discount_type" "coupon_discount_type" NOT NULL DEFAULT 'VALOR_FIXO';

-- DropEnum
DROP TYPE "promotion_placement";
