import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Auth as AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage = '';
  isLoading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      this.auth.login(email, password).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.auth.setToken(res.access_token);
          this.router.navigate(['/dashboard']); // navigate to protected page
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Login failed', err);
          if (err.status === 401) {
            this.errorMessage = 'Invalid email or password. Please try again.';
          } else if (err.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please check your connection.';
          } else {
            this.errorMessage = 'An error occurred. Please try again later.';
          }
        },
      });
    }
  }
  signInWithGoogle() {
    console.log('Google sign in clicked');
    // Implement Google authentication here
  }

  onToggle() {
    // Trigger the switch to the signup component
  }
}
