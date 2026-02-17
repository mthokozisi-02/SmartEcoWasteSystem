import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SmartGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const token = this.authService.getAccessToken();

        // Not logged in
        if (!token) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: state.url }
            });
            return false;
        }

        // Role check (if defined)
        const expectedRole = route.data['role'];

        if (expectedRole) {
            const userRole = this.authService.getUserRole();

            if (userRole !== expectedRole) {
                this.router.navigate(['/dashboard']);
                return false;
            }
        }

        return true;
    }
}
