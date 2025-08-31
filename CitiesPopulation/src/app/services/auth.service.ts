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
    // Check if user was previously logged in (for page refresh scenarios)
    const savedUser = this.getSavedUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(savedUser);
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
      this.saveUser(user);
    } else {
      this.currentUserSubject.next(null);
      this.clearSavedUser();
    }
  }

  login(username: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        if (this.validateCredentials(username, password)) {
          const user: User = {
            id: '1',
            email: 'admin@admin.com',
            name: 'Admin User'
          };
          
          this.currentUserSubject.next(user);
          this.saveUser(user);
          observer.next(true);
          
          // Navigate to redirect URL or dashboard
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
    this.clearSavedUser();
    this.redirectUrl = '/dashboard'; // Reset redirect URL
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  private validateCredentials(username: string, password: string): boolean {
    // Only support admin/admin credentials
    return username === 'admin' && password === 'admin';
  }

  private saveUser(user: User): void {
    try {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.warn('Could not save user to session storage:', error);
    }
  }

  private getSavedUser(): User | null {
    try {
      const savedUser = sessionStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.warn('Could not retrieve user from session storage:', error);
      return null;
    }
  }

  private clearSavedUser(): void {
    try {
      sessionStorage.removeItem('currentUser');
    } catch (error) {
      console.warn('Could not clear user from session storage:', error);
    }
  }
}