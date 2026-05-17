/*
  Warnings:

  - You are about to drop the column `tiktok_url` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `tiktok_url` on the `pubs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "brands" DROP COLUMN "tiktok_url",
ADD COLUMN     "youtube_url" TEXT;

-- AlterTable
ALTER TABLE "pubs" DROP COLUMN "tiktok_url",
ADD COLUMN     "youtube_url" TEXT;
