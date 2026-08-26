import { Component, OnInit, OnDestroy, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BinService } from '@/core/services/bin.service';
import { ReportService } from '@/core/services/report.service';
import { UserService } from '@/core/services/user.service';
import { BinResponseDto } from 'src/assets/interfaces/bin-response-dto';
import { ReportResponseDto } from 'src/assets/interfaces/report-response-dto';
import { StatusEnum } from 'src/assets/enums/status-enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, finalize } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RevenueStreamWidget } from './revenuestreamwidget';

@Component({
    selector: 'app-live-monitoring-widget',
    standalone: true,
    imports: [CommonModule, ProgressSpinnerModule, RevenueStreamWidget],
    template: `
        <div class="card p-6 relative overflow-hidden" style="background: #050c09; border: 1px solid rgba(16,185,129,0.15); border-radius: 28px; min-height: 500px;">
            <!-- Glow Accent -->
            <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 80% 20%, rgba(16,185,129,0.12) 0%, transparent 60%);"></div>

            <!-- Header -->
            <div class="flex items-center justify-between mb-6 relative z-10">
                <div class="flex items-center gap-2.5">
                    <span class="relative flex h-3 w-3">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background: #10b981;"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3" style="background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
                    </span>
                    <span class="text-xs font-black uppercase tracking-widest" style="color: rgba(209,250,229,0.7);">Live Dashboard</span>
                </div>
                <span class="text-xs px-3 py-1 rounded-full font-bold" style="background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.2); color: #34d399;">
                    System Online
                </span>
            </div>

            <!-- Loader -->
            <div *ngIf="isLoading" class="absolute inset-0 z-20 flex items-center justify-center rounded-3xl" style="background: rgba(5,12,9,0.75); backdrop-filter: blur(8px);">
                <p-progressSpinner styleClass="w-12 h-12"></p-progressSpinner>
            </div>

            <div class="grid grid-cols-12 gap-6 relative z-10">
                <!-- Left: Bins Status Grid -->
                <div class="col-span-12 lg:col-span-8 flex flex-col gap-4">
                    <h3 class="text-sm font-bold uppercase tracking-wider mb-2" style="color: rgba(209,250,229,0.5);">Smart Bins Status Monitor</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div *ngFor="let bin of displayBins" 
                             class="p-4 rounded-2xl flex flex-col justify-between transition-all duration-300"
                             [style]="getBinStyle(bin)">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <div class="text-xs font-bold" style="color: #f0fdf4;">Bin #{{ bin.id }}</div>
                                    <div class="text-[10px] truncate max-w-[180px]" style="color: rgba(209,250,229,0.4);">{{ trim(bin.area) }}</div>
                                </div>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" [style]="getStatusBadgeStyle(bin.status)">
                                    {{ bin.status }}
                                </span>
                            </div>
                            <div class="mt-2">
                                <div class="flex justify-between text-[9px] mb-1" style="color: rgba(209,250,229,0.5);">
                                    <span>Estimated Level</span>
                                    <span>{{ getFillLevel(bin.status) }}%</span>
                                </div>
                                <div class="w-full rounded-full overflow-hidden" style="height: 6px; background: rgba(255,255,255,0.06);">
                                    <div class="h-full rounded-full transition-all duration-500" 
                                         [style.width.%]="getFillLevel(bin.status)"
                                         [style.background]="getFillColor(bin.status)"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 class="text-sm font-bold uppercase tracking-wider mb-2" style="color: rgba(209,250,229,0.5);">User Report Stream</h3>
                    <app-revenue-stream-widget />
                </div>

                <!-- Right: Metrics & Notifications -->
                <div class="col-span-12 lg:col-span-4 flex flex-col gap-4">
                    <h3 class="text-sm font-bold uppercase tracking-wider mb-2" style="color: rgba(209,250,229,0.5);">Real-Time Activity Logs</h3>

                    <!-- Recent QR Report Card -->
                    <div class="p-4 rounded-2xl flex flex-col gap-3" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-qrcode text-emerald-400 text-base"></i>
                                <span class="text-xs font-bold" style="color: #d1fae5;">Recent Activity</span>
                            </div>
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" style="background: rgba(239,68,68,0.15); color: #f87171;">Alert</span>
                        </div>
                        <div class="text-xs leading-relaxed" style="color: rgba(209,250,229,0.7);">
                            {{ recentReportText }}
                        </div>
                        <div class="text-[10px]" style="color: rgba(209,250,229,0.45);">
                            {{ recentReportTime }}
                        </div>
                    </div>

                    <!-- Eco Points Summary Card -->
                    <div class="p-4 rounded-2xl flex items-center justify-between" 
                         style="background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08)); border: 1px solid rgba(16,185,129,0.2);">
                        <div class="flex items-center gap-3">
                            <i class="fa-solid fa-star text-amber-400 text-lg"></i>
                            <div>
                                <div class="text-[10px] font-bold uppercase tracking-wider" style="color: rgba(209,250,229,0.5);">User Eco Rewards</div>
                                <div class="text-lg font-black" style="color: #fbbf24;">1,240 pts</div>
                            </div>
                        </div>
                        <div class="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1" style="background: rgba(251,191,36,0.12); color: #fbbf24;">
                            Rank #3 <i class="fa-solid fa-trophy text-amber-500 text-xs"></i>
                        </div>
                    </div>

                    <!-- Dispatch Alert Card -->
                    <div class="p-4 rounded-2xl flex items-center gap-3.5 mt-auto"
                         style="background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.25); color: #d1fae5;">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(6,182,212,0.15);">
                            <i class="fa-solid fa-truck text-cyan-400 text-lg animate-bounce"></i>
                        </div>
                        <div>
                            <div class="font-bold text-xs" style="color: #67e8f9;">Dispatch Dispatched</div>
                            <div class="text-[10px]" style="color: rgba(209,250,229,0.55);">Collection Crew ETA: 12 mins</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Floating Notification Badge -->
            <div class="absolute top-4 right-4 lg:right-6 p-3 rounded-2xl text-xs font-medium flex items-center gap-2.5"
                 style="background: rgba(5,12,9,0.9); border: 1px solid rgba(16,185,129,0.2); backdrop-filter: blur(12px); color: #d1fae5; animation: floatBadge 6s ease-in-out infinite; box-shadow: 0 8px 30px rgba(0,0,0,0.4); z-index: 20;">
                <span class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(16,185,129,0.15);"><i class="fa-solid fa-leaf text-emerald-400 text-sm"></i></span>
                <div>
                    <div class="font-bold text-[11px]" style="color: #34d399;">+25 Eco Points</div>
                    <div class="text-[10px]" style="color: rgba(209,250,229,0.55);">Report submitted!</div>
                </div>
            </div>

            <style>
                @keyframes floatBadge {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
            </style>
        </div>
    `
})
export class LiveMonitoringWidget implements OnInit, OnDestroy {
    displayBins: BinResponseDto[] = [];
    isLoading = false;
    recentReportText = 'Awaiting incoming QR scan reports...';
    recentReportTime = 'Live updates active';

    private binService = inject(BinService);
    private reportService = inject(ReportService);
    private destroyRef = inject(DestroyRef);
    private interval: any;

    ngOnInit() {
        this.loadDashboardData();
        // Set up polling interval to fetch fresh statuses
        this.interval = setInterval(() => this.loadDashboardData(), 10000);
    }

    ngOnDestroy() {
        if (this.interval) clearInterval(this.interval);
    }

    private loadDashboardData() {
        this.isLoading = true;

        // Fetch Bins
        this.binService.getAll().pipe(
            tap((res) => {
                const list = res.data || [];
                // Sort or slice to get 4 representative bins
                this.displayBins = list.slice(0, 4);
            }),
            catchError(() => []),
            finalize(() => (this.isLoading = false)),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();

        // Fetch Reports
        this.reportService.getAll().pipe(
            tap((res) => {
                const reports = res.data || [];
                if (reports.length > 0) {
                    const latest = reports[0];
                    this.recentReportText = `QR Scan Detected at Bin #${latest.binId || '?'}. Status reported as ${latest.status || 'Unknown'}.`;
                    this.recentReportTime = `Reported by User #${latest.userId || 'Guest'}`;
                }
            }),
            catchError(() => []),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();
    }

    getFillLevel(status: string): number {
        switch (status) {
            case 'Emptied': return 15;
            case 'Full': return 90;
            case 'Overflowing': return 100;
            case 'Damaged': return 0;
            default: return 40;
        }
    }

    getFillColor(status: string): string {
        switch (status) {
            case 'Emptied': return '#10b981';
            case 'Full': return '#f59e0b';
            case 'Overflowing': return '#ef4444';
            default: return '#6b7280';
        }
    }

    getBinStyle(bin: BinResponseDto): string {
        const borderStyles: Record<string, string> = {
            Emptied: 'border: 1px solid rgba(16,185,129,0.15); background: rgba(16,185,129,0.04);',
            Full: 'border: 1px solid rgba(245,158,11,0.15); background: rgba(245,158,11,0.04);',
            Overflowing: 'border: 2px solid #ef4444; background: rgba(239,68,68,0.06);',
            Damaged: 'border: 1px solid rgba(107,114,128,0.15); background: rgba(107,114,128,0.04);',
        };
        return borderStyles[bin.status] || borderStyles['Damaged'];
    }

    getStatusBadgeStyle(status: string): string {
        const colors: Record<string, string> = {
            Emptied: 'background: rgba(16,185,129,0.15); color: #34d399;',
            Full: 'background: rgba(245,158,11,0.15); color: #fbbf24;',
            Overflowing: 'background: rgba(239,68,68,0.15); color: #f87171;',
            Damaged: 'background: rgba(107,114,128,0.15); color: #9ca3af;',
        };
        return colors[status] || colors['Damaged'];
    }

    trim(str: string | null): string {
        if (!str) return 'Unknown Area';
        const parts = str.split(',');
        return parts[0].trim();
    }
}
