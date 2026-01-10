-- CreateTable
CREATE TABLE "FarmParameter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "FarmParameter_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FarmParameter_farmId_idx" ON "FarmParameter"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmParameter_farmId_key_key" ON "FarmParameter"("farmId", "key");
