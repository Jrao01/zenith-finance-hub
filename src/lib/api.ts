// API Service para conectar con el backend
const API_URL = 'http://localhost:3000';
//const API_URL = 'https://zeniith-back.onrender.com';

// Helper para obtener el token del localStorage
const getToken = (): string | null => {
  return localStorage.getItem('zenith_token');
};

// Helper para headers con autenticación
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Tipos de respuesta
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== DEUDAS ====================

import type { Deuda, Abono } from '@/types/finance';

export interface DeudaInput {
  id_usuario: number;
  descripcion: string;
  acreedor: string;
  monto_total: number;
  moneda: string;
  fecha_pago_objetivo: string;
  recordatorio: boolean;
  interes_aplicado: boolean;
  tasa_interes: number;
}

export const apiGetDeudas = async (id_usuario: number): Promise<ApiResponse<Deuda[]>> => {
  try {
    const response = await fetch(`${API_URL}/deudas/usuario/${id_usuario}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al obtener deudas' };
    }

    return { success: true, data: data.deudas };
  } catch (error) {
    console.error('Error en apiGetDeudas:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

export const apiGetDeudaById = async (id: number): Promise<ApiResponse<Deuda>> => {
  try {
    const response = await fetch(`${API_URL}/deudas/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al obtener la deuda' };
    }

    return { success: true, data: data.deuda };
  } catch (error) {
    console.error('Error en apiGetDeudaById:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

export const apiCreateDeuda = async (deuda: DeudaInput): Promise<ApiResponse<Deuda>> => {
  try {
    const response = await fetch(`${API_URL}/deudas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(deuda),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al crear la deuda' };
    }

    return { success: true, data: data.deuda };
  } catch (error) {
    console.error('Error en apiCreateDeuda:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

export const apiUpdateDeuda = async (id: number, deuda: Partial<DeudaInput>): Promise<ApiResponse<Deuda>> => {
  try {
    const response = await fetch(`${API_URL}/deudas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(deuda),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al actualizar la deuda' };
    }

    return { success: true, data: data.deuda };
  } catch (error) {
    console.error('Error en apiUpdateDeuda:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

export const apiDeleteDeuda = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_URL}/deudas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al eliminar la deuda' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error en apiDeleteDeuda:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

// ==================== ABONOS ====================

export interface AbonoInput {
  id_deuda: number;
  monto_abonado: number;
  moneda: string;
  tipo_cambio?: number;
  nota?: string;
}

export interface AbonoResponse {
  abono: Abono;
  nuevo_saldo: number;
  estado_deuda: string;
}

export const apiGetAbonos = async (filters?: { id_deuda?: number, id_usuario?: number }): Promise<ApiResponse<Abono[]>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.id_deuda) params.append('id_deuda', filters.id_deuda.toString());
    if (filters?.id_usuario) params.append('id_usuario', filters.id_usuario.toString());
    
    const url = `${API_URL}/abonos${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al obtener abonos' };
    }

    return { success: true, data: data.abonos };
  } catch (error) {
    console.error('Error en apiGetAbonos:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

export const apiGetAbonosByDeuda = async (id_deuda: number): Promise<ApiResponse<{ abonos: Abono[], total_abonado: number }>> => {
  try {
    const response = await fetch(`${API_URL}/abonos/deuda/${id_deuda}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al obtener abonos' };
    }

    return { 
      success: true, 
      data: { 
        abonos: data.abonos, 
        total_abonado: data.total_abonado 
      } 
    };
  } catch (error) {
    console.error('Error en apiGetAbonosByDeuda:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

export const apiCreateAbono = async (abono: AbonoInput): Promise<ApiResponse<AbonoResponse>> => {
  try {
    const response = await fetch(`${API_URL}/abonos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(abono),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al registrar el abono' };
    }

    return { 
      success: true, 
      data: {
        abono: data.abono,
        nuevo_saldo: data.nuevo_saldo,
        estado_deuda: data.estado_deuda
      }
    };
  } catch (error) {
    console.error('Error en apiCreateAbono:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

export const apiUpdateAbono = async (id: number, abono: Partial<AbonoInput>): Promise<ApiResponse<AbonoResponse>> => {
  try {
    const response = await fetch(`${API_URL}/abonos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(abono),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al actualizar el abono' };
    }

    return { 
      success: true, 
      data: {
        abono: data.abono,
        nuevo_saldo: data.nuevo_saldo,
        estado_deuda: data.estado_deuda
      }
    };
  } catch (error) {
    console.error('Error en apiUpdateAbono:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

export const apiDeleteAbono = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_URL}/abonos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al eliminar el abono' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error en apiDeleteAbono:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

// ==================== DASHBOARD ====================

export interface DashboardData {
  total_deudas: number;
  total_abonado: number;
  saldo_pendiente: number;
  cantidad_deudas: number;
  deudas_pendientes: number;
  deudas_pagadas: number;
}

export const apiGetDashboard = async (id_usuario: number): Promise<ApiResponse<DashboardData>> => {
  try {
    const response = await fetch(`${API_URL}/dashboard/${id_usuario}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Error al obtener dashboard' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error en apiGetDashboard:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};
