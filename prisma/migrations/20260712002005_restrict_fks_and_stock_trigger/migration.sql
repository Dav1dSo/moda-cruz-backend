-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "product_reviews" DROP CONSTRAINT "product_reviews_product_id_fkey";

-- DropForeignKey
ALTER TABLE "return_request_items" DROP CONSTRAINT "return_request_items_product_id_fkey";

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_request_items" ADD CONSTRAINT "return_request_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Regra de negócio: produto com status PUBLICADO precisa ter ao menos uma
-- variação com stock > 0. Constraint trigger adiada (DEFERRABLE INITIALLY
-- DEFERRED) porque a checagem só pode ser feita depois que TODAS as
-- escritas da transação (produto + variantes) já foram aplicadas -- caso
-- contrário dispararia contra um estado intermediário inválido.
CREATE FUNCTION check_product_published_has_stock() RETURNS trigger AS $$
DECLARE
  affected_product_id INTEGER;
  affected_product_status "product_status";
BEGIN
  IF TG_TABLE_NAME = 'products' THEN
    affected_product_id := NEW.id;
  ELSE
    affected_product_id := NEW.product_id;
  END IF;

  SELECT status INTO affected_product_status
  FROM products
  WHERE id = affected_product_id;

  IF affected_product_status = 'PUBLICADO' AND NOT EXISTS (
    SELECT 1 FROM product_variants
    WHERE product_id = affected_product_id AND stock > 0
  ) THEN
    RAISE EXCEPTION 'PRODUCT_INSUFFICIENT_STOCK: produto % está com status PUBLICADO mas não possui nenhuma variação com estoque disponível', affected_product_id
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER product_published_has_stock_on_products
AFTER INSERT OR UPDATE ON "products"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_product_published_has_stock();

CREATE CONSTRAINT TRIGGER product_published_has_stock_on_variants
AFTER INSERT OR UPDATE ON "product_variants"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_product_published_has_stock();
