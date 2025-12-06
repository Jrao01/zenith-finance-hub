import { useState } from "react";
import { Deuda, Abono, MonedaCode } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { saveAbono, getNextAbonoId, calcularSaldoDeuda, saveDeuda } from "@/lib/storage";
import { toast } from "sonner";

interface AbonoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  deuda: Deuda | null;
}

const monedas: { code: MonedaCode; label: string }[] = [
  { code: "USD", label: "Dólar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "MXN", label: "Peso Mexicano (MXN)" },
  { code: "COP", label: "Peso Colombiano (COP)" },
  { code: "ARS", label: "Peso Argentino (ARS)" },
  { code: "PEN", label: "Sol Peruano (PEN)" },
];

export const AbonoForm = ({ open, onOpenChange, onSuccess, deuda }: AbonoFormProps) => {
  const [formData, setFormData] = useState({
    monto_abonado: 0,
    moneda: deuda?.moneda || "MXN",
    tipo_cambio: 1,
    nota: "",
  });

  const saldoActual = deuda ? calcularSaldoDeuda(deuda) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deuda) return;

    if (!formData.monto_abonado || formData.monto_abonado <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    if (formData.monto_abonado > saldoActual) {
      toast.error("El abono no puede ser mayor al saldo pendiente");
      return;
    }

    const nuevoRestante = saldoActual - formData.monto_abonado;

    const abono: Abono = {
      id_abono: getNextAbonoId(),
      id_deuda: deuda.id_deuda,
      fecha_abono: new Date().toISOString().split("T")[0],
      monto_abonado: formData.monto_abonado,
      moneda: formData.moneda,
      tipo_cambio: formData.tipo_cambio,
      restante_actual: nuevoRestante,
      nota: formData.nota,
    };

    saveAbono(abono);

    // Actualizar estado de la deuda
    const nuevoEstado = nuevoRestante <= 0 ? "pagada" : "en_progreso";
    saveDeuda({ ...deuda, estado_pago: nuevoEstado });

    toast.success("Abono registrado exitosamente");
    onOpenChange(false);
    onSuccess();
    setFormData({
      monto_abonado: 0,
      moneda: deuda.moneda,
      tipo_cambio: 1,
      nota: "",
    });
  };

  const formatMoney = (amount: number) => {
    if (!deuda) return "$0.00";
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: deuda.moneda,
    }).format(amount);
  };

  if (!deuda) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Abono</DialogTitle>
          <DialogDescription>Agrega un pago a "{deuda.descripcion}"</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted/50 p-4 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Saldo pendiente</span>
            <span className="font-bold text-foreground">{formatMoney(saldoActual)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto del Abono *</Label>
              <Input
                id="monto"
                type="number"
                min="0"
                step="0.01"
                max={saldoActual}
                placeholder="0.00"
                value={formData.monto_abonado || ""}
                onChange={(e) =>
                  setFormData({ ...formData, monto_abonado: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moneda">Moneda</Label>
              <Select
                value={formData.moneda}
                onValueChange={(value) => setFormData({ ...formData, moneda: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {monedas.map((m) => (
                    <SelectItem key={m.code} value={m.code}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.moneda !== deuda.moneda && (
            <div className="space-y-2">
              <Label htmlFor="tipoCambio">Tipo de Cambio</Label>
              <Input
                id="tipoCambio"
                type="number"
                min="0"
                step="0.0001"
                placeholder="1.0000"
                value={formData.tipo_cambio}
                onChange={(e) =>
                  setFormData({ ...formData, tipo_cambio: parseFloat(e.target.value) || 1 })
                }
              />
              <p className="text-xs text-muted-foreground">
                1 {formData.moneda} = {formData.tipo_cambio} {deuda.moneda}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nota">Nota (opcional)</Label>
            <Textarea
              id="nota"
              placeholder="Ej: Pago de nómina diciembre"
              value={formData.nota}
              onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1">
              Registrar Abono
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
