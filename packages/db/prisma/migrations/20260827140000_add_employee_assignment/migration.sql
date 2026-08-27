-- CreateTable
CREATE TABLE "public"."employees" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employee_assignments" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "outletId" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_code_key" ON "public"."employees"("code");

-- CreateIndex
CREATE INDEX "employee_assignments_employeeId_idx" ON "public"."employee_assignments"("employeeId");

-- CreateIndex
CREATE INDEX "employee_assignments_divisionId_idx" ON "public"."employee_assignments"("divisionId");

-- CreateIndex
CREATE INDEX "employee_assignments_effectiveFrom_idx" ON "public"."employee_assignments"("effectiveFrom");

-- CreateIndex
CREATE INDEX "employee_assignments_effectiveTo_idx" ON "public"."employee_assignments"("effectiveTo");

-- AddForeignKey
ALTER TABLE "public"."employee_assignments" ADD CONSTRAINT "employee_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_assignments" ADD CONSTRAINT "employee_assignments_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "public"."divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employee_assignments" ADD CONSTRAINT "employee_assignments_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
