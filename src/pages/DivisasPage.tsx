import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

// Tipos de cambio simulados (en producción conectarías a una API real)
const tiposCambio = [
  { codigo: "USD", nombre: "Dólar Estadounidense", simbolo: "$", valor: 17.25, cambio: 0.15 },
  { codigo: "EUR", nombre: "Euro", simbolo: "€", valor: 18.80, cambio: -0.08 },
  { codigo: "GBP", nombre: "Libra Esterlina", simbolo: "£", valor: 21.85, cambio: 0.22 },
  { codigo: "CAD", nombre: "Dólar Canadiense", simbolo: "$", valor: 12.65, cambio: 0.05 },
  { codigo: "JPY", nombre: "Yen Japonés", simbolo: "¥", valor: 0.115, cambio: -0.002 },
  { codigo: "BRL", nombre: "Real Brasileño", simbolo: "R$", valor: 3.45, cambio: 0.03 },
  { codigo: "ARS", nombre: "Peso Argentino", simbolo: "$", valor: 0.019, cambio: -0.001 },
  { codigo: "COP", nombre: "Peso Colombiano", simbolo: "$", valor: 0.0042, cambio: 0.0001 },
];

const DivisasPage = () => {
  const [monto, setMonto] = useState<number>(100);
  const [monedaOrigen, setMonedaOrigen] = useState("USD");
  const [lastUpdate] = useState(new Date());

  const monedaSeleccionada = tiposCambio.find((t) => t.codigo === monedaOrigen);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Divisas</h1>
            <p className="text-muted-foreground">
              Consulta tipos de cambio actualizados
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
            <span>
              Última actualización:{" "}
              {lastUpdate.toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Conversor */}
        <Card variant="elevated" className="overflow-hidden">
          <div className="h-1 gradient-gold" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-secondary" />
              Convertidor de Divisas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto</label>
                <Input
                  type="number"
                  min="0"
                  value={monto}
                  onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Moneda</label>
                <div className="grid grid-cols-4 gap-2">
                  {tiposCambio.slice(0, 4).map((t) => (
                    <Button
                      key={t.codigo}
                      variant={monedaOrigen === t.codigo ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMonedaOrigen(t.codigo)}
                    >
                      {t.codigo}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {tiposCambio.slice(4).map((t) => (
                    <Button
                      key={t.codigo}
                      variant={monedaOrigen === t.codigo ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMonedaOrigen(t.codigo)}
                    >
                      {t.codigo}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Equivalente en MXN</label>
                <div className="flex h-11 items-center rounded-lg bg-muted px-4">
                  <span className="text-2xl font-bold">
                    $
                    {(monto * (monedaSeleccionada?.valor || 1)).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="ml-2 text-muted-foreground">MXN</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Divisas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiposCambio.map((divisa) => (
            <Card
              key={divisa.codigo}
              variant="stat"
              className="cursor-pointer transition-all hover:scale-[1.02]"
              onClick={() => setMonedaOrigen(divisa.codigo)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{divisa.simbolo}</span>
                      <span className="text-lg font-semibold">{divisa.codigo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{divisa.nombre}</p>
                  </div>
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      divisa.cambio >= 0
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {divisa.cambio >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {divisa.cambio >= 0 ? "+" : ""}
                    {divisa.cambio.toFixed(3)}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">1 {divisa.codigo} =</p>
                  <p className="text-xl font-bold">${divisa.valor.toFixed(4)} MXN</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nota informativa */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <DollarSign className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium">Información importante</p>
              <p className="text-xs text-muted-foreground">
                Los tipos de cambio mostrados son referenciales. Para transacciones reales,
                consulta con tu institución financiera.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DivisasPage;
