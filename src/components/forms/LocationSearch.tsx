"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, X, Loader2 } from "lucide-react";
import type { Location } from "@/types";
import { cn } from "@/lib/utils";

interface LocationSearchProps {
  value?: Location;
  onChange: (location: Location | undefined) => void;
  placeholder?: string;
  className?: string;
  /** Minimal mode: no box, just text inline inside a parent layout */
  minimal?: boolean;
  /** Larger text for the destination hero input */
  size?: "sm" | "md" | "lg";
  autoGPS?: boolean;
}

interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

export function LocationSearch({
  value,
  onChange,
  placeholder = "Busca un destino...",
  className,
  minimal = false,
  size = "md",
  autoGPS = false,
}: LocationSearchProps) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.results ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (!q) { onChange(undefined); setSuggestions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 350);
  };

  const handleSelect = (s: PlaceSuggestion) => {
    setQuery(s.name);
    setSuggestions([]);
    onChange({ name: s.name, address: s.address, coordinates: s.coordinates, type: "search" });
    inputRef.current?.blur();
  };

  const handleGPS = useCallback(async () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&reverse=true`);
          const data = await res.json();
          const name = data.name ?? "Mi ubicación";
          setQuery(name);
          onChange({ name, coordinates: { lat, lng }, type: "gps" });
        } catch {
          setQuery("Mi ubicación");
          onChange({ name: "Mi ubicación", coordinates: { lat, lng }, type: "gps" });
        }
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [onChange]);

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    onChange(undefined);
    inputRef.current?.focus();
  };

  const showSuggestions = focused && suggestions.length > 0;
  const textSizeClass = size === "lg" ? "text-base font-medium" : size === "sm" ? "text-xs" : "text-sm";

  if (minimal) {
    return (
      <div className={cn("relative", className)}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent text-white outline-none min-w-0",
              textSizeClass,
              !query && "text-zinc-500"
            )}
            style={{ caretColor: "#3385ff" }}
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            {loading && <Loader2 size={13} className="animate-spin text-zinc-600" />}
            {query && !loading && (
              <button onClick={handleClear} className="p-1 rounded-lg press-effect text-zinc-600 hover:text-zinc-400">
                <X size={13} />
              </button>
            )}
            <button
              onClick={handleGPS}
              className={cn("p-1.5 rounded-xl press-effect transition-colors",
                gpsLoading ? "text-bmw-400" : "text-zinc-600 hover:text-bmw-400")}
            >
              {gpsLoading ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
            </button>
          </div>
        </div>

        {/* Dropdown — absolutely positioned */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute z-[100] left-0 right-0 mt-3 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(12,14,22,0.97)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              }}
            >
              {suggestions.map((s, i) => (
                <button
                  key={s.id}
                  onMouseDown={() => handleSelect(s)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                >
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(51,133,255,0.12)" }}>
                    <MapPin size={13} style={{ color: "#3385ff" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{s.name}</p>
                    <p className="text-xs truncate" style={{ color: "rgba(148,163,184,0.5)" }}>{s.address}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Standard (boxed) mode
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center gap-3 px-4 py-3.5 transition-all duration-200 rounded-2xl",
          focused
            ? "border-bmw-500/60 shadow-[0_0_0_3px_rgba(0,102,204,0.12)]"
            : "",
        )}
        style={{
          background: focused ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${focused ? "rgba(51,133,255,0.45)" : "rgba(255,255,255,0.09)"}`,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          className={cn("flex-1 bg-transparent text-white outline-none min-w-0", textSizeClass)}
          style={{ caretColor: "#3385ff" }}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="flex items-center gap-1">
          {loading && <Loader2 size={14} className="animate-spin text-zinc-500" />}
          {query && !loading && (
            <button onClick={handleClear} className="text-zinc-500 hover:text-white p-1 rounded-lg press-effect">
              <X size={14} />
            </button>
          )}
          <button
            onClick={handleGPS}
            className={cn("p-1.5 rounded-xl press-effect transition-colors",
              gpsLoading ? "text-bmw-400" : "text-zinc-500 hover:text-bmw-400")}
          >
            {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute z-50 left-0 right-0 mt-2 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(12,14,22,0.97)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={s.id}
                onMouseDown={() => handleSelect(s)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              >
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(51,133,255,0.12)" }}>
                  <MapPin size={13} style={{ color: "#3385ff" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{s.name}</p>
                  <p className="text-xs truncate" style={{ color: "rgba(148,163,184,0.5)" }}>{s.address}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
