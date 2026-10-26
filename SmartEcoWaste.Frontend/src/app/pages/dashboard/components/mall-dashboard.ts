import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { CollectionTaskService } from '@/core/services/collection-task.service';
import { PropertyService } from '@/core/services/property.service';
import { CollectionTaskDto, PropertyDto } from 'src/assets/interfaces/commercial-saas-dtos';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
    selector: 'app-mall-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule, ProgressBarModule],
    template: `
        <div class="flex flex-col gap-6">
            <!-- Organization Workspace Header (Clean White Sakai Card) -->
            <div class="card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl font-bold shadow-sm">
                        <i class="fa-solid fa-building-shield"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white">{{ tenantName }}</h1>
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                                Commercial Mall Operations
                            </span>
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                Code: {{ tenantCode }}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Service-Level Compliance • Food Court Compactors • Retail Loading Bay Oversight • Scale Weigh-In
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <a routerLink="/pages/manage-tasks" pButton label="Task Dispatch" icon="fa-solid fa-list-check" class="p-button-outlined p-button-sm"></a>
                    <a routerLink="/pages/manage-properties" pButton label="Mall Zones" icon="fa-solid fa-sitemap" class="p-button-primary p-button-sm"></a>
                </div>
            </div>

            <!-- Commercial Mall KPI Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- KPI 1 -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Contractor SLA Rate</span>
                        <div class="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-handshake-angle"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">96.8%</div>
                    <div class="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span><i class="fa-solid fa-arrow-trend-up mr-1"></i>+2.4% vs last week</span>
                        <span class="text-gray-400 font-normal">Target: 95%</span>
                    </div>
                </div>

                <!-- KPI 2 -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Scale Weight</span>
                        <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-weight-hanging"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">4,820 <span class="text-base font-normal text-gray-500">kg</span></div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        <span>Compacted commercial solid waste</span>
                    </div>
                </div>

                <!-- KPI 3 -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Monthly Disposal Cost</span>
                        <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-receipt"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">$1,420</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        <span>$0.29 / kg tipping & haulage fee</span>
                    </div>
                </div>

                <!-- KPI 4 -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Loading Bay Status</span>
                        <div class="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-truck-ramp-box"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">100% Clear</div>
                    <div class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span><i class="fa-solid fa-circle-check mr-1"></i>Zero bay congestion</span>
                    </div>
                </div>
            </div>

            <!-- Two-Column Section: Commercial Zones Monitor & Contractor Task Workflows -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Left: Food Court & Retail Zone Live Levels (7 Cols) -->
                <div class="lg:col-span-7 flex flex-col gap-4">
                    <div class="card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                        <div class="flex items-center justify-between mb-5">
                            <div>
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Mall Critical Zones & Compactors</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Real-time capacity monitor across commercial food halls and docks</p>
                            </div>
                            <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <i class="fa-solid fa-circle text-[8px] mr-1 animate-pulse"></i> Telemetry Active
                            </span>
                        </div>

                        <div class="flex flex-col gap-4">
                            <!-- Zone 1 -->
                            <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm">
                                            <i class="fa-solid fa-utensils"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-gray-900 dark:text-white">Level 2 Food Court Compactor</div>
                                            <div class="text-xs text-gray-500">Main Retail Atrium • Organic & Wet Waste</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 text-xs font-bold rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                        78% Full
                                    </span>
                                </div>
                                <p-progressBar [value]="78" [showValue]="false" styleClass="h-2" color="#f97316"></p-progressBar>
                                <div class="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                                    <span>Compactor Pressure: 180 Bar</span>
                                    <span class="text-orange-600 font-semibold">Scheduled collection in 45 mins</span>
                                </div>
                            </div>

                            <!-- Zone 2 -->
                            <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                                            <i class="fa-solid fa-boxes-packing"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-gray-900 dark:text-white">Loading Dock B2 (North Logistics)</div>
                                            <div class="text-xs text-gray-500">Basement 2 • Cardboard Baler & Bulk Pallets</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                        42% Normal
                                    </span>
                                </div>
                                <p-progressBar [value]="42" [showValue]="false" styleClass="h-2" color="#3b82f6"></p-progressBar>
                                <div class="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                                    <span>2 Bales Tied & Ready</span>
                                    <span class="text-emerald-600 font-semibold">Dock open for deliveries</span>
                                </div>
                            </div>

                            <!-- Zone 3 -->
                            <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                                            <i class="fa-solid fa-recycle"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-gray-900 dark:text-white">East Pavilion Sorting Chute</div>
                                            <div class="text-xs text-gray-500">Level 1 Promenade • Recyclable Streams</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        18% Low
                                    </span>
                                </div>
                                <p-progressBar [value]="18" [showValue]="false" styleClass="h-2" color="#10b981"></p-progressBar>
                                <div class="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                                    <span>Contamination: &lt; 2%</span>
                                    <span class="text-emerald-600 font-semibold">Optimal status</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Contractor Tasks & SLA Dispatch (5 Cols) -->
                <div class="lg:col-span-5 flex flex-col gap-4">
                    <div class="card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between h-full">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Active Contractor Tasks</h3>
                                <a routerLink="/pages/manage-tasks" class="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                                    View All <i class="fa-solid fa-chevron-right ml-0.5"></i>
                                </a>
                            </div>

                            <div class="flex flex-col gap-3">
                                <div *ngFor="let task of activeTasks" class="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/40 shadow-sm flex flex-col gap-2">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-extrabold text-gray-900 dark:text-white truncate max-w-[200px]">{{ task.title }}</span>
                                        <p-tag [value]="getTaskStatusString(task.status)" [severity]="getStatusSeverity(task.status)"></p-tag>
                                    </div>
                                    <div class="flex items-center justify-between text-xs text-gray-500">
                                        <span><i class="fa-solid fa-truck mr-1 text-gray-400"></i>{{ task.contractorName || 'EcoClean Services' }}</span>
                                        <span>Due: {{ task.dueDate | date:'shortTime' }}</span>
                                    </div>
                                </div>

                                <div *ngIf="activeTasks.length === 0" class="p-6 text-center text-gray-400 text-sm">
                                    <i class="fa-solid fa-clipboard-check text-2xl text-emerald-400 mb-2"></i>
                                    <p>All scheduled mall contractor collections are up-to-date!</p>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Anomaly Approval Banner -->
                        <div class="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-triangle-exclamation text-amber-500 text-xl"></i>
                                <div>
                                    <div class="text-xs font-bold text-amber-900 dark:text-amber-200">Pending Anomaly Approvals</div>
                                    <div class="text-[11px] text-amber-700 dark:text-amber-300">1 contractor report requires facilities supervisor sign-off</div>
                                </div>
                            </div>
                            <a routerLink="/pages/manage-tasks" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                                Review
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class MallDashboard implements OnInit {
    tenantName = '';
    tenantCode = '';

    activeTasks: any[] = [];
    properties: any[] = [];

    private authService = inject(AuthService);
    private taskService = inject(CollectionTaskService);
    private propertyService = inject(PropertyService);

    ngOnInit() {
        this.tenantName = this.authService.getTenantName();
        this.tenantCode = this.authService.getTenantCode();

        this.loadTasks();
        this.loadProperties();
    }

    loadTasks() {
        this.taskService.getAllTasks().subscribe({
            next: (res: any) => {
                if (res.isSuccess && res.data) {
                    this.activeTasks = res.data.slice(0, 5);
                } else {
                    this.activeTasks = [];
                }
            },
            error: () => {
                this.activeTasks = [];
            }
        });
    }

    loadProperties() {
        this.propertyService.getAllProperties().subscribe({
            next: (res: any) => {
                if (res.isSuccess && res.data) {
                    this.properties = res.data;
                }
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
