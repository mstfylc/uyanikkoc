-- Konu takibi: 3 durumlu ilerleme (todo/progress/done) ve kaynak-bazlı tamamlama.
-- Şimdiye dek yalnızca bellek modunda vardı; DB modunda status/toggleSource sessizce
-- yok sayılıyordu (Konu Takibi production'da çalışmıyordu).

-- AlterTable
ALTER TABLE "topic_progress" ADD COLUMN "inProgress" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "topic_progress" ADD COLUMN "completedSources" TEXT[];

-- Mevcut satırları boş diziyle doldur (Prisma scalar list NULL beklemez).
UPDATE "topic_progress" SET "completedSources" = ARRAY[]::TEXT[] WHERE "completedSources" IS NULL;
