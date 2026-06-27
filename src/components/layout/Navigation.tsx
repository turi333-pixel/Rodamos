"use client";
import { motion } from "framer-motion";
import { Home, History, Star, Settings } from "lucide-react";
import { useAppStore } from "@/store";
import type { AppView } from "@/types";
import { cn } from "@/lib/utils";

const tabs: { view: AppView; icon: typeof Home; label: string; activeColor: string; activeGlow: string }[] = [
  { view: "home",      icon: Home,     label: "Inicio",    activeColor: "#3385ff", activeGlow: "rgba(51,133,255,0.35)" },
  { view: "history",   icon: History,  label: "Historial", activeColor: "#8b5cf6", activeGlow: "rgba(139,92,246,0.35)" },
  { view: "favorites", icon: Star,     label: "Favoritos", activeColor: "#fbbf24", activeGlow: "rgba(251,191,36,0.35)" },
  { view: "settings",  icon: Settings, label: "Ajustes",   activeColor: "#94a3b8", activeGlow: "rgba(148,163,184,0.25)" },
];

export function BottomNav() {
  const { currentView, setView } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      {/* Frosted glass bar */}
      <div
        className="mx-3 mb-3 rounded-3xl overflow-hidden"
        style={{
          background: "rgba(10,10,20,0.82)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center justify-around px-1 py-2">
          {tabs.map(({ view, icon: Icon, label, activeColor, activeGlow }) => {
            const active = currentView === view || (currentView === "analyze" && view === "home");
            return (
              <button
                key={view}
                onClick={() => setView(view)}
                className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 press-effect"
                style={active ? { background: `${activeColor}12` } : undefined}
              >
                {/* Active background pill */}
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: `${activeColor}10`, border: `1px solid ${activeColor}22` }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.5 : 1.7}
                    style={{
                      color: active ? activeColor : "rgba(148,163,184,0.45)",
                      filter: active ? `drop-shadow(0 0 6px ${activeGlow})` : undefined,
                      transition: "color 0.2s, filter 0.2s",
                    }}
                  />
                  <span
                    className="text-2xs font-medium leading-none"
                    style={{
                      color: active ? activeColor : "rgba(100,110,130,0.7)",
                      transition: "color 0.2s",
                    }}
                  >
                    {label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function TopBar({
  title,
  subtitle,
  left,
  right,
  transparent = false,
}: {
  title?: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  transparent?: boolean;
}) {
  return (
    <header
      className={cn("sticky top-0 z-40 safe-top", !transparent && "border-b")}
      style={!transparent ? {
        background: "rgba(10,10,20,0.80)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(255,255,255,0.07)",
      } : undefined}
    >
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          {left}
          {(title || subtitle) && (
            <div>
              {title && <h1 className="text-base font-semibold text-white leading-tight">{title}</h1>}
              {subtitle && <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.55)" }}>{subtitle}</p>}
            </div>
          )}
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
