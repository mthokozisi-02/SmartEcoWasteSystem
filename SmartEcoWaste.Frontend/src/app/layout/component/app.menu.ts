import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.buildMenu();
    }

    buildMenu() {
        const userRole = this.authService.getUserRole();
        const orgType = this.authService.getOrganizationType();

        let propertiesLabel = 'Properties & Zones';
        let tasksLabel = 'Collection Tasks';
        let reportsLabel = 'Citizen Reports';

        if (orgType === 'CommercialMall') {
            propertiesLabel = 'Mall Zones & Docks';
            tasksLabel = 'Contractor Tasks & SLA';
            reportsLabel = 'Store & Tenant Notices';
        } else if (orgType === 'ResidentialEstate') {
            propertiesLabel = 'Estate Blocks & Chutes';
            tasksLabel = 'Cleaning Staff Tasks';
            reportsLabel = 'Resident Overflow Reports';
        } else if (orgType === 'Municipality') {
            propertiesLabel = 'Wards & Civic Depots';
            tasksLabel = 'Fleet Route Dispatch';
            reportsLabel = 'Citizen Grievances';
        }

        const rawMenu: MenuItem[] = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Citizen Services',
                role: 'User',
                items: [
                    {
                        label: 'Report Issue / Bin',
                        icon: 'pi pi-fw pi-exclamation-triangle',
                        routerLink: ['/pages/report-bin'],
                        role: 'User'
                    }
                ]
            },
            {
                label: 'Operations & Facilities',
                role: 'Admin,Staff',
                items: [
                    {
                        label: propertiesLabel,
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/pages/manage-properties'],
                        role: 'Admin'
                    },
                    {
                        label: tasksLabel,
                        icon: 'pi pi-fw pi-check-square',
                        routerLink: ['/pages/manage-tasks'],
                        role: 'Admin,Staff'
                    },
                    {
                        label: 'Smart Bins',
                        icon: 'pi pi-fw pi-trash',
                        role: 'Admin,Staff',
                        items: [
                            {
                                label: 'Register Bin',
                                icon: 'pi pi-fw pi-plus',
                                routerLink: ['/pages/create-bin'],
                                role: 'Admin'
                            },
                            {
                                label: 'Manage Bins',
                                icon: 'pi pi-fw pi-eye',
                                routerLink: ['/pages/manage-bins'],
                                role: 'Admin,Staff'
                            }
                        ]
                    },
                    {
                        label: reportsLabel,
                        icon: 'pi pi-fw pi-list-check',
                        routerLink: ['/pages/manage-reports'],
                        role: 'Admin'
                    }
                ]
            },
            {
                label: 'Organization Management',
                items: [
                    {
                        label: 'Profile',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['/pages/profile']
                    },
                    {
                        label: 'Staff & Roles',
                        icon: 'pi pi-fw pi-users',
                        role: 'Admin',
                        items: [
                            {
                                label: 'Add User',
                                icon: 'pi pi-fw pi-user-plus',
                                routerLink: ['/pages/create-user'],
                                role: 'Admin'
                            },
                            {
                                label: 'Manage Staff',
                                icon: 'pi pi-fw pi-user-edit',
                                routerLink: ['/pages/manage-users'],
                                role: 'Admin'
                            }
                        ]
                    },
                    {
                        label: 'Public Portal',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    }
                ]
            }
        ];

        this.model = this.filterMenuByRole(rawMenu, userRole);
    }

    filterMenuByRole(items: any[], userRole: string | null): any[] {
        return items
            .map((item) => {
                if (item.items) {
                    const filteredSubItems = this.filterMenuByRole(item.items, userRole);
                    return { ...item, items: filteredSubItems };
                }
                return item;
            })
            .filter((item) => {
                if (item.items && item.items.length === 0) {
                    return false;
                }
                if (item.role) {
                    const normalizedUserRole = (userRole || '').toLowerCase();
                    const allowedRoles = item.role.toLowerCase().split(',').map((r: string) => r.trim());
                    return allowedRoles.includes(normalizedUserRole) || normalizedUserRole.includes('superadmin');
                }
                return true;
            });
    }
}
