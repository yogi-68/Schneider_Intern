import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private redirectUrl: string = '/dashboard';

  constructor(private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  setAuthState(isAuthenticated: boolean): void {
    if (isAuthenticated) {
      const user: User = {
        id: '1',
        email: 'admin@admin.com',
        name: 'Admin User'
      };
      this.currentUserSubject.next(user);
    } else {
      this.currentUserSubject.next(null);
    }
  }

  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        if (this.validateCredentials(email, password)) {
          const user: User = {
            id: '1',
            email: email,
            name: email.split('@')[0]
          };
          
          this.currentUserSubject.next(user);
          observer.next(true);
          
          this.router.navigate([this.redirectUrl]);
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  private validateCredentials(email: string, password: string): boolean {
    return email === 'admin@example.com' && password === 'password';
  }
}