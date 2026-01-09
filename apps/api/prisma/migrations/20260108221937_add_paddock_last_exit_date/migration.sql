-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "hectares" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "UserFarm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFarm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserFarm_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Paddock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hectares" REAL NOT NULL,
    "pastureType" TEXT,
    "minRestDays" INTEGER,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" DATETIME,
    "lastExitDate" DATETIME,
    CONSTRAINT "Paddock_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Herd" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initialWeight" REAL NOT NULL,
    "currentWeight" REAL,
    "currentUA" REAL,
    "animalCount" INTEGER NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" DATETIME,
    CONSTRAINT "Herd_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "herdId" TEXT NOT NULL,
    "earTag" TEXT,
    "gender" TEXT,
    "birthDate" DATETIME,
    "initialWeight" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Animal_herdId_fkey" FOREIGN KEY ("herdId") REFERENCES "Herd" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Weighing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "herdId" TEXT NOT NULL,
    "animalId" TEXT,
    "weight" REAL NOT NULL,
    "animalCount" INTEGER NOT NULL,
    "notes" TEXT,
    "recordedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "method" TEXT NOT NULL DEFAULT 'SCALE',
    "chestGirthCm" REAL,
    "bodyLengthCm" REAL,
    "estimatedWeightKg" REAL,
    "realWeightKg" REAL,
    "errorMarginPercent" REAL,
    CONSTRAINT "Weighing_herdId_fkey" FOREIGN KEY ("herdId") REFERENCES "Herd" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Weighing_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmId" TEXT NOT NULL,
    "herdId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Cycle_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Cycle_herdId_fkey" FOREIGN KEY ("herdId") REFERENCES "Herd" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Movement" (
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
    CONSTRAINT "Movement_paddockId_fkey" FOREIGN KEY ("paddockId") REFERENCES "Paddock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movement_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForageSample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paddockId" TEXT NOT NULL,
    "kgPerHectare" REAL NOT NULL,
    "dryMatter" REAL NOT NULL,
    "sampleDate" DATETIME NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "frameAreaM2" REAL,
    "freshWeightKg" REAL,
    "dryMatterPercent" REAL,
    "utilizationPercent" REAL,
    "kgMSPerHa" REAL,
    CONSTRAINT "ForageSample_paddockId_fkey" FOREIGN KEY ("paddockId") REFERENCES "Paddock" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parameter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "Parameter_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TapeCalibration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmId" TEXT NOT NULL,
    "divisor" INTEGER NOT NULL DEFAULT 11877,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "appliedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "TapeCalibration_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TapeCalibrationHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmId" TEXT NOT NULL,
    "previousDivisor" INTEGER NOT NULL,
    "newDivisor" INTEGER NOT NULL,
    "samplesUsed" INTEGER NOT NULL,
    "rmseError" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TapeCalibrationHistory_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "TapeCalibration" ("farmId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_active_idx" ON "User"("active");

-- CreateIndex
CREATE INDEX "Farm_active_idx" ON "Farm"("active");

-- CreateIndex
CREATE INDEX "UserFarm_userId_idx" ON "UserFarm"("userId");

-- CreateIndex
CREATE INDEX "UserFarm_farmId_idx" ON "UserFarm"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFarm_userId_farmId_key" ON "UserFarm"("userId", "farmId");

-- CreateIndex
CREATE INDEX "Paddock_farmId_idx" ON "Paddock"("farmId");

-- CreateIndex
CREATE INDEX "Paddock_active_idx" ON "Paddock"("active");

-- CreateIndex
CREATE INDEX "Herd_farmId_idx" ON "Herd"("farmId");

-- CreateIndex
CREATE INDEX "Herd_active_idx" ON "Herd"("active");

-- CreateIndex
CREATE INDEX "Animal_herdId_idx" ON "Animal"("herdId");

-- CreateIndex
CREATE INDEX "Animal_earTag_idx" ON "Animal"("earTag");

-- CreateIndex
CREATE INDEX "Weighing_herdId_idx" ON "Weighing"("herdId");

-- CreateIndex
CREATE INDEX "Weighing_recordedAt_idx" ON "Weighing"("recordedAt");

-- CreateIndex
CREATE INDEX "Cycle_farmId_idx" ON "Cycle"("farmId");

-- CreateIndex
CREATE INDEX "Cycle_herdId_idx" ON "Cycle"("herdId");

-- CreateIndex
CREATE INDEX "Cycle_status_idx" ON "Cycle"("status");

-- CreateIndex
CREATE INDEX "Movement_herdId_idx" ON "Movement"("herdId");

-- CreateIndex
CREATE INDEX "Movement_paddockId_idx" ON "Movement"("paddockId");

-- CreateIndex
CREATE INDEX "Movement_entryDate_idx" ON "Movement"("entryDate");

-- CreateIndex
CREATE INDEX "Movement_status_idx" ON "Movement"("status");

-- CreateIndex
CREATE INDEX "ForageSample_paddockId_idx" ON "ForageSample"("paddockId");

-- CreateIndex
CREATE INDEX "ForageSample_sampleDate_idx" ON "ForageSample"("sampleDate");

-- CreateIndex
CREATE INDEX "Parameter_farmId_idx" ON "Parameter"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Parameter_farmId_key_key" ON "Parameter"("farmId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "TapeCalibration_farmId_key" ON "TapeCalibration"("farmId");

-- CreateIndex
CREATE INDEX "TapeCalibration_farmId_idx" ON "TapeCalibration"("farmId");

-- CreateIndex
CREATE INDEX "TapeCalibration_status_idx" ON "TapeCalibration"("status");

-- CreateIndex
CREATE INDEX "TapeCalibrationHistory_farmId_idx" ON "TapeCalibrationHistory"("farmId");

-- CreateIndex
CREATE INDEX "TapeCalibrationHistory_createdAt_idx" ON "TapeCalibrationHistory"("createdAt");
