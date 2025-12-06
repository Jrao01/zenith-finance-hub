import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DeudaCard } from "@/components/dashboard/DeudaCard";
import { DeudaForm } from "@/components/forms/DeudaForm";
import { AbonoForm } from "@/components/forms/AbonoForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { getDeudas, deleteDeuda } from "@/lib/storage";
import type { Deuda } from "@/types/finance";
import { Plus, Search, CreditCard, Filter } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const DeudasPage = () => {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [filteredDeudas, setFilteredDeudas] = useState<Deuda[]>([]);
  const [showDeudaForm, setShowDeudaForm] = useState(false);
  const [showAbonoForm, setShowAbonoForm] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState<Deuda | null>(null);
  const [editingDeuda, setEditingDeuda] = useState<Deuda | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadData = () => {
    const data = getDeudas();
    setDeudas(data);
    applyFilters(data, searchTerm, filterStatus);
  };

  const applyFilters = (data: Deuda[], search: string, status: string) => {
    let filtered = data;

    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.descripcion.toLowerCase().includes(search.toLowerCase()) ||
          d.acreedor.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((d) => d.estado_pago === status);
    }

    setFilteredDeudas(filtered);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters(deudas, searchTerm, filterStatus);
  }, [searchTerm, filterStatus, deudas]);

  const handleAddAbono = (deuda: Deuda) => {
    setSelectedDeuda(deuda);
    setShowAbonoForm(true);
  };

  const handleEditDeuda = (deuda: Deuda) => {
    setEditingDeuda(deuda);
    setShowDeudaForm(true);
  };

  const handleDeleteDeuda = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteDeuda(deleteId);
      toast.success("Deuda eliminada correctamente");
      loadData();
      setDeleteId(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Deudas</h1>
            <p className="text-muted-foreground">
              Gestiona todas tus deudas y préstamos
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingDeuda(null);
              setShowDeudaForm(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Deuda
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por descripción o acreedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en_progreso">En Progreso</SelectItem>
              <SelectItem value="pagada">Pagada</SelectItem>
              <SelectItem value="vencida">Vencida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deudas Grid */}
        {filteredDeudas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {deudas.length === 0
                  ? "Sin deudas registradas"
                  : "No se encontraron resultados"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {deudas.length === 0
                  ? "Comienza registrando tu primera deuda o préstamo"
                  : "Intenta con otros términos de búsqueda"}
              </p>
              {deudas.length === 0 && (
                <Button onClick={() => setShowDeudaForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Deuda
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDeudas.map((deuda) => (
              <DeudaCard
                key={deuda.id_deuda}
                deuda={deuda}
                onAddAbono={handleAddAbono}
                onEdit={handleEditDeuda}
                onDelete={handleDeleteDeuda}
              />
            ))}
          </div>
        )}
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

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta deuda?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todos los abonos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default DeudasPage;
