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
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-user-dashboard-widget',
    standalone: true,
    imports: [CommonModule, RouterModule, ProgressSpinnerModule, TagModule],
    template: `
        <div class="flex flex-col gap-6">
            <!-- Hero User Welcome & Eco Card (Clean White Theme) -->
            <div class="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div class="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none bg-emerald-50/60 blur-2xl"></div>

                <div class="relative z-10 flex items-center gap-5">
                    <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shrink-0 shadow-md"
                         style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 8px 20px rgba(16,185,129,0.3);">
                        <i class="fa-solid fa-user-astronaut"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-3 mb-1">
                            <h2 class="text-2xl font-extrabold text-slate-900 m-0">Welcome, {{ user?.name || 'Citizen Eco Champion' }}!</h2>
                            <span class="text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Eco Champion
                            </span>
                        </div>
                        <p class="text-sm text-slate-500 m-0">Thank you for reporting bins and keeping our shared environment clean.</p>
                    </div>
                </div>

                <div class="relative z-10 flex items-center gap-6 self-stretch md:self-auto justify-around p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div class="text-center px-2">
                        <div class="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">Accumulated Points</div>
                        <div class="text-3xl font-black flex items-center justify-center gap-1.5 text-amber-500">
                            <i class="fa-solid fa-star text-xl"></i>
                            {{ user?.points || 0 }}
                        </div>
                    </div>
                    <div class="w-px h-10 bg-slate-200"></div>
                    <div class="text-center px-2">
                        <div class="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">Reports Verified</div>
                        <div class="text-3xl font-black flex items-center justify-center gap-1.5 text-emerald-600">
                            <i class="fa-solid fa-flag-checkered text-xl"></i>
                            {{ user?.reports || 0 }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Action Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Action 1: Report Bin -->
                <a routerLink="/pages/report-bin" class="p-6 rounded-3xl no-underline flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 bg-white border border-slate-200 shadow-sm hover:border-emerald-300 group">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <i class="fa-solid fa-qrcode"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold mb-1 text-slate-900 group-hover:text-emerald-600 transition-colors">Report Smart Bin</h3>
                        <p class="text-xs text-slate-500 leading-relaxed m-0">Found a full or damaged bin? Check in and submit a quick report to earn eco-points.</p>
                    </div>
                    <div class="flex items-center gap-2 text-xs font-bold text-emerald-600">
                        Submit Report <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                    </div>
                </a>

                <!-- Action 2: View Map -->
                <a routerLink="/landing" fragment="live-map-section" class="p-6 rounded-3xl no-underline flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 bg-white border border-slate-200 shadow-sm hover:border-cyan-300 group">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                        <i class="fa-solid fa-map-location-dot"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold mb-1 text-slate-900 group-hover:text-cyan-600 transition-colors">Find Nearby Bins</h3>
                        <p class="text-xs text-slate-500 leading-relaxed m-0">Locate active recycling hubs and smart bins in real-time across your community.</p>
                    </div>
                    <div class="flex items-center gap-2 text-xs font-bold text-cyan-600">
                        Explore Live Map <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                    </div>
                </a>

                <!-- Action 3: Profile & Points History -->
                <a routerLink="/pages/profile" class="p-6 rounded-3xl no-underline flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 bg-white border border-slate-200 shadow-sm hover:border-amber-300 group">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-amber-50 text-amber-600 border border-amber-100">
                        <i class="fa-solid fa-award"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold mb-1 text-slate-900 group-hover:text-amber-600 transition-colors">Eco-Points & Profile</h3>
                        <p class="text-xs text-slate-500 leading-relaxed m-0">View your earned rewards, rank level, and account credentials.</p>
                    </div>
                    <div class="flex items-center gap-2 text-xs font-bold text-amber-600">
                        View My Profile <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                    </div>
                </a>
            </div>

            <!-- Bottom Row: Recent Reports & Eco Impact -->
            <div class="grid grid-cols-12 gap-6">
                <!-- Left: Recent Community Reports Stream -->
                <div class="col-span-12 lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-5">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <i class="fa-solid fa-clock-rotate-left text-emerald-600 text-base"></i>
                            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 m-0">Recent Community Reports</h3>
                        </div>
                        <span class="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Live Stream</span>
                    </div>

                    <div *ngIf="isLoadingReports" class="py-12 flex justify-center">
                        <p-progressSpinner styleClass="w-8 h-8"></p-progressSpinner>
                    </div>

                    <div *ngIf="!isLoadingReports && reports.length === 0" class="py-10 text-center text-xs text-slate-400">
                        No recent reports found. Be the first to report a bin!
                    </div>

                    <div *ngIf="!isLoadingReports && reports.length > 0" class="flex flex-col gap-3">
                        <div *ngFor="let report of reports.slice(0, 5)" class="p-4 rounded-2xl flex items-center justify-between bg-slate-50 border border-slate-200 transition-all hover:bg-slate-100/70">
                            <div class="flex items-center gap-3.5">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    <i class="fa-solid fa-trash-can"></i>
                                </div>
                                <div>
                                    <div class="text-xs font-bold text-slate-900">Report #{{ report.id }} — Bin #{{ report.binId }}</div>
                                    <div class="text-[11px] text-slate-500">{{ report.binArea || 'Area location' }} • Reported by {{ report.userName || 'Community Member' }}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="text-[11px] font-bold px-2.5 py-1 rounded-full" [style]="getStatusStyle(report.status)">
                                    {{ report.status }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Eco Impact Metrics -->
                <div class="col-span-12 lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-5">
                    <div class="flex items-center gap-2.5">
                        <i class="fa-solid fa-earth-americas text-emerald-600 text-base"></i>
                        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700 m-0">Your Environmental Impact</h3>
                    </div>

                    <div class="flex flex-col gap-4">
                        <div class="p-4 rounded-2xl flex items-center gap-4 bg-emerald-50/60 border border-emerald-100">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-emerald-100 text-emerald-700"><i class="fa-solid fa-cloud"></i></div>
                            <div>
                                <div class="text-lg font-black text-emerald-950">{{ getCO2Saved(user?.points || 0) }} kg</div>
                                <div class="text-[11px] text-slate-500">Estimated CO2 Diverted</div>
                            </div>
                        </div>

                        <div class="p-4 rounded-2xl flex items-center gap-4 bg-cyan-50/60 border border-cyan-100">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-cyan-100 text-cyan-700"><i class="fa-solid fa-bottle-water"></i></div>
                            <div>
                                <div class="text-lg font-black text-cyan-950">{{ getPlasticsSaved(user?.points || 0) }} items</div>
                                <div class="text-[11px] text-slate-500">Plastics & Bottles Recycled</div>
                            </div>
                        </div>

                        <div class="p-4 rounded-2xl flex items-center gap-4 bg-amber-50/60 border border-amber-100">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-amber-100 text-amber-700"><i class="fa-solid fa-tree"></i></div>
                            <div>
                                <div class="text-lg font-black text-amber-950">{{ getTreesSaved(user?.points || 0) }} trees</div>
                                <div class="text-[11px] text-slate-500">Tree Absorption Equivalent</div>
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
        const userId = this.authService.getUserId() || Number(localStorage.getItem('user_id'));
        if (userId) {
            this.userService.getUser(userId).pipe(
                tap(res => {
                    if (res && res.data) {
                        this.user = res.data;
                    }
                }),
                catchError(() => []),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe();
        } else {
            this.user = {
                name: this.authService.getUserName(),
                email: this.authService.getUserEmail() || '',
                reports: 0,
                points: 0
            };
        }

        this.isLoadingReports = true;
        this.reportService.getAll().pipe(
            tap(res => this.reports = res.data || []),
            catchError(() => []),
            finalize(() => this.isLoadingReports = false),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();
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
            return 'background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;';
        }
        if (s.includes('full') || s.includes('pending') || s.includes('1')) {
            return 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;';
        }
        return 'background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca;';
    }
}
