"use client";
import { Phone, Building2, Wrench, Bike } from "lucide-react";
import { CardShell } from "@/components/ui/CardShell";
import type { EmergencyInfo } from "@/types";

export function EmergencyCard({ emergency }: { emergency: EmergencyInfo }) {
  return (
    <CardShell theme="emergency" icon="🚑" title="Información de Emergencia" subtitle="Recursos cerca de tu ruta" delay={0.6}>

      {/* Emergency numbers */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {emergency.emergencyNumbers.map((num) => (
          <a
            key={num.name}
            href={`tel:${num.number}`}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(220,38,38,0.15) 0%, rgba(239,68,68,0.08) 100%)",
              border: "1px solid rgba(239,68,68,0.30)",
              boxShadow: "0 2px 12px rgba(220,38,38,0.15)",
            }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(220,38,38,0.18)", boxShadow: "0 0 10px rgba(220,38,38,0.3)" }}>
              <Phone size={14} style={{ color: "#fca5a5" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{num.number}</p>
              <p className="text-2xs truncate" style={{ color: "rgba(252,165,165,0.65)" }}>{num.name}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Hospitals */}
      {emergency.hospitals.length > 0 && (
        <EmSection
          icon={<Building2 size={13} />}
          title="Hospitales cercanos"
          color="#ef4444"
          items={emergency.hospitals.map((h) => ({ name: h.name, sub: h.address, badge: `${h.distance} km`, phone: h.phone }))}
        />
      )}

      {/* BMW Dealers */}
      {emergency.bmwDealers.length > 0 && (
        <EmSection
          icon={<Bike size={13} />}
          title="Concesionarios BMW"
          color="#3385ff"
          items={emergency.bmwDealers.map((d) => ({ name: d.name, sub: d.address, badge: `${d.distance} km`, phone: d.phone }))}
        />
      )}

      {/* Workshops */}
      {emergency.workshops.length > 0 && (
        <EmSection
          icon={<Wrench size={13} />}
          title="Talleres de moto"
          color="#f97316"
          items={emergency.workshops.map((w) => ({ name: w.name, sub: w.address, badge: `${w.distance} km` }))}
        />
      )}
    </CardShell>
  );
}

function EmSection({
  icon, title, color,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  items: { name: string; sub: string; badge: string; phone?: string }[];
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span style={{ color }}>{icon}</span>
        <p className="text-xs font-semibold" style={{ color: "rgba(148,163,184,0.7)" }}>{title}</p>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{item.name}</p>
              <p className="text-xs truncate" style={{ color: "rgba(148,163,184,0.55)" }}>{item.sub}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs" style={{ color: color }}>{item.badge}</span>
              {item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}28` }}
                >
                  <Phone size={11} style={{ color }} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
