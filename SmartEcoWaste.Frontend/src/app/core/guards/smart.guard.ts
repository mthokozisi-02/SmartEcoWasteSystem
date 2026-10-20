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

        // Not logged in or expired
        if (!token || this.authService.isTokenExpired()) {
            this.router.navigate(['/auth/login'], {
                queryParams: { returnUrl: state.url }
            });
            return false;
        }

        // Role check (if defined)
        const expectedRole = route.data['role'];
        if (expectedRole) {
            const userRole = this.authService.getUserRole();
            if (userRole !== expectedRole && userRole !== 'Admin') {
                this.router.navigate(['/']);
                return false;
            }
        }

        // Allowed Organization Types check (if defined)
        const allowedOrgTypes: string[] | undefined =
            route.data['allowedOrgTypes'] ||
            (route.data['organizationType'] ? [route.data['organizationType']] : undefined);

        if (allowedOrgTypes && allowedOrgTypes.length > 0) {
            const currentOrgType = this.authService.getOrganizationType();
            if (!allowedOrgTypes.includes(currentOrgType)) {
                console.warn(
                    `Access restricted for ${state.url}: Organization type '${currentOrgType}' is not authorized. Allowed: [${allowedOrgTypes.join(', ')}]`
                );
                this.router.navigate(['/']);
                return false;
            }
        }

        return true;
    }
}
