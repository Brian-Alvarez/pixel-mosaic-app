/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Pixel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pixel" DROP COLUMN "updatedAt";

-- AddForeignKey
ALTER TABLE "Pixel" ADD CONSTRAINT "Pixel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
