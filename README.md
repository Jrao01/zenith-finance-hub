# Zenith Finance Hub - Frontend 🚀

Zenith Finance Hub es una aplicación moderna y elegante para la gestión de finanzas personales, centrada especialmente en el seguimiento de deudas, préstamos y abonos. Diseñada con una estética premium de modo oscuro y micro-animaciones dinámicas.

## ✨ Características Principalas

- **Panel de Control (Dashboard)**: Visualización en tiempo real de estadísticas globales (Total de deudas, abonos realizados, próximos vencimientos).
- **Gestión de Deudas**: Crea, edita y rastrea deudas con soporte para múltiples monedas (USD, VES, EUR, MXN, etc.).
- **Sistema de Abonos**: Registra pagos parciales con cálculo automático de saldos y cambios de estado (de Pendiente a Pagada).
- **Cálculo de Intereses**: Soporte opcional para intereses aplicados al monto base.
- **Responsive Design**: Optimizado para dispositivos móviles y escritorio.
- **Autenticación Segura**: Flujo completo de registro e inicio de sesión con JWT.

## 🛠️ Tecnologías Utilizadas

- **Core**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [Shadcn/UI](https://ui.shadcn.com/) (basado en Radix UI)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Gestión de Fechas**: [date-fns](https://date-fns.org/)
- **Notificaciones**: [Sonner](https://sonner.stevenly.me/)

## 🚀 Instalación y Uso

1. **Clonar el repositorio** y navegar a la carpeta:

   ```bash
   cd zenith-finance-hub
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Configurar API**:
   La aplicación está configurada para conectar con el backend en `https://zeniith-back.onrender.com`. Puedes cambiar esta configuración en `src/lib/api.ts` y `src/contexts/AuthContext.tsx`.

4. **Iniciar en entorno de desarrollo**:
   ```bash
   npm run dev
   ```

## 📂 Estructura de Carpetas

- `src/components`: Componentes reutilizables de UI y formularios.
- `src/pages`: Páginas principales (Dashboard, Deudas, Abonos).
- `src/contexts`: Contexto de Autenticación para persistencia de sesión.
- `src/lib`: Servicios de API y utilidades.
- `src/types`: Definiciones de interfaces TypeScript para modelos de datos de finanzas.

## 📄 Notas Adicionales

- La aplicación usa `localStorage` para persistir el token JWT y los datos básicos del usuario.
- El sistema detecta automáticamente cuando una deuda llega a saldo cero y actualiza su estado visual.
