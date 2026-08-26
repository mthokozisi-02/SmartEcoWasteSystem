import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '@/core/services/user.service';
import { ReportService } from '@/core/services/report.service';
import { AuthService } from '@/core/services/auth.service';
import { GetUserDto } from 'src/assets/interfaces/get-user-dto';
import { ReportResponseDto } from 'src/assets/interfaces/report-response-dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, tap } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-user-dashboard-widget',
    standalone: true,
    imports: [CommonModule, RouterModule, ProgressSpinnerModule],
    template: `
        <div class="flex flex-col gap-8">
            <!-- Hero User Welcome & Eco Card -->
            <div class="p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
                 style="background: linear-gradient(135deg, #0d1f17 0%, #050c09 100%); border: 1px solid rgba(16,185,129,0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.4);">
                <div class="absolute -top-10 -left-10 w-48 h-48 rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);"></div>

                <div class="relative z-10 flex items-center gap-5">
                    <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shrink-0" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 25px rgba(16,185,129,0.4);">
                        <i class="fa-solid fa-user-astronaut"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-3 mb-1">
                            <h2 class="text-2xl font-bold" style="color: #f0fdf4;">Welcome, {{ user?.name || 'Eco Hero' }}!</h2>
                            <span class="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider" style="background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.25); color: #34d399;">
                                Community Member
                            </span>
                        </div>
                        <p class="text-sm" style="color: rgba(209,250,229,0.6);">Thank you for helping keep our city clean and sustainable.</p>
                    </div>
                </div>

                <div class="relative z-10 flex items-center gap-6 self-stretch md:self-auto justify-around p-4 rounded-2xl" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                    <div class="text-center">
                        <div class="text-xs font-bold uppercase tracking-wider mb-1" style="color: rgba(209,250,229,0.45);">Eco Points</div>
                        <div class="text-3xl font-black flex items-center justify-center gap-1.5" style="color: #fbbf24;">
                            <i class="fa-solid fa-star text-xl"></i>
                            {{ user?.points || 0 }}
                        </div>
                    </div>
                    <div class="w-px h-10" style="background: rgba(255,255,255,0.1);"></div>
                    <div class="text-center">
                        <div class="text-xs font-bold uppercase tracking-wider mb-1" style="color: rgba(209,250,229,0.45);">Community Rank</div>
                        <div class="text-3xl font-black flex items-center justify-center gap-1.5" style="color: #34d399;">
                            <i class="fa-solid fa-trophy text-xl text-amber-400"></i>
                            #{{ getRank(user?.points || 0) }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Action Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Action 1: Report Bin -->
                <a routerLink="/landing" fragment="live-map-section" class="p-6 rounded-3xl no-underline flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 group" style="background: #0d1f17; border: 1px solid rgba(16,185,129,0.15);">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);"><i class="fa-solid fa-qrcode text-emerald-400"></i></div>
                    <div>
                        <h3 class="text-lg font-bold mb-1 group-hover:text-emerald-400 transition-colors" style="color: #f0fdf4;">Scan & Report Bin</h3>
                        <p class="text-xs leading-relaxed" style="color: rgba(209,250,229,0.5);">Spotted a full or damaged bin? Scan its QR code to submit a report & earn eco points.</p>
                    </div>
                    <div class="flex items-center gap-2 text-xs font-bold" style="color: #34d399;">
                        Open Bin Scanner <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                    </div>
                </a>

                <!-- Action 2: View Map -->
                <a routerLink="/landing" fragment="live-map-section" class="p-6 rounded-3xl no-underline flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 group" style="background: #0d1f17; border: 1px solid rgba(6,182,212,0.15);">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2);"><i class="fa-solid fa-map-location-dot text-cyan-400"></i></div>
                    <div>
                        <h3 class="text-lg font-bold mb-1 group-hover:text-cyan-400 transition-colors" style="color: #f0fdf4;">Find Nearby Bins</h3>
                        <p class="text-xs leading-relaxed" style="color: rgba(209,250,229,0.5);">Locate active smart recycling bins around your area in real-time on our live interactive map.</p>
                    </div>
                    <div class="flex items-center gap-2 text-xs font-bold" style="color: #67e8f9;">
                        View Interactive Map <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                    </div>
                </a>

                <!-- Action 3: Recycling Guide -->
                <a routerLink="/landing" fragment="highlights" class="p-6 rounded-3xl no-underline flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 group" style="background: #0d1f17; border: 1px solid rgba(251,191,36,0.15);">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style="background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2);"><i class="fa-solid fa-leaf text-amber-400"></i></div>
                    <div>
                        <h3 class="text-lg font-bold mb-1 group-hover:text-amber-400 transition-colors" style="color: #f0fdf4;">Recycling Guide</h3>
                        <p class="text-xs leading-relaxed" style="color: rgba(209,250,229,0.5);">Learn what materials are recyclable, proper bin sorting tips, and how to maximize your impact.</p>
                    </div>
                    <div class="flex items-center gap-2 text-xs font-bold" style="color: #fbbf24;">
                        Read Eco Guide <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                    </div>
                </a>
            </div>

            <!-- Bottom Row: Recent Reports & Eco Impact -->
            <div class="grid grid-cols-12 gap-6">
                <!-- Left: Recent Community Reports Stream -->
                <div class="col-span-12 lg:col-span-8 p-6 rounded-3xl flex flex-col gap-5" style="background: #0d1f17; border: 1px solid rgba(16,185,129,0.12);">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <i class="fa-solid fa-clock-rotate-left text-emerald-400 text-base"></i>
                            <h3 class="text-sm font-bold uppercase tracking-wider" style="color: rgba(209,250,229,0.7);">Recent Community Reports</h3>
                        </div>
                        <span class="text-xs px-2.5 py-1 rounded-full font-semibold" style="background: rgba(16,185,129,0.1); color: #34d399;">Live Stream</span>
                    </div>

                    <div *ngIf="isLoadingReports" class="py-12 flex justify-center">
                        <p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner>
                    </div>

                    <div *ngIf="!isLoadingReports && reports.length === 0" class="py-10 text-center text-xs" style="color: rgba(209,250,229,0.4);">
                        No recent reports found. Be the first to report a bin!
                    </div>

                    <div *ngIf="!isLoadingReports && reports.length > 0" class="flex flex-col gap-3">
                        <div *ngFor="let report of reports.slice(0, 5)" class="p-4 rounded-2xl flex items-center justify-between transition-all duration-200" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
                            <div class="flex items-center gap-3.5">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0" style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #34d399;">
                                    <i class="fa-solid fa-trash-can"></i>
                                </div>
                                <div>
                                    <div class="text-xs font-bold" style="color: #f0fdf4;">Report #{{ report.id }} — Bin #{{ report.binId }}</div>
                                    <div class="text-[11px]" style="color: rgba(209,250,229,0.5);">{{ report.binArea || 'Area report' }} by {{ report.userName }}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full" [style]="getStatusStyle(report.status)">
                                    {{ report.status }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Eco Impact Metrics -->
                <div class="col-span-12 lg:col-span-4 p-6 rounded-3xl flex flex-col gap-5" style="background: #0d1f17; border: 1px solid rgba(16,185,129,0.12);">
                    <div class="flex items-center gap-2.5">
                        <i class="fa-solid fa-earth-americas text-emerald-400 text-base"></i>
                        <h3 class="text-sm font-bold uppercase tracking-wider" style="color: rgba(209,250,229,0.7);">Your Environmental Impact</h3>
                    </div>

                    <div class="flex flex-col gap-4">
                        <div class="p-4 rounded-2xl flex items-center gap-4" style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15);">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style="background: rgba(16,185,129,0.15); color: #34d399;"><i class="fa-solid fa-cloud"></i></div>
                            <div>
                                <div class="text-lg font-black" style="color: #d1fae5;">{{ getCO2Saved(user?.points || 0) }} kg</div>
                                <div class="text-[11px]" style="color: rgba(209,250,229,0.5);">Estimated CO2 Diverted</div>
                            </div>
                        </div>

                        <div class="p-4 rounded-2xl flex items-center gap-4" style="background: rgba(6,182,212,0.06); border: 1px solid rgba(6,182,212,0.15);">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style="background: rgba(6,182,212,0.15); color: #67e8f9;"><i class="fa-solid fa-bottle-water"></i></div>
                            <div>
                                <div class="text-lg font-black" style="color: #cffafe;">{{ getPlasticsSaved(user?.points || 0) }} items</div>
                                <div class="text-[11px]" style="color: rgba(209,250,229,0.5);">Plastics & Bottles Recycled</div>
                            </div>
                        </div>

                        <div class="p-4 rounded-2xl flex items-center gap-4" style="background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.15);">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style="background: rgba(251,191,36,0.15); color: #fbbf24;"><i class="fa-solid fa-tree"></i></div>
                            <div>
                                <div class="text-lg font-black" style="color: #fef3c7;">{{ getTreesSaved(user?.points || 0) }} trees</div>
                                <div class="text-[11px]" style="color: rgba(209,250,229,0.5);">Tree Absorption Equivalent</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class UserDashboardWidget implements OnInit {
    user: GetUserDto | null = null;
    reports: ReportResponseDto[] = [];
    isLoadingReports = false;

    private userService = inject(UserService);
    private reportService = inject(ReportService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    ngOnInit() {
        const userId = Number(localStorage.getItem('user_id'));
        if (userId) {
            this.userService.getUser(userId).pipe(
                tap(res => this.user = res.data),
                catchError(() => []),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe();
        }

        this.isLoadingReports = true;
        this.reportService.getAll().pipe(
            tap(res => this.reports = res.data || []),
            catchError(() => []),
            finalize(() => this.isLoadingReports = false),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();
    }

    getRank(points: number): number {
        if (points > 1000) return 1;
        if (points > 500) return 3;
        if (points > 100) return 7;
        return 12;
    }

    getCO2Saved(points: number): number {
        return Math.round((points * 0.45) * 10) / 10;
    }

    getPlasticsSaved(points: number): number {
        return Math.round(points * 2.8);
    }

    getTreesSaved(points: number): number {
        return Math.round((points * 0.02) * 10) / 10;
    }

    getStatusStyle(status: any): string {
        const s = String(status || '').toLowerCase();
        if (s.includes('emptied') || s.includes('resolved') || s.includes('approved') || s.includes('0')) {
            return 'background: rgba(16,185,129,0.15); color: #34d399;';
        }
        if (s.includes('full') || s.includes('pending') || s.includes('1')) {
            return 'background: rgba(245,158,11,0.15); color: #fbbf24;';
        }
        return 'background: rgba(239,68,68,0.15); color: #f87171;';
    }
}
