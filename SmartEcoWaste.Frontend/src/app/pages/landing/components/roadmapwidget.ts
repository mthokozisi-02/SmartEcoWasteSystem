import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RoadmapItem {
    icon: string;
    label: string;
    title: string;
    desc: string;
    status: 'live' | 'coming' | 'planned';
    accent: string;
    accentBg: string;
    tags: string[];
}

@Component({
    selector: 'roadmap-widget',
    standalone: true,
    imports: [CommonModule],
    template: `
        <section id="roadmap" style="background: #050c09; padding: 100px 0;">
            <div class="w-full px-8 lg:px-16">

                <!-- Header -->
                <div class="text-center mb-16 flex flex-col items-center justify-center" style="text-align: center !important;">
                    <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                         style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2); color: #a78bfa; display: inline-block; margin: 0 auto 1rem auto; text-align: center !important;">
                        Product Roadmap
                    </div>
                    <h2 class="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-5 leading-tight tracking-tight" style="color: #f0fdf4; text-align: center !important; width: 100%;">
                        What's coming to <br/>
                        <span style="background: linear-gradient(90deg, #8b5cf6, #a78bfa, #c4b5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">SmartEcoWaste</span>
                    </h2>
                    <p class="text-base md:text-2xl max-w-3xl" style="color: rgba(209,250,229,0.55); text-align: center !important; margin: 0 auto; width: 100%; line-height: 1.6;">
                        We're building the future of smart city waste management. Here are the features and improvements actively planned and in development.
                    </p>
                </div>

                <!-- Roadmap Cards Grid -->
                <div class="grid grid-cols-12 gap-5">

                    <div *ngFor="let item of roadmapItems; let i = index"
                         class="col-span-12 md:col-span-6 lg:col-span-4 p-7 rounded-3xl flex flex-col gap-5 cursor-default transition-all duration-300 roadmap-card relative overflow-hidden"
                         [style]="getCardStyle(item)">

                        <!-- Glow -->
                        <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                             [style]="'background: radial-gradient(circle, ' + item.accent + '20 0%, transparent 70%)'"></div>

                        <!-- Status badge + Icon row -->
                        <div class="flex items-start justify-between">
                            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-base shrink-0"
                                 [style]="'background: ' + item.accent + '15; border: 1px solid ' + item.accent + '30; color: ' + item.accent">
                                <i [class]="item.icon"></i>
                            </div>
                            <span class="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                                  [style]="getStatusStyle(item.status)">
                                {{ getStatusLabel(item.status) }}
                            </span>
                        </div>

                        <div>
                            <div class="text-sm font-bold uppercase tracking-wider mb-1.5" [style]="'color: ' + item.accent">{{ item.label }}</div>
                            <h3 class="text-base font-bold mb-2.5" style="color: #f0fdf4;">{{ item.title }}</h3>
                            <p class="text-base leading-relaxed" style="color: rgba(209,250,229,0.5);">{{ item.desc }}</p>
                        </div>

                        <div class="flex flex-wrap gap-1.5 mt-auto">
                            <span *ngFor="let tag of item.tags"
                                  class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                  [style]="'background: ' + item.accent + '10; border: 1px solid ' + item.accent + '20; color: ' + item.accent">
                                {{ tag }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- CTA -->
                <div class="mt-20 text-center">
                    <p class="text-base mb-6" style="color: rgba(209,250,229,0.45);">Have a feature idea? We&#39;d love to hear from you.</p>
                    <a routerLink="/auth/sign-up"
                       class="inline-flex items-center gap-2 px-9 py-4.5 rounded-2xl font-bold text-lg no-underline transition-all duration-300"
                       style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; box-shadow: 0 8px 30px rgba(139,92,246,0.3);"
                       onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 40px rgba(139,92,246,0.45)'"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 30px rgba(139,92,246,0.3)'">
                        <i class="pi pi-users"></i>
                        Join the Community
                    </a>
                </div>
            </div>
        </section>

        <style>
            .roadmap-card {
                transform: translateY(0);
                transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
            }
            .roadmap-card:hover {
                transform: translateY(-6px);
            }
        </style>
    `
})
export class RoadmapWidget {
    roadmapItems: RoadmapItem[] = [
        {
            icon: 'fa-solid fa-map-location-dot',
            label: 'Live Intelligence',
            title: 'Real-Time Bin Monitoring Map',
            desc: 'Interactive public map displaying all smart bins with live status indicators, geolocation centering, and one-tap QR-report access.',
            status: 'live',
            accent: '#10b981',
            accentBg: '#0d1f17',
            tags: ['Leaflet', 'OpenStreetMap', 'Live Status']
        },
        {
            icon: 'fa-solid fa-mobile-screen-button',
            label: 'Reporting Flow',
            title: 'QR Code Reporting (Mobile-First)',
            desc: 'Scan any registered bin\'s unique QR code to instantly open a beautiful mobile reporting screen with the bin\'s location map and status cards.',
            status: 'live',
            accent: '#06b6d4',
            accentBg: '#071a1f',
            tags: ['QR Scan', 'Mobile-First', 'Leaflet Map']
        },
        {
            icon: 'fa-solid fa-trophy',
            label: 'Gamification',
            title: 'Community Leaderboard',
            desc: 'A real-time leaderboard ranking users by eco-points earned per month. Showcasing top reporters to drive healthy competition and engagement.',
            status: 'coming',
            accent: '#f59e0b',
            accentBg: '#1a1406',
            tags: ['Points System', 'Rankings', 'Rewards']
        },
        {
            icon: 'fa-solid fa-earth-americas',
            label: 'Impact Tracking',
            title: 'Personal Carbon Footprint Tracker',
            desc: 'Translate your eco-point activity into estimated CO₂ saved, trees equivalent, and plastic diverted. Share your impact to social platforms.',
            status: 'coming',
            accent: '#34d399',
            accentBg: '#0d1f17',
            tags: ['CO₂ Metrics', 'Social Share', 'Impact Score']
        },
        {
            icon: 'fa-solid fa-bell',
            label: 'Notifications',
            title: 'Push Alerts & Smart Dispatching',
            desc: 'Admins receive real-time push notifications when bins reach Overflowing status. Auto-generate optimised collection routes for dispatch teams.',
            status: 'coming',
            accent: '#f87171',
            accentBg: '#1a0a0a',
            tags: ['Web Push', 'Route Optimization', 'Dispatch']
        },
        {
            icon: 'fa-solid fa-chart-line',
            label: 'Analytics',
            title: 'Advanced Admin Analytics Dashboard',
            desc: 'Heatmaps of bin activity, collection frequency charts, top reporters, busiest zones, and trend analysis over custom date ranges.',
            status: 'planned',
            accent: '#a78bfa',
            accentBg: '#110e1f',
            tags: ['Chart.js', 'Heatmaps', 'Export CSV']
        },
        {
            icon: 'fa-solid fa-store',
            label: 'Rewards',
            title: 'Eco Points Redemption Store',
            desc: 'A marketplace where users spend earned points on real-world rewards: shopping vouchers, tree planting credits, and city event passes.',
            status: 'planned',
            accent: '#fbbf24',
            accentBg: '#1a1406',
            tags: ['Points Wallet', 'Partners', 'Vouchers']
        },
        {
            icon: 'fa-solid fa-robot',
            label: 'AI / ML',
            title: 'Predictive Fill-Level Forecasting',
            desc: 'Machine-learning models trained on report history to predict when bins will need collection — enabling proactive instead of reactive dispatch.',
            status: 'planned',
            accent: '#67e8f9',
            accentBg: '#071a1f',
            tags: ['ML Model', 'Prediction', 'Smart Dispatch']
        },
        {
            icon: 'fa-solid fa-mobile-retro',
            label: 'Mobile App',
            title: 'Native Mobile Application',
            desc: 'A dedicated iOS and Android app with native camera QR scanning, offline report queuing, push notifications, and an in-app eco-points wallet.',
            status: 'planned',
            accent: '#818cf8',
            accentBg: '#0f0e1f',
            tags: ['iOS', 'Android', 'Native QR', 'Offline']
        }
    ];

    getCardStyle(item: RoadmapItem): string {
        return `background: ${item.accentBg}; border: 1px solid ${item.accent}22;`;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'live': return '✓ Live';
            case 'coming': return '⚡ Coming Soon';
            default: return '◎ Planned';
        }
    }

    getStatusStyle(status: string): string {
        switch (status) {
            case 'live': return 'background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #34d399;';
            case 'coming': return 'background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); color: #fbbf24;';
            default: return 'background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.25); color: #a78bfa;';
        }
    }
}
