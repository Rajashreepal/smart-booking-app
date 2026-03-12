import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatch(ctrl: AbstractControl) {
  const pw = ctrl.get('password')?.value;
  const confirm = ctrl.get('confirmPassword')?.value;
  if (pw && confirm && pw !== confirm) {
    ctrl.get('confirmPassword')?.setErrors({ mismatch: true });
  } else {
    const errs = ctrl.get('confirmPassword')?.errors;
    if (errs?.['mismatch']) {
      const { mismatch, ...rest } = errs;
      ctrl.get('confirmPassword')?.setErrors(Object.keys(rest).length ? rest : null);
    }
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <div class="brand-mark">SB</div>
          <h1 class="brand-title">Join SmartBook</h1>
          <p class="brand-subtitle">Create your account and start booking appointments with ease.</p>
        </div>
        <div class="steps">
          @for (s of steps; track s.num) {
            <div class="step">
              <div class="step-num">{{ s.num }}</div>
              <div>
                <div class="step-title">{{ s.title }}</div>
                <div class="step-desc">{{ s.desc }}</div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card fade-in">
          <div class="auth-header">
            <h2>Create Account</h2>
            <p>Fill in the details below to get started</p>
          </div>

          @if (errorMsg()) {
            <div class="alert alert-danger">{{ errorMsg() }}</div>
          }
          @if (successMsg()) {
            <div class="alert alert-success">{{ successMsg() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" formControlName="name" class="form-control"
                  [class.is-invalid]="isInvalid('name')" placeholder="John Doe" />
                @if (isInvalid('name')) {
                  <span class="form-error">{{ getError('name') }}</span>
                }
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" formControlName="phone" class="form-control"
                  [class.is-invalid]="isInvalid('phone')" placeholder="9876543210" />
                @if (isInvalid('phone')) {
                  <span class="form-error">{{ getError('phone') }}</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" formControlName="email" class="form-control"
                [class.is-invalid]="isInvalid('email')" placeholder="you@example.com" />
              @if (isInvalid('email')) {
                <span class="form-error">{{ getError('email') }}</span>
              }
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" formControlName="password" class="form-control"
                  [class.is-invalid]="isInvalid('password')" placeholder="Min. 6 characters" />
                @if (isInvalid('password')) {
                  <span class="form-error">{{ getError('password') }}</span>
                }
              </div>
              <div class="form-group">
                <label class="form-label">Confirm Password</label>
                <input type="password" formControlName="confirmPassword" class="form-control"
                  [class.is-invalid]="isInvalid('confirmPassword')" placeholder="Repeat password" />
                @if (isInvalid('confirmPassword')) {
                  <span class="form-error">{{ getError('confirmPassword') }}</span>
                }
              </div>
            </div>

            <div class="password-strength" *ngIf="form.get('password')?.value">
              <div class="strength-bar">
                <div class="strength-fill" [style.width.%]="strengthPct" [class]="'strength-' + strengthLevel"></div>
              </div>
              <span class="strength-label" [class]="'strength-' + strengthLevel">{{ strengthLabel }}</span>
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" [disabled]="loading()">
              @if (loading()) {
                <div class="spinner"></div> Creating account...
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/auth/login" class="link">Sign in</a></p>
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
      gap: 48px;
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
    .brand-title { font-size: 38px; color: #fff; margin-bottom: 12px; }
    .brand-subtitle { font-size: 16px; color: rgba(255,255,255,0.5); line-height: 1.6; max-width: 320px; }
    .steps { display: flex; flex-direction: column; gap: 20px; }
    .step { display: flex; align-items: flex-start; gap: 14px; }
    .step-num {
      width: 32px; height: 32px; background: var(--accent); color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0;
    }
    .step-title { font-size: 14px; font-weight: 500; color: #fff; margin-bottom: 2px; }
    .step-desc { font-size: 12px; color: rgba(255,255,255,0.4); }
    .auth-right {
      background: var(--paper);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      overflow-y: auto;
    }
    .auth-card { width: 100%; max-width: 460px; }
    .auth-header { margin-bottom: 28px; h2 { font-size: 28px; margin-bottom: 6px; } p { color: var(--ink-muted); font-size: 14px; } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: var(--ink-muted); }
    .link { color: var(--accent-dark); font-weight: 500; &:hover { text-decoration: underline; } }
    .password-strength { margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .strength-bar { flex: 1; height: 4px; background: var(--paper-alt); border-radius: 2px; overflow: hidden; }
    .strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s ease, background 0.3s ease; }
    .strength-weak .strength-fill, .strength-weak { background: var(--danger); color: var(--danger); }
    .strength-fair .strength-fill, .strength-fair { background: var(--warning); color: var(--warning); }
    .strength-strong .strength-fill, .strength-strong { background: var(--success); color: var(--success); }
    .strength-label { font-size: 12px; font-weight: 500; min-width: 48px; }
    @media (max-width: 768px) {
      .auth-page { grid-template-columns: 1fr; }
      .auth-left { display: none; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatch });

  loading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  steps = [
    { num: '1', title: 'Create Account', desc: 'Fill in your details to register.' },
    { num: '2', title: 'Browse Slots', desc: 'View available appointment time slots.' },
    { num: '3', title: 'Book & Confirm', desc: 'Book your slot and receive confirmation.' }
  ];

  get strengthPct(): number {
    const pw = this.form.get('password')?.value || '';
    let score = 0;
    if (pw.length >= 6) score += 33;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 33;
    if (/[0-9!@#$%^&*]/.test(pw)) score += 34;
    return score;
  }

  get strengthLevel(): string {
    const p = this.strengthPct;
    if (p <= 33) return 'weak';
    if (p <= 66) return 'fair';
    return 'strong';
  }

  get strengthLabel(): string {
    return this.strengthLevel.charAt(0).toUpperCase() + this.strengthLevel.slice(1);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['email']) return 'Enter a valid email address.';
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors['pattern']) return 'Enter a valid 10-digit phone number.';
    if (ctrl.errors['mismatch']) return 'Passwords do not match.';
    return '';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    setTimeout(async () => {
      const { name, email, password, phone } = this.form.value;
      const result = await this.auth.register(name!, email!, password!, phone!);
      this.loading.set(false);

      if (!result.success) { this.errorMsg.set(result.message); return; }

      this.successMsg.set('Account created! Redirecting to login...');
      setTimeout(() => this.router.navigate(['/auth/login']), 1500);
    }, 600);
  }
}
