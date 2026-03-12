import { Injectable, signal, computed } from '@angular/core';
import { TimeSlot, Appointment, BookingRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private readonly SLOTS_KEY = 'smartbook_slots';
  private readonly APPOINTMENTS_KEY = 'smartbook_appointments';

  private _slots = signal<TimeSlot[]>(this.loadSlots());
  private _appointments = signal<Appointment[]>(this.loadAppointments());

  slots = this._slots.asReadonly();
  appointments = this._appointments.asReadonly();

  availableSlots = computed(() =>
    this._slots().filter(s => s.isActive && s.bookedCount < s.maxCapacity && this.isFuture(s.date, s.startTime))
  );

  constructor() {
    this.seedSampleData();
  }

  private loadSlots(): TimeSlot[] {
    const data = localStorage.getItem(this.SLOTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private loadAppointments(): Appointment[] {
    const data = localStorage.getItem(this.APPOINTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveSlots(): void {
    localStorage.setItem(this.SLOTS_KEY, JSON.stringify(this._slots()));
  }

  private saveAppointments(): void {
    localStorage.setItem(this.APPOINTMENTS_KEY, JSON.stringify(this._appointments()));
  }

  private isFuture(date: string, time: string): boolean {
    const slotDate = new Date(`${date}T${time}`);
    return slotDate > new Date();
  }

  private seedSampleData(): void {
    if (this._slots().length > 0) return;

    const today = new Date();
    const slots: TimeSlot[] = [];

    const services = ['Consultation', 'Checkup', 'Follow-up', 'Dental', 'Therapy'];
    const timeBlocks = [
      ['09:00','09:30'],['09:30','10:00'],['10:00','10:30'],['10:30','11:00'],
      ['11:00','11:30'],['11:30','12:00'],['14:00','14:30'],['14:30','15:00'],
      ['15:00','15:30'],['15:30','16:00'],['16:00','16:30'],['16:30','17:00']
    ];

    for (let d = 1; d <= 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const dateStr = date.toISOString().split('T')[0];

      timeBlocks.forEach(([start, end], i) => {
        slots.push({
          id: `slot-${d}-${i}`,
          date: dateStr,
          startTime: start,
          endTime: end,
          service: services[i % services.length],
          duration: 30,
          maxCapacity: 1,
          bookedCount: 0,
          isActive: true,
          createdBy: 'admin-001'
        });
      });
    }

    this._slots.set(slots);
    this.saveSlots();
  }

  // ── CONFLICT DETECTION ──────────────────────────────────
  private hasConflict(slotId: string, userId: string): { conflict: boolean; reason: string } {
    const slot = this._slots().find(s => s.id === slotId);
    if (!slot) return { conflict: true, reason: 'Slot not found.' };
    if (!slot.isActive) return { conflict: true, reason: 'This slot is no longer active.' };
    if (slot.bookedCount >= slot.maxCapacity) return { conflict: true, reason: 'This slot is already fully booked.' };

    const existingAppts = this._appointments().filter(
      a => a.userId === userId && a.status !== 'cancelled'
    );

    // Check if user already booked the same slot
    const duplicate = existingAppts.find(a => a.slotId === slotId);
    if (duplicate) return { conflict: true, reason: 'You already have a booking for this slot.' };

    // Check for time overlap with user's other bookings
    const slotStart = this.timeToMinutes(slot.startTime);
    const slotEnd = this.timeToMinutes(slot.endTime);

    for (const appt of existingAppts) {
      if (appt.date !== slot.date) continue;
      const apptStart = this.timeToMinutes(appt.startTime);
      const apptEnd = this.timeToMinutes(appt.endTime);
      if (slotStart < apptEnd && slotEnd > apptStart) {
        return { conflict: true, reason: `You already have a booking on this date from ${appt.startTime} – ${appt.endTime}.` };
      }
    }

    return { conflict: false, reason: '' };
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  // ── BOOKING ─────────────────────────────────────────────
  bookSlot(req: BookingRequest, user: { id: string; name: string; email: string }): { success: boolean; message: string; appointment?: Appointment } {
    const { conflict, reason } = this.hasConflict(req.slotId, req.userId);
    if (conflict) return { success: false, message: reason };

    const slot = this._slots().find(s => s.id === req.slotId)!;

    const appointment: Appointment = {
      id: 'appt-' + Date.now(),
      slotId: req.slotId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: req.userPhone,
      service: slot.service,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'confirmed',
      notes: req.notes || '',
      bookedAt: new Date()
    };

    // Update slot count
    const updated = this._slots().map(s =>
      s.id === req.slotId ? { ...s, bookedCount: s.bookedCount + 1 } : s
    );
    this._slots.set(updated);
    this.saveSlots();

    this._appointments.set([...this._appointments(), appointment]);
    this.saveAppointments();

    return { success: true, message: 'Appointment confirmed!', appointment };
  }

  cancelAppointment(appointmentId: string, userId: string, isAdmin = false): { success: boolean; message: string } {
    const appt = this._appointments().find(a => a.id === appointmentId);
    if (!appt) return { success: false, message: 'Appointment not found.' };
    if (!isAdmin && appt.userId !== userId) return { success: false, message: 'Unauthorized.' };

    const updated = this._appointments().map(a =>
      a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
    );
    this._appointments.set(updated);
    this.saveAppointments();

    // Free up the slot
    const slots = this._slots().map(s =>
      s.id === appt.slotId ? { ...s, bookedCount: Math.max(0, s.bookedCount - 1) } : s
    );
    this._slots.set(slots);
    this.saveSlots();

    return { success: true, message: 'Appointment cancelled.' };
  }

  getUserAppointments(userId: string): Appointment[] {
    return this._appointments().filter(a => a.userId === userId);
  }

  getSlotById(id: string): TimeSlot | undefined {
    return this._slots().find(s => s.id === id);
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this._appointments().find(a => a.id === id);
  }

  // ── ADMIN: Slot Management ─────────────────────────────
  createSlot(slot: Omit<TimeSlot, 'id' | 'bookedCount'>): { success: boolean; message: string } {
    const newSlot: TimeSlot = { ...slot, id: 'slot-' + Date.now(), bookedCount: 0 };
    this._slots.set([...this._slots(), newSlot]);
    this.saveSlots();
    return { success: true, message: 'Slot created successfully.' };
  }

  toggleSlotStatus(slotId: string): void {
    const updated = this._slots().map(s =>
      s.id === slotId ? { ...s, isActive: !s.isActive } : s
    );
    this._slots.set(updated);
    this.saveSlots();
  }

  deleteSlot(slotId: string): { success: boolean; message: string } {
    const hasBooking = this._appointments().some(
      a => a.slotId === slotId && a.status === 'confirmed'
    );
    if (hasBooking) return { success: false, message: 'Cannot delete a slot with active bookings.' };

    this._slots.set(this._slots().filter(s => s.id !== slotId));
    this.saveSlots();
    return { success: true, message: 'Slot deleted.' };
  }

  getSlotsByDate(date: string): TimeSlot[] {
    return this._slots().filter(s => s.date === date);
  }

  getAllAppointments(): Appointment[] {
    return this._appointments();
  }

  completeAppointment(appointmentId: string): void {
    const updated = this._appointments().map(a =>
      a.id === appointmentId ? { ...a, status: 'completed' as const } : a
    );
    this._appointments.set(updated);
    this.saveAppointments();
  }
}
