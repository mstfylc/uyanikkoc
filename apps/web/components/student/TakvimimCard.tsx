"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";

type AgendaItem = {
  id: string;
  kind: "assignment" | "exam" | "appointment" | "mistake" | "study";
  title: string;
  meta: string;
  href: string;
  tone: "primary" | "success" | "warning" | "danger" | "info";
  when: string | null;
};

type Agenda = {
  items: AgendaItem[];
  counts: {
    assignments: number;
    exams: number;
    appointments: number;
    mistakes: number;
    study: number;
  };
};

const ICONS: Record<AgendaItem["kind"], string> = {
  assignment: "ki-notepad-edit",
  exam: "ki-chart-simple",
  appointment: "ki-calendar",
  mistake: "ki-information-2",
  study: "ki-book-open",
};

export function TakvimimCard() {
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const response = await fetch("/api/student/agenda", { credentials: "same-origin" });
      if (active && response.ok) {
        const data = (await response.json()) as { agenda: Agenda };
        setAgenda(data.agenda);
      }
      if (active) setIsLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const total = agenda
    ? agenda.counts.assignments + agenda.counts.appointments + agenda.counts.mistakes + agenda.counts.study
    : 0;

  return (
    <UkSection title="Takvimim" sub="Ödev, tekrar, randevu ve çalışma akışı" action={<UkBadge tone={total > 0 ? "warning" : "success"}>{total} aktif</UkBadge>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {isLoading ? (
          <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>
        ) : !agenda || agenda.items.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>Bugün için kayıtlı akış yok.</p>
        ) : (
          agenda.items.slice(0, 6).map((item) => (
            <Link key={item.id} href={item.href} className="lrow" style={{ textDecoration: "none" }}>
              <span className={`lr-icon tone-${item.tone}`}>
                <KiIcon name={ICONS[item.kind]} size={18} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lr-title">{item.title}</div>
                <div className="lr-meta">
                  <span>{item.meta}</span>
                  {item.when ? <span className="d">{item.when}</span> : null}
                </div>
              </div>
              <KiIcon name="ki-arrow-right" size={15} style={{ color: "var(--muted)" }} />
            </Link>
          ))
        )}
        <Link href="/student/schedule" className="btn btn-light btn-sm" style={{ alignSelf: "flex-start" }}>
          <KiIcon name="ki-calendar" />
          Programa git
        </Link>
      </div>
    </UkSection>
  );
}
