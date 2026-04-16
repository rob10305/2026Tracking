-- CreateTable
CREATE TABLE "AopMonthlyMetric" (
    "id" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AopMonthlyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AopGoal" (
    "id" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "number" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AopGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AopGoalProgress" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "rag" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AopGoalProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AopInitiative" (
    "id" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "number" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "owner" TEXT NOT NULL DEFAULT '',
    "q1Rag" TEXT NOT NULL DEFAULT '',
    "q2Rag" TEXT NOT NULL DEFAULT '',
    "q3Rag" TEXT NOT NULL DEFAULT '',
    "q4Rag" TEXT NOT NULL DEFAULT '',
    "q1Note" TEXT NOT NULL DEFAULT '',
    "q2Note" TEXT NOT NULL DEFAULT '',
    "q3Note" TEXT NOT NULL DEFAULT '',
    "q4Note" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AopInitiative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AopInsight" (
    "id" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "body" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AopInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AopRetrospect" (
    "id" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "body" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AopRetrospect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AopMonthlyMetric_dept_idx" ON "AopMonthlyMetric"("dept");

-- CreateIndex
CREATE UNIQUE INDEX "AopMonthlyMetric_dept_kind_metric_month_key" ON "AopMonthlyMetric"("dept", "kind", "metric", "month");

-- CreateIndex
CREATE INDEX "AopGoal_dept_idx" ON "AopGoal"("dept");

-- CreateIndex
CREATE UNIQUE INDEX "AopGoalProgress_goalId_month_key" ON "AopGoalProgress"("goalId", "month");

-- CreateIndex
CREATE INDEX "AopInitiative_dept_idx" ON "AopInitiative"("dept");

-- CreateIndex
CREATE INDEX "AopInsight_dept_idx" ON "AopInsight"("dept");

-- CreateIndex
CREATE INDEX "AopRetrospect_dept_kind_idx" ON "AopRetrospect"("dept", "kind");

-- AddForeignKey
ALTER TABLE "AopGoalProgress" ADD CONSTRAINT "AopGoalProgress_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "AopGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
