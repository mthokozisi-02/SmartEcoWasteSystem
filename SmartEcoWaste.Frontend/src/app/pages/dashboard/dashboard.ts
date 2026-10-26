import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/core/services/auth.service';
import { MallDashboard } from './components/mall-dashboard';
import { EstateDashboard } from './components/estate-dashboard';
import { MunicipalityDashboard } from './components/municipality-dashboard';
import { UserDashboardWidget } from './components/userdashboardwidget';
import { StaffDashboard } from './components/staff-dashboard';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MallDashboard, EstateDashboard, MunicipalityDashboard, UserDashboardWidget, StaffDashboard],
    template: `
        <div class="w-full">
            <!-- 1. Basic Regular User / Resident Member -->
            <ng-container *ngIf="isBasicUser">
                <app-user-dashboard-widget />
            </ng-container>

            <!-- 2. Staff / Cleaner / Field Collector: strictly their personal assigned tasks & stats -->
            <ng-container *ngIf="isStaff">
                <app-staff-dashboard />
            </ng-container>

            <!-- 3. Operational Administrator View: Adaptive Organization-Wide Operational Dashboard -->
            <ng-container *ngIf="!isBasicUser && !isStaff">
                <ng-container [ngSwitch]="organizationType">
                    <!-- Commercial Mall Operations View -->
                    <app-mall-dashboard *ngSwitchCase="'CommercialMall'" />

                    <!-- Residential Estate / Complex Operations View -->
                    <app-estate-dashboard *ngSwitchCase="'ResidentialEstate'" />

                    <!-- City Council / Municipality Operations View -->
                    <app-municipality-dashboard *ngSwitchCase="'Municipality'" />

                    <!-- Default Fallback to Mall View -->
                    <app-mall-dashboard *ngSwitchDefault />
                </ng-container>
            </ng-container>
        </div>
    `
})
export class Dashboard implements OnInit {
    organizationType = 'CommercialMall';
    isBasicUser = false;
    isStaff = false;

    private authService = inject(AuthService);

    ngOnInit() {
        const role = (this.authService.getUserRole() || '').toLowerCase();
        this.isBasicUser = role === 'user';
        this.isStaff = role === 'staff';
        this.organizationType = this.authService.getOrganizationType() || 'CommercialMall';

        this.authService.organizationType$.subscribe((type) => {
            if (type) {
                this.organizationType = type;
            }
        });
    }
}
