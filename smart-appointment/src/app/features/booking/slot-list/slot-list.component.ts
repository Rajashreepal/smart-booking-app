import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SlotService } from '../../../core/services/slot.service';
import { TimeSlot, Appointment } from '../../../core/models/models';

@Component({
  selector: 'app-slot-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="page-wrapper">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header fade-in">
          <div>
            <h1>Book an Appointment</h1>
            <p class="text-muted">Select a date and available time slot below</p>
          </div>
          <div class="header-actions">
            <span class="badge badge-available">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
              {{ availableCount }} slots available
            </span>
          </div>
        </div>

        <!-- Date Filter -->
        <div class="date-filter fade-in">
          <div class="date-scroll">
            @for (d of dateOptions; track d.value) {
              <button
                class="date-btn"
                [class.active]="selectedDate() === d.value"
                (click)="selectedDate.set(d.value)"
              >
                <span class="date-day">{{ d.dayName }}</span>
                <span class="date-num">{{ d.day }}</span>
                <span class="date-month">{{ d.month }}</span>
                @if (d.count > 0) {
                  <span class="date-count">{{ d.count }}</span>
                }
              </button>
            }
          </div>
        </div>

        <!-- Service Filter -->
        <div class="filter-row fade-in">
          @for (svc of services; track svc) {
            <button
              class="filter-chip"
              [class.active]="selectedService() === svc"
              (click)="selectedService.set(svc)"
            >{{ svc }}</button>
          }
        </div>

        <!-- Slots Grid -->
        @if (filteredSlots().length > 0) {
          <div class="slots-grid fade-in">
            @for (slot of filteredSlots(); track slot.id) {
              <div class="slot-card" [class.slot-booked]="isUserBooked(slot.id)">
                <div class="slot-header">
                  <span class="slot-time">{{ slot.startTime }} – {{ slot.endTime }}</span>
                  @if (isUserBooked(slot.id)) {
                    <span class="badge badge-confirmed">Booked</span>
                  } @else if (slot.bookedCount >= slot.maxCapacity) {
                    <span class="badge badge-booked">Full</span>
                  } @else {
                    <span class="badge badge-available">Available</span>
                  }
                </div>
                <div class="slot-service">{{ slot.service }}</div>
                <div class="slot-meta">
                  <span>
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {{ slot.duration }} min
                  </span>
                  <span>
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {{ slot.maxCapacity - slot.bookedCount }} / {{ slot.maxCapacity }} open
                  </span>
                </div>
                @if (!isUserBooked(slot.id) && slot.bookedCount < slot.maxCapacity) {
                  <div class="slot-action">
                    <button class="btn btn-primary btn-sm btn-full" (click)="bookSlot(slot)">Book Now →</button>
                  </div>
                } @else if (isUserBooked(slot.id)) {
                  <div class="slot-action">
                    <button class="btn btn-outline btn-sm btn-full" disabled>Already Booked</button>
                  </div>
                } @else {
                  <div class="slot-action">
                    <button class="btn btn-ghost btn-sm btn-full" disabled>Slot Full</button>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="empty-state fade-in">
            <div class="empty-icon">
              <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            </div>
            <h3>No available slots</h3>
            <p>Try selecting a different date or service filter.</p>
          </div>
        }

        <!-- My Appointments -->
        @if (myAppointments().length > 0) {
          <div class="my-appointments fade-in">
            <h2>My Appointments</h2>
            <div class="appointments-list">
              @for (appt of myAppointments(); track appt.id) {
                <div class="appointment-row" [class.cancelled]="appt.status === 'cancelled'">
                  <div class="appt-date">
                    <span class="appt-day">{{ appt.date | date:'EEE' }}</span>
                    <span class="appt-num">{{ appt.date | date:'d' }}</span>
                    <span class="appt-month">{{ appt.date | date:'MMM' }}</span>
                  </div>
                  <div class="appt-details">
                    <div class="appt-service">{{ appt.service }}</div>
                    <div class="appt-time text-muted">{{ appt.startTime }} – {{ appt.endTime }}</div>
                  </div>
                  <div class="appt-status">
                    <span class="badge" [class]="'badge-' + appt.status">{{ appt.status | titlecase }}</span>
                  </div>
                  @if (appt.status === 'confirmed') {
                    <button class="btn btn-ghost btn-sm cancel-btn" (click)="cancelAppt(appt.id, $event)">
                      Cancel
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 28px;
      h1 { font-size: 32px; margin-bottom: 6px; }
    }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .date-filter { margin-bottom: 20px; }
    .date-scroll {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 8px;
      scrollbar-width: thin;
      &::-webkit-scrollbar { height: 6px; }
      &::-webkit-scrollbar-track { background: var(--paper-alt); }
      &::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px; }
    }
    .date-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border);
      background: #fff;
      cursor: pointer;
      min-width: 68px;
      transition: all var(--transition);
      position: relative;
      flex-shrink: 0;
      &:hover { border-color: var(--accent); }
      &.active { background: var(--ink); border-color: var(--ink); color: #fff; }
    }
    .date-day { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.6; margin-bottom: 4px; }
    .date-num { font-family: var(--font-display); font-size: 22px; font-weight: 700; line-height: 1; margin-bottom: 2px; }
    .date-month { font-size: 10px; opacity: 0.6; text-transform: uppercase; }
    .date-count {
      position: absolute;
      top: -6px; right: -6px;
      width: 18px; height: 18px;
      background: var(--accent);
      color: #fff;
      border-radius: 50%;
      font-size: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .filter-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
    .filter-chip {
      padding: 6px 16px;
      border-radius: 99px;
      border: 1.5px solid var(--border);
      background: #fff;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition);
      &:hover { border-color: var(--ink); }
      &.active { background: var(--ink); border-color: var(--ink); color: #fff; }
    }
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 48px;
    }
    .slot-card {
      background: #fff;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      padding: 16px;
      transition: all var(--transition);
      display: flex;
      flex-direction: column;
      box-shadow: 1px 1px 0 var(--border);
      &:hover:not(.slot-booked) {
        border-color: var(--accent);
        box-shadow: 2px 2px 0 var(--accent);
        transform: translateY(-1px);
      }
      &.slot-booked { opacity: 0.65; }
    }
    .slot-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .slot-time { font-family: var(--font-display); font-size: 16px; font-weight: 600; }
    .slot-service { font-size: 14px; font-weight: 500; color: var(--ink-muted); margin-bottom: 10px; }
    .slot-meta {
      display: flex;
      gap: 14px;
      font-size: 12px;
      color: var(--ink-light);
      margin-bottom: 14px;
      span { display: flex; align-items: center; gap: 4px; }
    }
    .slot-action { margin-top: auto; }
    .empty-state {
      text-align: center;
      padding: 64px 32px;
      color: var(--ink-light);
      h3 { font-size: 20px; margin: 16px 0 8px; color: var(--ink-muted); }
      p { font-size: 14px; }
    }
    .empty-icon {
      width: 80px; height: 80px;
      background: var(--paper-alt);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      color: var(--ink-light);
    }
    .my-appointments {
      h2 { font-size: 22px; margin-bottom: 16px; }
    }
    .appointments-list { display: flex; flex-direction: column; gap: 10px; }
    .appointment-row {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #fff;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      transition: box-shadow var(--transition);
      box-shadow: 1px 1px 0 var(--border);
      &:hover { box-shadow: 2px 2px 0 var(--border); }
      &.cancelled { opacity: 0.5; }
    }
    .appt-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 44px;
    }
    .appt-day { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-light); }
    .appt-num { font-family: var(--font-display); font-size: 22px; font-weight: 600; line-height: 1; }
    .appt-month { font-size: 10px; color: var(--ink-light); text-transform: uppercase; }
    .appt-details { flex: 1; }
    .appt-service { font-size: 15px; font-weight: 500; margin-bottom: 2px; }
    .appt-time { font-size: 13px; }
    .cancel-btn { color: var(--danger); &:hover { background: var(--danger-bg); } }
    @media (max-width: 1024px) {
      .slots-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .slots-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 12px; }
    }
  `]
})
export class SlotListComponent {
  private slotService = inject(SlotService);
  private authService = inject(AuthService);
  private router = inject(Router);

  selectedDate = signal('');
  selectedService = signal('All');

  services = ['All', 'Consultation', 'Checkup', 'Follow-up', 'Dental', 'Therapy'];

  constructor() {
    // Initialize selected date with first available date
    const dates = this.getDateOptions();
    if (dates.length > 0 && !this.selectedDate()) {
      this.selectedDate.set(dates[0].value);
    }
  }

  get userId() { return this.authService.currentUser()?.id || ''; }

  get availableCount() { return this.slotService.availableSlots().length; }

  private getDateOptions() {
    const today = new Date();
    const dates = [];
    for (let i = 1; i <= 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const val = d.toISOString().split('T')[0];
      const slots = this.slotService.availableSlots().filter(s => s.date === val);
      dates.push({
        value: val,
        dayName: d.toLocaleDateString('en', { weekday: 'short' }),
        day: d.getDate(),
        month: d.toLocaleDateString('en', { month: 'short' }),
        count: slots.length
      });
    }
    return dates;
  }

  get dateOptions() {
    return this.getDateOptions();
  }

  filteredSlots = computed(() => {
    const date = this.selectedDate();
    let slots = this.slotService.availableSlots();
    
    if (date) {
      slots = slots.filter(s => s.date === date);
    }
    
    if (this.selectedService() !== 'All') {
      slots = slots.filter(s => s.service === this.selectedService());
    }
    
    return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  myAppointments = computed(() =>
    this.slotService.getUserAppointments(this.userId)
      .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
  );

  isUserBooked(slotId: string): boolean {
    return this.myAppointments().some(a => a.slotId === slotId && a.status === 'confirmed');
  }

  bookSlot(slot: TimeSlot): void {
    if (this.isUserBooked(slot.id) || slot.bookedCount >= slot.maxCapacity) return;
    this.router.navigate(['/booking/book', slot.id]);
  }

  cancelAppt(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Cancel this appointment?')) {
      this.slotService.cancelAppointment(id, this.userId);
    }
  }
}
