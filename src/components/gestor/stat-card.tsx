import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatAccent = "default" | "yellow" | "sky" | "mint" | "rose" | "money";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: StatAccent;
  big?: boolean;
}

const iconBgStyles: Record<StatAccent, string> = {
  default:
    "bg-[color-mix(in_oklab,var(--brand)_14%,transparent)] text-[var(--brand)]",
  yellow:
    "bg-[color-mix(in_oklab,var(--yellow)_22%,transparent)] text-[#8C6900]",
  sky: "bg-[color-mix(in_oklab,var(--sky)_18%,transparent)] text-[var(--sky)]",
  mint: "bg-[color-mix(in_oklab,var(--mint)_18%,transparent)] text-[var(--mint)]",
  rose: "bg-[color-mix(in_oklab,var(--rose)_14%,transparent)] text-[var(--rose)]",
  money: "bg-white/[.18] text-[var(--brand-ink)]",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "default",
  big = false,
}: StatCardProps) {
  const isMoney = accent === "money";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] border p-4",
        "flex flex-col gap-1.5",
        isMoney
          ? "border-transparent bg-gradient-to-br from-[var(--brand)] to-[#ff8867] text-[var(--brand-ink)]"
          : "border-[var(--line)] bg-[var(--surface)]",
      )}
    >
      {/* icon background */}
      <div
        className={cn(
          "absolute -right-2 -top-2 grid h-14 w-14 place-items-center rounded-[14px] opacity-85",
          iconBgStyles[accent],
        )}
      >
        <Icon size={20} />
      </div>

      {/* label */}
      <div
        className={cn(
          "text-xs font-medium tracking-[0.01em]",
          isMoney ? "text-[var(--brand-ink)]" : "text-[var(--muted)]",
        )}
      >
        {label}
      </div>

      {/* value */}
      <div
        className={cn(
          "font-heading font-bold tracking-[-0.03em]",
          big ? "text-[28px]" : "text-[34px]",
          isMoney ? "text-[var(--brand-ink)]" : "",
        )}
      >
        {value}
      </div>
    </div>
  );
}
