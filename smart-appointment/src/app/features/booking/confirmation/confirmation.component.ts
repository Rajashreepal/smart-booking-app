import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SlotService } from '../../../core/services/slot.service';
import { Appointment } from '../../../core/models/models';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (appointment()) {
      <div class="confirmation-page">
        <div class="confirmation-card fade-in">
          <div class="success-ring">
            <div class="success-icon">
              <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>

          <h1>Booking Confirmed!</h1>
          <p class="subtitle">Your appointment has been successfully scheduled.</p>

          <div class="booking-id">
            Booking ID: <strong>{{ appointment()!.id.toUpperCase() }}</strong>
          </div>

          <div class="detail-grid">
            <div class="detail-cell">
              <div class="cell-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <div class="cell-label">Date</div>
              <div class="cell-val">{{ formatDate(appointment()!.date) }}</div>
            </div>
            <div class="detail-cell">
              <div class="cell-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="cell-label">Time</div>
              <div class="cell-val">{{ appointment()!.startTime }} – {{ appointment()!.endTime }}</div>
            </div>
            <div class="detail-cell">
              <div class="cell-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div class="cell-label">Service</div>
              <div class="cell-val">{{ appointment()!.service }}</div>
            </div>
            <div class="detail-cell">
              <div class="cell-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <div class="cell-label">Name</div>
              <div class="cell-val">{{ appointment()!.userName }}</div>
            </div>
            <div class="detail-cell">
              <div class="cell-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div class="cell-label">Email</div>
              <div class="cell-val">{{ appointment()!.userEmail }}</div>
            </div>
            <div class="detail-cell">
              <div class="cell-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div class="cell-label">Phone</div>
              <div class="cell-val">{{ appointment()!.userPhone }}</div>
            </div>
          </div>

          @if (appointment()!.notes) {
            <div class="notes-box">
              <strong>Notes:</strong> {{ appointment()!.notes }}
            </div>
          }

          <div class="status-badge">
            <span class="badge badge-confirmed">
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
              Confirmed
            </span>
          </div>

          <div class="action-buttons">
            <a routerLink="/booking" class="btn btn-outline">Book Another →</a>
          </div>

          <div class="reminder-note">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Please arrive 5 minutes before your scheduled time. You can cancel from your appointments list if needed.
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirmation-page {
      min-height: calc(100vh - 72px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      background: linear-gradient(135deg, var(--paper) 0%, #f0ede8 100%);
    }
    .confirmation-card {
      background: #fff;
      border-radius: var(--radius-lg);
      padding: 48px;
      max-width: 600px;
      width: 100%;
      text-align: center;
      box-shadow: var(--shadow-lg);
    }
    .success-ring {
      width: 100px;
      height: 100px;
      background: var(--success-bg);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 28px;
      animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    .success-icon { color: var(--success); }
    @keyframes scaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    h1 { font-size: 32px; margin-bottom: 10px; }
    .subtitle { font-size: 16px; color: var(--ink-muted); margin-bottom: 20px; }
    .booking-id {
      font-size: 13px;
      color: var(--ink-light);
      background: var(--paper-alt);
      border-radius: var(--radius-sm);
      padding: 8px 16px;
      display: inline-block;
      margin-bottom: 32px;
      strong { color: var(--ink); }
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
      text-align: left;
    }
    .detail-cell {
      background: var(--paper-alt);
      border-radius: var(--radius-md);
      padding: 16px;
    }
    .cell-icon { color: var(--accent); margin-bottom: 8px; }
    .cell-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-light); margin-bottom: 4px; }
    .cell-val { font-size: 14px; font-weight: 500; word-break: break-all; }
    .notes-box {
      background: var(--paper-alt);
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      font-size: 13px;
      color: var(--ink-muted);
      text-align: left;
      margin-bottom: 20px;
    }
    .status-badge { margin-bottom: 28px; }
    .action-buttons { display: flex; justify-content: center; gap: 12px; margin-bottom: 24px; }
    .reminder-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 12px;
      color: var(--ink-light);
      line-height: 1.5;
    }
    @media (max-width: 600px) {
      .confirmation-card { padding: 32px 20px; }
      .detail-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ConfirmationComponent implements OnInit {
  private slotService = inject(SlotService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  appointment = signal<Appointment | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('appointmentId')!;
    const found = this.slotService.getAppointmentById(id);
    if (!found) { this.router.navigate(['/booking']); return; }
    this.appointment.set(found);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }
}
