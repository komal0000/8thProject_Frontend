import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl: string;
  private tokenKey = 'auth_token';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Use the same dynamic URL logic as ApiService
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      this.apiUrl = 'http://localhost:8000';
    } else if (window.location.hostname.startsWith('192.168.')) {
      this.apiUrl = `http://${window.location.hostname}:8000`;
    } else {
      this.apiUrl = `https://api.${window.location.hostname}`;
    }
  }

  loginWithGithub(): void {
    console.log('hello');
    window.location.href = `${this.apiUrl}/auth/github/redirect`;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
}
