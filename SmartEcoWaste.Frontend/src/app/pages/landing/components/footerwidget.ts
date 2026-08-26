import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'footer-widget',
    standalone: true,
    imports: [RouterModule, CommonModule],
    template: `
        <footer style="background: #030806; border-top: 1px solid rgba(16,185,129,0.1); padding: 72px 0 32px;">
            <div class="w-full px-8 lg:px-16">

                <!-- Top grid -->
                <div class="grid grid-cols-12 gap-12 mb-16">

                    <!-- Brand column -->
                    <div class="col-span-12 lg:col-span-4 flex flex-col gap-5">
                        <div class="flex items-center gap-3">
                            <div class="flex items-center justify-center w-9 h-9 rounded-xl"
                                 style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 20px rgba(16,185,129,0.35);">
                                <i class="fa-solid fa-recycle text-white text-base"></i>
                            </div>
                            <span class="text-lg font-bold" style="color: #f0fdf4;">
                                Smart<span style="background: linear-gradient(90deg,#10b981,#34d399); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">Eco</span>Waste
                            </span>
                        </div>
                        <p class="text-base leading-relaxed max-w-xs" style="color: rgba(209,250,229,0.45);">
                            A smart city initiative connecting communities, IoT monitoring, and eco-incentives to make waste management cleaner, smarter, and more sustainable.
                        </p>
                        <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl w-fit"
                             style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15);">
                            <span class="w-2 h-2 rounded-full animate-pulse" style="background: #10b981;"></span>
                            <span class="text-sm font-semibold" style="color: #34d399;">All systems operational</span>
                        </div>
                    </div>

                    <!-- Platform links -->
                    <div class="col-span-6 lg:col-span-2 flex flex-col gap-4">
                        <div class="text-sm font-bold uppercase tracking-widest mb-1" style="color: rgba(209,250,229,0.35);">Platform</div>
                        <a *ngFor="let link of platformLinks" [href]="link.href"
                           class="text-base no-underline transition-colors duration-200 w-fit"
                           style="color: rgba(209,250,229,0.55);"
                           onmouseover="this.style.color='#34d399'"
                           onmouseout="this.style.color='rgba(209,250,229,0.55)'">{{ link.label }}</a>
                    </div>

                    <!-- Users links -->
                    <div class="col-span-6 lg:col-span-2 flex flex-col gap-4">
                        <div class="text-sm font-bold uppercase tracking-widest mb-1" style="color: rgba(209,250,229,0.35);">Community</div>
                        <a *ngFor="let link of communityLinks" [href]="link.href"
                           class="text-base no-underline transition-colors duration-200 w-fit"
                           style="color: rgba(209,250,229,0.55);"
                           onmouseover="this.style.color='#34d399'"
                           onmouseout="this.style.color='rgba(209,250,229,0.55)'">{{ link.label }}</a>
                    </div>

                    <!-- Upcoming features CTA -->
                    <div class="col-span-12 lg:col-span-4">
                        <div class="p-6 rounded-3xl flex flex-col gap-4" style="background: #0d1f17; border: 1px solid rgba(16,185,129,0.15);">
                            <div class="text-sm font-bold uppercase tracking-widest" style="color: rgba(209,250,229,0.35);">Join the Mission</div>
                            <p class="text-base leading-relaxed" style="color: rgba(209,250,229,0.55);">Create an account to start reporting bins, earning eco-points, and making a measurable impact in your community.</p>
                            <a routerLink="/auth/sign-up"
                               class="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-base no-underline transition-all duration-300"
                               style="background: linear-gradient(135deg,#10b981,#059669); color: white; box-shadow: 0 4px 20px rgba(16,185,129,0.3);"
                               onmouseover="this.style.boxShadow='0 8px 30px rgba(16,185,129,0.45)'"
                               onmouseout="this.style.boxShadow='0 4px 20px rgba(16,185,129,0.3)'">
                                <i class="pi pi-user-plus text-base"></i>
                                Create Free Account
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Bottom bar -->
                <div class="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
                     style="border-top: 1px solid rgba(16,185,129,0.08);">
                    <p class="text-xs" style="color: rgba(209,250,229,0.3);">
                        © {{ year }} SmartEcoWaste. Built for cleaner communities and smarter cities.
                    </p>
                    <div class="flex items-center gap-2 text-xs" style="color: rgba(209,250,229,0.3);">
                        <span>Powered by</span>
                        <span style="color: #34d399; font-weight: 600;">Angular 20</span>
                        <span>+</span>
                        <span style="color: #34d399; font-weight: 600;">ASP.NET Core</span>
                        <span>+</span>
                        <span style="color: #34d399; font-weight: 600;">PrimeNG</span>
                    </div>
                </div>
            </div>
        </footer>
    `
})
export class FooterWidget {
    year = new Date().getFullYear();

    platformLinks = [
        { label: 'Live Bins Map', href: '/landing#live-map-section' },
        { label: 'How It Works', href: '/landing#features' },
        { label: 'Roadmap', href: '/landing#roadmap' },
        { label: 'Recycling Guide', href: '/landing#highlights' },
    ];

    communityLinks = [
        { label: 'Register', href: '/auth/sign-up' },
        { label: 'Login', href: '/auth/login' },
        { label: 'Report a Bin', href: '/landing#live-map-section' },
        { label: 'Eco Points', href: '/landing#roadmap' },
    ];
}
