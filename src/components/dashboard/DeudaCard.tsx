import { Deuda } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DeudaCardProps {
  deuda: Deuda;
  onAddAbono?: (deuda: Deuda) => void;
  onEdit?: (deuda: Deuda) => void;
  onDelete?: (id: number) => void;
}

const estadoStyles = {
  pendiente: "bg-warning/15 text-warning border-warning/30",
  en_progreso: "bg-accent/15 text-accent border-accent/30",
  pagada: "bg-success/15 text-success border-success/30",
  vencida: "bg-destructive/15 text-destructive border-destructive/30",
};

const estadoLabels = {
  pendiente: "Pendiente",
  en_progreso: "En Progreso",
  pagada: "Pagada",
  vencida: "Vencida",
};

export const DeudaCard = ({ deuda, onAddAbono, onEdit, onDelete }: DeudaCardProps) => {
  const totalPagado = Number(deuda.total_abonado || 0);
  const montoOriginal = Number(deuda.monto_total);
  const montoInteres = Number(deuda.monto_interes || 0);
  
  const montoTotal = deuda.interes_aplicado
    ? montoOriginal + montoInteres
    : montoOriginal;

  const saldoRestante = Math.max(0, montoTotal - totalPagado);
  const progreso = montoTotal > 0 ? (totalPagado / montoTotal) * 100 : 0;

  const currencyMap: Record<string, string> = {
    BS: "VES",
    USD: "USD",
    EUR: "EUR",
    MXN: "MXN",
    COP: "COP",
    ARS: "ARS",
    PEN: "PEN",
    CLP: "CLP",
    BRL: "BRL",
  };

  const formatMoney = (amount: number) => {
    const currency = currencyMap[deuda.moneda] ?? deuda.moneda;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <Card variant="elevated" className="animate-scale-in overflow-hidden">
      <div className="h-1 gradient-accent" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{deuda.descripcion}</CardTitle>
            <p className="text-sm text-muted-foreground">{deuda.acreedor}</p>
          </div>
          <Badge className={cn("border", estadoStyles[deuda.estado_pago])}>
            {estadoLabels[deuda.estado_pago]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Saldo pendiente</p>
            <p className="text-2xl font-bold text-foreground">{formatMoney(saldoRestante)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total original</p>
            <p className="text-sm font-medium text-muted-foreground">{formatMoney(montoTotal)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progreso de pago</span>
            <span className="font-medium">{progreso.toFixed(0)}%</span>
          </div>
          <Progress value={progreso} className="h-2" />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Vence:{" "}
              {format(new Date(deuda.fecha_pago_objetivo), "dd MMM yyyy", { locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{deuda.abonos_count || 0} abonos</span>
          </div>
        </div>

        {deuda.interes_aplicado && (
          <p className="text-xs text-muted-foreground">
            Interés: {deuda.tasa_interes}% ({formatMoney(deuda.monto_interes)})
          </p>
        )}

        {deuda.estado_pago !== "pagada" && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="accent" className="flex-1" onClick={() => onAddAbono?.(deuda)}>
              Agregar Abono
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit?.(deuda)}>
              Editar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
