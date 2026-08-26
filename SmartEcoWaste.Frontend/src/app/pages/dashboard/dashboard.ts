import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveMonitoringWidget } from './components/livemonitoringwidget';
import { UserDashboardWidget } from './components/userdashboardwidget';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, LiveMonitoringWidget, UserDashboardWidget],
    template: `
        <div class="w-full">
            <ng-container *ngIf="isAdmin; else userDashboard">
                <app-live-monitoring-widget />
            </ng-container>
            <ng-template #userDashboard>
                <app-user-dashboard-widget />
            </ng-template>
        </div>
    `
})
export class Dashboard implements OnInit {
    isAdmin = false;

    private authService = inject(AuthService);

    ngOnInit() {
        const role = (this.authService.getUserRole() || '').toLowerCase();
        this.isAdmin = role.includes('admin') || role.includes('superadmin');
    }
}
