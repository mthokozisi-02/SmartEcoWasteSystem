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
        <nav class="sticky top-0 z-50 w-full transition-all duration-300"
             style="background: rgba(5, 12, 9, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(16, 185, 129, 0.12);">
            <div class="flex items-center justify-between px-8 lg:px-16 py-4 w-full">

                <!-- Logo -->
                <a routerLink="/" class="flex items-center gap-3 no-underline group">
                    <div class="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden"
                         style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 20px rgba(16,185,129,0.4);">
                        <i class="fa-solid fa-recycle text-white text-base"></i>
                    </div>
                    <span class="text-lg font-bold tracking-tight" style="color: #f0fdf4;">
                        Smart<span style="background: linear-gradient(90deg, #10b981, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Eco</span>Waste
                    </span>
                </a>

                <!-- Mobile hamburger -->
                <a pButton [text]="true" pRipple class="lg:hidden! text-gray-400 hover:text-white"
                   pStyleClass="@next" enterFromClass="hidden" leaveToClass="hidden" [hideOnOutsideClick]="true">
                    <i class="pi pi-bars text-xl!"></i>
                </a>

                <!-- Desktop Nav -->
                <div class="items-center grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-6 lg:px-0 z-20 rounded-b-2xl"
                     style="background: rgba(5,12,9,0.97);">
                    <ul class="list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-1 lg:ml-12">
                        <li>
                            <a href="/landing#hero" class="no-underline px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 block"
                               style="color: rgba(209,250,229,0.7);"
                               onmouseover="this.style.color='#10b981'; this.style.background='rgba(16,185,129,0.08)'"
                               onmouseout="this.style.color='rgba(209,250,229,0.7)'; this.style.background='transparent'">Home</a>
                        </li>
                        <li>
                            <a href="/landing#features" class="no-underline px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 block"
                               style="color: rgba(209,250,229,0.7);"
                               onmouseover="this.style.color='#10b981'; this.style.background='rgba(16,185,129,0.08)'"
                               onmouseout="this.style.color='rgba(209,250,229,0.7)'; this.style.background='transparent'">Features</a>
                        </li>
                        <li>
                            <a href="/landing#live-map-section" class="no-underline px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 block"
                               style="color: rgba(209,250,229,0.7);"
                               onmouseover="this.style.color='#10b981'; this.style.background='rgba(16,185,129,0.08)'"
                               onmouseout="this.style.color='rgba(209,250,229,0.7)'; this.style.background='transparent'">Live Map</a>
                        </li>
                        <li>
                            <a href="/landing#roadmap" class="no-underline px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 block"
                               style="color: rgba(209,250,229,0.7);"
                               onmouseover="this.style.color='#10b981'; this.style.background='rgba(16,185,129,0.08)'"
                               onmouseout="this.style.color='rgba(209,250,229,0.7)'; this.style.background='transparent'">Roadmap</a>
                        </li>
                        <li>
                            <a href="/landing#highlights" class="no-underline px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 block"
                               style="color: rgba(209,250,229,0.7);"
                               onmouseover="this.style.color='#10b981'; this.style.background='rgba(16,185,129,0.08)'"
                               onmouseout="this.style.color='rgba(209,250,229,0.7)'; this.style.background='transparent'">Recycle Guide</a>
                        </li>
                    </ul>

                    <div class="flex items-center border-t lg:border-t-0 py-4 lg:py-0 mt-4 lg:mt-0 gap-3"
                         style="border-color: rgba(16,185,129,0.12);">
                        <button pButton pRipple label="Login" routerLink="/auth/login" [text]="true"
                                class="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                                style="color: rgba(209,250,229,0.7);"
                                onmouseover="this.style.color='#10b981'; this.style.background='rgba(232, 244, 240, 0.93)'"
                               onmouseout="this.style.color='rgba(209,250,229,0.7)'; this.style.background='transparent'"></button>
                        <button pButton pRipple label="Get Started" routerLink="/auth/sign-up"
                                class="text-sm font-bold px-5 py-2.5 rounded-xl border-none transition-all"
                                style="background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 15px rgba(16,185,129,0.3);"></button>
                        <app-floating-configurator [float]="false" />
                    </div>
                </div>
            </div>
        </nav>
    `
})
export class TopbarWidget {
    constructor(public router: Router) {}
}
