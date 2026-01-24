import { useState } from "react";
import { Deuda, MonedaCode } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { apiCreateDeuda, apiUpdateDeuda } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DeudaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  deudaToEdit?: Deuda | null;
}

const monedas: { code: MonedaCode; label: string }[] = [
  { code: "USD", label: "Dólar (USD)" },
  { code: "BS", label: "Bolivar (BS)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "MXN", label: "Peso Mexicano (MXN)" },
  { code: "COP", label: "Peso Colombiano (COP)" },
  { code: "ARS", label: "Peso Argentino (ARS)" },
  { code: "PEN", label: "Sol Peruano (PEN)" },
];

export const DeudaForm = ({ open, onOpenChange, onSuccess, deudaToEdit }: DeudaFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Deuda>>(
    deudaToEdit || {
      descripcion: "",
      acreedor: "",
      monto_total: 0,
      moneda: "USD",
      fecha_pago_objetivo: "",
      recordatorio: true,
      interes_aplicado: false,
      tasa_interes: 0,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion || !formData.monto_total || !formData.fecha_pago_objetivo) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!user) {
      toast.error("Debes iniciar sesión para crear una deuda");
      return;
    }

    setIsLoading(true);

    try {
      if (deudaToEdit) {
        // Actualizar deuda existente
        const result = await apiUpdateDeuda(deudaToEdit.id_deuda, {
          descripcion: formData.descripcion || "",
          acreedor: formData.acreedor || "",
          monto_total: formData.monto_total || 0,
          moneda: formData.moneda || "USD",
          fecha_pago_objetivo: formData.fecha_pago_objetivo || "",
          recordatorio: formData.recordatorio || false,
          interes_aplicado: formData.interes_aplicado || false,
          tasa_interes: formData.tasa_interes || 0,
        });

        if (result.success) {
          toast.success("Deuda actualizada exitosamente");
          onOpenChange(false);
          onSuccess();
          resetForm();
        } else {
          toast.error(result.error || "Error al actualizar la deuda");
        }
      } else {
        // Crear nueva deuda
        const result = await apiCreateDeuda({
          id_usuario: user.id_usuario,
          descripcion: formData.descripcion || "",
          acreedor: formData.acreedor || "",
          monto_total: formData.monto_total || 0,
          moneda: formData.moneda || "USD",
          fecha_pago_objetivo: formData.fecha_pago_objetivo || "",
          recordatorio: formData.recordatorio || false,
          interes_aplicado: formData.interes_aplicado || false,
          tasa_interes: formData.tasa_interes || 0,
        });

        if (result.success) {
          toast.success("Deuda registrada exitosamente");
          onOpenChange(false);
          onSuccess();
          resetForm();
        } else {
          toast.error(result.error || "Error al crear la deuda");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: "",
      acreedor: "",
      monto_total: 0,
      moneda: "USD",
      fecha_pago_objetivo: "",
      recordatorio: true,
      interes_aplicado: false,
      tasa_interes: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{deudaToEdit ? "Editar Deuda" : "Nueva Deuda"}</DialogTitle>
          <DialogDescription>
            {deudaToEdit
              ? "Modifica los detalles de tu deuda"
              : "Registra una nueva deuda o préstamo"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Input
              id="descripcion"
              placeholder="Ej: Préstamo personal"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="acreedor">Acreedor</Label>
            <Input
              id="acreedor"
              placeholder="Ej: Banco XYZ"
              value={formData.acreedor}
              onChange={(e) => setFormData({ ...formData, acreedor: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto Total *</Label>
              <Input
                id="monto"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.monto_total || ""}
                onChange={(e) =>
                  setFormData({ ...formData, monto_total: parseFloat(e.target.value) || 0 })
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

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha de Pago Objetivo *</Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha_pago_objetivo}
              onChange={(e) => setFormData({ ...formData, fecha_pago_objetivo: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="interes">Aplicar Interés</Label>
              <p className="text-xs text-muted-foreground">Agrega interés al monto total</p>
            </div>
            <Switch
              id="interes"
              checked={formData.interes_aplicado}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, interes_aplicado: checked })
              }
            />
          </div>

          {formData.interes_aplicado && (
            <div className="space-y-2">
              <Label htmlFor="tasa">Tasa de Interés (%)</Label>
              <Input
                id="tasa"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                value={formData.tasa_interes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tasa_interes: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="recordatorio">Recordatorios</Label>
              <p className="text-xs text-muted-foreground">Recibe alertas de vencimiento</p>
            </div>
            <Switch
              id="recordatorio"
              checked={formData.recordatorio}
              onCheckedChange={(checked) => setFormData({ ...formData, recordatorio: checked })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Guardando..." : (deudaToEdit ? "Guardar Cambios" : "Registrar Deuda")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
