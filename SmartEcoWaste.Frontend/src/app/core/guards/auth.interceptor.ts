import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getAccessToken();
        const tenantId = this.authService.getTenantId();

        const headers: { [name: string]: string } = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        if (tenantId) {
            headers['X-Tenant-Id'] = tenantId.toString();
        }

        const authReq = req.clone({
            setHeaders: headers
        });

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    return this.authService.refreshToken().pipe(
                        switchMap(() => {
                            const newToken = this.authService.getAccessToken();
                            const newTenantId = this.authService.getTenantId();

                            const retryHeaders: { [name: string]: string } = {};
                            if (newToken) retryHeaders['Authorization'] = `Bearer ${newToken}`;
                            if (newTenantId) retryHeaders['X-Tenant-Id'] = newTenantId.toString();

                            const retryReq = req.clone({
                                setHeaders: retryHeaders
                            });

                            return next.handle(retryReq);
                        })
                    );
                }

                return throwError(() => error);
            })
        );
    }
}
