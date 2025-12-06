import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DeudasPage from "./pages/DeudasPage";
import AbonosPage from "./pages/AbonosPage";
import IngresosPage from "./pages/IngresosPage";
import DivisasPage from "./pages/DivisasPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deudas" element={<DeudasPage />} />
          <Route path="/abonos" element={<AbonosPage />} />
          <Route path="/ingresos" element={<IngresosPage />} />
          <Route path="/divisas" element={<DivisasPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
