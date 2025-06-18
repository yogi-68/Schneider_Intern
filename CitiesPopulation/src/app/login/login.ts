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
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  onSubmit() {
    this.errorMessage = '';
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }
    this.isLoading = true;
    if (this.username === 'admin' && this.password === 'admin') {
      console.log('Login successful');
      this.authService.setAuthState(true);
      this.router.navigate(['/dashboard']).then(() => {
        this.isLoading = false;
      });
    } 
    else {
      this.errorMessage = 'Please enter both username and password';
      console.log('Invalid login attempt:', { 
        username: this.username, 
        password: this.password 
      });
      this.isLoading = false;
    }
  }
}
