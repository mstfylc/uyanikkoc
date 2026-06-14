"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkSection } from "@/components/design/UkSection";
import {
  countActiveChannels,
  loadNotificationPrefs,
  NOTIF_CATS,
  NOTIF_CHANNELS,
  saveNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/design/notification-ui";

type NotificationSettingsPanelProps = {
  role: "student" | "coach" | "parent";
  onSaved?: (message: string) => void;
};

export function NotificationSettingsPanel({ role, onSaved }: NotificationSettingsPanelProps) {
  const { data: session } = useSession();
  const cats = NOTIF_CATS[role];
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => loadNotificationPrefs(role));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(loadNotificationPrefs(role));
  }, [role]);

  function setType(cat: string, channel: "app" | "email" | "sms", value: boolean) {
    setPrefs((current) => ({
      ...current,
      types: {
        ...current.types,
        [cat]: { ...current.types[cat], [channel]: value },
      },
    }));
  }

  function setQuiet(patch: Partial<NotificationPrefs["quiet"]>) {
    setPrefs((current) => ({ ...current, quiet: { ...current.quiet, ...patch } }));
  }

  function commit() {
    saveNotificationPrefs(role, prefs);
    setSaved(true);
    onSaved?.("Bildirim tercihlerin kaydedildi");
    setTimeout(() => setSaved(false), 1800);
  }

  const activeCount = countActiveChannels(role, prefs);
  const email = session?.user?.email ?? "hesabına";

  return (
    <div className="stack">
      <UkSection
        title="Bildirim Tercihleri"
        sub="Hangi bildirimleri hangi kanaldan alacağını seç"
        action={
          <button type="button" className="btn btn-primary btn-sm" onClick={commit}>
            <KiIcon name={saved ? "ki-check" : "ki-setting-2"} size={15} />
            {saved ? "Kaydedildi" : "Tercihleri kaydet"}
          </button>
        }
      >
        <div className="card-body" style={{ padding: 0 }}>
          <div className="npref-grid npref-head">
            <div className="npref-cat-h">Bildirim turu</div>
            {NOTIF_CHANNELS.map((channel) => (
              <div key={channel.key} className="npref-ch-h">
                <KiIcon name={channel.icon} size={14} />
                {channel.label}
              </div>
            ))}
          </div>
          {cats.map((cat) => (
            <div className="npref-grid npref-row" key={cat.key}>
              <div className="npref-cat">
                <span className={`notif-ic tone-${cat.tone}`} style={{ width: 34, height: 34 }}>
                  <KiIcon name={cat.icon} size={16} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="npref-title">{cat.title}</div>
                  <div className="npref-desc">{cat.desc}</div>
                </div>
              </div>
              {NOTIF_CHANNELS.map((channel) => {
                const on = Boolean(prefs.types[cat.key]?.[channel.key]);
                return (
                  <div key={channel.key} className="npref-ch">
                    <button
                      type="button"
                      className={`switch sm${on ? " on" : ""}`}
                      onClick={() => setType(cat.key, channel.key, !on)}
                      aria-label={`${cat.title} · ${channel.label}`}
                    >
                      <span />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </UkSection>

      <UkSection title="Rahatsız Etme Saatleri" sub="Bu aralıkta uygulama ve SMS bildirimleri ertelenir">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="renew-toggle">
            <div>
              <b style={{ fontSize: 13.5 }}>Rahatsız etme modu</b>
              <div className="muted" style={{ fontSize: 12 }}>
                Belirledigin saatlerde sessize alinir
              </div>
            </div>
            <button
              type="button"
              className={`switch${prefs.quiet.enabled ? " on" : ""}`}
              onClick={() => setQuiet({ enabled: !prefs.quiet.enabled })}
              aria-label="Rahatsız etme"
            >
              <span />
            </button>
          </label>
          {prefs.quiet.enabled ? (
            <div className="row" style={{ gap: 14, flexWrap: "wrap" }}>
              <div className="field">
                <label className="label">Baslangic</label>
                <input
                  type="time"
                  className="input tnum"
                  style={{ width: 140 }}
                  value={prefs.quiet.from}
                  onChange={(event) => setQuiet({ from: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="label">Bitis</label>
                <input
                  type="time"
                  className="input tnum"
                  style={{ width: 140 }}
                  value={prefs.quiet.to}
                  onChange={(event) => setQuiet({ to: event.target.value })}
                />
              </div>
              <div
                className="row"
                style={{
                  alignSelf: "flex-end",
                  gap: 7,
                  color: "var(--muted)",
                  fontSize: 12,
                  paddingBottom: 10,
                }}
              >
                <KiIcon name="ki-moon" size={14} />
                Acil tahsilat/randevu bildirimleri istisna
              </div>
            </div>
          ) : null}
        </div>
      </UkSection>

      <div
        className="muted"
        style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 6, paddingLeft: 2 }}
      >
        <KiIcon name="ki-notification-on" size={13} />
        {activeCount} kanal etkin · E-posta {email} adresine gönderilir.
      </div>
    </div>
  );
}
