import { ORBIT_INNER, ORBIT_OUTER } from "@/data/tools";
import { ToolLogo } from "@/components/marketing/layout/tool-logo";
import { Tool } from "@/types";

export function ToolsOrbit() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-visible sm:max-w-[480px] lg:max-w-[500px] xl:max-w-[560px]">
      {/* Visual ring tracks */}
      <div className="absolute inset-0 rounded-full border border-border/10" />
      <div className="absolute inset-[8%] rounded-full border border-border/10" />
      <div className="absolute inset-[23%] rounded-full border border-border/10" />

      {/* Center piece */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="relative grid h-28 w-28 place-items-center rounded-full bg-card shadow-elegant border border-border sm:h-40 sm:w-40">
          {/* Inner decorative dashed spinning ring */}
          <div className="absolute inset-1.5 rounded-full border border-dashed border-border/40 animate-orbit-reverse" />
          
          <div className="relative flex flex-col items-center justify-center text-center z-10">
            <div className="font-display text-3.5xl font-extrabold text-gradient leading-none sm:text-4.5xl">80+</div>
            <div className="mt-1.5 px-1 text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-muted-foreground sm:text-[10.5px]">
              Professional &amp; AI
              <span className="block mt-0.5 text-primary/80">Tools</span>
            </div>
            <div className="mx-auto mt-2 h-[2px] w-8 rounded-full" style={{ backgroundImage: 'var(--gradient-brand)' }} />
          </div>
        </div>
      </div>

      <Ring tools={ORBIT_OUTER} radiusPct={42} className="animate-orbit" />
      <Ring tools={ORBIT_INNER} radiusPct={27} className="animate-orbit-reverse" />
    </div>
  );
}

function Ring({
  tools,
  radiusPct,
  className,
}: {
  tools: Tool[];
  radiusPct: number;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 ${className ?? ""}`}>
      {tools.map((t, i) => {
        const angle = (i / tools.length) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + radiusPct * Math.cos(angle);
        const y = 50 + radiusPct * Math.sin(angle);

        return (
          <div
            key={t.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
          >
            <div
              className={radiusPct > 40 ? "animate-orbit-reverse" : "animate-orbit"}
              style={{ animationDuration: radiusPct > 40 ? "40s" : "55s" }}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="group relative grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-card border border-border shadow-sm transition-transform hover:scale-110 sm:h-16 sm:w-16"
                  title={t.name}
                >
                  <div className="absolute inset-0 rounded-full bg-primary opacity-0 transition group-hover:opacity-[0.06]" />
                  <ToolLogo tool={t} className="h-7 w-7 sm:h-10 sm:w-10" />
                </div>
                <span className="hidden sm:block max-w-[96px] whitespace-nowrap text-center text-[9px] font-semibold leading-tight text-muted-foreground sm:max-w-[120px] sm:text-[11px]">
                  {t.name}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

