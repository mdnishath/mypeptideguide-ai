import { Activity, Brain, Droplets, Heart, Hourglass, Moon, ShieldCheck, Sparkles, Sun, TrendingUp, type LucideProps } from "lucide-react";
import type { GoalSlug } from "@/core/schema";

const ICON: Record<GoalSlug, React.ComponentType<LucideProps>> = {
  sleep: Moon,
  "weight-loss": Activity,
  "muscle-growth": TrendingUp,
  recovery: ShieldCheck,
  longevity: Hourglass,
  cognitive: Brain,
  "skin-hair": Droplets,
  libido: Heart,
  immune: Sparkles,
  energy: Sun,
};

export function GoalIcon({ goal, size = 18, className = "" }: { goal: GoalSlug; size?: number; className?: string }) {
  const Icon = ICON[goal];
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" className={className} />;
}
