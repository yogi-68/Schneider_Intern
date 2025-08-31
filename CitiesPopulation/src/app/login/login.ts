import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  onSubmit() {
    this.errorMessage = '';
    this.showError = false;
    
    if (!this.username || !this.password) {
      this.showErrorMessage('Please enter both username and password');
      return;
    }
    
    this.isLoading = true;
    
    // Use the auth service login method for consistent validation
    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          console.log('Login successful');
          // Navigation is handled by the auth service
        } else {
          this.showErrorMessage('Invalid login!!!');
          console.log('Invalid login attempt:', { 
            username: this.username, 
            password: this.password 
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showErrorMessage('Login failed. Please try again.');
        console.error('Login error:', error);
      }
    });
  }
  
  private showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    
    // Auto-hide error message after 5 seconds
    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }
}