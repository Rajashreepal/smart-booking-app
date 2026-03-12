import { Component, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SlotService } from '../../../core/services/slot.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="page-wrapper">
      <div class="container">
        <div class="page-header fade-in">
          <div>
            <h1>Admin Dashboard</h1>
            <p class="text-muted">Overview of all appointments and slot activity</p>
          </div>
          <a routerLink="/admin/manage-slots" class="btn btn-primary">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Manage Slots
          </a>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid fade-in">
          @for (stat of stats; track stat.label) {
            <div class="stat-card" [style.--accent-color]="stat.color">
              <div class="stat-icon" [innerHTML]="stat.icon"></div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          }
        </div>

        <!-- All Appointments -->
        <div class="section fade-in">
          <div class="section-header">
            <h2>All Appointments</h2>
            <div class="filter-tabs">
              @for (f of filters; track f) {
                <button class="tab-btn" [class.active]="activeFilter === f" (click)="activeFilter = f">
                  {{ f }}
                </button>
              }
            </div>
          </div>

          @if (filteredAppointments.length > 0) {
            <div class="appointments-table">
              <div class="table-header">
                <span>Patient</span>
                <span>Service</span>
                <span>Date & Time</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              @for (appt of filteredAppointments; track appt.id) {
                <div class="table-row">
                  <div class="patient-info">
                    <div class="patient-avatar">{{ appt.userName[0].toUpperCase() }}</div>
                    <div>
                      <div class="patient-name">{{ appt.userName }}</div>
                      <div class="patient-email">{{ appt.userEmail }}</div>
                    </div>
                  </div>
                  <div>
                    <span class="service-tag">{{ appt.service }}</span>
                  </div>
                  <div class="datetime">
                    <span class="appt-date">{{ appt.date | date:'mediumDate' }}</span>
                    <span class="appt-time">{{ appt.startTime }} – {{ appt.endTime }}</span>
                  </div>
                  <div>
                    <span class="badge" [class]="'badge-' + appt.status">{{ appt.status | titlecase }}</span>
                  </div>
                  <div class="row-actions">
                    @if (appt.status === 'confirmed') {
                      <button class="btn btn-success btn-sm" (click)="markComplete(appt.id)">Done</button>
                      <button class="btn btn-ghost btn-sm cancel-btn" (click)="cancelAppt(appt.id)">Cancel</button>
                    }
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <p class="text-muted">No {{ activeFilter.toLowerCase() }} appointments found.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 32px;
      h1 { font-size: 32px; margin-bottom: 6px; }
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 24px;
      position: relative;
      overflow: hidden;
      &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: var(--accent-color, var(--accent));
      }
    }
    .stat-icon {
      color: var(--accent-color, var(--accent));
      margin-bottom: 12px;
    }
    .stat-value { font-family: var(--font-display); font-size: 36px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
    .stat-label { font-size: 13px; color: var(--ink-muted); }
    .section { }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      h2 { font-size: 22px; }
    }
    .filter-tabs { display: flex; gap: 4px; }
    .tab-btn {
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: #fff;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition);
      &:hover { background: var(--paper-alt); }
      &.active { background: var(--ink); border-color: var(--ink); color: #fff; }
    }
    .appointments-table {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr;
      padding: 14px 20px;
      background: var(--paper-alt);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ink-muted);
      font-weight: 500;
    }
    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr;
      padding: 16px 20px;
      align-items: center;
      border-top: 1px solid var(--border);
      transition: background var(--transition);
      &:hover { background: var(--paper); }
    }
    .patient-info { display: flex; align-items: center; gap: 12px; }
    .patient-avatar {
      width: 36px; height: 36px;
      background: var(--paper-alt);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      font-family: var(--font-display);
      flex-shrink: 0;
    }
    .patient-name { font-size: 14px; font-weight: 500; }
    .patient-email { font-size: 12px; color: var(--ink-light); }
    .service-tag {
      font-size: 12px;
      background: var(--paper-alt);
      padding: 3px 10px;
      border-radius: 99px;
      font-weight: 500;
    }
    .datetime { display: flex; flex-direction: column; gap: 2px; }
    .appt-date { font-size: 13px; font-weight: 500; }
    .appt-time { font-size: 12px; color: var(--ink-muted); }
    .row-actions { display: flex; gap: 6px; }
    .cancel-btn { &:hover { color: var(--danger); background: var(--danger-bg); } }
    .empty-state { padding: 40px; text-align: center; }
    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .table-header, .table-row { grid-template-columns: 2fr 1fr 1.5fr 1fr; }
      .table-header span:last-child, .table-row .row-actions { display: none; }
    }
    @media (max-width: 640px) {
      .page-header { flex-direction: column; gap: 16px; }
      .table-header { display: none; }
      .table-row { grid-template-columns: 1fr 1fr; row-gap: 8px; }
    }
  `]
})
export class AdminDashboardComponent {
  private slotService = inject(SlotService);

  filters = ['All', 'Confirmed', 'Completed', 'Cancelled'];
  activeFilter = 'All';

  get allAppointments() { return this.slotService.getAllAppointments(); }

  get filteredAppointments() {
    if (this.activeFilter === 'All') return this.allAppointments;
    return this.allAppointments.filter(a => a.status === this.activeFilter.toLowerCase());
  }

  get stats() {
    const all = this.allAppointments;
    return [
      {
        label: 'Total Slots', value: this.slotService.slots().length,
        color: '#1A56DB',
        icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`
      },
      {
        label: 'Confirmed', value: all.filter(a => a.status === 'confirmed').length,
        color: '#2D7A4F',
        icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      },
      {
        label: 'Completed', value: all.filter(a => a.status === 'completed').length,
        color: '#C8A96E',
        icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
      },
      {
        label: 'Cancelled', value: all.filter(a => a.status === 'cancelled').length,
        color: '#C0392B',
        icon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      }
    ];
  }

  markComplete(id: string): void {
    this.slotService.completeAppointment(id);
  }

  cancelAppt(id: string): void {
    if (confirm('Cancel this appointment?')) {
      this.slotService.cancelAppointment(id, '', true);
    }
  }
}
