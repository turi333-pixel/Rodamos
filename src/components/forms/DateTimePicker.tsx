"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ChevronDown, X } from "lucide-react";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

type QuickDate = "hoy" | "manana" | "custom";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? 0 : 30;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const today = new Date();

  const getQuick = (): QuickDate => {
    if (isToday(value)) return "hoy";
    if (isTomorrow(value)) return "manana";
    return "custom";
  };

  const [quick, setQuick] = useState<QuickDate>(getQuick());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Scroll selected time into view when sheet opens
  useEffect(() => {
    if (!showTimePicker || !listRef.current) return;
    const idx = TIME_OPTIONS.indexOf(format(value, "HH:mm"));
    if (idx < 0) return;
    const item = listRef.current.children[idx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "center" });
  }, [showTimePicker, value]);

  const setQuickDate = (q: QuickDate) => {
    setQuick(q);
    if (q === "hoy") {
      const d = new Date();
      d.setHours(value.getHours(), value.getMinutes(), 0, 0);
      onChange(d);
      setShowDatePicker(false);
    } else if (q === "manana") {
      const d = addDays(new Date(), 1);
      d.setHours(value.getHours(), value.getMinutes(), 0, 0);
      onChange(d);
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
    }
  };

  const pickTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date(value);
    d.setHours(h, m, 0, 0);
    onChange(d);
    setShowTimePicker(false);
  };

  const formattedDate = isToday(value)
    ? "Hoy"
    : isTomorrow(value)
    ? "Mañana"
    : format(value, "d 'de' MMMM", { locale: es });

  const formattedTime = format(value, "HH:mm");

  // Bottom sheet rendered via portal so nothing clips it
  const sheet = mounted ? createPortal(
    <AnimatePresence>
      {showTimePicker && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTimePicker(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9998,
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
            }}
          />
          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              zIndex: 9999, background: "#0d1526",
              borderRadius: "1.25rem 1.25rem 0 0",
              maxHeight: "65vh", display: "flex", flexDirection: "column",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            {/* Handle + header */}
            <div style={{ flexShrink: 0, padding: "12px 20px 0" }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.15)", margin: "0 auto 14px" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ color: "white", fontWeight: 600, fontSize: 15 }}>Hora de salida</p>
                <button onClick={() => setShowTimePicker(false)} style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Scrollable list */}
            <div
              ref={listRef}
              style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"] }}
            >
              {TIME_OPTIONS.map((t) => {
                const selected = t === formattedTime;
                return (
                  <button
                    key={t}
                    onClick={() => pickTime(t)}
                    style={{
                      display: "block", width: "100%",
                      padding: "15px 20px",
                      textAlign: "center", fontSize: 17,
                      fontWeight: selected ? 700 : 400,
                      color: selected ? "#3385ff" : "rgba(255,255,255,0.85)",
                      background: selected ? "rgba(51,133,255,0.10)" : "transparent",
                      border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)",
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Quick date selector */}
      <div className="flex gap-2">
        {(["hoy", "manana", "custom"] as QuickDate[]).map((q) => (
          <button
            key={q}
            onClick={() => setQuickDate(q)}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 press-effect",
              quick === q
                ? "bg-bmw-500 text-white shadow-bmw"
                : "bg-white/6 text-zinc-400 hover:text-white border border-white/8"
            )}
          >
            {q === "hoy" ? "Hoy" : q === "manana" ? "Mañana" : "Otra fecha"}
          </button>
        ))}
      </div>

      {/* Date & time row */}
      <div className="flex gap-2">
        {/* Date pill */}
        <button
          onClick={() => quick === "custom" && setShowDatePicker(!showDatePicker)}
          className={cn(
            "flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/6 border border-white/8",
            "text-sm text-white transition-colors hover:bg-white/10 press-effect"
          )}
        >
          <Calendar size={15} className="text-bmw-400 flex-shrink-0" />
          <span className="font-medium">{formattedDate}</span>
        </button>

        {/* Time pill */}
        <button
          onClick={() => setShowTimePicker(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/6 border border-white/8 text-sm text-white hover:bg-white/10 press-effect"
        >
          <Clock size={15} className="text-bmw-400" />
          <span className="font-medium tabular-nums">{formattedTime}</span>
          <ChevronDown size={13} className="text-zinc-500" />
        </button>
      </div>

      {sheet}

      {/* Date input for custom */}
      <AnimatePresence>
        {showDatePicker && quick === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <input
              type="date"
              min={format(today, "yyyy-MM-dd")}
              value={format(value, "yyyy-MM-dd")}
              onChange={(e) => {
                const [y, mo, d] = e.target.value.split("-").map(Number);
                const nd = new Date(value);
                nd.setFullYear(y, mo - 1, d);
                onChange(nd);
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/10 text-white text-sm outline-none focus:border-bmw-500/60"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
