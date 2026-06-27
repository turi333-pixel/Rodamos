"use client";
import { motion } from "framer-motion";
import { ChevronRight, Cpu, Cloud, Map, Bell, Shield, Info, ExternalLink, LogIn } from "lucide-react";
import { TopBar } from "@/components/layout/Navigation";

interface SettingItem {
  icon: React.ReactNode;
  label: string;
  value?: string;
  color: string;
}

const sections: { title: string; items: SettingItem[] }[] = [
  {
    title: "Inteligencia Artificial",
    items: [
      { icon: <Cpu size={15} />, label: "Modelo de IA",   value: "Claude Sonnet 4.6", color: "#6366f1" },
      { icon: <Cloud size={15} />, label: "Proveedor",    value: "Anthropic",          color: "#6366f1" },
    ],
  },
  {
    title: "Datos y Servicios",
    items: [
      { icon: <Cloud size={15} />, label: "Clima",        value: "OpenWeather",               color: "#0ea5e9" },
      { icon: <Map size={15} />,   label: "Mapas",        value: "OpenStreetMap / Mapbox",     color: "#10b981" },
    ],
  },
  {
    title: "Notificaciones",
    items: [
      { icon: <Bell size={15} />, label: "Alertas de clima",            value: "Activadas", color: "#f97316" },
      { icon: <Bell size={15} />, label: "Recordatorios de mantenimiento", value: "Activadas", color: "#f97316" },
    ],
  },
  {
    title: "Privacidad",
    items: [
      { icon: <Shield size={15} />, label: "Datos almacenados", value: "Solo local",   color: "#10b981" },
      { icon: <Shield size={15} />, label: "Analytics",         value: "Desactivado",  color: "#10b981" },
    ],
  },
  {
    title: "Aplicación",
    items: [
      { icon: <Info size={15} />,         label: "Versión",             value: "1.0.0 beta", color: "#94a3b8" },
      { icon: <ExternalLink size={15} />, label: "Términos y condiciones", value: "",        color: "#94a3b8" },
    ],
  },
];

export function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-dvh">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#0d0d1a 0%,#06060d 100%)" }} />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)" }} />
      </div>

      <TopBar title="Configuración" />

      <div className="relative flex-1 px-4 py-4 pb-32 space-y-5">

        {/* Profile hero card */}
        <div className="relative p-5 rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg,rgba(51,133,255,0.18) 0%,rgba(91,45,248,0.12) 100%)",
            border: "1px solid rgba(51,133,255,0.25)",
          }}>
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle,rgba(51,133,255,0.25),transparent 70%)" }} />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: "linear-gradient(135deg,#3385ff 0%,#5b2df8 100%)",
                boxShadow: "0 4px 20px rgba(51,133,255,0.45)",
              }}>
              🏍️
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-white">Piloto</p>
              <p className="text-sm" style={{ color: "rgba(148,163,184,0.65)" }}>Rodamos Beta</p>
              <button className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold"
                style={{ color: "#3385ff" }}>
                <LogIn size={12} />
                Iniciar sesión con Google
              </button>
            </div>
          </div>
        </div>

        {/* Settings sections */}
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * si }}
          >
            <p className="text-2xs font-semibold uppercase tracking-widest px-1 mb-2"
              style={{ color: "rgba(148,163,184,0.45)" }}>
              {section.title}
            </p>
            <div className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-3.5 press-effect"
                  style={{
                    borderBottom: i < section.items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                  }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}14`, color: item.color }}>
                    {item.icon}
                  </div>
                  <span className="flex-1 text-sm text-left" style={{ color: "rgba(210,210,220,0.88)" }}>
                    {item.label}
                  </span>
                  {item.value && (
                    <span className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>{item.value}</span>
                  )}
                  <ChevronRight size={13} style={{ color: "rgba(148,163,184,0.3)" }} className="flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Footer */}
        <div className="text-center py-6 space-y-1">
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>Rodamos · Tu asistente inteligente de ruta</p>
          <p className="text-2xs" style={{ color: "rgba(148,163,184,0.25)" }}>Hecho con ❤️ para moteros · v1.0.0 beta</p>
        </div>
      </div>
    </motion.div>
  );
}
