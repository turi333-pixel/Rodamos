"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "dark" | "sm" | "bmw";
  delay?: number;
  animate?: boolean;
  children: React.ReactNode;
}

export function GlassCard({
  variant = "default",
  delay = 0,
  animate = true,
  children,
  className,
  ...props
}: GlassCardProps) {
  const variantClass = {
    default: "glass-card",
    dark: "glass-card-dark",
    sm: "glass-card-sm",
    bmw: "glass-card bmw-gradient-border",
  }[variant];

  if (!animate) {
    return (
      <div className={cn(variantClass, className)} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.32, 0.72, 0, 1] }}
      className={cn(variantClass, className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ─── Card Section Header ──────────────────────────────────────────────────────

interface CardHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  className?: string;
}

export function CardHeader({ icon, title, subtitle, badge, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-4", className)}>
      <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-bmw-500 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-zinc-400 mt-0.5 truncate">{subtitle}</p>}
      </div>
      {badge && <div className="flex-shrink-0">{badge}</div>}
    </div>
  );
}
