import { STATUS_META, type LavagemStatus, type EventoStatus } from "@/lib/constants";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvento {
  status: EventoStatus;
  descricao?: string;
  created_at: string;
}

interface TimelineProps {
  eventos: TimelineEvento[];
  animateLast?: boolean;
}

// Chaves mapeadas por className (não pelo status diretamente), então mantemos string
const markerColors: Record<string, string> = {
  aguardando:
    "bg-st-aguardando border-st-aguardando text-[#6b4d00]",
  lavando: "bg-st-lavando border-st-lavando text-white",
  concluida: "bg-st-concluida border-st-concluida text-white",
  ocorrencia: "bg-st-ocorrencia border-st-ocorrencia text-white",
  retirado: "bg-st-retirado border-st-retirado text-white",
  entrada: "bg-foreground border-foreground text-background",
};

function formatHM(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const titleMap: Record<EventoStatus, string> = {
  entrada: "Carro deu entrada",
  aguardando_lavagem: "Aguardando lavagem",
  lavando: "Lavagem em andamento",
  lavagem_concluida: "Lavagem concluida",
  ocorrencia: "Ocorrencia",
  retirado: "Carro retirado",
};

export function Timeline({ eventos, animateLast = false }: TimelineProps) {
  return (
    <div className="relative flex flex-col pl-3">
      {eventos.map((ev, i) => {
        const meta = STATUS_META[ev.status as LavagemStatus];
        const klass = ev.status === "entrada" ? "entrada" : (meta?.className ?? "entrada");
        const IconComponent = ev.status === "entrada" ? Car : (meta?.icon ?? Car);
        const isLast = i === eventos.length - 1;
        const isCurrent = isLast && ev.status !== "retirado";

        return (
          <div
            key={i}
            className={cn(
              "relative grid grid-cols-[28px_1fr] gap-3.5 pb-5 pt-1.5",
              animateLast && isLast && "animate-in fade-in slide-in-from-top-2 duration-350",
            )}
          >
            {/* Connector line */}
            {!isLast && (
              <div className="absolute left-[25px] top-7 bottom-[-4px] w-0.5 bg-border" />
            )}

            {/* Marker */}
            <div
              className={cn(
                "z-10 grid h-7 w-7 flex-none place-items-center rounded-full border-2",
                markerColors[klass] ?? "bg-card border-border text-foreground",
                isCurrent && "animate-pulse shadow-[0_0_0_6px_rgba(var(--ring),0.18)]",
              )}
            >
              <IconComponent size={14} />
            </div>

            {/* Body */}
            <div className="pt-0.5">
              <div className="text-sm font-semibold">
                {titleMap[ev.status] ?? ev.status}
              </div>
              {ev.descricao && ev.descricao !== ev.status && (
                <div className="mt-0.5 text-[13px] text-muted-foreground">
                  {ev.descricao}
                </div>
              )}
              <div className="mt-2 font-mono text-xs text-muted-foreground">
                {formatHM(ev.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
