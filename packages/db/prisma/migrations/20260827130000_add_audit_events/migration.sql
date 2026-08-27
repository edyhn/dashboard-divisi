-- CreateTable
CREATE TABLE "public"."audit_events" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "divisionCode" TEXT,
    "traceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_events_actorId_idx" ON "public"."audit_events"("actorId");

-- CreateIndex
CREATE INDEX "audit_events_action_idx" ON "public"."audit_events"("action");

-- CreateIndex
CREATE INDEX "audit_events_entity_idx" ON "public"."audit_events"("entity");

-- CreateIndex
CREATE INDEX "audit_events_divisionCode_idx" ON "public"."audit_events"("divisionCode");

-- CreateIndex
CREATE INDEX "audit_events_createdAt_idx" ON "public"."audit_events"("createdAt");
