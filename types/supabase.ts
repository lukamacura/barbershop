/**
 * Supabase database types
 * These types match YOUR existing database schema
 */

export type Service = {
  id: number; // bigint
  service_name: string;
  duration_minutes: number;
  price_rsd: number; // bigint
  active: boolean;
  created_at?: string;
};

export type Barber = {
  id: number; // bigint
  name: string;
  active: boolean;
  created_at?: string;
};

export type Customer = {
  id: number; // bigint
  name: string;
  phone: number; // bigint
  email: string;
  created_at?: string;
};

export type Reservation = {
  id: number; // bigint
  barber_id: number; // bigint FK to Barbers
  service_id: number; // bigint FK to Services
  customer_id?: number; // bigint FK to Customer (optional)
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  start_time: string;
  end_time: string;
  created_at?: string;
};

export type CreateReservationPayload = {
  barberId: number;
  serviceId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startTime: string;
  endTime: string;
  notes?: string;
};

/**
 * API Response types
 */
export type ApiResponse<T = unknown> =
  | {
      ok: true;
      data?: T;
      message?: string;
    }
  | {
      ok: false;
      message: string;
      error?: string;
      errors?: Array<{ field: string; message: string }>;
      hint?: string;
    };

export type ServicesResponse = ApiResponse<{ services: Service[] }>;

export type ReservationResponse = ApiResponse<{
  reservationId: string;
  message: string;
}>;
