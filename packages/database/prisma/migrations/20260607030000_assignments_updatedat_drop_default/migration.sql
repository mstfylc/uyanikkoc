-- assignment_alpha_fields migration'ı updatedAt'e DEFAULT CURRENT_TIMESTAMP eklemişti
-- (mevcut satırlar için gerekliydi). Şema @updatedAt kullanıyor (DB default'u yok),
-- bu da kalıcı schema drift'e yol açıyordu. Default kaldırıldı; @updatedAt'i Prisma
-- her yazımda zaten setliyor, fonksiyonel etki yok.
ALTER TABLE "assignments" ALTER COLUMN "updatedAt" DROP DEFAULT;
