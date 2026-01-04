interface PriceDisplayProps {
  value: number;
  locale?: string;
  symbol?: string;
  showSymbol?: boolean;
  symbolPosition?: "before" | "after";
  compact?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  className?: string;
}

const defaultSymbols: Record<string, string> = {
  "vi-VN": "₫",
  "en-US": "$",
  "ja-JP": "¥",
  "en-GB": "£",
  "de-DE": "€",
};

export default function PriceDisplay({
  value,
  locale = "en-US",
  symbol,
  showSymbol = false,
  symbolPosition,
  compact = false,
  minimumFractionDigits = 0,
  maximumFractionDigits = 0,
  className,
}: PriceDisplayProps) {
  // Check 1: invalid value
  if (typeof value !== "number" || isNaN(value)) {
    return <span className={className}>—</span>;
  }

  // Check 2: fractionDigits valid
  if (minimumFractionDigits > maximumFractionDigits) {
    maximumFractionDigits = minimumFractionDigits;
  }

  // Check 3: resolve symbol & position safely
  const resolvedSymbol = String(symbol ?? defaultSymbols[locale] ?? "");
  const validPositions = ["before", "after"] as const;
  const resolvedPosition = validPositions.includes(symbolPosition || "before")
    ? symbolPosition
    : locale === "en-US"
    ? "before"
    : "after";

  // Check 4: safe formatter with fallback locale
  let formatter: Intl.NumberFormat;
  try {
    formatter = new Intl.NumberFormat(locale, {
      notation: compact ? "compact" : "standard",
      minimumFractionDigits,
      maximumFractionDigits,
    });
  } catch {
    formatter = new Intl.NumberFormat("vi-VN", {
      notation: compact ? "compact" : "standard",
      minimumFractionDigits,
      maximumFractionDigits,
    });
  }

  const formattedValue = formatter.format(value);

  return (
    <span className={className}>
      {showSymbol && resolvedPosition === "before" && resolvedSymbol}
      {formattedValue}
      {showSymbol && resolvedPosition === "after" && resolvedSymbol}
    </span>
  );
}
