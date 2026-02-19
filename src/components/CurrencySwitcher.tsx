import { useCurrency, SUPPORTED_CURRENCIES } from "@/hooks/useCurrency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export const CurrencySwitcher = () => {
  const { currency, setCurrencyCode } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md border border-border/40 hover:border-border bg-transparent">
          <span>{currency.flag}</span>
          <span>{currency.code}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] bg-popover border-border z-50">
        {SUPPORTED_CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrencyCode(c.code)}
            className={`flex items-center gap-2 text-sm cursor-pointer ${
              c.code === currency.code ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            <span>{c.flag}</span>
            <span>{c.code}</span>
            <span className="ml-auto text-xs text-muted-foreground">{c.symbol}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
