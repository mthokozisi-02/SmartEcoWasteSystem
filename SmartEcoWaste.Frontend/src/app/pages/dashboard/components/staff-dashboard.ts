import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { CollectionTaskService } from '@/core/services/collection-task.service';
import { ResponseCollectionTaskDto } from 'src/assets/interfaces/commercial-saas-dtos';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-staff-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule, TableModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="flex flex-col gap-6">
            <!-- Staff Hero Banner -->
            <div class="card p-6 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl font-bold shadow-sm">
                        <i class="pi pi-user-edit"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <h1 class="text-2xl font-extrabold text-surface-900 dark:text-surface-0 m-0">Welcome, {{ staffName }}!</h1>
                            <p-tag value="Staff Operations Portal" severity="success" icon="pi pi-shield" />
                        </div>
                        <p class="text-sm text-muted-color m-0">
                            Organization: <b>{{ tenantName }}</b> • Your Assigned Bin Collections & Field Tasks
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <a routerLink="/pages/manage-bins" pButton label="View Bins" icon="pi pi-trash" class="p-button-outlined p-button-sm"></a>
                    <a routerLink="/pages/manage-tasks" pButton label="My Workflows" icon="pi pi-check-square" class="p-button-primary p-button-sm"></a>
                </div>
            </div>

            <!-- Staff Personal Stats KPI Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- KPI 1: Total Tasks -->
                <div class="card p-5 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold uppercase tracking-wider text-muted-color">Total Tasks</span>
                        <div class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                            <i class="pi pi-list"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-extrabold text-surface-900 dark:text-surface-0 mb-1">{{ tasks.length }}</div>
                    <div class="text-xs text-muted-color">Assigned to your queue</div>
                </div>

                <!-- KPI 2: Pending Tasks -->
                <div class="card p-5 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold uppercase tracking-wider text-muted-color">Pending Work</span>
                        <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                            <i class="pi pi-clock"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mb-1">{{ pendingCount }}</div>
                    <div class="text-xs text-muted-color">Awaiting your pickup</div>
                </div>

                <!-- KPI 3: In Progress -->
                <div class="card p-5 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold uppercase tracking-wider text-muted-color">In Progress</span>
                        <div class="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm">
                            <i class="pi pi-spin pi-spinner"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 mb-1">{{ inProgressCount }}</div>
                    <div class="text-xs text-muted-color">Actively being serviced</div>
                </div>

                <!-- KPI 4: Completed -->
                <div class="card p-5 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold uppercase tracking-wider text-muted-color">Completed</span>
                        <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                            <i class="pi pi-check-circle"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">{{ completedCount }}</div>
                    <div class="text-xs text-muted-color">Successfully cleared</div>
                </div>
            </div>

            <!-- Staff Tasks Table -->
            <div class="card p-5 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-sm">
                <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                        <h2 class="text-lg font-bold text-surface-900 dark:text-surface-0 m-0">My Collection Assignments</h2>
                        <p class="text-xs text-muted-color mt-1 mb-0">Bins assigned for you to empty and inspect</p>
                    </div>
                    <a routerLink="/pages/manage-tasks" class="text-sm font-semibold text-emerald-600 hover:text-emerald-500">
                        View All Tasks & Logs &rarr;
                    </a>
                </div>

                <p-table [value]="tasks" [paginator]="true" [rows]="5" [loading]="loading" responsiveLayout="scroll">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Task ID</th>
                            <th>Title</th>
                            <th>Bin</th>
                            <th>Status</th>
                            <th>Due Date</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-t>
                        <tr>
                            <td>#{{ t.id }}</td>
                            <td><span class="font-bold">{{ t.title }}</span></td>
                            <td><p-tag [value]="t.binTag || ('Bin #' + t.binId)" severity="secondary"></p-tag></td>
                            <td><p-tag [value]="getStatusName(t.status)" [severity]="getStatusSeverity(t.status)"></p-tag></td>
                            <td>{{ t.dueDate | date:'mediumDate' }}</td>
                            <td class="flex gap-2">
                                <button *ngIf="t.status === 0 || t.status === 'Pending'" pButton icon="pi pi-play" label="Start" class="p-button-outlined p-button-sm p-button-info" (click)="startTask(t)"></button>
                                <a routerLink="/pages/manage-tasks" *ngIf="t.status === 1 || t.status === 'InProgress'" pButton icon="pi pi-check" label="Complete" class="p-button-outlined p-button-sm p-button-success"></a>
                                <span *ngIf="t.status === 2 || t.status === 'Completed'" class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                    <i class="pi pi-check"></i> Finished
                                </span>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-6 text-muted-color">
                                <i class="pi pi-inbox text-3xl mb-2 block"></i>
                                No collection tasks currently assigned to you.
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export class StaffDashboard implements OnInit {
    private authService = inject(AuthService);
    private taskService = inject(CollectionTaskService);
    private messageService = inject(MessageService);

    staffName = '';
    tenantName = '';
    tasks: ResponseCollectionTaskDto[] = [];
    loading = false;

    get pendingCount(): number {
        return this.tasks.filter((t) => t.status === 0 || (t.status as any) === 'Pending').length;
    }

    get inProgressCount(): number {
        return this.tasks.filter((t) => t.status === 1 || (t.status as any) === 'InProgress').length;
    }

    get completedCount(): number {
        return this.tasks.filter((t) => t.status === 2 || (t.status as any) === 'Completed').length;
    }

    ngOnInit(): void {
        this.staffName = this.authService.getUserName() || 'Staff';
        this.tenantName = this.authService.getTenantName();
        this.loadMyTasks();
    }

    loadMyTasks(): void {
        this.loading = true;
        this.taskService.getMyTasks().subscribe({
            next: (res) => {
                this.tasks = res.data || [];
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    startTask(task: ResponseCollectionTaskDto): void {
        this.taskService.updateTaskStatus(task.id, 1).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Updated', detail: 'Task marked In Progress' });
                this.loadMyTasks();
            }
        });
    }

    getStatusName(status: number | string): string {
        const statuses = ['Pending', 'In Progress', 'Completed', 'Overdue', 'Requires Approval', 'Cancelled'];
        return statuses[Number(status)] || 'Pending';
    }

    getStatusSeverity(status: number | string): 'secondary' | 'info' | 'success' | 'warn' | 'danger' {
        const s = Number(status);
        if (s === 1) return 'info';
        if (s === 2) return 'success';
        if (s === 3) return 'danger';
        if (s === 4) return 'warn';
        return 'secondary';
    }
}
