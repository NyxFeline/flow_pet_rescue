/*
  Warnings:

  - You are about to drop the column `location` on the `SosReport` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_sos_location";

-- AlterTable
ALTER TABLE "SosReport" DROP COLUMN "location";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refresh_token_hash" TEXT;
