export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  moneda_preferida: string;
}

export interface Deuda {
  id_deuda: number;
  id_usuario: number;
  descripcion: string;
  acreedor: string;
  monto_total: number;
  moneda: string;
  fecha_registro: string;
  fecha_pago_objetivo: string;
  estado_pago: 'pendiente' | 'en_progreso' | 'pagada' | 'vencida';
  recordatorio: boolean;
  interes_aplicado: boolean;
  tasa_interes: number;
  monto_interes: number;
}

export interface Abono {
  id_abono: number;
  id_deuda: number;
  fecha_abono: string;
  monto_abonado: number;
  moneda: string;
  tipo_cambio: number;
  restante_actual: number;
  nota?: string;
}

export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  id_deuda: number;
  mensaje: string;
  fecha_programada: string;
  enviada: boolean;
}

export interface Ingreso {
  id_ingreso: number;
  id_usuario: number;
  descripcion: string;
  monto: number;
  moneda: string;
  fecha: string;
  categoria: string;
}

export type MonedaCode = 'BS' | 'USD' | 'EUR' | 'MXN' | 'COP' | 'ARS' | 'PEN' | 'CLP' | 'BRL';

export interface TipoCambio {
  moneda: MonedaCode;
  valor: number;
  simbolo: string;
}
