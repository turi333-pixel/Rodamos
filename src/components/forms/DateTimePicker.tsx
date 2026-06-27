"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ChevronDown } from "lucide-react";
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const timePillRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showTimePicker) return;
    const handleClick = (e: Event) => {
      if (
        timePillRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) return;
      setShowTimePicker(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [showTimePicker]);

  const openTimePicker = () => {
    if (!timePillRef.current) return;
    const rect = timePillRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropH = 240;

    if (spaceBelow >= dropH + 12) {
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 160),
      });
    } else {
      setDropdownStyle({
        position: "fixed",
        bottom: window.innerHeight - rect.top + 6,
        left: rect.left,
        width: Math.max(rect.width, 160),
      });
    }
    setShowTimePicker((v) => !v);
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

  const setTime = (t: string) => {
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

  const dropdown = mounted && showTimePicker ? createPortal(
    <div
      ref={dropdownRef}
      style={{
        ...dropdownStyle,
        zIndex: 9999,
        borderRadius: "1rem",
        background: "#0d1526",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        maxHeight: 240,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {TIME_OPTIONS.map((t) => (
        <button
          key={t}
          onMouseDown={(e) => { e.preventDefault(); setTime(t); }}
          onTouchEnd={(e) => { e.preventDefault(); setTime(t); }}
          style={{
            display: "block",
            width: "100%",
            padding: "10px 16px",
            textAlign: "left",
            fontSize: 14,
            fontWeight: formattedTime === t ? 700 : 400,
            color: formattedTime === t ? "#3385ff" : "rgba(255,255,255,0.85)",
            background: formattedTime === t ? "rgba(51,133,255,0.10)" : "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          {t}
        </button>
      ))}
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

        {/* Time pill */}
        <button
          ref={timePillRef}
          onClick={openTimePicker}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/6 border border-white/8 text-sm text-white hover:bg-white/10 press-effect"
        >
          <Clock size={15} className="text-bmw-400" />
          <span className="font-medium tabular-nums">{formattedTime}</span>
          <ChevronDown
            size={13}
            className={cn("text-zinc-500 transition-transform duration-200", showTimePicker && "rotate-180")}
          />
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
