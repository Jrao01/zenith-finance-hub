import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  ArrowDownCircle,
  Wallet,
  DollarSign,
  Settings,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import zenithLogo from "@/assets/zenith-logo.png";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/deudas", icon: CreditCard, label: "Deudas" },
  { to: "/abonos", icon: ArrowDownCircle, label: "Abonos" },
  { to: "/ingresos", icon: Wallet, label: "Ingresos" },
  { to: "/divisas", icon: DollarSign, label: "Divisas" },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 gradient-primary transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-8">
            <img src={zenithLogo} alt="Zenith" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">Zenith</h1>
              <p className="text-xs text-sidebar-foreground/60">Gestión Financiera</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary">
                <TrendingUp className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">Control Total</p>
                <p className="text-xs text-sidebar-foreground/60">Tus finanzas en orden</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
