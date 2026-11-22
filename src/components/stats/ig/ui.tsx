import type { ReactNode } from "react";

export const IG_REF = "miraculixx";

export const inputClass =
  "h-11 w-full rounded-ig-sm border border-transparent bg-ig-medium-dark px-3 text-sm text-white placeholder:text-ig-medium-light outline-none transition focus:border-ig-orange";

export function formatMoney(value: number) {
  return `${value.toFixed(2)} €`;
}

export function localDay(value: string | number | Date) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDate(value: string | number) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function productLink(id: number, url: string) {
  return `https://www.instant-gaming.com/en/${id}-buy-${url}?igr=${IG_REF}`;
}

export function coverUrl(id: number, url: string, size: "380x218" | "616x353" = "380x218") {
  return `https://gaming-cdn.com/images/products/${id}/${size}/${url}-cover.jpg`;
}

export function DiscountBadge({ value, className = "" }: { value: number; className?: string }) {
  if (value <= 0) return null;
  return <span className={`ig-discount text-sm ${className}`}>-{value}%</span>;
}

export function PlatformIcon({ type, size = 16, className = "" }: { type: string; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/img/stats/${type.replace("|", "")}.svg`}
      alt={type}
      title={type}
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}

const TAG_TONES = {
  neutral: "bg-ig-medium-dark text-ig-very-light",
  orange: "bg-ig-orange/15 text-ig-hover",
  green: "bg-ig-green/15 text-ig-green",
  red: "bg-ig-red/15 text-ig-red",
};

export function Tag({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: keyof typeof TAG_TONES; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-ig-sm px-2 py-0.5 text-xs font-bold ${TAG_TONES[tone]} ${className}`}>{children}</span>;
}

export function StockDot({ inStock }: { inStock: boolean }) {
  return <span aria-hidden className={`inline-block h-2 w-2 shrink-0 rounded-full ${inStock ? "bg-ig-green" : "bg-ig-red"}`} />;
}

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wide text-ig-light">{label}</span>
      {children}
    </label>
  );
}

export function Toggle({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-ig-sm px-1 py-1.5 text-sm text-ig-very-light transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-ig-orange" : "bg-ig-medium"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export function Segmented<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="flex h-11 gap-1 overflow-x-auto rounded-ig-sm bg-ig-medium-dark p-1">
      {options.map((entry) => (
        <button
          key={entry.value}
          type="button"
          aria-pressed={value === entry.value}
          onClick={() => onChange(entry.value)}
          className={`flex-1 whitespace-nowrap rounded-[5px] px-4 text-sm font-bold transition ${value === entry.value ? "bg-ig-orange text-white" : "text-ig-light hover:text-white"}`}
        >
          {entry.label}
        </button>
      ))}
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-ig bg-ig-very-dark p-5 ${className}`}>
      {title || action ? (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-lg font-bold text-white">{title}</h2> : <span />}
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <p role="alert" className="rounded-ig-sm bg-ig-red/10 px-4 py-3 text-sm text-ig-red">{children}</p>;
}

export function ChartTooltip({ active, label, rows }: { active?: boolean; label?: ReactNode; rows: { name: string; value: string; color?: string; dashed?: boolean }[] }) {
  if (!active || rows.length === 0) return null;
  return (
    <div className="rounded-ig-sm border border-ig-medium bg-ig-ultra-dark/95 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-bold text-white">{label}</p>
      {rows.map((row) => (
        <p key={row.name} className="flex items-center gap-2 text-ig-very-light">
          {row.color ? <span aria-hidden className={`h-0.5 w-3 ${row.dashed ? "border-t-2 border-dashed bg-transparent" : ""}`} style={row.dashed ? { borderColor: row.color } : { background: row.color }} /> : null}
          <span>{row.name}</span>
          <span className="ml-auto pl-4 font-bold text-white">{row.value}</span>
        </p>
      ))}
    </div>
  );
}

export const CHART = {
  primary: "#ff5400",
  reference: "#a8a8a8",
  grid: "#323232",
  axis: "#6d6d6d",
  outOfStock: "#ff3235",
};
