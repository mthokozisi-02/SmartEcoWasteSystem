import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/core/services/auth.service';
import { MallDashboard } from './components/mall-dashboard';
import { EstateDashboard } from './components/estate-dashboard';
import { MunicipalityDashboard } from './components/municipality-dashboard';
import { UserDashboardWidget } from './components/userdashboardwidget';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MallDashboard, EstateDashboard, MunicipalityDashboard, UserDashboardWidget],
    template: `
        <div class="w-full">
            <!-- If basic regular user (e.g. individual resident member) -->
            <ng-container *ngIf="isBasicUser; else orgDashboard">
                <app-user-dashboard-widget />
            </ng-container>

            <!-- Adaptive Organization-Specific Operational Dashboard -->
            <ng-template #orgDashboard>
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
            </ng-template>
        </div>
    `
})
export class Dashboard implements OnInit {
    organizationType = 'CommercialMall';
    isBasicUser = false;

    private authService = inject(AuthService);

    ngOnInit() {
        const role = (this.authService.getUserRole() || '').toLowerCase();
        this.isBasicUser = role === 'user';
        this.organizationType = this.authService.getOrganizationType() || 'CommercialMall';

        this.authService.organizationType$.subscribe((type) => {
            if (type) {
                this.organizationType = type;
            }
        });
    }
}
