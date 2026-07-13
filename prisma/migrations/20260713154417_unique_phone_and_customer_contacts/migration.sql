CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

CREATE UNIQUE INDEX "customers_document_key" ON "customers"("document");

CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone") WHERE "deleted_at" IS NULL;
