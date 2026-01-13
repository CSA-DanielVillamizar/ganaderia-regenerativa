-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "herdId" TEXT NOT NULL,
    "paddockId" TEXT NOT NULL,
    "cycleId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "entryDate" DATETIME NOT NULL,
    "exitDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    CONSTRAINT "Movement_herdId_fkey" FOREIGN KEY ("herdId") REFERENCES "Herd" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Movement_paddockId_fkey" FOREIGN KEY ("paddockId") REFERENCES "Paddock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Movement_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Movement" ("createdAt", "createdBy", "cycleId", "entryDate", "exitDate", "herdId", "id", "notes", "paddockId", "status", "type", "updatedAt", "updatedBy") SELECT "createdAt", "createdBy", "cycleId", "entryDate", "exitDate", "herdId", "id", "notes", "paddockId", "status", "type", "updatedAt", "updatedBy" FROM "Movement";
DROP TABLE "Movement";
ALTER TABLE "new_Movement" RENAME TO "Movement";
CREATE INDEX "Movement_herdId_idx" ON "Movement"("herdId");
CREATE INDEX "Movement_paddockId_idx" ON "Movement"("paddockId");
CREATE INDEX "Movement_entryDate_idx" ON "Movement"("entryDate");
CREATE INDEX "Movement_status_idx" ON "Movement"("status");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
