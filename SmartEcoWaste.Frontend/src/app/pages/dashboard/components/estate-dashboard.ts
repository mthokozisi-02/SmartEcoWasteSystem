import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { CollectionTaskService } from '@/core/services/collection-task.service';
import { ReportService } from '@/core/services/report.service';
import { CollectionTaskDto } from 'src/assets/interfaces/commercial-saas-dtos';
import { ReportResponseDto } from 'src/assets/interfaces/report-response-dto';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
    selector: 'app-estate-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule, ProgressBarModule],
    template: `
        <div class="flex flex-col gap-6">
            <!-- Organization Workspace Header -->
            <div class="card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-2xl font-bold shadow-sm">
                        <i class="fa-solid fa-tree-city"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white">{{ tenantName }}</h1>
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700">
                                Residential Complex & HOA
                            </span>
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                Code: {{ tenantCode }}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Block Cleanliness • Resident Overflow Reporting • Chute Health • Green Recycling Rewards
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <a routerLink="/pages/manage-reports" pButton label="Resident Reports" icon="fa-solid fa-flag" class="p-button-outlined p-button-sm"></a>
                    <a routerLink="/pages/manage-tasks" pButton label="Cleaning Schedule" icon="fa-solid fa-broom" class="p-button-primary p-button-sm"></a>
                </div>
            </div>

            <!-- Residential Estate KPI Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- KPI 1: Cleanliness Score -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Estate Cleanliness Index</span>
                        <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-sparkles"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">98.4%</div>
                    <div class="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span><i class="fa-solid fa-circle-check mr-1"></i>Odor-free & inspected</span>
                        <span class="text-gray-400 font-normal">All 12 floors</span>
                    </div>
                </div>

                <!-- KPI 2: Resident Recycling Participation -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Recycling Participation</span>
                        <div class="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-people-roof"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">56.2%</div>
                    <div class="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                        <span><i class="fa-solid fa-arrow-trend-up mr-1"></i>184 households active</span>
                    </div>
                </div>

                <!-- KPI 3: Resident Photo Overflow Alerts -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Active Resident Reports</span>
                        <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">{{ pendingReportsCount }} <span class="text-base font-normal text-amber-600">Pending</span></div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        <span>Avg resolution time: 24 mins</span>
                    </div>
                </div>

                <!-- KPI 4: Eco Reward Points Issued -->
                <div class="card p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Green Points Issued</span>
                        <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-star"></i>
                        </div>
                    </div>
                    <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">14,850 <span class="text-base font-normal text-gray-500">pts</span></div>
                    <div class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Redeemable at local estate mart</span>
                    </div>
                </div>
            </div>

            <!-- Two-Column Section: Residential Block Monitoring & Resident Overflow Reports -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Left: Residential Blocks & Chutes Monitor (7 Cols) -->
                <div class="lg:col-span-7 flex flex-col gap-4">
                    <div class="card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                        <div class="flex items-center justify-between mb-5">
                            <div>
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Residential Blocks & Central Chutes</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Floor refuse chutes and community recycling hubs</p>
                            </div>
                            <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                                <i class="fa-solid fa-bell text-[8px] mr-1"></i> Sensors Synced
                            </span>
                        </div>

                        <div class="flex flex-col gap-4">
                            <!-- Block 1 -->
                            <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                                            <i class="fa-solid fa-building"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-gray-900 dark:text-white">Tower A - Ocean Crest (Ground Chute)</div>
                                            <div class="text-xs text-gray-500">Floors 1-12 • General Resident Refuse</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        34% Normal
                                    </span>
                                </div>
                                <p-progressBar [value]="34" [showValue]="false" styleClass="h-2" color="#10b981"></p-progressBar>
                                <div class="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                                    <span>Chute Ventilation: Active</span>
                                    <span class="text-emerald-600 font-semibold">Inspected at 08:30 AM today</span>
                                </div>
                            </div>

                            <!-- Block 2 -->
                            <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm">
                                            <i class="fa-solid fa-bottle-water"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-gray-900 dark:text-white">Community Eco & Recycling Hub</div>
                                            <div class="text-xs text-gray-500">Central Courtyard • Separated Plastics, Paper & Glass</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 text-xs font-bold rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                        82% High
                                    </span>
                                </div>
                                <p-progressBar [value]="82" [showValue]="false" styleClass="h-2" color="#f97316"></p-progressBar>
                                <div class="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                                    <span>High paper & cardboard volume</span>
                                    <span class="text-orange-600 font-semibold">Cleaning crew dispatched</span>
                                </div>
                            </div>

                            <!-- Block 3 -->
                            <div class="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm">
                                            <i class="fa-solid fa-water-ladder"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-gray-900 dark:text-white">Clubhouse & Recreational Bay</div>
                                            <div class="text-xs text-gray-500">Clubhouse Lawn & Pool Deck</div>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 text-xs font-bold rounded bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                                        25% Clear
                                    </span>
                                </div>
                                <p-progressBar [value]="25" [showValue]="false" styleClass="h-2" color="#06b6d4"></p-progressBar>
                                <div class="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                                    <span>Morning sweep complete</span>
                                    <span class="text-emerald-600 font-semibold">All bins sanitised</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Resident Photo Reports & Cleaning Staff Tasks (5 Cols) -->
                <div class="lg:col-span-5 flex flex-col gap-4">
                    <div class="card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between h-full">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Resident Overflow Reports</h3>
                                <a routerLink="/pages/manage-reports" class="text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
                                    Manage <i class="fa-solid fa-chevron-right ml-0.5"></i>
                                </a>
                            </div>

                            <div class="flex flex-col gap-3">
                                <div *ngFor="let report of recentReports" class="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/40 shadow-sm flex flex-col gap-2">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2">
                                            <i class="fa-solid fa-camera text-xs text-cyan-500"></i>
                                            <span class="text-xs font-bold text-gray-900 dark:text-white">Bin #{{ report.binId }} Overflow Notice</span>
                                        </div>
                                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                            Pending Verification
                                        </span>
                                    </div>
                                    <div class="text-xs text-gray-500 flex items-center justify-between">
                                        <span>Reported by: Resident #{{ report.userId }}</span>
                                        <span>{{ report.createdAt | date:'shortTime' }}</span>
                                    </div>
                                </div>

                                <div *ngIf="recentReports.length === 0" class="p-6 text-center text-gray-400 text-sm">
                                    <i class="fa-solid fa-circle-check text-2xl text-emerald-400 mb-2"></i>
                                    <p>No unresolved resident complaints or overflowing chutes!</p>
                                </div>
                            </div>
                        </div>

                        <!-- Estate HOA Cleaning Dispatch Card -->
                        <div class="mt-4 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <i class="fa-solid fa-broom text-cyan-600 text-xl"></i>
                                <div>
                                    <div class="text-xs font-bold text-cyan-900 dark:text-cyan-200">On-Site Estate Cleaning Crew</div>
                                    <div class="text-[11px] text-cyan-700 dark:text-cyan-300">4 cleaning staff members clocked in and active</div>
                                </div>
                            </div>
                            <a routerLink="/pages/manage-tasks" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">
                                Dispatch
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class EstateDashboard implements OnInit {
    tenantName = '';
    tenantCode = '';

    recentReports: any[] = [];
    pendingReportsCount = 0;

    private authService = inject(AuthService);
    private reportService = inject(ReportService);

    ngOnInit() {
        this.tenantName = this.authService.getTenantName();
        this.tenantCode = this.authService.getTenantCode();

        this.loadReports();
    }

    loadReports() {
        this.reportService.getAll().subscribe({
            next: (res: any) => {
                const list = res.data || (Array.isArray(res) ? res : []);
                if (Array.isArray(list)) {
                    this.recentReports = list.slice(0, 5);
                    this.pendingReportsCount = list.filter((r: any) =>
                        r.status === 'Pending' || r.status === 0 || r.status === 'Overflowing'
                    ).length;
                }
            },
            error: () => {
                this.recentReports = [];
                this.pendingReportsCount = 0;
            }
        });
    }
}
