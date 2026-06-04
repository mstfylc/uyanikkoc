export default function BranchDashboardPage() {
  return (
    <div className="flex flex-col gap-5" data-testid="branch-dashboard">
      <div>
        <h1 className="text-xl font-semibold text-mono">Şube Dashboard</h1>
        <p className="text-sm text-muted-foreground">Şube öğrenci ve koç takibi</p>
      </div>

      <div className="kt-card">
        <div className="kt-card-body p-5 flex flex-col gap-2">
          <h2 className="text-base font-medium">Single-branch alpha</h2>
          <p className="text-sm text-muted-foreground">
            Bu sürüm tek şube demo kapsamındadır. Çoklu şube, franchise ve gelişmiş raporlama
            sonraki fazlarda açılacaktır.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="kt-card">
          <div className="kt-card-body p-5">
            <div className="text-2xl font-semibold text-mono">1</div>
            <div className="text-sm text-muted-foreground">Öğrenci (demo)</div>
          </div>
        </div>
        <div className="kt-card">
          <div className="kt-card-body p-5">
            <div className="text-2xl font-semibold text-mono">1</div>
            <div className="text-sm text-muted-foreground">Koç (demo)</div>
          </div>
        </div>
        <div className="kt-card">
          <div className="kt-card-body p-5">
            <div className="text-2xl font-semibold text-mono">—</div>
            <div className="text-sm text-muted-foreground">Raporlar</div>
          </div>
        </div>
        <div className="kt-card">
          <div className="kt-card-body p-5">
            <div className="text-2xl font-semibold text-mono">Alpha</div>
            <div className="text-sm text-muted-foreground">Şube modu</div>
          </div>
        </div>
      </div>
    </div>
  );
}
