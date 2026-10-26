import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'footer-widget',
    standalone: true,
    imports: [RouterModule, CommonModule],
    template: `
        <footer class="bg-slate-900 border-t border-slate-800 text-white pt-16 pb-12 relative overflow-hidden" data-aos="fade-up">

            <!-- Glowing ambient background orb -->
            <div class="absolute -top-24 left-1/3 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none"></div>

            <div class="w-full px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto relative z-10">

                <!-- Top grid -->
                <div class="grid grid-cols-12 gap-10 mb-14">

                    <!-- Brand column -->
                    <div class="col-span-12 lg:col-span-4 flex flex-col gap-4">
                        <div class="flex items-center gap-3">
                            <div class="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 text-white">
                                <i class="fa-solid fa-recycle text-xl"></i>
                            </div>
                            <span class="text-2xl font-black tracking-tight text-white">
                                Smart<span class="text-emerald-400">Eco</span>Waste
                            </span>
                        </div>
                        <p class="text-sm leading-relaxed text-slate-400 max-w-sm">
                            Next-generation commercial waste management and smart city ecosystem. Powered by multi-tenant operations, field camera proof, supervisory inspection audits, and citizen Eco-Points rewards.
                        </p>
                        <div class="flex items-center gap-2.5 px-4 py-2 rounded-xl w-fit bg-slate-800 border border-emerald-500/30">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                            <span class="text-xs font-bold text-emerald-300">Commercial Multi-Tenant SaaS Online</span>
                        </div>
                    </div>

                    <!-- Platform links -->
                    <div class="col-span-6 lg:col-span-2 flex flex-col gap-3">
                        <div class="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Platform</div>
                        <a *ngFor="let link of platformLinks" [href]="link.href"
                           class="text-sm font-semibold text-slate-400 hover:text-emerald-400 no-underline transition-colors w-fit">{{ link.label }}</a>
                    </div>

                    <!-- Community links -->
                    <div class="col-span-6 lg:col-span-2 flex flex-col gap-3">
                        <div class="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Features</div>
                        <a *ngFor="let link of featureLinks" [href]="link.href"
                           class="text-sm font-semibold text-slate-400 hover:text-emerald-400 no-underline transition-colors w-fit">{{ link.label }}</a>
                    </div>

                    <!-- Call to action card -->
                    <div class="col-span-12 lg:col-span-4">
                        <div class="p-6 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-xl flex flex-col gap-4">
                            <div class="text-xs font-black uppercase tracking-widest text-emerald-400">Get Started Today</div>
                            <p class="text-xs leading-relaxed text-slate-300">
                                Register your shopping mall, residential estate, or municipality to streamline field inspections, eliminate unverified tasks, and reward your community.
                            </p>
                            <a routerLink="/auth/sign-up"
                               class="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm no-underline text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                               style="background: linear-gradient(135deg, #34d399, #10b981);">
                                <i class="pi pi-user-plus text-xs"></i>
                                Register Organization Workspace
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Bottom bar -->
                <div class="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-800">
                    <p class="text-xs text-slate-500">
                        © {{ year }} SmartEcoWaste Systems. Commercial Multi-Tenant Smart Waste Management.
                    </p>
                    <div class="flex items-center gap-2 text-xs text-slate-400">
                        <span>Powered by</span>
                        <span class="text-white font-bold">Angular 20</span>
                        <span>•</span>
                        <span class="text-white font-bold">ASP.NET Core</span>
                        <span>•</span>
                        <span class="text-white font-bold">PrimeNG</span>
                    </div>
                </div>
            </div>
        </footer>
    `
})
export class FooterWidget {
    year = new Date().getFullYear();

    platformLinks = [
        { label: 'Live IoT Map', href: '/landing#live-map-section' },
        { label: 'Platform Capabilities', href: '/landing#features' },
        { label: 'Operational Lifecycle', href: '/landing#roadmap' },
        { label: 'Recycling Guide', href: '/landing#highlights' },
    ];

    featureLinks = [
        { label: 'Multi-Tenant Commercial SaaS', href: '/landing#features' },
        { label: 'Camera Photo Proof', href: '/landing#roadmap' },
        { label: 'Inspection Audit & Approval', href: '/landing#roadmap' },
        { label: '100 Eco-Points Engine', href: '/landing#features' },
    ];
}
