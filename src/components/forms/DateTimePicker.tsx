"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ChevronDown, ChevronUp, Check } from "lucide-react";
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
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 200 });
  const [mounted, setMounted] = useState(false);
  const timePillRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close on outside click
  useEffect(() => {
    if (!showTimePicker) return;
    const handler = (e: Event) => {
      if (timePillRef.current?.contains(e.target as Node)) return;
      if (dropRef.current?.contains(e.target as Node)) return;
      setShowTimePicker(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showTimePicker]);

  // Scroll selected item into view
  useEffect(() => {
    if (!showTimePicker || !listRef.current) return;
    const idx = TIME_OPTIONS.indexOf(format(value, "HH:mm"));
    if (idx < 0) return;
    const item = listRef.current.children[idx] as HTMLElement | undefined;
    if (item) item.scrollIntoView({ block: "center" });
  }, [showTimePicker, value]);

  const openTimePicker = () => {
    if (showTimePicker) { setShowTimePicker(false); return; }
    if (!timePillRef.current) return;
    const rect = timePillRef.current.getBoundingClientRect();
    const dropW = Math.max(rect.width, 200);
    const dropH = 300;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const top = spaceBelow >= dropH ? rect.bottom + 6 : rect.top - dropH - 6;
    setDropPos({ top, left: rect.left, width: dropW });
    setShowTimePicker(true);
  };

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

  const pickNow = () => {
    const now = new Date();
    const d = new Date(value);
    d.setHours(now.getHours(), now.getMinutes(), 0, 0);
    onChange(d);
    setShowTimePicker(false);
  };

  const formattedDate = isToday(value) ? "Hoy" : isTomorrow(value) ? "Mañana" : format(value, "d 'de' MMMM", { locale: es });
  const formattedTime = format(value, "HH:mm");

  const dropdown = mounted && showTimePicker ? createPortal(
    <div
      ref={dropRef}
      style={{
        position: "fixed",
        top: dropPos.top,
        left: dropPos.left,
        width: dropPos.width,
        zIndex: 9999,
        background: "#0d1a2d",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Scrollable list — shows ~6 items */}
      <div ref={listRef} style={{ maxHeight: 240, overflowY: "auto", overscrollBehavior: "contain" }}>
        {TIME_OPTIONS.map((t) => {
          const selected = t === formattedTime;
          return (
            <button
              key={t}
              onClick={() => pickTime(t)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "11px 16px",
                fontSize: 15,
                fontWeight: selected ? 600 : 400,
                color: selected ? "#3385ff" : "rgba(255,255,255,0.82)",
                background: selected ? "rgba(51,133,255,0.14)" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {t}
              {selected && <Check size={14} color="#3385ff" />}
            </button>
          );
        })}
      </div>

      {/* Footer actions */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex" }}>
        <button
          onClick={pickNow}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px", color: "#3385ff", fontSize: 13, background: "none", border: "none", cursor: "pointer", borderRight: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Clock size={13} /> Ahora
        </button>
        <button
          onClick={() => { setShowTimePicker(false); setQuick("custom"); setShowDatePicker(true); }}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px", color: "#3385ff", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}
        >
          <Calendar size={13} /> Elegir en calendario
        </button>
      </div>
    </div>,
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

        {/* Time pill — opens the dropdown */}
        <button
          ref={timePillRef}
          onClick={openTimePicker}
          className="flex items-center gap-2 px-4 py-3 rounded-xl press-effect transition-all"
          style={{
            background: showTimePicker ? "rgba(51,133,255,0.08)" : "rgba(255,255,255,0.06)",
            border: `1.5px solid ${showTimePicker ? "#3385ff" : "rgba(255,255,255,0.1)"}`,
            color: showTimePicker ? "#3385ff" : "rgba(255,255,255,0.9)",
          }}
        >
          <Clock size={15} style={{ color: showTimePicker ? "#3385ff" : "rgba(51,133,255,0.8)" }} />
          <span className="text-sm font-semibold tabular-nums">{formattedTime}</span>
          {showTimePicker
            ? <ChevronUp size={13} style={{ color: "#3385ff" }} />
            : <ChevronDown size={13} style={{ color: "rgba(148,163,184,0.5)" }} />}
        </button>
      </div>

      {dropdown}

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
