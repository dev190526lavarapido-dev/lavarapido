import { cn } from "@/lib/utils";

interface PlacaTagProps {
  placa: string;
  size?: "sm" | "default" | "big";
}

export function PlacaTag({ placa, size = "default" }: PlacaTagProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-md border border-black font-mono font-semibold tracking-[0.16em] uppercase",
        "bg-gradient-to-b from-[#1A1413] to-[#2A211D] text-[#FFE8AC]",
        "shadow-[inset_0_0_0_2px_rgba(255,232,172,0.13),var(--shadow-sm)]",
        size === "sm" && "px-2 py-0.5 text-[11px]",
        size === "default" && "px-2.5 py-1 text-[13px]",
        size === "big" && "px-3.5 py-1.5 text-lg tracking-[0.2em]",
      )}
    >
      {placa.toUpperCase()}
    </span>
  );
}
