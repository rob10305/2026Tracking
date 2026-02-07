-- CreateTable
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'financial',
    "granularity" TEXT NOT NULL DEFAULT 'monthly',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "forecastId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "isBaseline" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scenario_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimePeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "forecastId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TimePeriod_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenarioId" TEXT NOT NULL,
    "timePeriodId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL DEFAULT '',
    "value" REAL NOT NULL DEFAULT 0,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "LineItem_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LineItem_timePeriodId_fkey" FOREIGN KEY ("timePeriodId") REFERENCES "TimePeriod" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Scenario_forecastId_idx" ON "Scenario"("forecastId");

-- CreateIndex
CREATE INDEX "TimePeriod_forecastId_idx" ON "TimePeriod"("forecastId");

-- CreateIndex
CREATE INDEX "LineItem_scenarioId_idx" ON "LineItem"("scenarioId");

-- CreateIndex
CREATE INDEX "LineItem_timePeriodId_idx" ON "LineItem"("timePeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "LineItem_scenarioId_timePeriodId_category_subcategory_key" ON "LineItem"("scenarioId", "timePeriodId", "category", "subcategory");
