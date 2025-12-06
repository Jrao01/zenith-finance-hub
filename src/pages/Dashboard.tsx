import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DeudaCard } from "@/components/dashboard/DeudaCard";
import { DeudaForm } from "@/components/forms/DeudaForm";
import { AbonoForm } from "@/components/forms/AbonoForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getDeudas,
  calcularSaldoDeuda,
  calcularTotalDeudas,
  getAbonos,
} from "@/lib/storage";
import type { Deuda, Abono } from "@/types/finance";
import {
  CreditCard,
  TrendingDown,
  Calendar,
  Plus,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { es } from "date-fns/locale";

const Dashboard = () => {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [showDeudaForm, setShowDeudaForm] = useState(false);
  const [showAbonoForm, setShowAbonoForm] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState<Deuda | null>(null);
  const [editingDeuda, setEditingDeuda] = useState<Deuda | null>(null);

  const loadData = () => {
    setDeudas(getDeudas());
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalDeudas = calcularTotalDeudas();
  const deudasActivas = deudas.filter((d) => d.estado_pago !== "pagada").length;
  const abonos = getAbonos();
  const ultimosAbonos = abonos.slice(-5).reverse();

  // Próximos vencimientos (próximos 30 días)
  const hoy = new Date();
  const proximosVencimientos = deudas
    .filter((d) => {
      const fechaVenc = new Date(d.fecha_pago_objetivo);
      return d.estado_pago !== "pagada" && isAfter(fechaVenc, hoy) && isBefore(fechaVenc, addDays(hoy, 30));
    })
    .sort((a, b) => new Date(a.fecha_pago_objetivo).getTime() - new Date(b.fecha_pago_objetivo).getTime())
    .slice(0, 5);

  const handleAddAbono = (deuda: Deuda) => {
    setSelectedDeuda(deuda);
    setShowAbonoForm(true);
  };

  const handleEditDeuda = (deuda: Deuda) => {
    setEditingDeuda(deuda);
    setShowDeudaForm(true);
  };

  const formatMoney = (amount: number, currency = "MXN") => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
            <p className="text-muted-foreground">
              Resumen de tus finanzas personales
            </p>
          </div>
          <Button onClick={() => {
            setEditingDeuda(null);
            setShowDeudaForm(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Deuda
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Deudas"
            value={formatMoney(totalDeudas)}
            subtitle={`${deudasActivas} deudas activas`}
            icon={<CreditCard className="h-6 w-6 text-primary" />}
            trend="neutral"
          />
          <StatCard
            title="Abonos Realizados"
            value={abonos.length.toString()}
            subtitle="Total de pagos"
            icon={<TrendingDown className="h-6 w-6 text-accent" />}
            trend="up"
          />
          <StatCard
            title="Próximo Vencimiento"
            value={
              proximosVencimientos[0]
                ? format(new Date(proximosVencimientos[0].fecha_pago_objetivo), "dd MMM", {
                    locale: es,
                  })
                : "Sin vencimientos"
            }
            subtitle={proximosVencimientos[0]?.descripcion || ""}
            icon={<Calendar className="h-6 w-6 text-secondary" />}
            trend="neutral"
          />
          <StatCard
            title="Deudas Pagadas"
            value={deudas.filter((d) => d.estado_pago === "pagada").length.toString()}
            subtitle="Completadas"
            icon={<ArrowUpRight className="h-6 w-6 text-success" />}
            trend="up"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Deudas List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mis Deudas</h2>
              <Badge variant="secondary">{deudasActivas} activas</Badge>
            </div>
            {deudas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Sin deudas registradas</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Comienza registrando tu primera deuda o préstamo
                  </p>
                  <Button onClick={() => setShowDeudaForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Deuda
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {deudas.map((deuda) => (
                  <DeudaCard
                    key={deuda.id_deuda}
                    deuda={deuda}
                    onAddAbono={handleAddAbono}
                    onEdit={handleEditDeuda}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Próximos Vencimientos */}
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  Próximos Vencimientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {proximosVencimientos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin vencimientos próximos
                  </p>
                ) : (
                  <div className="space-y-3">
                    {proximosVencimientos.map((deuda) => (
                      <div
                        key={deuda.id_deuda}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{deuda.descripcion}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(deuda.fecha_pago_objetivo), "dd MMM yyyy", {
                              locale: es,
                            })}
                          </p>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatMoney(calcularSaldoDeuda(deuda), deuda.moneda)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Últimos Abonos */}
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-accent" />
                  Últimos Abonos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ultimosAbonos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin abonos registrados
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ultimosAbonos.map((abono) => {
                      const deuda = deudas.find((d) => d.id_deuda === abono.id_deuda);
                      return (
                        <div
                          key={abono.id_abono}
                          className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {deuda?.descripcion || "Deuda"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(abono.fecha_abono), "dd MMM yyyy", {
                                locale: es,
                              })}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-accent">
                            -{formatMoney(abono.monto_abonado, abono.moneda)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <DeudaForm
        open={showDeudaForm}
        onOpenChange={(open) => {
          setShowDeudaForm(open);
          if (!open) setEditingDeuda(null);
        }}
        onSuccess={loadData}
        deudaToEdit={editingDeuda}
      />

      <AbonoForm
        open={showAbonoForm}
        onOpenChange={setShowAbonoForm}
        onSuccess={loadData}
        deuda={selectedDeuda}
      />
    </MainLayout>
  );
};

export default Dashboard;
