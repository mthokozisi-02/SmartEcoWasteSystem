import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse } from 'src/assets/interfaces/auth-response';
import { LoginDto } from 'src/assets/interfaces/login-dto';
import { environment } from 'src/environments/environment';

const apiUrl = environment.apiUrl;

export interface TenantInfo {
    id: number;
    name: string;
    code: string;
    organizationType: string;
    isActive: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<boolean>(this.hasToken());
    public isLoggedIn$ = this.currentUserSubject.asObservable();

    private organizationTypeSubject = new BehaviorSubject<string>(this.getOrganizationType());
    public organizationType$ = this.organizationTypeSubject.asObservable();

    private refreshTimer: any;

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    // ===============================
    // LOGIN
    // ===============================
    login(login: LoginDto): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${apiUrl}/user-login`, login).pipe(
            tap((response) => {
                this.setSession(response);
                this.getUserRole();
                this.currentUserSubject.next(true);
                this.organizationTypeSubject.next(this.getOrganizationType());
            })
        );
    }

    // ===============================
    // PUBLIC TENANTS
    // ===============================
    getPublicTenants(): Observable<{ isSuccess: boolean; data: TenantInfo[] }> {
        return this.http.get<{ isSuccess: boolean; data: TenantInfo[] }>(`${apiUrl}/tenant/public-list`);
    }

    // ===============================
    // LOGOUT
    // ===============================
    logout(): void {
        this.stopRefreshTimer();

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('user_id');
        localStorage.removeItem('tenant_id');
        localStorage.removeItem('tenant_name');
        localStorage.removeItem('tenant_code');
        localStorage.removeItem('organization_type');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');

        this.currentUserSubject.next(false);
        this.organizationTypeSubject.next('CommercialMall');
        this.router.navigate(['/auth/login']);
    }

    isLoggedIn(): boolean {
        const token = this.getAccessToken();
        return !!token && !this.isTokenExpired();
    }

    // ===============================
    // STORE TOKENS & TENANT
    // ===============================
    private setSession(authResult: AuthResponse) {
        const data = authResult.data;
        const expiresIn = data?.expiresIn || 86400;
        const expiresAt = Date.now() + expiresIn * 1000;

        if (data?.accessToken) localStorage.setItem('access_token', data.accessToken);
        if (data?.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
        localStorage.setItem('expires_at', expiresAt.toString());

        if (data?.tenantId) localStorage.setItem('tenant_id', data.tenantId.toString());
        if (data?.tenantName) localStorage.setItem('tenant_name', data.tenantName);
        if (data?.tenantCode) localStorage.setItem('tenant_code', data.tenantCode);
        if (data?.organizationType) localStorage.setItem('organization_type', data.organizationType);
        if (data?.role) localStorage.setItem('user_role', data.role);
        if (data?.userName) localStorage.setItem('user_name', data.userName);

        this.startRefreshTokenTimer(expiresIn);
    }

    // ===============================
    // TOKEN & TENANT GETTERS
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

    getTenantId(): number {
        const tid = localStorage.getItem('tenant_id');
        if (tid) return parseInt(tid, 10);

        const token = this.getAccessToken();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                if (decoded?.TenantId) return parseInt(decoded.TenantId, 10);
            } catch {}
        }
        return 1;
    }

    getTenantName(): string {
        const name = localStorage.getItem('tenant_name');
        if (name) return name;

        const token = this.getAccessToken();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                if (decoded?.TenantName) return decoded.TenantName;
            } catch {}
        }
        return 'Commercial Mall Operations';
    }

    getTenantCode(): string {
        return localStorage.getItem('tenant_code') || 'MALL-001';
    }

    getUserName(): string {
        return localStorage.getItem('user_name') || 'Operations Staff';
    }

    getOrganizationType(): string {
        const orgType = localStorage.getItem('organization_type');
        if (orgType) return orgType;

        const token = this.getAccessToken();
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                if (decoded?.OrganizationType) return decoded.OrganizationType;
            } catch {}
        }
        return 'CommercialMall'; // Default fallback
    }

    getUserRole(): string | null {
        const storedRole = localStorage.getItem('user_role');
        if (storedRole) return storedRole;

        const token = localStorage.getItem('access_token');
        if (!token) return null;

        try {
            const decoded: any = jwtDecode(token);
            const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'] || null;
            const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded['nameid'] || null;

            if (userId) localStorage.setItem('user_id', userId);
            if (role) localStorage.setItem('user_role', role);

            return role;
        } catch {
            return null;
        }
    }

    // ===============================
    // REFRESH TOKEN
    // ===============================
    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return throwError(() => new Error('No refresh token'));

        return this.http.post<AuthResponse>(`${apiUrl}/refresh-tokens`, { refreshToken }).pipe(
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
        const timeout = Math.max(10, (expiresIn - 60)) * 1000;

        this.refreshTimer = setTimeout(() => {
            this.refreshToken().subscribe();
        }, timeout);
    }

    stopRefreshTimer() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
    }

    autoLogin() {
        if (!this.getAccessToken()) return;

        if (this.isTokenExpired()) {
            this.refreshToken().subscribe({
                next: () => this.currentUserSubject.next(true),
                error: () => this.logout()
            });
        } else {
            this.currentUserSubject.next(true);
            this.organizationTypeSubject.next(this.getOrganizationType());
        }
    }
}
