-- CreateTable
CREATE TABLE "AopMbrHighlight" (
    "id" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "body" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AopMbrHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AopMbrHighlight_dept_kind_idx" ON "AopMbrHighlight"("dept", "kind");
