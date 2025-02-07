/*
  Warnings:

  - The values [iMAGE] on the enum `MEDIATYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MEDIATYPE_new" AS ENUM ('NONE', 'IMAGE', 'VIDEO');
ALTER TABLE "Post" ALTER COLUMN "type" TYPE "MEDIATYPE_new" USING ("type"::text::"MEDIATYPE_new");
ALTER TYPE "MEDIATYPE" RENAME TO "MEDIATYPE_old";
ALTER TYPE "MEDIATYPE_new" RENAME TO "MEDIATYPE";
DROP TYPE "MEDIATYPE_old";
COMMIT;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "type" SET DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
