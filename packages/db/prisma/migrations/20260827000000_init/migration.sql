-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."divisions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."outlets" (
    "id" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outlets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "divisions_code_key" ON "public"."divisions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "outlets_code_key" ON "public"."outlets"("code");

-- CreateIndex
CREATE INDEX "outlets_divisionId_idx" ON "public"."outlets"("divisionId");

-- AddForeignKey
ALTER TABLE "public"."outlets" ADD CONSTRAINT "outlets_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "public"."divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
