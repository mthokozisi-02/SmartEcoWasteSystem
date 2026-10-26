import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface WorkflowStep {
    icon: string;
    stepNumber: string;
    title: string;
    desc: string;
    badge: string;
    accent: string;
    tags: string[];
}

@Component({
    selector: 'roadmap-widget',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <section id="roadmap" class="py-24 bg-white border-b border-slate-200/80 relative overflow-hidden">

            <!-- Wide Container: 1600px, Minimal Padding -->
            <div class="w-full px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto relative z-10">

                <!-- Header -->
                <div class="text-center mb-16 flex flex-col items-center justify-center" data-aos="fade-up">
                    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                        Closed-Loop Operational Architecture
                    </div>
                    <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight tracking-tight text-slate-900">
                        Operational Lifecycle: <br/>
                        <span class="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Telemetry to Audit & Reward</span>
                    </h2>
                    <p class="text-base sm:text-lg lg:text-xl max-w-3xl text-slate-600 leading-relaxed">
                        Every step in the SmartEcoWaste lifecycle guarantees accountability through IoT sensors, mobile camera evidence, and supervisory sign-off.
                    </p>
                </div>

                <!-- Animated Workflow Stepper Bar (Desktop) -->
                <div class="hidden lg:flex items-center justify-between mb-16 relative px-8" data-aos="fade-up" data-aos-delay="100">
                    <div class="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0">
                        <div class="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 animate-flow-line" style="width: 100%;"></div>
                    </div>

                    <div *ngFor="let s of workflowSteps; let i = index" class="relative z-10 flex flex-col items-center gap-2 group cursor-pointer">
                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base bg-white border-2 border-emerald-500 text-emerald-700 shadow-lg group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                            0{{ i + 1 }}
                        </div>
                        <span class="text-xs font-black text-slate-700 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">{{ s.badge }}</span>
                    </div>
                </div>

                <!-- Step Cards Grid with Staggered AOS Animations -->
                <div class="grid grid-cols-12 gap-6 mb-16">
                    <div *ngFor="let item of workflowSteps; let i = index"
                         class="col-span-12 md:col-span-6 lg:col-span-4 p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col gap-4 shadow-md hover:shadow-2xl hover:border-emerald-400 hover:bg-white hover:-translate-y-2 transition-all duration-300 relative group"
                         data-aos="fade-up" [attr.data-aos-delay]="(i * 100) + 100">

                        <div class="flex items-start justify-between">
                            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 transition-transform group-hover:scale-110 shadow-xs"
                                 [style]="'background: ' + item.accent + '15; border: 1px solid ' + item.accent + '35; color: ' + item.accent">
                                <i [class]="item.icon"></i>
                            </div>
                            <span class="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
                                {{ item.badge }}
                            </span>
                        </div>

                        <div>
                            <div class="text-xs font-black uppercase tracking-widest mb-1.5" [style]="'color: ' + item.accent">{{ item.stepNumber }}</div>
                            <h3 class="text-2xl font-black mb-2 text-slate-900 group-hover:text-emerald-700 transition-colors">{{ item.title }}</h3>
                            <p class="text-sm leading-relaxed text-slate-600">{{ item.desc }}</p>
                        </div>

                        <div class="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-200">
                            <span *ngFor="let tag of item.tags"
                                  class="text-xs font-bold px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-600">
                                {{ tag }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Photographic Accountability Callout Banner -->
                <div class="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white shadow-2xl relative overflow-hidden"
                     data-aos="zoom-in" data-aos-delay="200">
                    <div class="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>

                    <div class="grid grid-cols-12 gap-8 items-center relative z-10">
                        <div class="col-span-12 lg:col-span-8 flex flex-col gap-4">
                            <span class="text-xs font-black uppercase tracking-widest text-emerald-200">Zero-Compromise Operational Integrity</span>
                            <h3 class="text-3xl sm:text-4xl font-black text-white leading-tight">Every Field Task Requires Verified Camera Evidence</h3>
                            <p class="text-emerald-100 text-base leading-relaxed max-w-3xl">
                                SmartEcoWaste eliminates unverified task completions and missed bins. Field operators upload live time-stamped camera photos, audited by supervisors before tasks are approved and Eco-Points awarded.
                            </p>
                        </div>
                        <div class="col-span-12 lg:col-span-4 flex lg:justify-end">
                            <a routerLink="/auth/sign-up"
                               class="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-base text-slate-950 bg-white hover:bg-emerald-50 hover:scale-105 shadow-xl transition-all duration-300 no-underline">
                                <span>Register Your Property</span>
                                <i class="pi pi-arrow-right text-sm"></i>
                            </a>
                        </div>
                    </div>
                </div>

            </div>

            <style>
                @keyframes flowLine {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
                .animate-flow-line {
                    background-size: 200% 200%;
                    animation: flowLine 3s linear infinite;
                }
            </style>
        </section>
    `
})
export class RoadmapWidget {
    workflowSteps: WorkflowStep[] = [
        {
            icon: 'fa-solid fa-building-user',
            stepNumber: 'Step 01',
            title: 'Organization Setup',
            desc: 'Shopping centers, residential HOAs, and city councils launch their isolated workspace with custom zones and staff rosters.',
            badge: 'Onboarding',
            accent: '#059669',
            tags: ['Multi-Tenant', 'Data Isolation', 'Role RBAC']
        },
        {
            icon: 'fa-solid fa-qrcode',
            stepNumber: 'Step 02',
            title: 'QR & IoT Telemetry',
            desc: 'Citizens and IoT sensors detect bin status (Normal, Full, Overflowing, Damaged) and submit geocoded incident alerts instantly.',
            badge: 'Detection',
            accent: '#0284c7',
            tags: ['QR Scans', 'Fill Level', 'No App Required']
        },
        {
            icon: 'fa-solid fa-truck-fast',
            stepNumber: 'Step 03',
            title: 'Automated Dispatch',
            desc: 'Operations managers dispatch collection and inspection tasks to assigned field operators with optimized GPS route coordinates.',
            badge: 'Operations',
            accent: '#0d9488',
            tags: ['Route Dispatch', 'Field Queues', 'Live Status']
        },
        {
            icon: 'fa-solid fa-camera',
            stepNumber: 'Step 04',
            title: 'Camera Photo Proof',
            desc: 'Field operators physically clear the bin and capture mandatory real-time camera proof directly on-site from their mobile browser.',
            badge: 'Verification',
            accent: '#059669',
            tags: ['Camera Capture', 'Time-Stamped', 'Photo Evidence']
        },
        {
            icon: 'fa-solid fa-clipboard-check',
            stepNumber: 'Step 05',
            title: 'Supervisory Quality Audit',
            desc: 'Supervisors audit photo evidence in the Inspection Audit Log. 1-click Approve seals the task; Reject flags anomalies for rework.',
            badge: 'Audit & QA',
            accent: '#d97706',
            tags: ['Audit Logs', '1-Click Approval', 'Rework Routing']
        },
        {
            icon: 'fa-solid fa-gift',
            stepNumber: 'Step 06',
            title: '100 Eco-Points Reward',
            desc: 'Upon verified completion of the report, the reporting citizen is automatically awarded 100 Eco-Points for community perks and rankings.',
            badge: 'Rewards',
            accent: '#d97706',
            tags: ['100 Points', 'Leaderboards', 'Community Perks']
        }
    ];
}
