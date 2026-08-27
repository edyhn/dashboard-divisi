-- CreateTable
CREATE TABLE "public"."user_scopes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "outletId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_scopes_userId_divisionId_key" ON "public"."user_scopes"("userId", "divisionId");

-- CreateIndex
CREATE INDEX "user_scopes_divisionId_idx" ON "public"."user_scopes"("divisionId");

-- AddForeignKey
ALTER TABLE "public"."user_scopes" ADD CONSTRAINT "user_scopes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_scopes" ADD CONSTRAINT "user_scopes_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "public"."divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_scopes" ADD CONSTRAINT "user_scopes_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "public"."outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
