"use client";

import { useEffect, useMemo, useState } from "react";

import { CardBrandBadge } from "@/components/shared/billing/CardBrandBadge";
import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { downloadTextFile, planColor } from "@/lib/design/billing-ui";
import { formatTRY } from "@uyanik/shared";
import type { CoachRevenueView } from "@/mocks/coach-revenue";

type Filter = "all" | "paid" | "due";

const PLAN_NAMES: Record<string, string> = {
  standart: "Standart Koçluk",
  plus: "Plus Koçluk",
  vip: "VIP Koçluk",
};

export function CoachRevenuePanel() {
  const [view, setView] = useState<CoachRevenueView | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [reminded, setReminded] = useState<Set<string>>(() => new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/coach/revenue", { credentials: "same-origin" });
      if (response.ok) {
        setView((await response.json()) as CoachRevenueView);
      }
      setIsLoading(false);
    }
    void load();
  }, []);

  const subscribers = view?.subscribers ?? [];
  const trend = view?.trend ?? [];
  const mrr = subscribers.filter((item) => item.status !== "failed").reduce((sum, item) => sum + item.monthlyAmount, 0);
  const active = subscribers.filter((item) => item.status === "paid").length;
  const overdue = subscribers.filter((item) => item.status === "failed" || item.status === "pending");
  const overdueTotal = overdue.reduce((sum, item) => sum + item.monthlyAmount, 0);
  const maxTrend = Math.max(...trend.map((item) => item.value), 1);

  const list = useMemo(() => {
    if (filter === "paid") return subscribers.filter((item) => item.status === "paid");
    if (filter === "due") return overdue;
    return subscribers;
  }, [filter, subscribers, overdue]);

  function exportCsv() {
    const rows = [["Öğrenci", "Veli", "Plan", "Dönem", "Aylık", "Durum", "Sonraki"]];
    subscribers.forEach((item) => {
      rows.push([
        item.studentName,
        item.parentName,
        PLAN_NAMES[item.planId] ?? item.planId,
        item.cycle === "annual" ? "Yıllık" : "Aylık",
        String(item.monthlyAmount),
        item.status === "paid" ? "Ödendi" : item.status === "pending" ? "Bekliyor" : "Başarısız",
        item.nextDays < 0 ? `${-item.nextDays} gün gecikti` : `${item.nextDays} gün`,
      ]);
    });
    downloadTextFile("sube-tahsilat.csv", rows.map((row) => row.join(",")).join("\n"));
  }

  if (isLoading) {
    return <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>;
  }

  return (
    <div className="stack rise" data-testid="coach-revenue-panel">
      <UkPageHead
        title="Gelir & Tahsilat"
        sub="Subenin abonelik geliri, tahsilat durumu ve platform ucreti"
        actions={
          <button type="button" className="btn btn-light" onClick={exportCsv}>
            <KiIcon name="ki-cloud-download" size={16} />
            Disa aktar
          </button>
        }
      />

      <div className="grid g-4">
        <UkStatCard icon="ki-dollar" tone="primary" value={formatTRY(mrr)} label="Aylik tekrarli gelir" delta="+%7,1" />
        <UkStatCard icon="ki-people" tone="success" value={`${active}/${subscribers.length}`} label="Aktif abonelik" />
        <UkStatCard icon="ki-information-2" tone="warning" value={formatTRY(overdueTotal)} label="Bekleyen tahsilat" />
        <UkStatCard icon="ki-office-bag" tone="info" value={formatTRY(view?.platformFee ?? 0)} label="Platform ucreti" />
      </div>

      <div className="rev-split">
        <UkSection title="Aylik Gelir Trendi" sub="Son 6 ay · sube toplam tahsilati">
          <div className="card-body">
            <div className="rev-bars">
              {trend.map((item, index) => (
                <div key={item.month} className="rev-bar-col">
                  <div className="rev-bar-wrap">
                    <span className="rev-bar-val tnum">{Math.round(item.value / 1000)}B</span>
                    <div
                      className="rev-bar"
                      style={{
                        height: `${(item.value / maxTrend) * 100}%`,
                        background: index === trend.length - 1 ? "var(--primary)" : "var(--primary-soft)",
                      }}
                    />
                  </div>
                  <span className="rev-bar-ay muted">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </UkSection>

        <UkSection title="Platform Aboneliği" sub="Şubenin Uyanık Koç kullanım planı">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div className="plat-plan">
              <UkBadge tone="info">Kurumsal</UkBadge>
              <div className="row" style={{ gap: 6, marginTop: 8 }}>
                <b style={{ fontSize: 19, fontWeight: 800 }} className="tnum">
                  {formatTRY(view?.platformFee ?? 0)}
                </b>
                <span className="muted" style={{ fontSize: 12 }}>
                  /ay · {view?.studentCapacity ?? 50} öğrenciye kadar
                </span>
              </div>
            </div>
            <div className="plat-rows">
              <div className="plat-row">
                <span className="muted">Kullanım</span>
                <b>
                  {subscribers.length} / {view?.studentCapacity ?? 50} öğrenci
                </b>
              </div>
              <div className="plat-meter">
                <span style={{ width: `${(subscribers.length / (view?.studentCapacity ?? 50)) * 100}%` }} />
              </div>
              <div className="plat-row">
                <span className="muted">Sonraki ödeme</span>
                <b>1 Temmuz 2026</b>
              </div>
              <div className="plat-row">
                <span className="muted">Ödeme yöntemi</span>
                <b className="row" style={{ gap: 6 }}>
                  <CardBrandBadge brand="mastercard" size="sm" /> •5571
                </b>
              </div>
            </div>
            <button type="button" className="btn btn-outline" style={{ width: "100%" }}>
              <KiIcon name="ki-arrow-up" size={15} />
              Kapasiteyi yükselt
            </button>
          </div>
        </UkSection>
      </div>

      <UkSection
        title="Öğrenci Tahsilatları"
        sub="Abonelik bazında tahsilat durumu"
        action={
          <div className="seg" style={{ width: "fit-content" }}>
            <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>
              Tümü
            </button>
            <button type="button" className={filter === "paid" ? "on" : ""} onClick={() => setFilter("paid")}>
              Ödendi
            </button>
            <button type="button" className={filter === "due" ? "on" : ""} onClick={() => setFilter("due")}>
              Bekleyen
            </button>
          </div>
        }
      >
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 680 }}>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Veli</th>
                <th>Plan</th>
                <th style={{ textAlign: "right" }}>Aylık</th>
                <th style={{ textAlign: "center" }}>Sonraki</th>
                <th style={{ textAlign: "center" }}>Durum</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((item) => {
                const tone = item.status === "paid" ? "success" : item.status === "pending" ? "warning" : "danger";
                const label = item.status === "paid" ? "Ödendi" : item.status === "pending" ? "Yaklaşıyor" : "Başarısız";
                const overdueDays = item.nextDays < 0;
                return (
                  <tr key={item.studentName}>
                    <td>
                      <div className="row" style={{ gap: 9 }}>
                        <UkAvatar name={item.studentName} size={30} />
                        <b style={{ fontSize: 13, fontWeight: 700 }}>{item.studentName}</b>
                      </div>
                    </td>
                    <td>
                      <span className="muted" style={{ fontSize: 12.5 }}>
                        {item.parentName}
                      </span>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 7 }}>
                        <span className="plan-dot" style={{ background: planColor(item.planId) }} />
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{PLAN_NAMES[item.planId] ?? item.planId}</span>
                        <span className="muted" style={{ fontSize: 11 }}>
                          {item.cycle === "annual" ? "Yıllık" : "Aylık"}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="tnum" style={{ fontWeight: 700 }}>
                        {formatTRY(item.monthlyAmount)}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className="tnum"
                        style={{
                          fontSize: 12.5,
                          color: overdueDays ? "var(--danger)" : "var(--muted)",
                          fontWeight: overdueDays ? 700 : 500,
                        }}
                      >
                        {overdueDays ? `${-item.nextDays} gün gecikti` : `${item.nextDays} gün`}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <UkBadge tone={tone}>{label}</UkBadge>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {item.status !== "paid" ? (
                        <button
                          type="button"
                          className="btn btn-light btn-sm"
                          disabled={reminded.has(item.studentName)}
                          style={reminded.has(item.studentName) ? { opacity: 0.6 } : undefined}
                          onClick={() =>
                            setReminded((current) => {
                              const next = new Set(current);
                              next.add(item.studentName);
                              return next;
                            })
                          }
                        >
                          <KiIcon name={reminded.has(item.studentName) ? "ki-check" : "ki-send"} size={14} />
                          {reminded.has(item.studentName) ? "Hatırlatıldı" : "Hatırlat"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: 32, height: 32 }}
                          title="Makbuz"
                          aria-label="Makbuz"
                          onClick={() =>
                            downloadTextFile(
                              `makbuz-${item.studentName.replace(/\s/g, "-")}.txt`,
                              [
                                "UYANIK KOÇ — TAHSİLAT MAKBUZU",
                                "",
                                `Öğrenci: ${item.studentName}`,
                                `Veli: ${item.parentName}`,
                                `Plan: ${PLAN_NAMES[item.planId] ?? item.planId}`,
                                `Aylık tutar: ${formatTRY(item.monthlyAmount)}`,
                                "Durum: Ödendi",
                              ].join("\n"),
                            )
                          }
                        >
                          <KiIcon name="ki-receipt-square" size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </UkSection>
    </div>
  );
}
