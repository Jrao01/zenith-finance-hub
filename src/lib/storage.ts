import type { Deuda, Abono, Ingreso, Usuario } from '@/types/finance';

const STORAGE_KEYS = {
  DEUDAS: 'zenith_deudas',
  ABONOS: 'zenith_abonos',
  INGRESOS: 'zenith_ingresos',
  USUARIO: 'zenith_usuario',
};

// Usuario
export const getUsuario = (): Usuario | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USUARIO);
  return data ? JSON.parse(data) : null;
};

export const saveUsuario = (usuario: Usuario): void => {
  localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuario));
};

// Deudas
export const getDeudas = (): Deuda[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DEUDAS);
  return data ? JSON.parse(data) : [];
};

export const saveDeuda = (deuda: Deuda): void => {
  const deudas = getDeudas();
  const index = deudas.findIndex(d => d.id_deuda === deuda.id_deuda);
  if (index >= 0) {
    deudas[index] = deuda;
  } else {
    deudas.push(deuda);
  }
  localStorage.setItem(STORAGE_KEYS.DEUDAS, JSON.stringify(deudas));
};

export const deleteDeuda = (id: number): void => {
  const deudas = getDeudas().filter(d => d.id_deuda !== id);
  localStorage.setItem(STORAGE_KEYS.DEUDAS, JSON.stringify(deudas));
  // También eliminar abonos relacionados
  const abonos = getAbonos().filter(a => a.id_deuda !== id);
  localStorage.setItem(STORAGE_KEYS.ABONOS, JSON.stringify(abonos));
};

export const getNextDeudaId = (): number => {
  const deudas = getDeudas();
  return deudas.length > 0 ? Math.max(...deudas.map(d => d.id_deuda)) + 1 : 1;
};

// Abonos
export const getAbonos = (): Abono[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ABONOS);
  return data ? JSON.parse(data) : [];
};

export const getAbonosByDeuda = (idDeuda: number): Abono[] => {
  return getAbonos().filter(a => a.id_deuda === idDeuda);
};

export const saveAbono = (abono: Abono): void => {
  const abonos = getAbonos();
  abonos.push(abono);
  localStorage.setItem(STORAGE_KEYS.ABONOS, JSON.stringify(abonos));
};

export const getNextAbonoId = (): number => {
  const abonos = getAbonos();
  return abonos.length > 0 ? Math.max(...abonos.map(a => a.id_abono)) + 1 : 1;
};

// Ingresos
export const getIngresos = (): Ingreso[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INGRESOS);
  return data ? JSON.parse(data) : [];
};

export const saveIngreso = (ingreso: Ingreso): void => {
  const ingresos = getIngresos();
  ingresos.push(ingreso);
  localStorage.setItem(STORAGE_KEYS.INGRESOS, JSON.stringify(ingresos));
};

export const getNextIngresoId = (): number => {
  const ingresos = getIngresos();
  return ingresos.length > 0 ? Math.max(...ingresos.map(i => i.id_ingreso)) + 1 : 1;
};

// Cálculos
export const calcularSaldoDeuda = (deuda: Deuda): number => {
  const abonos = getAbonosByDeuda(deuda.id_deuda);
  const totalAbonado = abonos.reduce((sum, a) => sum + a.monto_abonado, 0);
  const montoConInteres = deuda.interes_aplicado 
    ? deuda.monto_total + deuda.monto_interes 
    : deuda.monto_total;
  return Math.max(0, montoConInteres - totalAbonado);
};

export const calcularTotalDeudas = (): number => {
  return getDeudas().reduce((sum, d) => sum + calcularSaldoDeuda(d), 0);
};

export const calcularTotalIngresos = (): number => {
  return getIngresos().reduce((sum, i) => sum + i.monto, 0);
};
