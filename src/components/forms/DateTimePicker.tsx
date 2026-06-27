"use client";
import { useState } from "react";
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

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  const getQuick = (): QuickDate => {
    if (isToday(value)) return "hoy";
    if (isTomorrow(value)) return "manana";
    return "custom";
  };

  const [quick, setQuick] = useState<QuickDate>(getQuick());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const setTime = (h: number, m: number) => {
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

      {/* Date & time display row */}
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
          onClick={() => setShowTimePicker(!showTimePicker)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/6 border border-white/8 text-sm text-white hover:bg-white/10 press-effect"
        >
          <Clock size={15} className="text-bmw-400" />
          <span className="font-medium tabular-nums">{formattedTime}</span>
          <ChevronDown size={13} className={cn("text-zinc-500 transition-transform", showTimePicker && "rotate-180")} />
        </button>
      </div>

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

      {/* Time picker */}
      <AnimatePresence>
        {showTimePicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card-sm p-4">
              <p className="text-xs text-zinc-400 mb-3">Hora de salida</p>
              <select
                value={formattedTime}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(":").map(Number);
                  setTime(h, m);
                }}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none appearance-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "white",
                }}
              >
                {Array.from({ length: 48 }, (_, i) => {
                  const h = Math.floor(i / 2);
                  const m = i % 2 === 0 ? 0 : 30;
                  const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                  return (
                    <option key={i} value={t} style={{ background: "#0f172a" }}>
                      {t}
                    </option>
                  );
                })}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
