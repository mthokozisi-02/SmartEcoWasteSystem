import { Component } from '@angular/core';
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
export class AppMenu {
    model: MenuItem[] = [];

    filteredMenu: MenuItem[] = [];

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Pages',
                items: [
                    {
                        label: 'Profile',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['/pages/profile']
                    },
                    {
                        label: 'Bins',
                        icon: 'pi pi-fw pi-trash',
                        items: [
                            {
                                label: 'Create Bin',
                                icon: 'pi pi-fw pi-plus',
                                routerLink: ['/pages/create-bin'],
                                role: 'Admin'
                            },
                            {
                                label: 'Manage Bins',
                                icon: 'pi pi-fw pi-eye',
                                routerLink: ['/pages/manage-bins'],
                                role: 'Admin'
                            }
                        ]
                    },
                    {
                        label: 'Reports',
                        icon: 'pi pi-fw pi-list-check',
                        routerLink: ['/pages/manage-reports'],
                        role: 'Admin'
                    },
                    {
                        label: 'Users',
                        icon: 'pi pi-fw pi-users',
                        items: [
                            {
                                label: 'Create User',
                                icon: 'pi pi-fw pi-user-plus',
                                routerLink: ['/pages/create-user'],
                                role: 'Admin'
                            },
                            {
                                label: 'Manage Users',
                                icon: 'pi pi-fw pi-user-edit',
                                routerLink: ['/pages/manage-users'],
                                role: 'Admin'
                            }
                        ]
                    },
                    {
                        label: 'Eco-Education',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    }
                ]
            }
        ];

        this.buildMenu();
    }

    buildMenu() {
        const userRole = this.authService.getUserRole();

        this.model = this.filterMenuByRole(this.model, userRole);
    }

    filterMenuByRole(items: any[], userRole: string | null): any[] {
        return items
            .map((item) => {
                // If item has role and doesn't match → remove
                if (item.role && item.role !== userRole) {
                    return null;
                }

                // If item has children → filter them recursively
                if (item.items) {
                    item.items = this.filterMenuByRole(item.items, userRole);

                    // If after filtering there are no children → remove parent
                    if (item.items.length === 0) {
                        return null;
                    }
                }

                return item;
            })
            .filter((item) => item !== null);
    }
}
