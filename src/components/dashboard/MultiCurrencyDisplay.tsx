import { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MultiCurrencyDisplayProps {
  totals: Record<string, number>;
  formatMoney: (amount: number, currency?: string) => string;
  title?: string;
}

export const MultiCurrencyDisplay = ({ totals, formatMoney, title = "Desglose por Moneda" }: MultiCurrencyDisplayProps) => {
  const keys = Object.keys(totals);
  
  if (keys.length === 0) return <span>{formatMoney(0)}</span>;
  if (keys.length === 1) return <span>{formatMoney(totals[keys[0]], keys[0])}</span>;

  const displayKeys = keys.slice(0, 3);
  const remainingKeys = keys.slice(3);

  return (
    <div className="flex flex-col gap-1 w-full">
      {displayKeys.map((k) => (
        <div key={k} className="text-base font-semibold flex justify-between gap-4">
          <span className="opacity-70 text-sm">{k}:</span>
          <span>{formatMoney(totals[k], k)}</span>
        </div>
      ))}
      
      {remainingKeys.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-full mt-1 flex items-center justify-center gap-1 hover:bg-accent/10 text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="text-[10px]">Ver {remainingKeys.length} más</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {keys.map((k) => (
                <div key={k} className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border">
                  <span className="font-medium">{k}</span>
                  <span className="font-bold text-accent">{formatMoney(totals[k], k)}</span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
