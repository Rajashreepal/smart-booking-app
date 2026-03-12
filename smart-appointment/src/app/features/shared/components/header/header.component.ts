import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    @if (auth.isLoggedIn()) {
      <header class="header">
        <div class="container">
          <div class="header-inner">
            <a class="logo" [routerLink]="auth.isAdmin() ? '/admin' : '/booking'">
              <span class="logo-mark">SB</span>
              <span class="logo-text">SmartBook</span>
            </a>

            <nav class="nav">
              @if (!auth.isAdmin()) {
                <a routerLink="/booking" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  Appointments
                </a>
              }
              @if (auth.isAdmin()) {
                <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Dashboard
                </a>
                <a routerLink="/admin/manage-slots" routerLinkActive="active" class="nav-link">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                  Manage Slots
                </a>
              }
            </nav>

            <div class="header-right">
              <div class="user-info">
                <div class="user-avatar">{{ initials }}</div>
                <div class="user-details">
                  <span class="user-name">{{ auth.currentUser()?.name }}</span>
                  <span class="user-role">{{ auth.currentUser()?.role | titlecase }}</span>
                </div>
              </div>
              <button class="btn btn-ghost btn-sm logout-btn" (click)="logout()">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
    }
  `,
  styles: [`
    .header {
      background: #fff;
      border-bottom: 1px solid var(--border);
      height: 72px;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(8px);
    }
    .header-inner {
      display: flex;
      align-items: center;
      gap: 32px;
      height: 72px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-mark {
      width: 36px;
      height: 36px;
      background: var(--ink);
      color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .logo-text {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 600;
      color: var(--ink);
    }
    .nav {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 500;
      color: var(--ink-muted);
      transition: all var(--transition);
      text-decoration: none;
      &:hover { color: var(--ink); background: var(--paper-alt); }
      &.active { color: var(--ink); background: var(--paper-alt); }
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-left: auto;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      background: var(--accent-light);
      color: var(--accent-dark);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      font-family: var(--font-display);
    }
    .user-details {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.2;
    }
    .user-role {
      font-size: 11px;
      color: var(--ink-light);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .logout-btn {
      border: 1px solid var(--border);
      &:hover { border-color: var(--danger); color: var(--danger); background: var(--danger-bg); }
    }
    @media (max-width: 640px) {
      .user-details, .logo-text { display: none; }
      .nav-link span { display: none; }
    }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  get initials(): string {
    const name = this.auth.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}
