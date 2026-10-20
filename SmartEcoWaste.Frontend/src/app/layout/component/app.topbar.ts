import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '@/core/services/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, ButtonModule],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <i class="fa-solid fa-recycle text-emerald-600 text-2xl mr-2"></i>
                <span class="font-bold text-xl text-surface-900 dark:text-surface-0">Smart<span class="text-emerald-600">Eco</span>Waste</span>
            </a>
        </div>

        <!-- Tenant Workspace Active Badge -->
        <div class="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-xs font-bold text-surface-800 dark:text-surface-100 shadow-sm">
            <i [class]="getTenantIcon()"></i>
            <span class="truncate max-w-[220px]">{{ tenantName }}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300">{{ tenantCode }}</span>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>
            <p-button label="Logout" (click)="logOut()" severity="danger" [outlined]="true" size="small" icon="fa-solid fa-arrow-right-from-bracket" />
        </div>
    </div>`
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    tenantName = '';
    tenantCode = '';
    orgType = '';

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.tenantName = this.authService.getTenantName();
        this.tenantCode = this.authService.getTenantCode();
        this.orgType = this.authService.getOrganizationType();
    }

    getTenantIcon(): string {
        switch (this.orgType) {
            case 'CommercialMall': return 'fa-solid fa-building-shield text-emerald-600 dark:text-emerald-400';
            case 'ResidentialEstate': return 'fa-solid fa-tree-city text-cyan-600 dark:text-cyan-400';
            case 'Municipality': return 'fa-solid fa-landmark-flag text-amber-600 dark:text-amber-400';
            default: return 'fa-solid fa-building text-emerald-600';
        }
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logOut() {
        this.authService.logout();
    }
}
