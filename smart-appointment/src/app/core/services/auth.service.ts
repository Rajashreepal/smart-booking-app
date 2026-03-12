import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthResponse } from '../models/models';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'smartbook_user';
  private readonly TOKEN_KEY = 'smartbook_token';
  private api = inject(ApiService);

  currentUser = signal<User | null>(this.loadUser());
  isLoggedIn = signal<boolean>(!!this.loadUser());

  constructor(private router: Router) {}

  private loadUser(): User | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  async register(name: string, email: string, password: string, phone: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await firstValueFrom(this.api.register(name, email, password, phone));
      return result;
    } catch (error: any) {
      return { success: false, message: error.error?.message || 'Registration failed.' };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const result = await firstValueFrom(this.api.login(email, password));
      
      if (result.success) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(result.user));
        localStorage.setItem(this.TOKEN_KEY, result.token);
        this.currentUser.set(result.user);
        this.isLoggedIn.set(true);
        return { success: true, message: result.message, user: result.user };
      }
      
      return { success: false, message: result.message };
    } catch (error: any) {
      return { success: false, message: error.error?.message || 'Login failed.' };
    }
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/auth/login']);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
