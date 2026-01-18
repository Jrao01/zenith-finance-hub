import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AbonoForm } from "@/components/forms/AbonoForm";
import { getDeudas, getAbonos, calcularSaldoDeuda } from "@/lib/storage";
import type { Deuda, Abono } from "@/types/finance";
import { ArrowDownCircle, Search, Plus, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AbonosPage = () => {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [filteredAbonos, setFilteredAbonos] = useState<Abono[]>([]);
  const [showAbonoForm, setShowAbonoForm] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState<Deuda | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDeuda, setFilterDeuda] = useState<string>("all");

  const loadData = () => {
    setDeudas(getDeudas());
    const allAbonos = getAbonos();
    setAbonos(allAbonos);
    applyFilters(allAbonos, searchTerm, filterDeuda);
  };

  const applyFilters = (data: Abono[], search: string, deudaId: string) => {
    let filtered = data;

    if (deudaId !== "all") {
      filtered = filtered.filter((a) => a.id_deuda === parseInt(deudaId));
    }

    if (search) {
      filtered = filtered.filter((a) => {
        const deuda = deudas.find((d) => d.id_deuda === a.id_deuda);
        return (
          deuda?.descripcion.toLowerCase().includes(search.toLowerCase()) ||
          a.nota?.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    setFilteredAbonos(filtered.reverse());
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters(abonos, searchTerm, filterDeuda);
  }, [searchTerm, filterDeuda, abonos, deudas]);

  const handleNewAbono = () => {
    if (deudas.filter((d) => d.estado_pago !== "pagada").length === 0) {
      return;
    }
    const activeDeuda = deudas.find((d) => d.estado_pago !== "pagada");
    if (activeDeuda) {
      setSelectedDeuda(activeDeuda);
      setShowAbonoForm(true);
    }
  };

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

  const formatMoney = (amount: number, currency = "MXN") => {
    const cur = currencyMap[currency] ?? currency;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: cur,
    }).format(amount);
  };

  const totalAbonado = abonos.reduce((sum, a) => sum + a.monto_abonado, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Abonos</h1>
            <p className="text-muted-foreground">
              Historial de todos tus pagos realizados
            </p>
          </div>
          <Button
            onClick={handleNewAbono}
            className="gap-2"
            disabled={deudas.filter((d) => d.estado_pago !== "pagada").length === 0}
          >
            <Plus className="h-4 w-4" />
            Nuevo Abono
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <TrendingDown className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Abonado</p>
                  <p className="text-2xl font-bold">{formatMoney(totalAbonado)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <ArrowDownCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagos Realizados</p>
                  <p className="text-2xl font-bold">{abonos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/30">
                  <TrendingDown className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Promedio por Abono</p>
                  <p className="text-2xl font-bold">
                    {formatMoney(abonos.length > 0 ? totalAbonado / abonos.length : 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar abonos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterDeuda} onValueChange={setFilterDeuda}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filtrar por deuda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las deudas</SelectItem>
              {deudas.map((d) => (
                <SelectItem key={d.id_deuda} value={d.id_deuda.toString()}>
                  {d.descripcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Abonos List */}
        {filteredAbonos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ArrowDownCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Sin abonos registrados</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {deudas.length === 0
                  ? "Primero registra una deuda para poder agregar abonos"
                  : "Comienza registrando tu primer pago"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-lg">Historial de Abonos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAbonos.map((abono) => {
                  const deuda = deudas.find((d) => d.id_deuda === abono.id_deuda);
                  return (
                    <div
                      key={abono.id_abono}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                          <ArrowDownCircle className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{deuda?.descripcion || "Deuda"}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(abono.fecha_abono), "dd MMMM yyyy", {
                              locale: es,
                            })}
                          </p>
                          {abono.nota && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {abono.nota}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">
                          -{formatMoney(abono.monto_abonado, abono.moneda)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Restante: {formatMoney(abono.restante_actual, deuda?.moneda)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AbonoForm
        open={showAbonoForm}
        onOpenChange={setShowAbonoForm}
        onSuccess={loadData}
        deuda={selectedDeuda}
      />
    </MainLayout>
  );
};

export default AbonosPage;
