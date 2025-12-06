import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getIngresos, saveIngreso, getNextIngresoId } from "@/lib/storage";
import type { Ingreso, MonedaCode } from "@/types/finance";
import { Plus, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const categorias = [
  "Salario",
  "Freelance",
  "Inversiones",
  "Venta",
  "Regalo",
  "Reembolso",
  "Otro",
];

const monedas: { code: MonedaCode; label: string }[] = [
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
  { code: "MXN", label: "MXN" },
  { code: "COP", label: "COP" },
  { code: "ARS", label: "ARS" },
  { code: "PEN", label: "PEN" },
];

const IngresosPage = () => {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: 0,
    moneda: "MXN",
    categoria: "Salario",
  });

  const loadData = () => {
    setIngresos(getIngresos().reverse());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion || !formData.monto) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const ingreso: Ingreso = {
      id_ingreso: getNextIngresoId(),
      id_usuario: 1,
      descripcion: formData.descripcion,
      monto: formData.monto,
      moneda: formData.moneda,
      fecha: new Date().toISOString().split("T")[0],
      categoria: formData.categoria,
    };

    saveIngreso(ingreso);
    toast.success("Ingreso registrado exitosamente");
    setShowForm(false);
    loadData();
    setFormData({
      descripcion: "",
      monto: 0,
      moneda: "MXN",
      categoria: "Salario",
    });
  };

  const formatMoney = (amount: number, currency = "MXN") => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
  const ingresosPorCategoria = ingresos.reduce(
    (acc, i) => {
      acc[i.categoria] = (acc[i.categoria] || 0) + i.monto;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ingresos</h1>
            <p className="text-muted-foreground">
              Registra y gestiona tus entradas de dinero
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Ingreso
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Ingresos</p>
                  <p className="text-2xl font-bold">{formatMoney(totalIngresos)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registros</p>
                  <p className="text-2xl font-bold">{ingresos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/30">
                  <DollarSign className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Promedio</p>
                  <p className="text-2xl font-bold">
                    {formatMoney(ingresos.length > 0 ? totalIngresos / ingresos.length : 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lista de Ingresos */}
          <div className="lg:col-span-2">
            {ingresos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Sin ingresos registrados</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Comienza registrando tu primer ingreso
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Ingreso
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Historial de Ingresos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ingresos.map((ingreso) => (
                      <div
                        key={ingreso.id_ingreso}
                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                            <TrendingUp className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium">{ingreso.descripcion}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{ingreso.categoria}</span>
                              <span>•</span>
                              <span>
                                {format(new Date(ingreso.fecha), "dd MMM yyyy", {
                                  locale: es,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="font-bold text-success">
                          +{formatMoney(ingreso.monto, ingreso.moneda)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Categorías */}
          <div>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-lg">Por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(ingresosPorCategoria).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin datos
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(ingresosPorCategoria)
                      .sort((a, b) => b[1] - a[1])
                      .map(([categoria, monto]) => (
                        <div
                          key={categoria}
                          className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                        >
                          <span className="text-sm font-medium">{categoria}</span>
                          <span className="text-sm font-semibold text-success">
                            {formatMoney(monto)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Ingreso</DialogTitle>
            <DialogDescription>Registra una nueva entrada de dinero</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Input
                id="descripcion"
                placeholder="Ej: Pago de nómina"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto *</Label>
                <Input
                  id="monto"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.monto || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })
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
                    <SelectValue />
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
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Registrar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default IngresosPage;
