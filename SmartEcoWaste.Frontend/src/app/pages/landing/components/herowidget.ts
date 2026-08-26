import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'hero-widget',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <section id="hero" class="relative min-h-screen flex flex-col justify-center overflow-hidden"
                 style="background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.18) 0%, transparent 60%), linear-gradient(180deg, #050c09 0%, #080f0b 60%, #0a1a11 100%);">

            <!-- Animated mesh grid background -->
            <div class="absolute inset-0 pointer-events-none" style="background-image: linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px); background-size: 60px 60px;"></div>

            <!-- Floating glow orbs -->
            <div class="absolute pointer-events-none" style="top: 15%; left: 8%; width: 380px; height: 380px; background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%); animation: floatOrb 8s ease-in-out infinite;"></div>
            <div class="absolute pointer-events-none" style="top: 50%; right: 5%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%); animation: floatOrb 10s ease-in-out infinite reverse;"></div>
            <div class="absolute pointer-events-none" style="bottom: 10%; left: 40%; width: 250px; height: 250px; background: radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%); animation: floatOrb 12s ease-in-out infinite;"></div>

            <div class="relative z-10 w-full px-8 lg:px-16 py-20 lg:py-28">
                <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

                    <!-- LEFT: Content -->
                    <div class="w-full lg:w-6/12 flex flex-col items-start">

                        <!-- Status badge -->
                        <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 border text-xs font-semibold tracking-widest uppercase"
                             style="background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.25); color: #34d399; animation: fadeInUp 0.6s ease both;">
                            <span class="relative flex h-2 w-2">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background: #10b981;"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2" style="background: #10b981;"></span>
                            </span>
                            Smart City Initiative · Live Now
                        </div>

                        <!-- Headline -->
                        <h1 class="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] mb-6 tracking-tight"
                            style="animation: fadeInUp 0.7s ease 0.1s both; color: #f0fdf4;">
                            Waste Management<br/>
                            <span style="background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Reimagined.</span>
                        </h1>

                        <!-- Subheadline -->
                        <p class="text-base md:text-2xl font-normal leading-relaxed mb-10 max-w-xl"
                           style="color: rgba(209,250,229,0.65); animation: fadeInUp 0.8s ease 0.2s both;">
                            SmartEcoWaste connects IoT-enabled bins, QR-code reporting, and community incentives into a single intelligent platform — keeping cities cleaner, smarter, and greener.
                        </p>

                        <!-- CTA Buttons -->
                        <div class="flex flex-wrap gap-4 mb-16" style="animation: fadeInUp 0.9s ease 0.3s both;">
                            <a routerLink="/auth/sign-up"
                               class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg no-underline transition-all duration-300"
                               style="background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 8px 30px rgba(16,185,129,0.35);"
                               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 40px rgba(16,185,129,0.45)'"
                               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 30px rgba(16,185,129,0.35)'">
                                <i class="pi pi-arrow-right"></i>
                                Get Started Free
                            </a>
                            <a href="/landing#live-map-section"
                               class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg no-underline transition-all duration-300 border"
                               style="color: #34d399; border-color: rgba(52,211,153,0.3); background: rgba(16,185,129,0.06);"
                               onmouseover="this.style.borderColor='rgba(52,211,153,0.6)'; this.style.background='rgba(16,185,129,0.12)'"
                               onmouseout="this.style.borderColor='rgba(52,211,153,0.3)'; this.style.background='rgba(16,185,129,0.06)'">
                                <i class="pi pi-map"></i>
                                View Live Map
                            </a>
                        </div>

                        <!-- Metrics Row -->
                        <div class="flex flex-wrap gap-8" style="animation: fadeInUp 1s ease 0.4s both;">
                            <div class="flex flex-col gap-0.5">
                                <span class="text-4xl font-black" style="color: #10b981;">{{ displayBins }}+</span>
                                <span class="text-sm font-bold uppercase tracking-wider" style="color: rgba(209,250,229,0.5);">Smart Bins</span>
                            </div>
                            <div class="w-px" style="background: rgba(16,185,129,0.2);"></div>
                            <div class="flex flex-col gap-0.5">
                                <span class="text-4xl font-black" style="color: #10b981;">{{ displayReports }}+</span>
                                <span class="text-sm font-bold uppercase tracking-wider" style="color: rgba(209,250,229,0.5);">Reports Filed</span>
                            </div>
                            <div class="w-px" style="background: rgba(16,185,129,0.2);"></div>
                            <div class="flex flex-col gap-0.5">
                                <span class="text-4xl font-black" style="color: #10b981;">{{ displayPoints }}+</span>
                                <span class="text-sm font-bold uppercase tracking-wider" style="color: rgba(209,250,229,0.5);">Eco Points Awarded</span>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT: Visual -->
                    <div class="w-full lg:w-6/12 flex justify-center items-center relative" style="animation: fadeInUp 1s ease 0.2s both;">

                        <!-- Outer glow ring -->
                        <div class="absolute rounded-full pointer-events-none"
                             style="width: 440px; height: 440px; background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%); animation: pulse 4s ease-in-out infinite;"></div>

                        <!-- Central bin dashboard card -->
                        <div class="relative rounded-[28px] p-1 z-10"
                             style="background: linear-gradient(135deg, rgba(16,185,129,0.5) 0%, rgba(6,182,212,0.3) 50%, rgba(16,185,129,0.1) 100%); box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.15);">
                            <div class="rounded-[24px] p-6 w-80" style="background: #0d1f17;">

                                <!-- Card Header -->
                                <div class="flex items-center justify-between mb-5">
                                    <div class="flex items-center gap-2">
                                        <div class="w-2.5 h-2.5 rounded-full animate-pulse" style="background: #10b981; box-shadow: 0 0 8px #10b981;"></div>
                                        <span class="text-xs font-bold uppercase tracking-widest" style="color: rgba(209,250,229,0.6);">Live Dashboard</span>
                                    </div>
                                    <span class="text-xs px-2 py-0.5 rounded-full font-semibold" style="background: rgba(16,185,129,0.15); color: #34d399;">Online</span>
                                </div>

                                <!-- Bin Status Grid -->
                                <div class="grid grid-cols-2 gap-3 mb-5">
                                    <div class="p-3 rounded-xl" style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.15);">
                                        <div class="text-xs mb-1" style="color: rgba(209,250,229,0.5);">Bin #001</div>
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-2 h-2 rounded-full" style="background: #10b981;"></div>
                                            <span class="text-xs font-bold" style="color: #10b981;">Emptied</span>
                                        </div>
                                        <div class="mt-2 w-full rounded-full overflow-hidden" style="height: 4px; background: rgba(255,255,255,0.08);">
                                            <div class="h-full rounded-full" style="width: 15%; background: #10b981;"></div>
                                        </div>
                                    </div>
                                    <div class="p-3 rounded-xl" style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.15);">
                                        <div class="text-xs mb-1" style="color: rgba(209,250,229,0.5);">Bin #002</div>
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-2 h-2 rounded-full" style="background: #f59e0b;"></div>
                                            <span class="text-xs font-bold" style="color: #f59e0b;">Full</span>
                                        </div>
                                        <div class="mt-2 w-full rounded-full overflow-hidden" style="height: 4px; background: rgba(255,255,255,0.08);">
                                            <div class="h-full rounded-full" style="width: 90%; background: #f59e0b;"></div>
                                        </div>
                                    </div>
                                    <div class="p-3 rounded-xl" style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15);">
                                        <div class="text-xs mb-1" style="color: rgba(209,250,229,0.5);">Bin #003</div>
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-2 h-2 rounded-full animate-ping" style="background: #ef4444;"></div>
                                            <span class="text-xs font-bold" style="color: #ef4444;">Overflowing</span>
                                        </div>
                                        <div class="mt-2 w-full rounded-full overflow-hidden" style="height: 4px; background: rgba(255,255,255,0.08);">
                                            <div class="h-full rounded-full" style="width: 100%; background: #ef4444;"></div>
                                        </div>
                                    </div>
                                    <div class="p-3 rounded-xl" style="background: rgba(107,114,128,0.08); border: 1px solid rgba(107,114,128,0.15);">
                                        <div class="text-xs mb-1" style="color: rgba(209,250,229,0.5);">Bin #004</div>
                                        <div class="flex items-center gap-1.5">
                                            <div class="w-2 h-2 rounded-full" style="background: #6b7280;"></div>
                                            <span class="text-xs font-bold" style="color: #9ca3af;">Damaged</span>
                                        </div>
                                        <div class="mt-2 w-full rounded-full overflow-hidden" style="height: 4px; background: rgba(255,255,255,0.08);">
                                            <div class="h-full rounded-full" style="width: 0%; background: #6b7280;"></div>
                                        </div>
                                    </div>
                                </div>

                                <!-- QR Scan row -->
                                <div class="flex items-center gap-3 p-3 rounded-xl mb-4" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);">
                                    <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(16,185,129,0.12);">
                                        <i class="fa-solid fa-qrcode text-emerald-400 text-lg"></i>
                                    </div>
                                    <div>
                                        <div class="text-xs font-semibold" style="color: #d1fae5;">QR Scan Detected</div>
                                        <div class="text-[10px]" style="color: rgba(209,250,229,0.4);">Bin #003 · 2 min ago · Overflowing</div>
                                    </div>
                                    <div class="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style="background: rgba(239,68,68,0.15); color: #f87171;">Alert</div>
                                </div>

                                <!-- Eco Points earned -->
                                <div class="flex items-center justify-between p-3 rounded-xl" style="background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08)); border: 1px solid rgba(16,185,129,0.2);">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-star text-amber-400 text-sm"></i>
                                        <div>
                                            <div class="text-[10px] font-semibold uppercase tracking-wider" style="color: rgba(209,250,229,0.5);">Your Eco Points</div>
                                            <div class="text-sm font-black" style="color: #fbbf24;">1,240 pts</div>
                                        </div>
                                    </div>
                                    <div class="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style="background: rgba(251,191,36,0.12); color: #fbbf24;">Rank #3 <i class="fa-solid fa-trophy text-amber-500 text-xs"></i></div>
                                </div>
                            </div>
                                           <!-- Floating notification card -->
                        <div class="absolute top-0 right-0 lg:right-[-40px] p-3 rounded-2xl text-xs font-medium flex items-center gap-2.5"
                             style="background: rgba(5,12,9,0.9); border: 1px solid rgba(16,185,129,0.2); backdrop-filter: blur(12px); color: #d1fae5; animation: floatBadge 6s ease-in-out infinite; box-shadow: 0 8px 30px rgba(0,0,0,0.4);">
                            <span class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(16,185,129,0.15);"><i class="fa-solid fa-leaf text-emerald-400 text-sm"></i></span>
                            <div>
                                <div class="font-bold text-[11px]" style="color: #34d399;">+25 Eco Points</div>
                                <div class="text-[10px]" style="color: rgba(209,250,229,0.5);">Report submitted!</div>
                            </div>
                        </div>
 
                        <!-- Floating dispatch card -->
                        <div class="absolute bottom-4 left-0 lg:left-[-40px] p-3 rounded-2xl text-xs font-medium flex items-center gap-2.5"
                             style="background: rgba(5,12,9,0.9); border: 1px solid rgba(6,182,212,0.2); backdrop-filter: blur(12px); color: #d1fae5; animation: floatBadge 7s ease-in-out infinite reverse; box-shadow: 0 8px 30px rgba(0,0,0,0.4);">
                            <span class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style="background: rgba(6,182,212,0.15);"><i class="fa-solid fa-truck text-cyan-400 text-sm"></i></span>
                            <div>
                                <div class="font-bold text-[11px]" style="color: #67e8f9;">Dispatch Sent</div>
                                <div class="text-[10px]" style="color: rgba(209,250,229,0.5);">ETA: 12 min</div>
                            </div>
                        </div>             </div>
                    </div>
                </div>
            </div>

            <!-- Scroll hint -->
            <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style="animation: fadeInUp 1.2s ease 0.6s both;">
                <span class="text-xs font-medium uppercase tracking-widest" style="color: rgba(209,250,229,0.35);">Scroll to explore</span>
                <div class="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5" style="border-color: rgba(16,185,129,0.3);">
                    <div class="w-1 h-2 rounded-full" style="background: #10b981; animation: scrollDot 1.8s ease-in-out infinite;"></div>
                </div>
            </div>

            <style>
                @keyframes floatOrb {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(20px, -30px) scale(1.05); }
                    66% { transform: translate(-15px, 20px) scale(0.95); }
                }
                @keyframes floatBadge {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes scrollDot {
                    0%, 100% { transform: translateY(0); opacity: 1; }
                    50% { transform: translateY(8px); opacity: 0.3; }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.04); }
                }
            </style>
        </section>
    `,
})
export class HeroWidget implements OnInit, OnDestroy {
    displayBins = 0;
    displayReports = 0;
    displayPoints = 0;
    private interval: any;

    ngOnInit() {
        // Animated counter effect
        const targets = { bins: 120, reports: 850, points: 24000 };
        const duration = 2000;
        const steps = 60;
        const stepTime = duration / steps;
        let step = 0;
        this.interval = setInterval(() => {
            step++;
            const progress = step / steps;
            const ease = 1 - Math.pow(1 - progress, 3); // ease out cubic
            this.displayBins = Math.round(targets.bins * ease);
            this.displayReports = Math.round(targets.reports * ease);
            this.displayPoints = Math.round(targets.points * ease);
            if (step >= steps) clearInterval(this.interval);
        }, stepTime);
    }

    ngOnDestroy() {
        if (this.interval) clearInterval(this.interval);
    }
}
