/* import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileComponent,
    HeaderComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// app.component.html
<div class="app-container">
  <app-header></app-header>
  <main class="content">
    <router-outlet></router-outlet>
  </main>
</div>

// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-user-login';
}

// models/user.model.ts
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  role: string;
  createdAt: Date;
  bio?: string;
  location?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Mock API URL - replace with your actual API endpoint
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    const token = localStorage.getItem('auth_token');
    
    if (userJson && token) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (e) {
        this.logout();
      }
    }
  }

  login(loginRequest: LoginRequest): Observable<User> {
    // For demo purpose, we'll mock the API call
    // In a real app, replace this with actual API call
    return this.mockLogin(loginRequest).pipe(
      tap((response: LoginResponse) => {
        this.setSession(response);
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        console.error('Login error', error);
        return throwError(() => new Error('Invalid username or password'));
      })
    );
  }

  // Mock login for demo purposes
  private mockLogin(loginRequest: LoginRequest): Observable<LoginResponse> {
    // In a real application, you would use your actual API endpoint:
    // return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginRequest);
    
    // For demo, we'll simulate a successful login if username is "admin" and password is "password"
    if (loginRequest.username === 'admin' && loginRequest.password === 'password') {
      const mockUser: User = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'John',
        lastName: 'Doe',
        profileImage: 'https://via.placeholder.com/150',
        role: 'Admin',
        createdAt: new Date(),
        bio: 'Software developer with 10 years of experience',
        location: 'New York, USA'
      };
      
      const mockResponse: LoginResponse = {
        user: mockUser,
        token: 'mock-jwt-token-12345'
      };
      
      return of(mockResponse);
    } else {
      return throwError(() => new Error('Invalid username or password'));
    }
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('auth_token', authResult.token);
    localStorage.setItem('currentUser', JSON.stringify(authResult.user));
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

// services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getUserProfile(): Observable<User> {
    // In a real app, you would fetch from an API:
    // return this.http.get<User>(`${this.apiUrl}/users/profile`);
    
    // For demo, we'll just return the current user from auth service
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      return of(currentUser);
    } else {
      throw new Error('User not found');
    }
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    // In a real app:
    // return this.http.put<User>(`${this.apiUrl}/users/profile`, userData);
    
    // For demo:
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return of(updatedUser);
    } else {
      throw new Error('User not found');
    }
  }
}

// guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

// interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService) {}
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    if (token) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authRequest);
    }
    
    return next.handle(request);
  }
}

// components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.errorMessage = err.message || 'Login failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}

// components/login/login.component.html
<div class="login-container">
  <div class="login-card">
    <h2>Login to Your Account</h2>
    
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
      <div class="alert alert-danger" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>
      
      <div class="form-group">
        <label for="username">Username</label>
        <input 
          type="text" 
          id="username" 
          formControlName="username" 
          class="form-control"
          [ngClass]="{'is-invalid': loginForm.get('username')?.invalid && loginForm.get('username')?.touched}"
        >
        <div class="invalid-feedback" *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
          Username is required
        </div>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          formControlName="password" 
          class="form-control"
          [ngClass]="{'is-invalid': loginForm.get('password')?.invalid && loginForm.get('password')?.touched}"
        >
        <div class="invalid-feedback" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
          Password is required and must be at least 6 characters
        </div>
      </div>
      
      <div class="form-group">
        <button 
          type="submit" 
          class="btn btn-primary" 
          [disabled]="loginForm.invalid || isSubmitting"
        >
          {{ isSubmitting ? 'Logging in...' : 'Login' }}
        </button>
      </div>
      
      <div class="form-group login-hint">
        <p>For demo, use: username <strong>admin</strong> and password <strong>password</strong></p>
      </div>
    </form>
  </div>
</div>

// components/login/login.component.scss
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.login-card h2 {
  margin-bottom: 24px;
  text-align: center;
  color: #333;
}

.login-form {
  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    
    &.is-invalid {
      border-color: #dc3545;
    }
  }

  .invalid-feedback {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
  }

  .btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    
    &.btn-primary {
      background-color: #4361ee;
      color: white;
      
      &:hover {
        background-color: #3a56d4;
      }
      
      &:disabled {
        background-color: #a0aee8;
        cursor: not-allowed;
      }
    }
  }
  
  .alert {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
    
    &.alert-danger {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }
  }
  
  .login-hint {
    text-align: center;
    color: #6c757d;
    font-size: 14px;
    margin-top: 10px;
  }
}

// components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  isLoading = true;
  isEditing = false;
  isSubmitting = false;
  updateMessage = '';
  updateSuccess = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      bio: [''],
      location: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    
    this.userService.getUserProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.populateForm(user);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile', error);
        this.isLoading = false;
      }
    });
  }

  populateForm(user: User): void {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio || '',
      location: user.location || ''
    });
    
    this.profileForm.disable(); // Initially disable the form
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    
    if (this.isEditing) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      if (this.user) {
        this.populateForm(this.user);
      }
    }
    
    this.updateMessage = '';
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    this.updateMessage = '';
    
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isSubmitting = false;
        this.isEditing = false;
        this.profileForm.disable();
        this.updateMessage = 'Profile updated successfully!';
        this.updateSuccess = true;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.updateMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error updating profile', error);
        this.isSubmitting = false;
        this.updateMessage = 'Failed to update profile. Please try again.';
        this.updateSuccess = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

// components/profile/profile.component.html
<div class="profile-container">
  <div class="profile-card">
    <div class="card-header">
      <h2>User Profile</h2>
      <div class="header-actions">
        <button class="btn btn-outline" *ngIf="!isEditing" (click)="toggleEdit()">
          <i class="fas fa-edit"></i> Edit Profile
        </button>
        <button class="btn btn-outline btn-danger" (click)="logout()">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>
    
    <div class="card-content">
      <!-- Loading Spinner -->
      <div class="loading-spinner" *ngIf="isLoading">Loading profile...</div>
      
      <!-- Profile Information -->
      <ng-container *ngIf="!isLoading && user">
        <div class="profile-header">
          <div class="profile-avatar">
            <img [src]="user.profileImage || '/assets/default-avatar.png'" alt="Profile Image">
          </div>
          <div class="profile-info">
            <h3>{{ user.firstName }} {{ user.lastName }}</h3>
            <p class="username">@{{ user.username }}</p>
            <p class="role">{{ user.role }}</p>
          </div>
        </div>
        
        <!-- Update Message -->
        <div class="alert" *ngIf="updateMessage" [ngClass]="{'alert-success': updateSuccess, 'alert-danger': !updateSuccess}">
          {{ updateMessage }}
        </div>
        
        <!-- Profile Form -->
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                formControlName="firstName" 
                class="form-control"
                [ngClass]="{'is-invalid': profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched}"
              >
              <div class="invalid-feedback" *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched">
                First name is required
              </div>
            </div>
            
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                formControlName="lastName" 
                class="form-control"
                [ngClass]="{'is-invalid': profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched}"
              >
              <div class="invalid-feedback" *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched">
                Last name is required
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              [ngClass]="{'is-invalid': profileForm.get('email')?.invalid && profileForm.get('email')?.touched}"
            >
            <div class="invalid-feedback" *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
              Please enter a valid email address
            </div>
          </div>
          
          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea 
              id="bio" 
              formControlName="bio" 
              class="form-control"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="location">Location</label>
            <input 
              type="text" 
              id="location" 
              formControlName="location" 
              class="form-control"
            >
          </div>
          
          <div class="form-actions" *ngIf="isEditing">
            <button type="button" class="btn btn-secondary" (click)="toggleEdit()">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="profileForm.invalid || isSubmitting"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
        
        <!-- Additional Info -->
        <div class="additional-info">
          <p><strong>Member Since:</strong> {{ user.createdAt | date:'mediumDate' }}</p>
        </div>
      </ng-container>
    </div>
  </div>
</div>

// components/profile/profile.component.scss
.profile-container {
  display: flex;
  justify-content: center;
  padding: 30px 20px;
}

.profile-card {
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  
  h2 {
    margin: 0;
    color: #333;
  }
}

.header-actions {
  display: flex;
  gap: 10px;
}

.card-content {
  padding: 30px;
}

.loading-spinner {
  text-align: center;
  color: #666;
  padding: 40px 0;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  margin-right: 20px;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.profile-info {
  h3 {
    margin: 0 0 5px 0;
    font-size: 24px;
  }
  
  .username {
    color: #666;
    margin: 0 0 5px 0;
  }
  
  .role {
    display: inline-block;
    background-color: #4361ee;
    color: white;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 14px;
    margin: 5px 0 0 0;
  }
}

.profile-form {
  margin-top: 20px;
  
  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    
    @media (max-width: 576px) {
      flex-direction: column;
      gap: 0;
    }
    
    .form-group {
      flex: 1;
    }
  }
  
  .form-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }
    
    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      
      &:disabled {
        background-color: #f9f9f9;
        cursor: not-allowed;
      }
      
      &.is-invalid {
        border-color: #dc3545;
      }
      
      &:focus {
        outline: none;
        border-color: #4361ee;
        box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
      }
    }
    
    textarea.form-control {
      resize: vertical;
    }
    
    .invalid-feedback {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 30px;
  }
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  
  i {
    font-size: 16px;
  }
  
  &.btn-primary {
    background-color: #4361ee;
    border: none;
    color: white;
    
    &:hover {
      background-color: #3a56d4;
    }
    
    &:disabled {
      background-color: #a0aee8;
      cursor: not-allowed;
    }
  }
  
  &.btn-secondary {
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    color: #333;
    
    &:hover {
      background-color: #e9ecef;
    }
  }
  
  &.btn-outline {
    background-color: transparent;
    border: 1px solid #4361ee;
    color: #4361ee;
    
    &:hover {
      background-color: #eef0fd;
    }
    
    &.btn-danger {
      border-color: #dc3545;
      color: #dc3545;
      
      &:hover {
        background-color: #fdf0f1;
      }
    }
  }
}

.alert {
  padding: 12px 16px; */