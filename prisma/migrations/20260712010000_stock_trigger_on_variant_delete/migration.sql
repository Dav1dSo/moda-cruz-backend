CREATE OR REPLACE FUNCTION check_product_published_has_stock() RETURNS trigger AS $$
DECLARE
  affected_product_id INTEGER;
  affected_product_status "product_status";
BEGIN
  IF TG_OP = 'DELETE' THEN
    affected_product_id := OLD.product_id;
  ELSIF TG_TABLE_NAME = 'products' THEN
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

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER product_published_has_stock_on_variants_delete
AFTER DELETE ON "product_variants"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_product_published_has_stock();
