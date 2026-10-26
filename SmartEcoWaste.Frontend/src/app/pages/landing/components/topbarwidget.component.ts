import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'topbar-widget',
    standalone: true,
    imports: [CommonModule, RouterModule, StyleClassModule, ButtonModule, RippleModule, AppFloatingConfigurator],
    template: `
        <nav class="sticky top-0 z-50 w-full transition-all duration-300 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs">
            <div class="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3.5 w-full max-w-[1600px] mx-auto">

                <!-- Logo -->
                <a routerLink="/" class="flex items-center gap-3 no-underline group">
                    <div class="relative flex items-center justify-center w-11 h-11 rounded-2xl overflow-hidden shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-300"
                         style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <i class="fa-solid fa-recycle text-white text-xl animate-spin-slow"></i>
                    </div>
                    <div>
                        <span class="text-2xl font-black tracking-tight text-slate-900">
                            Smart<span class="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Eco</span>Waste
                        </span>
                        <span class="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-emerald-700 -mt-1">Commercial Multi-Tenant SaaS</span>
                    </div>
                </a>

                <!-- Mobile hamburger -->
                <a pButton [text]="true" pRipple class="lg:hidden! text-slate-700 hover:text-slate-900"
                   pStyleClass="@next" enterFromClass="hidden" leaveToClass="hidden" [hideOnOutsideClick]="true">
                    <i class="pi pi-bars text-xl!"></i>
                </a>

                <!-- Desktop Nav -->
                <div class="items-center grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-6 lg:px-0 z-20 rounded-b-2xl bg-white/95 lg:bg-transparent shadow-xl lg:shadow-none border lg:border-none border-slate-200 backdrop-blur-xl">
                    <ul class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-1 lg:ml-12">
                        <li>
                            <a href="/landing#hero" class="no-underline px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 transition-all duration-200 block">Home</a>
                        </li>
                        <li>
                            <a href="/landing#features" class="no-underline px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 transition-all duration-200 block">SaaS Operations</a>
                        </li>
                        <li>
                            <a href="/landing#live-map-section" class="no-underline px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 transition-all duration-200 block">Live IoT Map</a>
                        </li>
                        <li>
                            <a href="/landing#roadmap" class="no-underline px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 transition-all duration-200 block">Field Proof & Audit</a>
                        </li>
                        <li>
                            <a href="/landing#highlights" class="no-underline px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 transition-all duration-200 block">Rewards & Sorting</a>
                        </li>
                    </ul>

                    <div class="flex items-center border-t lg:border-t-0 py-4 lg:py-0 mt-4 lg:mt-0 gap-3 border-slate-200">
                        <button pButton pRipple label="Login" routerLink="/auth/login" [text]="true"
                                class="text-sm font-bold px-4 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all"></button>
                        <button pButton pRipple label="Register Property" routerLink="/auth/sign-up"
                                class="text-sm font-black px-5 py-2.5 rounded-xl border-none transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:scale-105"
                                style="background: linear-gradient(135deg, #10b981, #059669); color: white;"></button>
                        <app-floating-configurator [float]="false" />
                    </div>
                </div>
            </div>
            <style>
                @keyframes spinSlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spinSlow 20s linear infinite;
                }
            </style>
        </nav>
    `
})
export class TopbarWidget {
    constructor(public router: Router) {}
}
