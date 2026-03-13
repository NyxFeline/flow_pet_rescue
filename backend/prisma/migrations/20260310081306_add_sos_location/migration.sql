/*
  Warnings:

  - Made the column `location` on table `SosReport` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SosReport" ALTER COLUMN "images" SET DEFAULT '[]',
ALTER COLUMN "location" SET NOT NULL;
