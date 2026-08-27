-- CreateTable
CREATE TABLE "public"."division_configs" (
    "id" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "enabledModules" TEXT[] NOT NULL,
    "enabledKpis" TEXT[] NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "division_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "division_configs_divisionId_key" ON "public"."division_configs"("divisionId");

-- AddForeignKey
ALTER TABLE "public"."division_configs" ADD CONSTRAINT "division_configs_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "public"."divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
