import { useState, useEffect } from "react";
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
import { apiCreateAbono, apiGetAbonosByDeuda, apiGetDeudas } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AbonoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  deuda: Deuda | null;
}

const monedas: { code: MonedaCode; label: string }[] = [
  { code: "BS", label: "Bolivar (BS)" },
  { code: "USD", label: "Dólar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "MXN", label: "Peso Mexicano (MXN)" },
  { code: "COP", label: "Peso Colombiano (COP)" },
  { code: "ARS", label: "Peso Argentino (ARS)" },
  { code: "PEN", label: "Sol Peruano (PEN)" },
];

export const AbonoForm = ({ open, onOpenChange, onSuccess, deuda: initialDeuda }: AbonoFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [saldoActual, setSaldoActual] = useState(0);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [selectedDeudaId, setSelectedDeudaId] = useState<number | null>(null);
  const [currentDeuda, setCurrentDeuda] = useState<Deuda | null>(null);

  const [formData, setFormData] = useState({
    monto_abonado: 0,
    moneda: "BS",
    tipo_cambio: 1,
    nota: "",
  });

  // Efecto para sincronizar cuando se abre con una deuda específica
  useEffect(() => {
    if (open) {
      if (initialDeuda) {
        setCurrentDeuda(initialDeuda);
        setSelectedDeudaId(initialDeuda.id_deuda);
        setFormData(prev => ({
          ...prev,
          moneda: initialDeuda.moneda
        }));
      } else {
        // Si no hay deuda inicial, resetear selección
        setCurrentDeuda(null);
        setSelectedDeudaId(null);
      }
    }
  }, [open, initialDeuda]);

  // Cargar deudas pendientes del usuario
  useEffect(() => {
    const fetchDeudas = async () => {
      if (user && open && !initialDeuda) {
        const result = await apiGetDeudas(user.id_usuario);
        if (result.success && result.data) {
          const pendientes = result.data.filter(d => d.estado_pago !== 'pagada');
          setDeudas(pendientes);
          
          if (pendientes.length > 0 && !selectedDeudaId) {
            updateSelectedDeuda(pendientes[0].id_deuda, pendientes);
          }
        }
      }
    };

    fetchDeudas();
  }, [user, open, initialDeuda]);

  const updateSelectedDeuda = (deudaId: number, list: Deuda[]) => {
    const found = list.find(d => d.id_deuda === deudaId);
    if (found) {
      setSelectedDeudaId(deudaId);
      setCurrentDeuda(found);
      setFormData(prev => ({ ...prev, moneda: found.moneda }));
    }
  };

  const handleDeudaChange = (value: string) => {
    updateSelectedDeuda(parseInt(value), deudas);
  };

  // Calcular saldo actual
  useEffect(() => {
    const fetchSaldo = async () => {
      if (currentDeuda) {
        const result = await apiGetAbonosByDeuda(currentDeuda.id_deuda);
        const montoBase = Number(currentDeuda.monto_total);
        const interes = currentDeuda.interes_aplicado ? Number(currentDeuda.monto_interes || 0) : 0;
        const totalDeuda = montoBase + interes;

        if (result.success && result.data) {
          setSaldoActual(Math.max(0, totalDeuda - result.data.total_abonado));
        } else {
          setSaldoActual(totalDeuda);
        }
      }
    };

    if (open && currentDeuda) {
      fetchSaldo();
    }
  }, [open, currentDeuda]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentDeuda) {
      toast.error("Selecciona una deuda primero");
      return;
    }

    if (!formData.monto_abonado || formData.monto_abonado <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    if (formData.monto_abonado > saldoActual) {
      toast.error("No puedes abonar más del saldo pendiente");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiCreateAbono({
        id_deuda: currentDeuda.id_deuda,
        monto_abonado: formData.monto_abonado,
        moneda: formData.moneda,
        tipo_cambio: formData.tipo_cambio,
        nota: formData.nota,
      });

      if (result.success) {
        toast.success("Abono registrado");
        onOpenChange(false);
        onSuccess();
        setFormData({ monto_abonado: 0, moneda: currentDeuda.moneda, tipo_cambio: 1, nota: "" });
      } else {
        toast.error(result.error || "Error al registrar abono");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const currencyMap: Record<string, string> = {
    BS: "VES", USD: "USD", EUR: "EUR", MXN: "MXN",
    COP: "COP", ARS: "ARS", PEN: "PEN", CLP: "CLP", BRL: "BRL",
  };

  const formatMoney = (amount: number, currencyCode?: string) => {
    const code = currencyCode || (currentDeuda?.moneda || "USD");
    const currency = currencyMap[code] ?? code;
    return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Abono</DialogTitle>
          <DialogDescription>
            {currentDeuda 
              ? `Abono a: ${currentDeuda.descripcion}` 
              : "Selecciona una deuda para registrar un pago"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Deuda</Label>
            <Select 
              value={selectedDeudaId?.toString()} 
              onValueChange={handleDeudaChange}
              disabled={!!initialDeuda}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona deuda..." />
              </SelectTrigger>
              <SelectContent>
                {initialDeuda ? (
                   <SelectItem value={initialDeuda.id_deuda.toString()}>
                     {initialDeuda.descripcion}
                   </SelectItem>
                ) : (
                  deudas.map(d => (
                    <SelectItem key={d.id_deuda} value={d.id_deuda.toString()}>
                      {d.descripcion} ({formatMoney(Number(d.monto_total), d.moneda)})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {currentDeuda && (
            <div className="rounded-lg bg-muted/50 p-3 flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Saldo Pendiente:</span>
              <span className="font-bold">{formatMoney(saldoActual)}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto_abono">Monto *</Label>
              <Input
                id="monto_abono"
                type="number"
                step="0.01"
                value={formData.monto_abonado || ""}
                onChange={e => setFormData({...formData, monto_abonado: parseFloat(e.target.value) || 0})}
                disabled={!currentDeuda}
              />
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select 
                value={formData.moneda} 
                onValueChange={v => setFormData({...formData, moneda: v})}
                disabled={!currentDeuda}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monedas.map(m => <SelectItem key={m.code} value={m.code}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentDeuda && formData.moneda !== currentDeuda.moneda && (
            <div className="space-y-2 p-3 border rounded-lg bg-accent/5">
              <Label htmlFor="tc">Tipo de Cambio</Label>
              <Input
                id="tc"
                type="number"
                step="0.0001"
                value={formData.tipo_cambio}
                onChange={e => setFormData({...formData, tipo_cambio: parseFloat(e.target.value) || 1})}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                1 {formData.moneda} = {formData.tipo_cambio} {currentDeuda.moneda}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nota_abono">Nota</Label>
            <Textarea
              id="nota_abono"
              placeholder="Detalles del pago..."
              value={formData.nota}
              onChange={e => setFormData({...formData, nota: e.target.value})}
              disabled={!currentDeuda}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={isLoading || !currentDeuda}>
              {isLoading ? "Enviando..." : "Confirmar Abono"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
