-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parent_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
