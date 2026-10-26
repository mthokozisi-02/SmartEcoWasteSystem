import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SectorTab {
    id: string;
    label: string;
    icon: string;
    image: string;
    title: string;
    description: string;
    stat1: { value: string; label: string };
    stat2: { value: string; label: string };
    badge: string;
}

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section id="features" class="py-24 bg-white border-b border-slate-200/80 relative overflow-hidden">

            <!-- Wide Container: 1600px, Minimal Side Padding! -->
            <div class="w-full px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto relative z-10">

                <!-- Section Header -->
                <div class="text-center mb-16 flex flex-col items-center justify-center" data-aos="fade-up">
                    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                        Commercial Multi-Tenant SaaS
                    </div>
                    <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight tracking-tight text-slate-900">
                        Tailored for Commercial Malls, Estates & <br/>
                        <span class="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Smart City Operations</span>
                    </h2>
                    <p class="text-base sm:text-lg lg:text-xl max-w-3xl text-slate-600 leading-relaxed">
                        Dedicated tenant spaces, mandatory mobile photo proof, supervisory inspection audit workflows, and 100 Eco-Points citizen gamification.
                    </p>
                </div>

                <!-- Interactive Multi-Tenant Sector Showcase with High-Res Photos -->
                <div class="mb-16 p-6 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 shadow-xl" data-aos="fade-up" data-aos-delay="100">

                    <!-- Sector Switcher Tabs -->
                    <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
                        <button *ngFor="let tab of sectorTabs"
                                (click)="activeTab = tab.id"
                                class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-black transition-all duration-300 cursor-pointer border shadow-sm"
                                [ngClass]="activeTab === tab.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/30 scale-105' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/80'">
                            <i [class]="tab.icon" class="text-base"></i>
                            <span>{{ tab.label }}</span>
                        </button>
                    </div>

                    <!-- Active Sector Content with Photography -->
                    <div *ngFor="let tab of sectorTabs" [hidden]="activeTab !== tab.id"
                         class="grid grid-cols-12 gap-8 lg:gap-12 items-center animate-fade-in">

                        <!-- Photo visual with live overlay -->
                        <div class="col-span-12 lg:col-span-6 relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group">
                            <img [src]="tab.image" [alt]="tab.title" class="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

                            <div class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-black bg-white/95 text-slate-900 backdrop-blur-md shadow-md">
                                {{ tab.badge }}
                            </div>

                            <div class="absolute bottom-5 left-5 right-5 text-white">
                                <h4 class="text-2xl font-black mb-2">{{ tab.title }}</h4>
                                <div class="flex gap-6 pt-3 border-t border-white/20">
                                    <div>
                                        <div class="text-xl font-black text-emerald-400">{{ tab.stat1.value }}</div>
                                        <div class="text-[11px] text-slate-300 uppercase font-bold">{{ tab.stat1.label }}</div>
                                    </div>
                                    <div class="border-l border-white/20 pl-6">
                                        <div class="text-xl font-black text-teal-300">{{ tab.stat2.value }}</div>
                                        <div class="text-[11px] text-slate-300 uppercase font-bold">{{ tab.stat2.label }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Description & Features -->
                        <div class="col-span-12 lg:col-span-6 flex flex-col gap-4">
                            <span class="text-xs font-black uppercase tracking-widest text-emerald-600">Dedicated Tenant Organization</span>
                            <h3 class="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">{{ tab.title }}</h3>
                            <p class="text-base text-slate-600 leading-relaxed">{{ tab.description }}</p>

                            <div class="space-y-3 pt-3">
                                <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
                                    <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
                                        <i class="fa-solid fa-layer-group"></i>
                                    </div>
                                    <span class="text-sm font-bold text-slate-800">Complete data isolation & custom branding for this property</span>
                                </div>
                                <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
                                    <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-base shrink-0">
                                        <i class="fa-solid fa-mobile-screen"></i>
                                    </div>
                                    <span class="text-sm font-bold text-slate-800">QR code reporting on every bin station with instant routing</span>
                                </div>
                                <div class="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
                                    <div class="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-base shrink-0">
                                        <i class="fa-solid fa-chart-pie"></i>
                                    </div>
                                    <span class="text-sm font-bold text-slate-800">Dedicated operational analytics, staff shifts & fill metrics</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4 Bento Cards with High-Res Photos & AOS Animations -->
                <div class="grid grid-cols-12 gap-6 lg:gap-8">

                    <!-- Bento Card 1: Mobile Camera Photo Proof -->
                    <div class="col-span-12 lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-lg hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                         data-aos="fade-right" data-aos-delay="200">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                                    <i class="fa-solid fa-camera"></i>
                                </div>
                                <span class="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                                    Mandatory Photo Proof
                                </span>
                            </div>
                            <h3 class="text-2xl font-black text-slate-900 mb-2">Field Camera Verification</h3>
                            <p class="text-sm text-slate-600 mb-6 leading-relaxed">
                                Field operators claim tasks and snap high-resolution camera photos upon completing bin collections. No task can be closed without timestamped photographic evidence.
                            </p>
                        </div>

                        <!-- Photographic Proof Preview Box -->
                        <div class="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                            <img src="images/field-inspection.jpg" alt="Field Operator with Camera" class="w-full h-52 object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                            <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                                <div class="flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                                    <span class="text-xs font-black font-mono">TASK #142 · CAMERA VERIFIED</span>
                                </div>
                                <span class="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500 text-white shadow-md">
                                    Ready for Audit
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Bento Card 2: Supervisory Quality Audit & Rework Loop -->
                    <div class="col-span-12 lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-lg hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                         data-aos="fade-left" data-aos-delay="200">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl font-bold">
                                    <i class="fa-solid fa-clipboard-check"></i>
                                </div>
                                <span class="px-3.5 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-800">
                                    1-Click QA Decision
                                </span>
                            </div>
                            <h3 class="text-2xl font-black text-slate-900 mb-2">Supervisory Inspection Audit</h3>
                            <p class="text-sm text-slate-600 mb-6 leading-relaxed">
                                Supervisors review field photos in the Inspection Audit Log. One click approves clean bins; reject flags anomalies and returns tasks for immediate field rework.
                            </p>
                        </div>

                        <!-- Interactive Workflow Card -->
                        <div class="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                            <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-emerald-200">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base font-black">
                                        <i class="pi pi-check"></i>
                                    </div>
                                    <div>
                                        <div class="text-xs font-extrabold text-slate-900">Task Inspection Approved</div>
                                        <div class="text-[11px] text-slate-500">Photo verified clean · Sealed permanently</div>
                                    </div>
                                </div>
                                <span class="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
                                    PASS (100%)
                                </span>
                            </div>

                            <div class="flex items-center justify-between p-3.5 rounded-xl bg-white border border-rose-200">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-base font-black">
                                        <i class="pi pi-replay"></i>
                                    </div>
                                    <div>
                                        <div class="text-xs font-extrabold text-slate-900">Anomaly Flagged for Rework</div>
                                        <div class="text-[11px] text-slate-500">Lid jammed · Returned to staff task queue</div>
                                    </div>
                                </div>
                                <span class="text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-lg border border-rose-300">
                                    REWORK
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Bento Card 3: 100 Eco-Points Reward Engine -->
                    <div class="col-span-12 lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-lg hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300"
                         data-aos="fade-right" data-aos-delay="300">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
                                <i class="fa-solid fa-gift"></i>
                            </div>
                            <span class="px-3.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                                Automated Rewards
                            </span>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 mb-2">100 Eco-Points Citizen Engine</h3>
                        <p class="text-sm text-slate-600 mb-6 leading-relaxed">
                            Citizens scan QR codes to report overflow. Once field operators clear the bin and supervisors verify the report, 100 Eco-Points are credited automatically to the reporter's wallet.
                        </p>

                        <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-amber-300 flex items-center justify-between shadow-xs">
                            <div class="flex items-center gap-3.5">
                                <div class="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black shadow-md animate-bounce-slow">
                                    ★
                                </div>
                                <div>
                                    <div class="text-sm font-black text-slate-900">+100 Eco-Points Deposited</div>
                                    <div class="text-xs text-amber-800 font-bold">Community Leaderboard Rank #1</div>
                                </div>
                            </div>
                            <span class="text-xs font-black px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-700 shadow-sm">
                                Instant Credit
                            </span>
                        </div>
                    </div>

                    <!-- Bento Card 4: Waste Collection Fleet Route Dispatch -->
                    <div class="col-span-12 lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-lg hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300"
                         data-aos="fade-left" data-aos-delay="300">
                        <div class="flex items-center justify-between mb-4">
                            <div class="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center text-xl font-bold">
                                <i class="fa-solid fa-truck-moving"></i>
                            </div>
                            <span class="px-3.5 py-1 rounded-full text-xs font-black bg-cyan-100 text-cyan-800">
                                Dynamic Routing
                            </span>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 mb-2">Fleet Dispatch & Route Optimization</h3>
                        <p class="text-sm text-slate-600 mb-6 leading-relaxed">
                            Collection trucks only navigate to bins flagged full or overflowing. Prevents unnecessary vehicle trips, lowering fuel consumption and municipal carbon emissions by up to 38%.
                        </p>

                        <div class="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                            <img src="images/waste-truck.jpg" alt="Collection Truck" class="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                            <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                                <span class="text-xs font-black">Smart Dispatch Route #08</span>
                                <span class="text-xs font-mono font-black text-emerald-400">Fuel Saved: -38%</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out;
                }
            </style>
        </section>
    `
})
export class FeaturesWidget {
    activeTab = 'malls';

    sectorTabs: SectorTab[] = [
        {
            id: 'malls',
            label: 'Shopping Malls & Retail',
            icon: 'fa-solid fa-cart-shopping',
            image: 'images/commercial-mall.jpg',
            title: 'Commercial Retail & Mall Centers',
            description: 'Coordinate high-traffic food court waste stations, retail compaction, and cleaning staff schedules. Automatically dispatch tasks as foot traffic peaks during weekends and lunch rushes.',
            stat1: { value: '45 mins', label: 'Average Clear Time' },
            stat2: { value: '99.4%', label: 'Cleanliness Rating' },
            badge: 'Retail Operations'
        },
        {
            id: 'estates',
            label: 'Residential Gated Estates',
            icon: 'fa-solid fa-tree-city',
            image: 'images/residential-estate.jpg',
            title: 'Residential Gated Communities',
            description: 'Empower HOA members and residents to report neighborhood bin issues with simple QR scans. Gamified 100 Eco-Points incentives drive active resident engagement and immaculate neighborhood streets.',
            stat1: { value: '+100 Pts', label: 'Per Verified Report' },
            stat2: { value: '100%', label: 'Photo Proof Audit' },
            badge: 'HOA & Community'
        },
        {
            id: 'cities',
            label: 'Municipal City Councils',
            icon: 'fa-solid fa-city',
            image: 'images/smart-city.jpg',
            title: 'Municipal Districts & Metro Councils',
            description: 'Scale to thousands of bins across metropolitan zones. Real-time IoT heatmaps route municipal collection trucks exclusively to overflowing bins, slashing urban traffic and operational expenditure.',
            stat1: { value: '-38%', label: 'Fuel & Fleet Savings' },
            stat2: { value: '0 Backlog', label: 'Automated Dispatch' },
            badge: 'Smart City Scale'
        }
    ];
}
