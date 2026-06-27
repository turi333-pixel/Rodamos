"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "bmw";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:   "bg-bmw-500 hover:bg-bmw-600 text-white shadow-bmw",
  secondary: "bg-white/8 hover:bg-white/12 text-white border border-white/10",
  ghost:     "bg-transparent hover:bg-white/6 text-zinc-300 hover:text-white",
  danger:    "bg-danger hover:bg-red-600 text-white",
  bmw: [
    "relative text-white font-semibold overflow-hidden",
    "before:absolute before:inset-0 before:rounded-[inherit]",
    "before:bg-[linear-gradient(135deg,#0066cc_0%,#003d7a_100%)]",
    "after:absolute after:inset-0 after:rounded-[inherit]",
    "after:bg-[linear-gradient(135deg,rgba(255,255,255,0.15)_0%,transparent_50%)]",
    "shadow-bmw-lg",
  ].join(" "),
};

const sizes: Record<ButtonSize, string> = {
  sm:  "h-9  px-4  text-sm  rounded-xl  gap-1.5",
  md:  "h-11 px-5  text-sm  rounded-2xl gap-2",
  lg:  "h-14 px-6  text-base rounded-2xl gap-2.5",
  xl:  "h-16 px-8  text-lg  rounded-3xl gap-3",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12 }}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmw-500/50",
        "disabled:opacity-40 disabled:pointer-events-none select-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      onClick={props.onClick}
      type={props.type ?? "button"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span className={variant === "bmw" ? "relative z-10" : ""}>{children}</span>
      {iconRight && !loading && (
        <span className="flex-shrink-0">{iconRight}</span>
      )}
    </motion.button>
  );
}

// ─── Icon Button ──────────────────────────────────────────────────────────────

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "glass" | "primary";
}

export function IconButton({
  size = "md",
  variant = "ghost",
  className,
  children,
  ...props
}: IconButtonProps) {
  const sz = { sm: "w-8 h-8 rounded-lg", md: "w-10 h-10 rounded-xl", lg: "w-12 h-12 rounded-2xl" }[size];
  const v = {
    ghost:   "bg-transparent hover:bg-white/8 text-zinc-400 hover:text-white",
    glass:   "bg-white/6 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/8",
    primary: "bg-bmw-500 hover:bg-bmw-600 text-white shadow-bmw",
  }[variant];

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.1 }}
      className={cn(
        "inline-flex items-center justify-center transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bmw-500/50",
        "disabled:opacity-40 disabled:pointer-events-none select-none",
        sz, v, className
      )}
      onClick={props.onClick}
      type={props.type ?? "button"}
      disabled={props.disabled}
    >
      {children}
    </motion.button>
  );
}
