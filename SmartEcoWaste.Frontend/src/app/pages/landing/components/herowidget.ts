import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'hero-widget',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <section id="hero" class="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-gradient-to-b from-white via-emerald-50/20 to-slate-50 border-b border-slate-200/80">

            <!-- Subtle Architectural Background Overlay -->
            <div class="absolute inset-0 pointer-events-none opacity-10">
                <img src="images/urban-buildings.jpg" alt="Urban Architecture" class="w-full h-full object-cover object-center scale-105 animate-subtle-pan" />
            </div>

            <!-- Soft Glowing Ambient Light Orbs -->
            <div class="absolute pointer-events-none w-[600px] h-[600px] -top-32 -left-32 rounded-full bg-emerald-400/15 blur-[120px]"></div>
            <div class="absolute pointer-events-none w-[500px] h-[500px] top-1/2 -right-24 rounded-full bg-teal-400/15 blur-[100px]"></div>

            <!-- Subtle Grid Pattern -->
            <div class="absolute inset-0 pointer-events-none opacity-40"
                 style="background-image: radial-gradient(rgba(16,185,129,0.15) 1.5px, transparent 1.5px); background-size: 32px 32px;"></div>

            <!-- Live Streaming Multi-Tenant Activity Marquee Banner -->
            <div class="relative z-20 w-full overflow-hidden py-3 bg-white/80 border-b border-slate-200/80 backdrop-blur-md shadow-xs">
                <div class="flex items-center gap-12 whitespace-nowrap animate-marquee">
                    <div *ngFor="let item of tickerItems" class="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                        <span class="w-2.5 h-2.5 rounded-full animate-ping" [style.background]="item.dotColor"></span>
                        <span class="font-extrabold text-slate-900">{{ item.tenant }}:</span>
                        <span>{{ item.text }}</span>
                        <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs" [style]="item.badgeStyle">{{ item.badge }}</span>
                    </div>
                    <!-- Duplicate for infinite marquee loop -->
                    <div *ngFor="let item of tickerItems" class="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                        <span class="w-2.5 h-2.5 rounded-full animate-ping" [style.background]="item.dotColor"></span>
                        <span class="font-extrabold text-slate-900">{{ item.tenant }}:</span>
                        <span>{{ item.text }}</span>
                        <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs" [style]="item.badgeStyle">{{ item.badge }}</span>
                    </div>
                </div>
            </div>

            <!-- Main Hero Content (Wide 1600px, Minimal Side Padding!) -->
            <div class="relative z-10 w-full px-4 sm:px-8 lg:px-12 py-12 lg:py-16 max-w-[1600px] mx-auto">
                <div class="grid grid-cols-12 gap-8 lg:gap-12 items-center">

                    <!-- LEFT: Headline & Value Proposition -->
                    <div class="col-span-12 lg:col-span-7 flex flex-col items-start" data-aos="fade-right" data-aos-duration="800">

                        <!-- Live Status Badge with Animated Radar Ping -->
                        <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6 border text-xs font-extrabold tracking-widest uppercase bg-emerald-50 border-emerald-200 text-emerald-800 shadow-xs">
                            <span class="relative flex h-3 w-3">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                            </span>
                            Commercial Multi-Tenant SaaS · Live Field Monitoring
                        </div>

                        <!-- Main Title -->
                        <h1 class="text-5xl sm:text-6xl xl:text-7xl font-black leading-[1.06] mb-6 tracking-tight text-slate-900">
                            Intelligent Waste <br/>
                            <span class="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">Operations & Audit.</span>
                        </h1>

                        <!-- Subtitle -->
                        <p class="text-base sm:text-lg xl:text-xl font-normal leading-relaxed mb-8 max-w-2xl text-slate-600">
                            The all-in-one ecosystem for shopping malls, residential estates, and municipal councils. Automating IoT fill detection, mobile camera photo proof, supervisory inspection approvals, and 100 Eco-Points citizen incentives.
                        </p>

                        <!-- Action Buttons -->
                        <div class="flex flex-wrap gap-4 mb-10 w-full sm:w-auto" data-aos="fade-up" data-aos-delay="200">
                            <a routerLink="/auth/sign-up"
                               class="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-lg text-white no-underline shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:shadow-emerald-600/40 hover:scale-105 transition-all duration-300 relative overflow-hidden"
                               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <span class="relative z-10">Start Organization Free</span>
                                <i class="pi pi-arrow-right text-sm group-hover:translate-x-1.5 transition-transform relative z-10"></i>
                            </a>

                            <a href="/landing#live-map-section"
                               class="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-extrabold text-lg text-slate-800 bg-white border border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-700 shadow-sm transition-all duration-300">
                                <i class="pi pi-map text-emerald-600 animate-bounce-slow"></i>
                                <span>Explore Live IoT Map</span>
                            </a>
                        </div>

                        <!-- Live Metrics Row -->
                        <div class="grid grid-cols-3 gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xl backdrop-blur-md w-full max-w-2xl"
                             data-aos="fade-up" data-aos-delay="300">
                            <div class="flex flex-col">
                                <div class="text-3xl sm:text-4xl font-black text-emerald-600 flex items-center gap-1">
                                    {{ displayBins }}+
                                </div>
                                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Active Smart Bins</span>
                            </div>
                            <div class="flex flex-col border-l border-slate-200 pl-4 sm:pl-6">
                                <div class="text-3xl sm:text-4xl font-black text-teal-600 flex items-center gap-1">
                                    {{ displayReports }}+
                                </div>
                                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Photo Proofs Audited</span>
                            </div>
                            <div class="flex flex-col border-l border-slate-200 pl-4 sm:pl-6">
                                <div class="text-3xl sm:text-4xl font-black text-amber-500 flex items-center gap-1">
                                    {{ displayPoints | number }}+
                                </div>
                                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Eco-Points Awarded</span>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT: Interactive Visual Operations Hub -->
                    <div class="col-span-12 lg:col-span-5 relative" data-aos="fade-left" data-aos-duration="800">

                        <!-- Central Glassmorphic Console Card -->
                        <div class="relative z-10 rounded-3xl p-6 bg-white border border-slate-200 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500">

                            <!-- Top Header with Tenant Selector Simulation -->
                            <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                                        <i class="fa-solid fa-city"></i>
                                    </div>
                                    <div>
                                        <div class="text-sm font-extrabold text-slate-900">Commercial Mall Operations Hub</div>
                                        <div class="text-[11px] text-emerald-700 font-mono font-bold">Workspace: MALL-WESTGATE-01 · Active</div>
                                    </div>
                                </div>
                                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                    <span class="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span> Live Fleet
                                </span>
                            </div>

                            <!-- Photographic Inspection Visual Card with Real Image -->
                            <div class="relative rounded-2xl overflow-hidden mb-5 border border-slate-200 group">
                                <img src="images/recycling-station.jpg" alt="Smart Bin Station" class="w-full h-48 object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

                                <!-- Viewfinder Overlays -->
                                <div class="absolute top-2.5 left-2.5 text-[11px] font-mono px-2.5 py-0.5 rounded bg-black/70 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                                    GPS: 26.2041° S, 28.0473° E
                                </div>
                                <div class="absolute top-2.5 right-2.5 text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-600 text-white flex items-center gap-1.5 shadow-md">
                                    <i class="pi pi-camera"></i> Camera Verified
                                </div>

                                <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                                    <div>
                                        <div class="text-sm font-extrabold">Bin #004 — Food Court Atrium</div>
                                        <div class="text-xs text-emerald-300 font-medium">Field Operator: Alex K. · Camera Photo Stamped</div>
                                    </div>
                                    <span class="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500 text-white shadow-lg flex items-center gap-1 animate-pulse">
                                        <i class="pi pi-check-circle"></i> Approved
                                    </span>
                                </div>
                            </div>

                            <!-- Real-time Bin Fill Level Bars -->
                            <div class="space-y-3 mb-5">
                                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    <div class="flex justify-between text-xs font-bold mb-1.5">
                                        <span class="flex items-center gap-2 text-slate-800">
                                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                            Organic Waste Station #01
                                        </span>
                                        <span class="text-emerald-700 font-extrabold">18% · Optimal</span>
                                    </div>
                                    <div class="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                        <div class="h-full bg-emerald-500 rounded-full" style="width: 18%;"></div>
                                    </div>
                                </div>

                                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                                    <div class="flex justify-between text-xs font-bold mb-1.5">
                                        <span class="flex items-center gap-2 text-slate-800">
                                            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                            Plastics & Packaging #04
                                        </span>
                                        <span class="text-amber-700 font-extrabold">86% · Queued for Collection</span>
                                    </div>
                                    <div class="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                        <div class="h-full bg-amber-500 rounded-full" style="width: 86%;"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- 100 Eco-Points Reward Card -->
                            <div class="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-amber-300 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md animate-wiggle">
                                        ★
                                    </div>
                                    <div>
                                        <div class="text-[10px] font-extrabold uppercase tracking-widest text-amber-800">Automated Gamification</div>
                                        <div class="text-xs font-black text-slate-900">+100 Eco-Points Credited to Citizen</div>
                                    </div>
                                </div>
                                <span class="text-xs font-black px-3 py-1.5 rounded-xl bg-white text-amber-800 border border-amber-300 shadow-xs">
                                    Rank #1 🏆
                                </span>
                            </div>
                        </div>

                        <!-- Floating Live Verification Pill 1 -->
                        <div class="absolute -top-5 -right-4 z-20 p-3.5 rounded-2xl bg-white border border-emerald-300 shadow-2xl flex items-center gap-3 animate-float-slow"
                             data-aos="zoom-in" data-aos-delay="400">
                            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold">
                                <i class="fa-solid fa-camera"></i>
                            </div>
                            <div>
                                <div class="text-xs font-black text-slate-900">Camera Proof Attached</div>
                                <div class="text-[10px] text-emerald-700 font-bold">100% Supervisory Sign-off</div>
                            </div>
                        </div>

                        <!-- Floating Live Verification Pill 2 -->
                        <div class="absolute -bottom-5 -left-4 z-20 p-3.5 rounded-2xl bg-white border border-teal-300 shadow-2xl flex items-center gap-3 animate-float-reverse"
                             data-aos="zoom-in" data-aos-delay="500">
                            <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-lg font-bold">
                                <i class="fa-solid fa-truck-fast"></i>
                            </div>
                            <div>
                                <div class="text-xs font-black text-slate-900">Collection Dispatched</div>
                                <div class="text-[10px] text-teal-700 font-bold">ETA: 6 Minutes · Route #3</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style>
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                .animate-float-slow {
                    animation: floatSlow 5s ease-in-out infinite;
                }
                @keyframes floatReverse {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(12px); }
                }
                .animate-float-reverse {
                    animation: floatReverse 6s ease-in-out infinite;
                }
                @keyframes subtlePan {
                    0%, 100% { transform: scale(1.04) translate(0px, 0px); }
                    50% { transform: scale(1.08) translate(-10px, -10px); }
                }
                .animate-subtle-pan {
                    animation: subtlePan 25s ease-in-out infinite alternate;
                }
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-10deg); }
                    75% { transform: rotate(10deg); }
                }
                .animate-wiggle {
                    animation: wiggle 2.5s ease-in-out infinite;
                }
                @keyframes bounceSlow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce-slow {
                    animation: bounceSlow 2s ease-in-out infinite;
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

    tickerItems = [
        { tenant: 'WESTGATE-MALL', text: 'Bin #014 [Food Court] emptied · Photo proof verified by supervisor', badge: 'Approved', dotColor: '#059669', badgeStyle: 'background: #d1fae5; color: #065f46;' },
        { tenant: 'NORTH-ESTATE', text: 'Resident submitted QR overflow alert · +100 Eco-Points awarded', badge: '+100 Pts', dotColor: '#d97706', badgeStyle: 'background: #fef3c7; color: #92400e;' },
        { tenant: 'METRO-CITY-COUNCIL', text: 'Truck Fleet #02 dispatched on dynamic route (8 bins queued)', badge: 'Dispatched', dotColor: '#0891b2', badgeStyle: 'background: #cffafe; color: #155e75;' },
        { tenant: 'CENTRAL-PLAZA', text: 'Supervisory quality audit passed with zero anomaly flags', badge: '100% QA', dotColor: '#059669', badgeStyle: 'background: #d1fae5; color: #065f46;' },
        { tenant: 'GREEN-VALLEY', text: 'Field Operator camera capture uploaded via mobile browser', badge: 'Photo Proof', dotColor: '#059669', badgeStyle: 'background: #d1fae5; color: #065f46;' }
    ];

    ngOnInit() {
        const targets = { bins: 154, reports: 980, points: 34200 };
        const duration = 2000;
        const steps = 60;
        const stepTime = duration / steps;
        let step = 0;
        this.interval = setInterval(() => {
            step++;
            const progress = step / steps;
            const ease = 1 - Math.pow(1 - progress, 3);
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
