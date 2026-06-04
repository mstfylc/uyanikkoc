export default function StudentAiCoachPage() {
  return (
    <div className="flex flex-col gap-5" data-testid="ai-coach-coming-soon">
      <div>
        <h1 className="text-xl font-semibold text-mono">AI Koç Yakında</h1>
        <p className="text-sm text-muted-foreground">
          Kişisel AI koç desteği alpha sürümünde hazırlanıyor.
        </p>
      </div>

      <div className="kt-card">
        <div className="kt-card-body p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <i className="ki-filled ki-technology-2 text-xl" />
            </span>
            <div>
              <h2 className="text-base font-medium">Yakında burada</h2>
              <p className="text-sm text-muted-foreground">
                Ödev planlama, motivasyon ve çalışma önerileri için AI koç modülü geliştiriliyor.
              </p>
            </div>
          </div>

          <ul className="text-sm text-muted-foreground list-disc ps-5 flex flex-col gap-1">
            <li>Ödev ve hedef takibi için akıllı öneriler</li>
            <li>Haftalık çalışma planı özeti</li>
            <li>Koçunuzla uyumlu rehberlik (canlı AI henüz kapalı)</li>
          </ul>

          <p className="text-xs text-muted-foreground">
            Canlı AI yanıtları şu an devre dışı. Özellik açıldığında bu sayfadan erişilebilecek.
          </p>
        </div>
      </div>
    </div>
  );
}
