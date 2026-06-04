export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-5" data-testid="admin-dashboard">
      <div>
        <h1 className="text-xl font-semibold text-mono">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Organizasyon ve sistem özeti</p>
      </div>

      <div className="kt-card">
        <div className="kt-card-body p-5 flex flex-col gap-2">
          <h2 className="text-base font-medium">Single-branch alpha</h2>
          <p className="text-sm text-muted-foreground">
            Bu sürüm tek organizasyon / tek şube kapsamındadır. Kullanıcı yönetimi ve sistem
            sağlığı ekranları iskelet olarak sunulur; tam CRUD sonraki fazlarda gelir.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="kt-card">
          <div className="kt-card-body p-5 flex flex-col gap-2">
            <h3 className="text-base font-medium">Kullanıcılar</h3>
            <p className="text-sm text-muted-foreground">
              Demo kullanıcılar seed ile yüklenir. Organizasyon geneli kullanıcı listesi yakında.
            </p>
          </div>
        </div>
        <div className="kt-card">
          <div className="kt-card-body p-5 flex flex-col gap-2">
            <h3 className="text-base font-medium">Sistem Sağlığı</h3>
            <p className="text-sm text-muted-foreground">
              API ve veritabanı durumu bu alpha sürümünde manuel doğrulanır (`pnpm db:verify-alpha`).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
