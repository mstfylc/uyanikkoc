export type SupportFaqItem = {
  question: string;
  answer: string;
};

export const SUPPORT_FAQ: Record<"student" | "coach" | "parent", SupportFaqItem[]> = {
  coach: [
    {
      question: "Deneme sonucu Excel'ini nasil ice aktaririm?",
      answer:
        "Denemeler sayfasinda sag ustteki Deneme Ice Aktar butonuna basin. CSV formatinda toplu sonuc yukleyebilir veya Excel dosyanizi CSV olarak kaydedip yukleyebilirsiniz.",
    },
    {
      question: "Ogrenciye nasil odev atarim?",
      answer:
        "Konu Takibi sayfasinda ogrenciyi secin, Odev Ata ile ders ve konu secin. Odev & Gorev sayfasindan da yeni odev olusturabilirsiniz.",
    },
    {
      question: "Mufredattaki konulari degistirebilir miyim?",
      answer:
        "Ayarlar > Mufredat & Konu Gruplari sekmesinden ders, grup ve konulari duzenleyebilirsiniz.",
    },
    {
      question: "Randevu limitini nasil ayarlarim?",
      answer:
        "Randevular > Musait Saatlerim sekmesinde haftalik randevu limitini ve online/yuz yuze izinlerini belirleyebilirsiniz.",
    },
  ],
  student: [
    {
      question: "Odevimin sonucunu nasil girerim?",
      answer:
        "Odevlerim sayfasinda ilgili odevde Sonuc Gir butonuna basin, dogru/yanlis/bos sayilarini girin. Net otomatik hesaplanir.",
    },
    {
      question: "Kocumdan nasil randevu alirim?",
      answer:
        "Randevular sayfasinda Randevu Iste butonuna basin, online veya yuz yuze secin ve musait bir saat secin.",
    },
    {
      question: "Elimdeki kaynaklari nasil eklerim?",
      answer:
        "Odevlerim sayfasinin altindaki Kaynaklarim alanina sahip oldugunuz kitaplari ekleyin.",
    },
    {
      question: "Deneme analizimi nerede gorurum?",
      answer:
        "Denemeler sayfasinda Analiz sekmesine gecin. Net dagilimi ve oncelikli konular orada listelenir.",
    },
  ],
  parent: [
    {
      question: "Cocugumun odev durumunu nasil takip ederim?",
      answer:
        "Genel Bakis sayfasinda haftalik odev listesi ve tamamlama oranini gorebilirsiniz.",
    },
    {
      question: "Deneme sonuclarini nerede gorurum?",
      answer:
        "Deneme Sonuclari sayfasinda cocugunuzun son deneme netlerini ve ders bazli dagilimini inceleyebilirsiniz.",
    },
    {
      question: "Koc ile nasil iletisime gecerim?",
      answer:
        "Mesajlar sayfasindan kocunuzla yazisma baslatabilirsiniz.",
    },
    {
      question: "Randevu talebi nasil olusturulur?",
      answer:
        "Randevular sayfasindan onayli gorusmeleri gorebilirsiniz. Yeni talep icin ogrenci hesabi uzerinden randevu istenebilir.",
    },
  ],
};

export const SUPPORT_CATEGORIES = {
  teknik: "Teknik sorun",
  oneri: "Oneri",
  hesap: "Hesap",
  diger: "Diger",
} as const;

export type SupportCategory = keyof typeof SUPPORT_CATEGORIES;
