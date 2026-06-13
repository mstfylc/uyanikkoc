/* Koç paneli rotası: Yıllık Konu Takip Çizelgesi
   Gerçek uygulamanın PageHead + Icon + KonuCizelge bileşenlerini kullanır.
   (Hook tanımlamaz; mevcut globallerle çakışmaz.) */
function CoachKonuCizelgePage() {
  return (
    <div className="stack rise">
      <PageHead
        title="Yıllık Konu Takip Çizelgesi"
        sub="Tüm yılın oturum oturum çalışma kaydı · Tekrar / Günlük / Haftalık görünüm"
        actions={<button className="btn btn-light"><Icon name="download" size={16} />Dışa aktar</button>}
      />
      <KonuCizelge maxHeight="64vh" />
    </div>
  );
}
window.CoachKonuCizelgePage = CoachKonuCizelgePage;
