import { Component, AfterViewInit, OnDestroy, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { BinService } from '@/core/services/bin.service';
import { StatusEnum } from 'src/assets/enums/status-enum';
import { BinResponseDto } from 'src/assets/interfaces/bin-response-dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, finalize } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface LiveEvent {
    id: number;
    time: string;
    bin: string;
    type: 'report' | 'cleared' | 'audit' | 'dispatch';
    text: string;
    icon: string;
    badgeClass: string;
}

@Component({
    selector: 'live-map-widget',
    standalone: true,
    imports: [CommonModule, ProgressSpinnerModule],
    template: `
        <section id="live-map-section" class="py-24 bg-slate-50/70 border-b border-slate-200/80 relative overflow-hidden">

            <!-- Wide Container: 1600px, Minimal Side Padding! -->
            <div class="w-full px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto relative z-10">

                <!-- Header -->
                <div class="text-center mb-16 flex flex-col items-center justify-center" data-aos="fade-up">
                    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm">
                        <span class="relative flex h-2.5 w-2.5">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                        </span>
                        Live Telemetry & Geolocation
                    </div>
                    <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight tracking-tight text-slate-900">
                        Interactive Smart Bins <br/>
                        <span class="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">IoT Operations Map</span>
                    </h2>
                    <p class="text-base sm:text-lg lg:text-xl max-w-3xl text-slate-600 leading-relaxed">
                        Track live fill levels and deployed bins in real time. Click any marker to view camera verification status, fill capacity, and file instant community reports.
                    </p>
                </div>

                <div class="grid grid-cols-12 gap-8 items-stretch">
                    <!-- Map Container -->
                    <div class="col-span-12 lg:col-span-8 relative min-h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-slate-300/80"
                         data-aos="fade-right" data-aos-duration="800">
                        <div *ngIf="isLoading" class="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-xs">
                            <p-progressSpinner styleClass="w-12 h-12"></p-progressSpinner>
                        </div>
                        <div id="live-map" class="w-full h-full min-h-[580px] z-10"></div>

                        <!-- Floating Live Status Overlay Pill -->
                        <div class="absolute top-4 left-4 z-20 px-4 py-2 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md flex items-center gap-2.5 text-xs font-black text-slate-800">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>GPS Geolocation: Live</span>
                            <span class="text-slate-300">|</span>
                            <span class="text-emerald-700 font-extrabold">{{ bins().length }} Active Bins</span>
                        </div>
                    </div>

                    <!-- Sidebar: Legend + Live Streaming Telemetry Feed -->
                    <div class="col-span-12 lg:col-span-4 flex flex-col gap-5" data-aos="fade-left" data-aos-duration="800">

                        <!-- Total Active Bins Card -->
                        <div class="p-6 rounded-3xl flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl">
                            <div class="flex items-center gap-4">
                                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-white/20 text-white backdrop-blur-md shadow-inner">
                                    <i class="fa-solid fa-map-location-dot"></i>
                                </div>
                                <div>
                                    <div class="text-3xl font-black text-white">{{ bins().length }} Active Bins</div>
                                    <div class="text-xs font-black uppercase tracking-wider text-emerald-200">Real-Time Telemetry</div>
                                </div>
                            </div>
                            <span class="text-xs font-black px-3 py-1 rounded-full bg-white text-emerald-800 shadow-md">
                                Live
                            </span>
                        </div>

                        <!-- Status Legend Card -->
                        <div class="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl">
                            <div class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Status & Fill Indicators</div>
                            <div class="grid grid-cols-2 gap-3">
                                <div *ngFor="let leg of legend" class="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                                    <span class="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" [style.background]="leg.color"></span>
                                    <div class="min-w-0">
                                        <div class="text-xs font-black text-slate-800 truncate">{{ leg.label }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Live Incoming Telemetry Event Stream -->
                        <div class="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl flex-1 flex flex-col">
                            <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <div class="flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                                    <span class="text-xs font-black text-slate-900 uppercase tracking-wider">Live Activity Stream</span>
                                </div>
                                <span class="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Auto-Cycling</span>
                            </div>

                            <div class="space-y-3 overflow-hidden flex-1">
                                <div *ngFor="let ev of liveEvents" class="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex items-center gap-3 animate-fade-in hover:bg-slate-100/70 transition-colors">
                                    <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs" [ngClass]="ev.badgeClass">
                                        <i [class]="ev.icon"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="font-black text-slate-900 truncate">{{ ev.text }}</div>
                                        <div class="text-[11px] text-slate-500 font-medium">{{ ev.bin }} · {{ ev.time }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style>
                .leaflet-popup-content-wrapper {
                    background: #ffffff !important;
                    border: 1px solid #cbd5e1 !important;
                    border-radius: 18px !important;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2) !important;
                    color: #0f172a !important;
                }
                .leaflet-popup-tip { background: #ffffff !important; }
                .leaflet-popup-close-button { color: #64748b !important; }
            </style>
        </section>
    `
})
export class LiveMapWidget implements AfterViewInit, OnDestroy {
    private map!: L.Map;
    bins = signal<BinResponseDto[]>([]);
    isLoading = false;

    legend = [
        { color: '#10b981', label: 'Emptied' },
        { color: '#f59e0b', label: 'Full (80%+)' },
        { color: '#ef4444', label: 'Overflowing' },
        { color: '#64748b', label: 'Maintenance' },
    ];

    liveEvents: LiveEvent[] = [
        { id: 1, time: 'Just now', bin: 'Bin #004 · Food Court', type: 'audit', text: 'Inspection photo approved by supervisor', icon: 'fa-solid fa-check', badgeClass: 'bg-emerald-100 text-emerald-700' },
        { id: 2, time: '2m ago', bin: 'Bin #012 · South Gate', type: 'cleared', text: 'Emptied by Field Staff Alex · Photo attached', icon: 'fa-solid fa-camera', badgeClass: 'bg-teal-100 text-teal-700' },
        { id: 3, time: '5m ago', bin: 'Bin #088 · Parking P2', type: 'report', text: 'Citizen QR report logged (+100 pts queued)', icon: 'fa-solid fa-qrcode', badgeClass: 'bg-amber-100 text-amber-700' },
        { id: 4, time: '8m ago', bin: 'Bin #003 · West Wing', type: 'dispatch', text: 'Collection truck dispatched on optimal route', icon: 'fa-solid fa-truck-fast', badgeClass: 'bg-cyan-100 text-cyan-700' }
    ];

    private binService = inject(BinService);
    private destroyRef = inject(DestroyRef);
    private tickerInterval: any;

    ngAfterViewInit(): void {
        this.initMap();
        setTimeout(() => this.loadBins());

        this.tickerInterval = setInterval(() => {
            const first = this.liveEvents.shift();
            if (first) {
                first.time = 'Just now';
                this.liveEvents.push(first);
            }
        }, 4000);
    }

    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove();
        }
        if (this.tickerInterval) {
            clearInterval(this.tickerInterval);
        }
    }

    private initMap() {
        const container = L.DomUtil.get('live-map');
        if (container != null) {
            (container as any)._leaflet_id = null;
        }
        if (this.map) {
            this.map.remove();
        }
        this.map = L.map('live-map', { zoomControl: true }).setView([0, 0], 2);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => this.map.setView([pos.coords.latitude, pos.coords.longitude], 13),
                () => {}
            );
        }
    }

    private getIcon(status: StatusEnum): L.DivIcon {
        const colorMap: Record<string, { bg: string; shadow: string }> = {
            [StatusEnum.Emptied]: { bg: '#10b981', shadow: 'rgba(16,185,129,0.35)' },
            [StatusEnum.Full]: { bg: '#f59e0b', shadow: 'rgba(245,158,11,0.35)' },
            [StatusEnum.Overflowing]: { bg: '#ef4444', shadow: 'rgba(239,68,68,0.45)' },
            [StatusEnum.Damaged]: { bg: '#64748b', shadow: 'rgba(100,116,139,0.35)' },
        };
        const { bg, shadow } = colorMap[status] || colorMap[StatusEnum.Damaged];
        const ping = status === StatusEnum.Overflowing
            ? `<div style="position:absolute;top:-4px;left:-4px;width:42px;height:42px;background:${bg};opacity:0.3;border-radius:50%;animation:ping 1.5s infinite;"></div>`
            : '';
        return L.divIcon({
            html: `<div style="position:relative;width:34px;height:34px;">${ping}<div style="position:absolute;width:34px;height:34px;background:${bg};border:3px solid #ffffff;border-radius:50%;box-shadow:0 4px 12px ${shadow};display:flex;align-items:center;justify-content:center;font-size:12px;color:white;"><i class="fa-solid fa-recycle"></i></div></div>`,
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
        });
    }

    private loadBins() {
        this.isLoading = true;
        this.binService.getAll().pipe(
            tap((res) => {
                const list: BinResponseDto[] = res.data || [];
                this.bins.set(list);
                if (list.length > 0) {
                    const avgLat = list.reduce((s, b) => s + b.latitude, 0) / list.length;
                    const avgLng = list.reduce((s, b) => s + b.longitude, 0) / list.length;
                    if (this.map.getZoom() <= 2) this.map.setView([avgLat, avgLng], 12);
                    list.forEach((bin) => {
                        const cleanArea = this.trim(bin.area);
                        const statusColors: Record<string, string> = {
                            Emptied: '#10b981', Full: '#f59e0b', Overflowing: '#ef4444', Damaged: '#64748b'
                        };
                        const c = statusColors[bin.status] || '#64748b';
                        const popup = `
                            <div style="font-family:system-ui,-apple-system,sans-serif;padding:6px;min-width:220px;">
                                <div style="font-size:15px;font-weight:900;color:#0f172a;margin-bottom:4px;">Smart Bin #${bin.id}</div>
                                <div style="font-size:12px;color:#64748b;margin-bottom:12px;line-height:1.4;">${cleanArea}</div>
                                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #e2e8f0;">
                                    <span style="font-size:11px;font-weight:800;padding:4px 10px;border-radius:8px;background:${c}15;border:1px solid ${c}30;color:${c};">${bin.status}</span>
                                    <a href="/report/${bin.id}" style="font-size:11px;font-weight:800;padding:6px 14px;border-radius:10px;background:linear-gradient(135deg,#10b981,#059669);color:white;text-decoration:none;box-shadow:0 2px 8px rgba(16,185,129,0.3);">Report Bin</a>
                                </div>
                            </div>`;
                        L.marker([bin.latitude, bin.longitude], { icon: this.getIcon(bin.status) })
                            .addTo(this.map).bindPopup(popup);
                    });
                }
            }),
            catchError(() => []),
            finalize(() => (this.isLoading = false)),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();
    }

    private trim(str: string | null): string {
        if (!str) return 'Commercial District';
        const parts = str.split(',');
        return parts.length <= 3 ? str : parts.slice(0, 3).join(', ').trim();
    }
}
