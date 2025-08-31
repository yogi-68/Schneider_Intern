import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('AuthGuard: Checking authentication for route:', state.url);
    
    if (this.authService.isAuthenticated()) {
      console.log('AuthGuard: User is authenticated');
      return true;
    }
    
    console.log('AuthGuard: User is not authenticated, redirecting to login');
    this.authService.setRedirectUrl(state.url);
    
    this.router.navigate(['/login']);
    return false;
  }
}