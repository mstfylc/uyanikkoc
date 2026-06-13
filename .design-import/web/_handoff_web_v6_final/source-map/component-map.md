# Source Map — Bileşen → Rota / Hedef Eşlemesi (component-map)

> Her v6 bileşeninin **nereye mount edildiği** ve hedef konumu. Mount bağlamı kritik — bir bileşen birden çok rotaya gömülüdür.

## Yanlış Defteri ailesi
| Prototip bileşen | Mount (prototip) | Rol | Hedef |
|---|---|---|---|
| `YanlisDefteriPage` | ROUTES.student.mistakes | student | `/student/mistakes` |
| `ZeroErrorLoop` + `ZeroErrorReview` | YanlisDefteriPage içi | student | mistakes sayfası |
| `HataFrekansiCard` | YanlisDefteriPage (student) · CoachKonuPage (coach) · VeliDashboard (parent, role=coach) | hepsi | paylaşılan kart |
| `MistakeAddModal` | YanlisDefteriPage "Yanlış ekle" | student | modal |
| `MistakeBatchModal` | `OdevResultModal` (y>0) · `student-exam-analiz` | student | modal (besleme) |
| `MistakeRow` | YanlisDefteriPage "Tüm Yanlışlar" | student | liste satırı |
| `CoachMistakesCard` | CoachKonuPage (c-topics) | coach | `/coach/topics` |

## Net Kaybı Haritası
| `NetGainMap` | Öğrenci `exams` · Koç `c-topics` · Veli `dashboard` | role'e göre CTA | `components/shared/NetGainMap.tsx` |

## Akıllı Ödev
| `SmartOdevModal` | Koç `c-assignments` "Akıllı Ödev" butonu | coach | `/coach/assignments` modal |

## Takvimim
| `TakvimimCard` | Öğrenci `dashboard` | student | `/student` (StudentDashboard) |

## Mesajlaşma + Bildirim
| `MessagesPage` | App shell özel-render (tüm roller `messages`) | hepsi | `/<rol>/messages` |
| `GroupModal` | MessagesPage (koç) | coach | modal |
| `NotifBell` / `pushNotif` | Topbar (tüm roller) | hepsi | `components/layout/Header.tsx` |

## Koç geri bildirim + atama
| `CoachNoteModal` | `CoachAssignmentRow` (tamamlanan ödev) · `ExamStudentDetail` (deneme) | coach | modal |
| `CoachAssignmentRow` | CoachAssignmentsPage | coach | `/coach/assignments` |
| `OdevAtaModal` (coach-odev-ata) | CoachKonuPage `openAta(subject,topic)` — NetGainMap/CoachMistakesCard/konu satırı tetikler | coach | modal |

## Ödev (öğrenci)
| `OdevDailyPlan` (default) / `OdevCalendar` / `StudentOdevList` | AssignmentsPage | student | `/student/assignments` |
| `OdevResultModal` | OdevCard "Sonuç Gir" | student | modal (→MistakeBatch) |
| `OdevCard` | tüm ödev görünümleri | student | satır |
| `KaynaklarimCard` | AssignmentsPage | student | kart |

## Veli
| `VeliDashboard` | ROUTES.parent.dashboard | parent | `/parent` |
| `VeliDenemelerPage` | ROUTES.parent.p-exams | parent | `/parent/exams` |

## App shell
| `Sidebar` / `Topbar` / `BottomNav` | App | hepsi | `components/layout/*` |
| `App` (rol+sayfa state, tema, uk-nav event) | kök | — | Next route ağacı + layout + tema provider |

## Mount kuralları (özet — birebir korunmalı)
1. **CoachKonuPage sırası:** NetGainMap → CoachMistakesCard → HataFrekansiCard → konu ısı tablosu; hepsi tek `OdevAtaModal`'ı `initialSubject/initialTopic` ile açar.
2. **VeliDashboard:** NetGainMap(role=parent, CTA yok) → HataFrekansiCard(role=coach) → KaynakTracker(editable=false).
3. **OdevResultModal:** sonuç kaydında `y>0` → MistakeBatchModal otomatik açılır (max 12 slot).
4. **Mesaj:** App shell `messages` sayfasını role prop'uyla `MessagesPage`'e verir (ROUTES içindeki MessagesPage referansları da aynı bileşen).
5. **Section başlığı `flex:1`** (ui.jsx v6 fix) — uzun başlıkların action'ı taşımasını engeller; hedefte koru.
