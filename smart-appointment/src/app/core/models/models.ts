// ============================================================
// CORE MODELS – Smart Appointment Booking System
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  phone?: string;
  createdAt: Date;
}

export interface TimeSlot {
  id: string;
  date: string;           // ISO date string YYYY-MM-DD
  startTime: string;      // HH:mm format
  endTime: string;        // HH:mm format
  service: string;
  duration: number;       // minutes
  maxCapacity: number;
  bookedCount: number;
  isActive: boolean;
  createdBy: string;      // admin userId
}

export interface Appointment {
  id: string;
  slotId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  notes?: string;
  bookedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface BookingRequest {
  slotId: string;
  userId: string;
  notes?: string;
  userPhone: string;
}

export type ServiceType = 'Consultation' | 'Checkup' | 'Follow-up' | 'General' | 'Therapy' | 'Dental';
