# Cursor Run Log

Cursor her tamamlanan fazdan sonra bu tabloya **tek satır** ekler. Uzun açıklama yok.

| Tarih | Prompt | Durum | Commit | Test | Risk | Sonraki |
|---|---|---|---|---|---|---|
| 2026-06-03 | Setup | not-started | none | not-run | none | PROMPT 00 |

## Kural

- Her prompt çıktısı en fazla 1 tablo satırı.
- Commit SHA kısa yazılır: ilk 7 karakter.
- Test başarısızsa `fail:<komut>` yazılır.
- Risk varsa detay tabloya yazılmaz; `docs/cursor/RISK_REPORT.md` güncellenir.
