-- CreateTable
CREATE TABLE "document_type" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50),
    "description" VARCHAR(500),
    "template_path" VARCHAR(500) DEFAULT 'member',
    "template_content" TEXT,
    "background_image" VARCHAR(500),
    "requires_spouse" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_type_organization_id_is_active_idx" ON "document_type"("organization_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_organization_id_name_key" ON "document_type"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_organization_id_code_key" ON "document_type"("organization_id", "code");

-- AddForeignKey
ALTER TABLE "document_type" ADD CONSTRAINT "document_type_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
