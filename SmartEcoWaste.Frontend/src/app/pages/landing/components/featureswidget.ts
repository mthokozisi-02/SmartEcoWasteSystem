import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
    icon: string;
    title: string;
    desc: string;
    accent: string;
    accentBg: string;
    large?: boolean;
}

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section id="features" style="background: #060e0a; padding: 100px 0;">
            <div class="w-full px-8 lg:px-16">

                <!-- Section header -->
                 <div class="text-center mb-16 flex flex-col items-center justify-center" style="text-align: center !important;">
                    <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                         style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #34d399; display: inline-block; margin: 0 auto 1rem auto; text-align: center !important;">
                        Platform Capabilities
                    </div>
                    <h2 class="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-5 leading-tight tracking-tight" style="color: #f0fdf4; text-align: center !important; width: 100%;">
                        Everything you need to <br/>
                        <span style="background: linear-gradient(90deg, #10b981, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">manage waste, smarter</span>
                    </h2>
                    <p class="text-xl md:text-2xl max-w-3xl" style="color: rgba(209,250,229,0.55); text-align: center !important; margin: 0 auto; width: 100%; line-height: 1.6;">
                        A complete ecosystem connecting citizens, administrators, and field teams — powered by real-time data and community incentives.
                    </p>
                </div>

                <!-- Bento Grid -->
                <div class="grid grid-cols-12 gap-6">

                    <!-- Large Feature 1 – Smart Monitoring -->
                    <div class="col-span-12 md:col-span-7 group relative p-9 rounded-3xl overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1"
                         style="background: #0d1f17; border: 1px solid rgba(16,185,129,0.12);"
                         onmouseover="this.style.borderColor='rgba(16,185,129,0.35)'; this.style.boxShadow='0 20px 60px rgba(16,185,129,0.08)'"
                         onmouseout="this.style.borderColor='rgba(16,185,129,0.12)'; this.style.boxShadow='none'">
                        <div class="absolute top-0 right-0 w-64 h-64 pointer-events-none" style="background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);"></div>
                        <div class="relative z-10 flex flex-col h-full gap-6">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);"><i class="fa-solid fa-tower-broadcast text-emerald-400"></i></div>
                            <div>
                                <h3 class="text-2xl font-bold mb-3.5" style="color: #f0fdf4;">Real-Time Bin Monitoring</h3>
                                <p class="text-base leading-relaxed" style="color: rgba(209,250,229,0.55);">
                                    Every registered bin is tracked live on an interactive map. Administrators see fill-level status (Emptied, Full, Overflowing, Damaged) updated by community QR scans — no hardware sensors required.
                                </p>
                            </div>
                            <!-- Mini bar chart visual -->
                            <div class="flex items-end gap-2 mt-auto h-16">
                                <div *ngFor="let h of barHeights" class="flex-1 rounded-t-lg transition-all duration-700" [style.height.%]="h" style="background: linear-gradient(180deg, #10b981, #059669); min-height: 8px;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 2 – QR Reporting -->
                    <div class="col-span-12 md:col-span-5 group p-9 rounded-3xl overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1 relative"
                         style="background: #0d1f17; border: 1px solid rgba(6,182,212,0.12);"
                         onmouseover="this.style.borderColor='rgba(6,182,212,0.35)'; this.style.boxShadow='0 20px 60px rgba(6,182,212,0.08)'"
                         onmouseout="this.style.borderColor='rgba(6,182,212,0.12)'; this.style.boxShadow='none'">
                        <div class="absolute bottom-0 right-0 w-48 h-48 pointer-events-none" style="background: radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%);"></div>
                        <div class="relative z-10 flex flex-col gap-6 h-full">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2);"><i class="fa-solid fa-mobile-screen-button text-cyan-400"></i></div>
                            <div>
                                <h3 class="text-2xl font-bold mb-3.5" style="color: #f0fdf4;">Instant QR Reporting</h3>
                                <p class="text-base leading-relaxed" style="color: rgba(209,250,229,0.55);">
                                    Scan any bin's QR code with your phone camera. Instantly report its status — no app download required. Works for logged-in users and guests alike.
                                </p>
                            </div>
                            <!-- QR Mock -->
                            <div class="mt-auto self-end grid grid-cols-5 gap-1 w-20 h-20 p-2 rounded-xl" style="background: white;">
                                <div *ngFor="let c of qrCells" class="rounded-sm" [style.background]="c ? '#000' : '#fff'"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 3 – Eco Points -->
                    <div class="col-span-12 md:col-span-4 p-9 rounded-3xl cursor-default transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                         style="background: linear-gradient(135deg, #12200f, #0d1f17); border: 1px solid rgba(251,191,36,0.15);"
                         onmouseover="this.style.borderColor='rgba(251,191,36,0.4)'; this.style.boxShadow='0 20px 60px rgba(251,191,36,0.06)'"
                         onmouseout="this.style.borderColor='rgba(251,191,36,0.15)'; this.style.boxShadow='none'">
                        <div class="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%);"></div>
                        <div class="relative z-10 flex flex-col gap-5">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style="background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2);"><i class="fa-solid fa-star text-amber-400"></i></div>
                            <h3 class="text-2xl font-bold" style="color: #f0fdf4;">Eco Points & Rewards</h3>
                            <p class="text-base leading-relaxed" style="color: rgba(209,250,229,0.55);">Earn points for every verified report. Redeem them for community rewards and climb the leaderboard.</p>
                            <div class="flex items-center gap-3 mt-2 p-3 rounded-xl" style="background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.12);">
                                <i class="fa-solid fa-trophy text-amber-400 text-xl"></i>
                                <div>
                                    <div class="text-sm font-bold" style="color: #fbbf24;">Top Reporter</div>
                                    <div class="text-xs" style="color: rgba(209,250,229,0.45);">1,240 pts this month</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 4 – Admin Dashboard -->
                    <div class="col-span-12 md:col-span-4 p-9 rounded-3xl cursor-default transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                         style="background: #0d1f17; border: 1px solid rgba(139,92,246,0.12);"
                         onmouseover="this.style.borderColor='rgba(139,92,246,0.35)'; this.style.boxShadow='0 20px 60px rgba(139,92,246,0.08)'"
                         onmouseout="this.style.borderColor='rgba(139,92,246,0.12)'; this.style.boxShadow='none'">
                        <div class="absolute bottom-0 left-0 w-40 h-40 pointer-events-none" style="background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);"></div>
                        <div class="relative z-10 flex flex-col gap-5">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2);"><i class="fa-solid fa-shield-halved text-purple-400"></i></div>
                            <h3 class="text-2xl font-bold" style="color: #f0fdf4;">Role-Based Access</h3>
                            <p class="text-base leading-relaxed" style="color: rgba(209,250,229,0.55);">SuperAdmin, Admin, and Community User roles each have tailored dashboards with the tools they need — no more, no less.</p>
                            <div class="flex flex-col gap-2.5 mt-2">
                                <div *ngFor="let role of roles" class="flex items-center gap-2.5 text-sm">
                                    <div class="w-2 h-2 rounded-full shrink-0" [style.background]="role.color"></div>
                                    <span style="color: rgba(209,250,229,0.65);">{{ role.name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Feature 5 – Security -->
                    <div class="col-span-12 md:col-span-4 p-9 rounded-3xl cursor-default transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                         style="background: #0d1f17; border: 1px solid rgba(16,185,129,0.12);"
                         onmouseover="this.style.borderColor='rgba(16,185,129,0.35)'; this.style.boxShadow='0 20px 60px rgba(16,185,129,0.08)'"
                         onmouseout="this.style.borderColor='rgba(16,185,129,0.12)'; this.style.boxShadow='none'">
                        <div class="relative z-10 flex flex-col gap-5">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);"><i class="fa-solid fa-lock text-emerald-400"></i></div>
                            <h3 class="text-2xl font-bold" style="color: #f0fdf4;">Secure by Design</h3>
                            <p class="text-base leading-relaxed" style="color: rgba(209,250,229,0.55);">JWT authentication, HTTP interceptors, Angular route guards, and fully protected backend endpoints — security at every layer.</p>
                            <div class="flex flex-wrap gap-2 mt-2.5">
                                <span *ngFor="let tag of secTags" class="text-sm font-semibold px-3 py-1 rounded-full" style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15); color: #6ee7b7;">{{ tag }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `
})
export class FeaturesWidget {
    barHeights = [35, 60, 45, 90, 55, 70, 40, 80, 65, 95, 50, 75];
    qrCells = [1,1,1,0,1, 0,0,1,0,0, 1,1,0,0,1, 0,1,1,0,1, 1,0,0,1,1];
    roles = [
        { name: 'SuperAdmin — Full system control', color: '#8b5cf6' },
        { name: 'Admin — Manage bins, users & reports', color: '#10b981' },
        { name: 'User — Report bins, earn points', color: '#06b6d4' },
    ];
    secTags = ['JWT Auth', 'Route Guards', 'HTTP Interceptors', '[Authorize]'];
}
