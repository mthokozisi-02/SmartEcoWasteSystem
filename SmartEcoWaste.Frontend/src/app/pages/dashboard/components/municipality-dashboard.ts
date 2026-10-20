import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { CollectionTaskService } from '@/core/services/collection-task.service';
import { CollectionTaskDto } from 'src/assets/interfaces/commercial-saas-dtos';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
    selector: 'app-municipality-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule, ProgressBarModule],
    template: `
        <div class="flex flex-col gap-6">
            <!-- Organization Workspace Header -->
            <div class="card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 text-2xl font-bold shadow-sm">
                        <i class="fa-solid fa-landmark-flag"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white">{{ tenantName }}</h1>
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                                City Council & Sanitation Fleet
                            </span>
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                Code: {{ tenantCode }}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Ward Service Coverage • Fleet Truck Route Scheduling • Citizen Grievance Resolution • Public Telemetry
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <a routerLink="/pages/manage-tasks" pButton label="Fleet Dispatch" icon="fa-solid fa-truck-front" class="p-button-outlined p-button-sm"></a>
                    <a routerLink="/pages/manage-properties" pButton label="Ward Hierarchy" icon="fa-solid fa-map-location-dot" class="p-button-primary p-button-sm"></a>
                </div>
            </div>

            <!-- Municipality KPI Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- KPI 1 -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Ward Service Coverage</span>
                        <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-chart-pie"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">93.4%</div>
                    <div class="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span><i class="fa-solid fa-check mr-1"></i>Wards 1 through 5</span>
                        <span class="text-gray-400 font-normal">Target: 90%</span>
                    </div>
                </div>

                <!-- KPI 2 -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Active Compactor Fleet</span>
                        <div class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-truck-pickup"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">8 / 10 <span class="text-base font-normal text-gray-500">Trucks</span></div>
                    <div class="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        <span><i class="fa-solid fa-route mr-1"></i>GPS tracked routes</span>
                    </div>
                </div>

                <!-- KPI 3 -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Citizen Grievances</span>
                        <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-comments"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">3 <span class="text-base font-normal text-amber-600">Open</span></div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        <span>Avg resolution time: 4.2 hours</span>
                    </div>
                </div>

                <!-- KPI 4 -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Landfill Diversion</span>
                        <div class="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-leaf"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">32.8%</div>
                    <div class="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                        <span>+4.1% city-wide recycling</span>
                    </div>
                </div>
            </div>

            <!-- Two-Column Section: Ward Sanitation Status & Fleet Schedule -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Left: Ward Sanitation & Telemetry (7 Cols) -->
                <div class="lg:col-span-7 flex flex-col gap-4">
                    <div class="card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                        <div class="flex items-center justify-between mb-5">
                            <div>
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Ward Level Service Coverage</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Collection progress and smart bin telemetry per municipal ward</p>
                            </div>
                            <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                <i class="fa-solid fa-satellite text-[8px] mr-1"></i> GIS Dispatch
                            </span>
                        </div>

                        <div class="flex flex-col gap-4">
                            <!-- Ward 1 -->
                            <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                                            <i class="fa-solid fa-city"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-gray-900 dark:text-white">Ward 1 - Central Business & Transit Hub</div>
                                            <div class="text-xs text-gray-500">Commercial Core • 42 Solar Compactor Bins</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        98% Complete
                                    </span>
                                </div>
                                <p-progressBar [value]="98" [showValue]="false" styleClass="h-2" color="#10b981"></p-progressBar>
                                <div class="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                                    <span>Morning collection cycle completed</span>
                                    <span class="text-emerald-600 font-semibold">Truck #04 returning to depot</span>
                                </div>
                            </div>

                            <!-- Ward 2 -->
                            <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                                            <i class="fa-solid fa-houses"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-gray-900 dark:text-white">Ward 2 - Northern Residential Suburbs</div>
                                            <div class="text-xs text-gray-500">Residential Curbside • 118 Collection Points</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                        76% In Progress
                                    </span>
                                </div>
                                <p-progressBar [value]="76" [showValue]="false" styleClass="h-2" color="#3b82f6"></p-progressBar>
                                <div class="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                                    <span>Sector 3 active</span>
                                    <span class="text-blue-600 font-semibold">2 trucks en-route</span>
                                </div>
                            </div>

                            <!-- Ward 4 -->
                            <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                                            <i class="fa-solid fa-industry"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-gray-900 dark:text-white">Ward 4 - Civic Depot & Industrial Sector</div>
                                            <div class="text-xs text-gray-500">Heavy Waste & Public Recycling Drop-Off Hub</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                        64% In Progress
                                    </span>
                                </div>
                                <p-progressBar [value]="64" [showValue]="false" styleClass="h-2" color="#f59e0b"></p-progressBar>
                                <div class="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                                    <span>Afternoon industrial route underway</span>
                                    <span class="text-amber-600 font-semibold">ETA completion 16:30</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Fleet Route Dispatch (5 Cols) -->
                <div class="lg:col-span-5 flex flex-col gap-4">
                    <div class="card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between h-full">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Fleet Route Tasks</h3>
                                <a routerLink="/pages/manage-tasks" class="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400">
                                    Fleet Board <i class="fa-solid fa-chevron-right ml-0.5"></i>
                                </a>
                            </div>

                            <div class="flex flex-col gap-3">
                                <div *ngFor="let task of fleetTasks" class="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/40 shadow-sm flex flex-col gap-2">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-extrabold text-gray-900 dark:text-white truncate max-w-[200px]">{{ task.title }}</span>
                                        <p-tag [value]="getTaskStatusString(task.status)" [severity]="getStatusSeverity(task.status)"></p-tag>
                                    </div>
                                    <div class="flex items-center justify-between text-xs text-gray-500">
                                        <span><i class="fa-solid fa-truck-moving mr-1 text-gray-400"></i>{{ task.contractorName || 'Metro Sanitation Fleet' }}</span>
                                        <span>Due: {{ task.dueDate | date:'shortTime' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Ward Performance Report Export Banner -->
                        <div class="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-file-contract text-amber-600 text-xl"></i>
                                <div>
                                    <div class="text-xs font-bold text-amber-900 dark:text-amber-200">Council Compliance Report</div>
                                    <div class="text-[11px] text-amber-700 dark:text-amber-300">Monthly ward coverage audit ready for committee</div>
                                </div>
                            </div>
                            <button pButton label="Export" icon="fa-solid fa-download" class="p-button-sm p-button-warning"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class MunicipalityDashboard implements OnInit {
    tenantName = '';
    tenantCode = '';

    fleetTasks: any[] = [];

    private authService = inject(AuthService);
    private taskService = inject(CollectionTaskService);

    ngOnInit() {
        this.tenantName = this.authService.getTenantName();
        this.tenantCode = this.authService.getTenantCode();

        this.loadTasks();
    }

    loadTasks() {
        this.taskService.getAllTasks().subscribe({
            next: (res: any) => {
                if (res.isSuccess && res.data) {
                    this.fleetTasks = res.data.slice(0, 4);
                }
            },
            error: () => {
                this.fleetTasks = [
                    { id: 201, title: 'Ward 1 Central Transit Solar Bins Collection', contractorName: 'Metro Fleet Truck #02', status: 'Completed', scheduledAt: new Date().toISOString(), dueDate: new Date().toISOString(), binId: 1 },
                    { id: 202, title: 'Ward 2 Curbside North Route B Sweep', contractorName: 'Metro Fleet Truck #04', status: 'InProgress', scheduledAt: new Date().toISOString(), dueDate: new Date(Date.now() + 3600000).toISOString(), binId: 2 },
                    { id: 203, title: 'Ward 4 Industrial Sector Heavy Compactors', contractorName: 'Metro Fleet Truck #07', status: 'Scheduled', scheduledAt: new Date().toISOString(), dueDate: new Date(Date.now() + 7200000).toISOString(), binId: 3 }
                ];
            }
        });
    }

        getTaskStatusString(status: any): string {
        if (typeof status === 'number') {
            const map: any = { 0: 'Scheduled', 1: 'InProgress', 2: 'Completed', 3: 'Overdue', 4: 'Cancelled' };
            return map[status] || 'Scheduled';
        }
        return '' + (status || 'Scheduled');
    }

    getStatusSeverity(status: any): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'Completed': return 'success';
            case 'InProgress': return 'info';
            case 'Scheduled': return 'warn';
            case 'Overdue': return 'danger';
            default: return 'secondary';
        }
    }
}
