-- AlterTable: Add missing fields to User table
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);

-- AlterTable: Add missing fields to Profile table
ALTER TABLE "Profile" ADD COLUMN "firstName" TEXT;
ALTER TABLE "Profile" ADD COLUMN "lastName" TEXT;
ALTER TABLE "Profile" ADD COLUMN "favoriteVerse" TEXT;
ALTER TABLE "Profile" ADD COLUMN "isComplete" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex: Add unique index for resetToken
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
