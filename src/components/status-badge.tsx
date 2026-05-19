import { STATUS_META, type LavagemStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  aguardando:
    "bg-[color-mix(in_oklab,var(--st-aguardando)_22%,transparent)] text-[#8C6900] border-[color-mix(in_oklab,var(--st-aguardando)_50%,transparent)]",
  lavando:
    "bg-[color-mix(in_oklab,var(--st-lavando)_18%,transparent)] text-[#1E5A85] border-[color-mix(in_oklab,var(--st-lavando)_40%,transparent)]",
  concluida:
    "bg-[color-mix(in_oklab,var(--st-concluida)_18%,transparent)] text-[#1A6E55] border-[color-mix(in_oklab,var(--st-concluida)_40%,transparent)]",
  ocorrencia:
    "bg-[color-mix(in_oklab,var(--st-ocorrencia)_18%,transparent)] text-[#B62144] border-[color-mix(in_oklab,var(--st-ocorrencia)_40%,transparent)]",
  retirado: "bg-muted text-muted-foreground border-border",
};

interface StatusBadgeProps {
  status: LavagemStatus;
  size?: "sm" | "default";
}

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  if (!meta) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        statusStyles[meta.className],
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-90"
        aria-hidden
      />
      {meta.label}
    </span>
  );
}
