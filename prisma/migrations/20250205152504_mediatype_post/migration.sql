/*
  Warnings:

  - Added the required column `type` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MEDIATYPE" AS ENUM ('NONE', 'iMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "type",
ADD COLUMN     "type" "MEDIATYPE" NOT NULL;
