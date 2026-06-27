"use client";
import { motion } from "framer-motion";
import { CardShell } from "@/components/ui/CardShell";

interface AIRecommendationsCardProps {
  recommendations: string[];
  aiSummary: string;
}

export function AIRecommendationsCard({ recommendations, aiSummary }: AIRecommendationsCardProps) {
  return (
    <CardShell theme="ai" icon="🤖" title="Recomendaciones IA" subtitle="Como un amigo experto que te aconseja" delay={0.5}>

      {/* AI Summary block */}
      <div className="relative p-4 rounded-2xl mb-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)", border: "1px solid rgba(99,102,241,0.25)" }}>
        {/* Quote mark decoration */}
        <div className="absolute -top-2 -left-1 text-6xl font-serif leading-none pointer-events-none select-none"
          style={{ color: "rgba(99,102,241,0.15)" }}>
          "
        </div>
        <p className="text-sm leading-relaxed relative z-10" style={{ color: "rgba(210,210,240,0.92)" }}>
          {aiSummary}
        </p>
      </div>

      {/* Recommendations list */}
      <div className="space-y-2.5">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex items-start gap-3 p-3.5 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
              style={{
                background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
                boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
                color: "white",
              }}>
              {i + 1}
            </div>
            <p className="text-sm leading-snug" style={{ color: "rgba(210,210,230,0.88)" }}>{rec}</p>
          </motion.div>
        ))}
      </div>
    </CardShell>
  );
}
