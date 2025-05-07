-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "salleId" INTEGER;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_salleId_fkey" FOREIGN KEY ("salleId") REFERENCES "Salle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
