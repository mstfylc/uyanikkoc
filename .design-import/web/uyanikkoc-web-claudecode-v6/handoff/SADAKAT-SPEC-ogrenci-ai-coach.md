# SADAKAT SPEC — Öğrenci · AI Koç (ai-coach)

Kaynak: `src/student-extra.jsx → AiCoachPage`. Rota: `ai-coach` (menüde "Yakında" etiketi).
Veri: `AI_FEATURES` (4 öğe). Bu ekran **"Çok Yakında" tanıtım/bekleme** ekranıdır. Tam Türkçe.

## PageHead
- Başlık **`AI Koç`** · alt **`Kişisel yapay zekâ koçun — çok yakında`** · sağda `Badge` primary dot **`Yakında`**

## Bileşen sırası
1. **`.hero`** (yatay, ortalı): sol cam kare içinde `ai` orb (76px). Sağ:
   - `<h2>` **`Senin için düşünen bir koç`** (24px)
   - Paragraf: **`Uyanık AI Koç; netlerini, ödevlerini ve çalışma alışkanlıklarını analiz ederek
     sana özel öneriler ve program çıkaracak. Beta erişimi için sıraya gir.`**
   - Butonlar: beyaz **`Erken erişime katıl`** (bolt) → tıklanınca **`Sıraya eklendin`** olur +
     toast **`Beta sırasına eklendin — yer açılınca haber vereceğiz!`**; yarı saydam **`Nasıl çalışır?`** → modal.
2. **`.grid.g-2`** — 4 özellik kartı (`AI_FEATURES`): ikon + başlık + açıklama.
   (target "Zayıf konu tespiti" · calendar "Akıllı program" · message "7/24 soru çözümü" · trend "Net tahmini")
3. **`Section` — `Önizleme`** · alt **`AI Koç sohbeti — demo`**: sağda kullanıcı balonu
   **`Türev konusunda hep hata yapıyorum, ne yapmalıyım?`**, solda AI balonu (ai orb + **`AI Koç`** +
   örnek cevap). Altta **devre dışı** mesaj kutusu **`Mesaj yaz... (yakında aktif)`** + gönder butonu.

## "Nasıl çalışır?" modalı
- Başlık **`AI Koç nasıl çalışır?`** · alt **`3 adımda kişisel asistanın`**.
- 3 adım: **`1. Verini analiz eder`** · **`2. Zayıf noktaları bulur`** · **`3. Plan önerir`** (ikon+açıklama).
- Footer birincil **`Erken erişime katıl`** (bolt) → sıraya ekler + toast.

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `AI Koc`, `Nasil calisir`, `Erken erisime katil`.
- ❌ Mesaj kutusunu **aktif** yapmak — bu ekran "yakında"; input disabled kalır.
- ❌ "Yakında" rozetini/etiketini kaldırmak.
- ❌ Demo sohbet balonlarını veya 4 özellik kartını atlamak.
