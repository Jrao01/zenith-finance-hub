import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AbonoForm } from "@/components/forms/AbonoForm";
import { apiGetDeudas, apiGetAbonos } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Deuda, Abono } from "@/types/finance";
import { ArrowDownCircle, Search, Plus, TrendingDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MultiCurrencyDisplay } from "@/components/dashboard/MultiCurrencyDisplay";

const AbonosPage = () => {
  const { user } = useAuth();
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [filteredAbonos, setFilteredAbonos] = useState<Abono[]>([]);
  const [showAbonoForm, setShowAbonoForm] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState<Deuda | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDeuda, setFilterDeuda] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingAbono, setEditingAbono] = useState<Abono | null>(null);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const deudasRes = await apiGetDeudas(user.id_usuario);
      const abonosRes = await apiGetAbonos({ id_usuario: user.id_usuario });
      
      if (deudasRes.success) setDeudas(deudasRes.data || []);
      if (abonosRes.success) {
        setAbonos(abonosRes.data || []);
        applyFilters(abonosRes.data || [], searchTerm, filterDeuda, deudasRes.data || []);
      }
    } catch (error) {
      console.error("Error cargando abonos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (data: Abono[], search: string, deudaId: string, currentDeudas: Deuda[]) => {
    let filtered = [...data];

    if (deudaId !== "all") {
      filtered = filtered.filter((a) => a.id_deuda === parseInt(deudaId));
    }

    if (search) {
      filtered = filtered.filter((a) => {
        // @ts-ignore - Deuda is joined in backend
        const joinedDeuda = a.Deuda;
        const localDeuda = currentDeudas.find((d) => d.id_deuda === a.id_deuda);
        const descripcion = joinedDeuda?.descripcion || localDeuda?.descripcion || "";
        
        return (
          descripcion.toLowerCase().includes(search.toLowerCase()) ||
          a.nota?.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    setFilteredAbonos(filtered); // La API ya los trae ordenados
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    applyFilters(abonos, searchTerm, filterDeuda, deudas);
  }, [searchTerm, filterDeuda, abonos, deudas]);

  const handleNewAbono = () => {
    const activeDeudas = deudas.filter((d) => d.estado_pago !== "pagada");
    if (activeDeudas.length === 0) {
      toast.error("No tienes deudas activas para abonar");
      return;
    }
    // Pasamos null para que el formulario habilite el selector de deudas
    setSelectedDeuda(null);
    setShowAbonoForm(true);
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

  const formatMoney = (amount: number, currency = "USD") => {
    const cur = currencyMap[currency] ?? currency;
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: cur,
    }).format(amount);
  };

  const totalAbonadoValue = abonos.reduce((sum, a) => sum + Number(a.monto_abonado), 0);

  // Calcular totales y promedios por moneda
  const abonosPorMoneda = abonos.reduce((acc, a) => {
    if (!acc[a.moneda]) acc[a.moneda] = { total: 0, count: 0 };
    acc[a.moneda].total += Number(a.monto_abonado);
    acc[a.moneda].count += 1;
    return acc;
  }, {} as Record<string, { total: number, count: number }>);

  const totalesPorMoneda = Object.keys(abonosPorMoneda).reduce((acc, k) => {
    acc[k] = abonosPorMoneda[k].total;
    return acc;
  }, {} as Record<string, number>);

  const promediosPorMoneda = Object.keys(abonosPorMoneda).reduce((acc, k) => {
    acc[k] = abonosPorMoneda[k].total / abonosPorMoneda[k].count;
    return acc;
  }, {} as Record<string, number>);

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
            disabled={isLoading || deudas.filter((d) => d.estado_pago !== "pagada").length === 0}
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
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-muted-foreground">Total Abonado</p>
                  <div className="mt-1">
                    {isLoading ? (
                      <div className="text-2xl font-bold">---</div>
                    ) : (
                      <MultiCurrencyDisplay 
                        totals={totalesPorMoneda} 
                        formatMoney={formatMoney} 
                        title="Resumen de Abonos" 
                      />
                    )}
                  </div>
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
                  <p className="text-2xl font-bold">{isLoading ? "---" : abonos.length}</p>
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
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-muted-foreground">Promedio por Abono</p>
                  <div className="mt-1">
                    {isLoading ? (
                      <div className="text-2xl font-bold">---</div>
                    ) : (
                      <MultiCurrencyDisplay 
                        totals={promediosPorMoneda} 
                        formatMoney={formatMoney} 
                        title="Promedio por Moneda" 
                      />
                    )}
                  </div>
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
              disabled={isLoading}
            />
          </div>
          <Select value={filterDeuda} onValueChange={setFilterDeuda} disabled={isLoading}>
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground italic">Cargando historial de abonos...</p>
          </div>
        ) : filteredAbonos.length === 0 ? (
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
                  // @ts-ignore - Deuda is joined in backend
                  const joinedDeuda = abono.Deuda;
                  const localDeuda = deudas.find((d) => d.id_deuda === abono.id_deuda);
                  const deuda = joinedDeuda || localDeuda;
                  
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
                          -{formatMoney(Number(abono.monto_abonado), abono.moneda)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Restante: {formatMoney(Number(abono.restante_actual), deuda?.moneda)}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-[10px] mt-1 text-muted-foreground hover:text-accent"
                          onClick={() => {
                            setEditingAbono(abono);
                            setShowAbonoForm(true);
                          }}
                        >
                          Editar
                        </Button>
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
        onOpenChange={(open) => {
          setShowAbonoForm(open);
          if (!open) setEditingAbono(null);
        }}
        onSuccess={loadData}
        deuda={selectedDeuda}
        abonoToEdit={editingAbono}
      />
    </MainLayout>
  );
};

export default AbonosPage;
