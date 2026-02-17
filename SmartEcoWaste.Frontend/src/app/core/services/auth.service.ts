import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse } from 'src/assets/interfaces/auth-response';
import { LoginDto } from 'src/assets/interfaces/login-dto';

const apiUrl = 'https://localhost:7107/api';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<boolean>(this.hasToken());
    public isLoggedIn$ = this.currentUserSubject.asObservable();

    private refreshTimer: any;

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    // ===============================
    // LOGIN
    // ===============================
    login(login: LoginDto): Observable<AuthResponse> {
        console.log(login);
        return this.http.post<AuthResponse>(`${apiUrl}/user-login`, login).pipe(
            tap((response) => {
                this.setSession(response);
                this.getUserRole();
                this.currentUserSubject.next(true);
            })
        );
    }

    // ===============================
    // LOGOUT
    // ===============================
    logout(): void {
        const refreshToken = this.getRefreshToken();

        if (refreshToken) {
            this.http.post(`${apiUrl}/logout`, { refreshToken }).subscribe();
        }

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');

        this.currentUserSubject.next(false);
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        const token = this.getAccessToken();
        return !!token && !this.isTokenExpired();
    }

    // ===============================
    // STORE TOKENS
    // ===============================
    private setSession(authResult: AuthResponse) {
        const expiresAt = Date.now() + authResult.data.expiresIn * 1000;

        localStorage.setItem('access_token', authResult.data.accessToken);
        localStorage.setItem('refresh_token', authResult.data.refreshToken);
        localStorage.setItem('expires_at', expiresAt.toString());

        this.startRefreshTokenTimer(authResult.data.expiresIn);
    }

    // ===============================
    // TOKEN HELPERS
    // ===============================
    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    private hasToken(): boolean {
        return !!localStorage.getItem('access_token');
    }

    isTokenExpired(): boolean {
        const expiresAt = localStorage.getItem('expires_at');
        if (!expiresAt) return true;

        return Date.now() > +expiresAt;
    }

    // ===============================
    // REFRESH TOKEN
    // ===============================
    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return throwError(() => new Error('No refresh token'));

        return this.http.post<AuthResponse>(`${apiUrl}/refresh`, { refreshToken }).pipe(
            tap((response) => {
                this.setSession(response);
            }),
            catchError((err) => {
                this.logout();
                return throwError(() => err);
            })
        );
    }

    // ===============================
    // AUTO REFRESH TIMER
    // ===============================
    private startRefreshTokenTimer(expiresIn: number) {
        const timeout = (expiresIn - 60) * 1000; // refresh 1 min before expiry

        this.refreshTimer = setTimeout(() => {
            this.refreshToken().subscribe();
        }, timeout);
    }

    stopRefreshTimer() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    }

    // ===============================
    // CHECK LOGIN ON APP START
    // ===============================
    autoLogin() {
        if (!this.getAccessToken()) return;

        if (this.isTokenExpired()) {
            this.refreshToken().subscribe({
                next: () => this.currentUserSubject.next(true),
                error: () => this.logout()
            });
        } else {
            this.currentUserSubject.next(true);
        }
    }

    getUserRole(): string | null {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        const decoded: any = jwtDecode(token);

        // Extract claims using full keys
        const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
        const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;

        if (userId) {
            localStorage.setItem('user_id', userId);
        }

        return role;
    }
}
