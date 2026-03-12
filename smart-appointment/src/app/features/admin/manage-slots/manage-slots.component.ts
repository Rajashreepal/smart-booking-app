import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SlotService } from '../../../core/services/slot.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-manage-slots',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, DatePipe],
  template: `
    <div class="page-wrapper">
      <div class="container">
        <div class="page-header fade-in">
          <div>
            <a routerLink="/admin" class="back-link">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Dashboard
            </a>
            <h1>Manage Slots</h1>
            <p class="text-muted">Create and manage appointment time slots</p>
          </div>
          <button class="btn btn-primary" (click)="showForm.set(!showForm())">
            @if (showForm()) {
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Close
            } @else {
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Add New Slot
            }
          </button>
        </div>

        <!-- Create Slot Form -->
        @if (showForm()) {
          <div class="create-form card fade-in">
            <h3>Create New Time Slot</h3>
            <p class="text-muted mb-4">Fill in the slot details below</p>

            @if (formMsg()) {
              <div class="alert" [class]="formMsgType() === 'success' ? 'alert-success' : 'alert-danger'">{{ formMsg() }}</div>
            }

            <form [formGroup]="slotForm" (ngSubmit)="createSlot()">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Date</label>
                  <input type="date" formControlName="date" class="form-control"
                    [class.is-invalid]="isInvalid('date')" [min]="minDate" />
                  @if (isInvalid('date')) { <span class="form-error">Date is required.</span> }
                </div>
                <div class="form-group">
                  <label class="form-label">Service</label>
                  <select formControlName="service" class="form-control" [class.is-invalid]="isInvalid('service')">
                    @for (svc of services; track svc) {
                      <option [value]="svc">{{ svc }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Start Time</label>
                  <input type="time" formControlName="startTime" class="form-control"
                    [class.is-invalid]="isInvalid('startTime')" />
                  @if (isInvalid('startTime')) { <span class="form-error">Start time is required.</span> }
                </div>
                <div class="form-group">
                  <label class="form-label">End Time</label>
                  <input type="time" formControlName="endTime" class="form-control"
                    [class.is-invalid]="isInvalid('endTime')" />
                  @if (isInvalid('endTime')) { <span class="form-error">End time is required.</span> }
                </div>
                <div class="form-group">
                  <label class="form-label">Duration (minutes)</label>
                  <input type="number" formControlName="duration" class="form-control" min="15" max="120" />
                </div>
                <div class="form-group">
                  <label class="form-label">Max Capacity</label>
                  <input type="number" formControlName="maxCapacity" class="form-control" min="1" max="10" />
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-ghost" (click)="showForm.set(false)">Cancel</button>
                <button type="submit" class="btn btn-primary">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                  Create Slot
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Date Filter -->
        <div class="date-filter fade-in">
          <label class="form-label">Filter by Date</label>
          <input type="date" class="form-control date-input" [(ngModel)]="filterDate" />
        </div>

        <!-- Slots Table -->
        <div class="slots-section fade-in">
          <div class="section-header">
            <h2>Time Slots ({{ displayedSlots().length }})</h2>
          </div>

          @if (displayedSlots().length > 0) {
            <div class="slots-table">
              <div class="table-header">
                <span>Date</span>
                <span>Time</span>
                <span>Service</span>
                <span>Bookings</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              @for (slot of displayedSlots(); track slot.id) {
                <div class="table-row" [class.inactive]="!slot.isActive">
                  <div class="slot-date">
                    <span class="slot-day">{{ slot.date | date:'EEE' }}</span>
                    <span class="slot-d">{{ slot.date | date:'dd MMM' }}</span>
                  </div>
                  <div class="slot-time-col">
                    <strong>{{ slot.startTime }}</strong>
                    <span class="text-light">{{ slot.endTime }}</span>
                  </div>
                  <div><span class="service-tag">{{ slot.service }}</span></div>
                  <div class="booking-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="(slot.bookedCount / slot.maxCapacity) * 100"></div>
                    </div>
                    <span class="progress-text">{{ slot.bookedCount }} / {{ slot.maxCapacity }}</span>
                  </div>
                  <div>
                    <span class="badge" [class]="slot.isActive ? 'badge-available' : 'badge-booked'">
                      {{ slot.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <div class="row-actions">
                    <button class="btn btn-ghost btn-sm" (click)="toggleSlot(slot.id)" [title]="slot.isActive ? 'Deactivate' : 'Activate'">
                      @if (slot.isActive) {
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                      } @else {
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                      }
                    </button>
                    <button class="btn btn-ghost btn-sm delete-btn" (click)="deleteSlot(slot.id)">
                      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <p class="text-muted">No slots found for selected date.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13px; color: var(--ink-muted); margin-bottom: 8px;
      transition: color var(--transition);
      &:hover { color: var(--ink); }
    }
    .page-header {
      display: flex; align-items: flex-end;
      justify-content: space-between; margin-bottom: 28px;
      h1 { font-size: 30px; margin-bottom: 4px; }
    }
    .create-form {
      margin-bottom: 28px;
      h3 { font-size: 20px; margin-bottom: 6px; }
    }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 4px; }
    .date-filter { margin-bottom: 20px; display: flex; align-items: center; gap: 16px; }
    .date-input { max-width: 200px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; h2 { font-size: 20px; } }
    .slots-table { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
    .table-header {
      display: grid; grid-template-columns: 1fr 1fr 1fr 1.2fr 0.8fr 0.8fr;
      padding: 12px 20px; background: var(--paper-alt);
      font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--ink-muted); font-weight: 500;
    }
    .table-row {
      display: grid; grid-template-columns: 1fr 1fr 1fr 1.2fr 0.8fr 0.8fr;
      padding: 14px 20px; align-items: center;
      border-top: 1px solid var(--border);
      transition: background var(--transition);
      &:hover { background: var(--paper); }
      &.inactive { opacity: 0.55; }
    }
    .slot-date { display: flex; flex-direction: column; }
    .slot-day { font-size: 11px; text-transform: uppercase; color: var(--ink-light); }
    .slot-d { font-size: 14px; font-weight: 500; }
    .slot-time-col { display: flex; flex-direction: column; gap: 2px; font-size: 13px; }
    .service-tag { font-size: 12px; background: var(--paper-alt); padding: 3px 10px; border-radius: 99px; font-weight: 500; }
    .booking-progress { display: flex; flex-direction: column; gap: 4px; }
    .progress-bar { height: 4px; background: var(--paper-alt); border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.5s ease; }
    .progress-text { font-size: 12px; color: var(--ink-muted); }
    .row-actions { display: flex; gap: 4px; }
    .delete-btn { &:hover { color: var(--danger); background: var(--danger-bg); } }
    .empty-state { padding: 40px; text-align: center; }
    @media (max-width: 900px) {
      .form-grid { grid-template-columns: repeat(2, 1fr); }
      .table-header, .table-row { grid-template-columns: 1fr 1fr 1fr 0.8fr; }
      .table-header span:nth-child(4), .table-row .booking-progress { display: none; }
    }
  `]
})
export class ManageSlotsComponent {
  private slotService = inject(SlotService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  showForm = signal(false);
  formMsg = signal('');
  formMsgType = signal<'success' | 'error'>('success');
  private _filterDate = signal<string>('');

  services = ['Consultation', 'Checkup', 'Follow-up', 'Dental', 'Therapy', 'General'];

  get filterDate(): string {
    return this._filterDate();
  }

  set filterDate(value: string) {
    this._filterDate.set(value);
  }

  get minDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  slotForm = this.fb.group({
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    service: ['Consultation', Validators.required],
    duration: [30, [Validators.required, Validators.min(15)]],
    maxCapacity: [1, [Validators.required, Validators.min(1)]]
  });

  displayedSlots = computed(() => {
    const date = this._filterDate();
    const slots = this.slotService.slots();
    if (!date) return slots.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
    return slots.filter(s => s.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  isInvalid(field: string): boolean {
    const ctrl = this.slotForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  createSlot(): void {
    if (this.slotForm.invalid) { this.slotForm.markAllAsTouched(); return; }
    const v = this.slotForm.value;

    if (v.startTime! >= v.endTime!) {
      this.formMsg.set('End time must be after start time.');
      this.formMsgType.set('error');
      return;
    }

    const result = this.slotService.createSlot({
      date: v.date!,
      startTime: v.startTime!,
      endTime: v.endTime!,
      service: v.service!,
      duration: v.duration!,
      maxCapacity: v.maxCapacity!,
      isActive: true,
      createdBy: this.authService.currentUser()?.id || 'admin'
    });

    this.formMsg.set(result.message);
    this.formMsgType.set(result.success ? 'success' : 'error');
    if (result.success) { this.slotForm.reset({ service: 'Consultation', duration: 30, maxCapacity: 1 }); }
    setTimeout(() => this.formMsg.set(''), 3000);
  }

  toggleSlot(id: string): void { this.slotService.toggleSlotStatus(id); }

  deleteSlot(id: string): void {
    if (!confirm('Delete this slot?')) return;
    const r = this.slotService.deleteSlot(id);
    if (!r.success) alert(r.message);
  }
}
