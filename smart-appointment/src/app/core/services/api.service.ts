import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, TimeSlot, Appointment, AuthResponse, BookingRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Auth endpoints
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  register(name: string, email: string, password: string, phone: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, { name, email, password, phone });
  }

  // Slots endpoints
  getSlots(): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(`${this.apiUrl}/slots`);
  }

  getSlot(id: string): Observable<TimeSlot> {
    return this.http.get<TimeSlot>(`${this.apiUrl}/slots/${id}`);
  }

  createSlot(slot: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/slots`, slot);
  }

  toggleSlotStatus(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/slots/${id}/toggle`, {});
  }

  deleteSlot(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/slots/${id}`);
  }

  // Appointments endpoints
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`);
  }

  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/appointments/${id}`);
  }

  bookAppointment(request: BookingRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, request);
  }

  cancelAppointment(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${id}/cancel`, {});
  }

  completeAppointment(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${id}/complete`, {});
  }
}
