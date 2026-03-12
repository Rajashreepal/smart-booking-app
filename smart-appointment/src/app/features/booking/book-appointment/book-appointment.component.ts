import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SlotService } from '../../../core/services/slot.service';
import { TimeSlot } from '../../../core/models/models';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="container">
        <a routerLink="/booking" class="back-link">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Slots
        </a>

        @if (slot()) {
          <div class="book-layout fade-in">
            <!-- Slot Summary -->
            <div class="slot-summary card">
              <div class="summary-header">
                <div class="service-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                </div>
                <div>
                  <h2>{{ slot()!.service }}</h2>
                  <p class="text-muted">Confirm your booking details</p>
                </div>
              </div>

              <div class="divider"></div>

              <div class="detail-rows">
                <div class="detail-row">
                  <span class="detail-label">Date</span>
                  <span class="detail-val">{{ formatDate(slot()!.date) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time</span>
                  <span class="detail-val">{{ slot()!.startTime }} – {{ slot()!.endTime }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration</span>
                  <span class="detail-val">{{ slot()!.duration }} minutes</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service</span>
                  <span class="detail-val">{{ slot()!.service }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Availability</span>
                  <span class="badge badge-available">{{ slot()!.maxCapacity - slot()!.bookedCount }} spot(s) left</span>
                </div>
              </div>

              <div class="divider"></div>

              <div class="user-row">
                <div class="user-avatar-lg">{{ initials }}</div>
                <div>
                  <div class="user-name">{{ user?.name }}</div>
                  <div class="user-email text-muted">{{ user?.email }}</div>
                </div>
              </div>
            </div>

            <!-- Booking Form -->
            <div class="booking-form card">
              <h3>Complete Booking</h3>
              <p class="text-muted mb-4">Fill in any additional details</p>

              @if (errorMsg()) {
                <div class="alert alert-danger">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {{ errorMsg() }}
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="tel" formControlName="phone" class="form-control"
                    [class.is-invalid]="isInvalid('phone')"
                    placeholder="Your contact number" />
                  @if (isInvalid('phone')) {
                    <span class="form-error">Enter a valid 10-digit phone number.</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Notes <span class="text-light">(Optional)</span></label>
                  <textarea formControlName="notes" class="form-control textarea"
                    placeholder="Any special requests or information for the provider..."></textarea>
                </div>

                <div class="confirm-box">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <p>By booking, you confirm the slot is reserved exclusively for you. Cancellations can be made from your dashboard.</p>
                </div>

                <div class="form-actions">
                  <a routerLink="/booking" class="btn btn-outline">Cancel</a>
                  <button type="submit" class="btn btn-primary" [disabled]="loading()">
                    @if (loading()) {
                      <div class="spinner"></div> Booking...
                    } @else {
                      Confirm Booking →
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <h3>Slot not found</h3>
            <a routerLink="/booking" class="btn btn-primary mt-4">← Back to Slots</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: var(--ink-muted);
      margin-bottom: 28px;
      transition: color var(--transition);
      &:hover { color: var(--ink); }
    }
    .book-layout {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 24px;
      align-items: start;
    }
    .summary-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      h2 { font-size: 22px; }
    }
    .service-icon {
      width: 52px; height: 52px;
      background: var(--paper-alt);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .detail-rows { display: flex; flex-direction: column; gap: 14px; }
    .detail-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .detail-label { font-size: 13px; color: var(--ink-light); text-transform: uppercase; letter-spacing: 0.06em; }
    .detail-val { font-size: 15px; font-weight: 500; }
    .user-row { display: flex; align-items: center; gap: 12px; }
    .user-avatar-lg {
      width: 44px; height: 44px;
      background: var(--accent-light);
      color: var(--accent-dark);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      font-family: var(--font-display);
    }
    .user-name { font-size: 15px; font-weight: 500; }
    .user-email { font-size: 13px; }
    .booking-form h3 { font-size: 22px; margin-bottom: 6px; }
    .textarea { min-height: 100px; resize: vertical; }
    .confirm-box {
      display: flex;
      gap: 10px;
      background: var(--paper-alt);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      margin-bottom: 24px;
      color: var(--ink-muted);
      font-size: 13px;
      line-height: 1.5;
      svg { flex-shrink: 0; color: var(--accent); margin-top: 1px; }
    }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .empty-state { text-align: center; padding: 64px; }
    @media (max-width: 768px) {
      .book-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class BookAppointmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private slotService = inject(SlotService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  slot = signal<TimeSlot | null>(null);
  loading = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    notes: ['']
  });

  get user() { return this.auth.currentUser(); }
  get initials(): string {
    return (this.user?.name || '').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
  }

  ngOnInit(): void {
    const slotId = this.route.snapshot.paramMap.get('slotId')!;
    const found = this.slotService.getSlotById(slotId);
    if (found) {
      this.slot.set(found);
      this.form.patchValue({ phone: this.user?.phone || '' });
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.slot() || !this.user) return;
    this.loading.set(true);
    this.errorMsg.set('');

    setTimeout(() => {
      const result = this.slotService.bookSlot(
        {
          slotId: this.slot()!.id,
          userId: this.user!.id,
          notes: this.form.value.notes || '',
          userPhone: this.form.value.phone!
        },
        { id: this.user!.id, name: this.user!.name, email: this.user!.email }
      );
      this.loading.set(false);

      if (!result.success) { this.errorMsg.set(result.message); return; }
      this.router.navigate(['/booking/confirmation', result.appointment!.id]);
    }, 700);
  }
}
