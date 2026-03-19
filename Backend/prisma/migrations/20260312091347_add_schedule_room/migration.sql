-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "room" TEXT,
ADD COLUMN     "schedule" TEXT,
ALTER COLUMN "semester" DROP NOT NULL;
