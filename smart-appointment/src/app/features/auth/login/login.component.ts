import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <div class="brand-mark">SB</div>
          <h1 class="brand-title">SmartBook</h1>
          <p class="brand-subtitle">Intelligent appointment scheduling for modern service providers.</p>
        </div>
        <div class="auth-features">
          @for (f of features; track f.title) {
            <div class="feature-item">
              <div class="feature-icon" [innerHTML]="f.icon"></div>
              <div>
                <div class="feature-title">{{ f.title }}</div>
                <div class="feature-desc">{{ f.desc }}</div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card fade-in">
          <div class="auth-header">
            <h2>Welcome back</h2>
            <p>Sign in to manage your appointments</p>
          </div>

          @if (errorMsg()) {
            <div class="alert alert-danger">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ errorMsg() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input
                type="email"
                formControlName="email"
                class="form-control"
                [class.is-invalid]="isInvalid('email')"
                placeholder="you@example.com"
              />
              @if (isInvalid('email')) {
                <span class="form-error">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/></svg>
                  {{ getError('email') }}
                </span>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrapper">
                <input
                  [type]="showPass() ? 'text' : 'password'"
                  formControlName="password"
                  class="form-control"
                  [class.is-invalid]="isInvalid('password')"
                  placeholder="Enter your password"
                />
                <button type="button" class="toggle-pass" (click)="showPass.set(!showPass())">
                  @if (showPass()) {
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  } @else {
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              @if (isInvalid('password')) {
                <span class="form-error">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/></svg>
                  {{ getError('password') }}
                </span>
              }
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading()">
              @if (loading()) {
                <div class="spinner"></div> Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a routerLink="/auth/register" class="link">Create one</a></p>
          </div>

          <div class="demo-hint">
            <strong>Demo Credentials</strong><br>
            Admin: admin&#64;smartbook.com / Admin&#64;123<br>
            Register a new account to test user flow
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
    }
    .auth-left {
      background: var(--ink);
      padding: 64px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 56px;
    }
    .brand-mark {
      width: 56px;
      height: 56px;
      background: var(--accent);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 20px;
    }
    .brand-title {
      font-family: var(--font-display);
      font-size: 42px;
      color: #fff;
      margin-bottom: 12px;
    }
    .brand-subtitle {
      font-size: 17px;
      color: rgba(255,255,255,0.5);
      line-height: 1.6;
      max-width: 340px;
    }
    .auth-features { display: flex; flex-direction: column; gap: 24px; }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .feature-icon {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.08);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--accent);
    }
    .feature-title { font-size: 15px; font-weight: 500; color: #fff; margin-bottom: 3px; }
    .feature-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; }
    .auth-right {
      background: var(--paper);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
    }
    .auth-header {
      margin-bottom: 32px;
      h2 { font-size: 30px; margin-bottom: 6px; }
      p { color: var(--ink-muted); font-size: 15px; }
    }
    .input-wrapper { position: relative; }
    .toggle-pass {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--ink-light);
      padding: 4px;
      display: flex;
      &:hover { color: var(--ink); }
    }
    .input-wrapper .form-control { padding-right: 44px; }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: var(--ink-muted);
    }
    .link { color: var(--accent-dark); font-weight: 500; &:hover { text-decoration: underline; } }
    .demo-hint {
      margin-top: 24px;
      padding: 14px 16px;
      background: var(--paper-alt);
      border-radius: var(--radius-sm);
      font-size: 12.5px;
      color: var(--ink-muted);
      line-height: 1.7;
      border-left: 3px solid var(--accent);
    }
    @media (max-width: 768px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-left { display: none; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = signal(false);
  errorMsg = signal('');
  showPass = signal(false);

  features = [
    {
      icon: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
      title: 'Real-time Availability',
      desc: 'See live slot availability and book instantly.'
    },
    {
      icon: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      title: 'Conflict Detection',
      desc: 'Smart system prevents double-bookings automatically.'
    },
    {
      icon: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      title: 'Instant Confirmation',
      desc: 'Get immediate booking confirmation with all details.'
    }
  ];

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (ctrl?.errors?.['required']) return 'This field is required.';
    if (ctrl?.errors?.['email']) return 'Enter a valid email address.';
    if (ctrl?.errors?.['minlength']) return 'Password must be at least 6 characters.';
    return '';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    setTimeout(async () => {
      const { email, password } = this.form.value;
      const result = await this.auth.login(email!, password!);
      this.loading.set(false);

      if (!result.success) { this.errorMsg.set(result.message); return; }

      const returnUrl = this.route.snapshot.queryParams['returnUrl'];
      const dest = returnUrl || (result.user?.role === 'admin' ? '/admin' : '/booking');
      this.router.navigateByUrl(dest);
    }, 600);
  }
}
