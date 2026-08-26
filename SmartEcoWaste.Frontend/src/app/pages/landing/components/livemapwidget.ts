import { Component, AfterViewInit, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { BinService } from '@/core/services/bin.service';
import { StatusEnum } from 'src/assets/enums/status-enum';
import { BinResponseDto } from 'src/assets/interfaces/bin-response-dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, finalize } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'live-map-widget',
    standalone: true,
    imports: [CommonModule, ProgressSpinnerModule],
    template: `
        <section id="live-map-section" style="background: #060e0a; padding: 100px 0;">
            <div class="w-full px-8 lg:px-16">

                <!-- Header -->
                <div class="text-center mb-16 flex flex-col items-center justify-center" style="text-align: center !important;">
                    <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
                         style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); color: #67e8f9; display: inline-block; margin: 0 auto 1rem auto; text-align: center !important;">
                        Community Network
                    </div>
                    <h2 class="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-5 leading-tight tracking-tight" style="color: #f0fdf4; text-align: center !important; width: 100%;">
                        Live Smart Bins <span style="background: linear-gradient(90deg, #06b6d4, #67e8f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Map</span>
                    </h2>
                    <p class="text-base md:text-2xl max-w-3xl" style="color: rgba(209,250,229,0.55); text-align: center !important; margin: 0 auto; width: 100%; line-height: 1.6;">
                        Track every registered bin in real-time. See what needs attention, what's ready for collection, and report issues with one tap.
                    </p>
                </div>

                <div class="grid grid-cols-12 gap-6 items-stretch">
                    <!-- Map -->
                    <div class="col-span-12 lg:col-span-8 relative" style="min-height: 520px;">
                        <div *ngIf="isLoading" class="absolute inset-0 z-20 flex items-center justify-center rounded-3xl" style="background: rgba(5,12,9,0.7); backdrop-filter: blur(8px);">
                            <p-progressSpinner styleClass="w-12 h-12"></p-progressSpinner>
                        </div>
                        <div id="live-map" class="w-full h-full rounded-3xl overflow-hidden" style="min-height: 520px; z-index: 10; border: 1px solid rgba(6,182,212,0.15); box-shadow: 0 30px 80px rgba(0,0,0,0.5);"></div>
                    </div>

                    <!-- Sidebar -->
                    <div class="col-span-12 lg:col-span-4 flex flex-col gap-4">

                        <!-- Total bins -->
                        <div class="p-6 rounded-3xl flex items-center gap-4" style="background: rgba(6,182,212,0.06); border: 1px solid rgba(6,182,212,0.15);">
                            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0" style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2);"><i class="fa-solid fa-map-location-dot text-cyan-400"></i></div>
                            <div>
                                <div class="text-3xl font-black" style="color: #67e8f9;">{{ bins().length }}</div>
                                <div class="text-sm font-bold uppercase tracking-wider" style="color: rgba(209,250,229,0.5);">Active Smart Bins</div>
                            </div>
                        </div>

                        <!-- Legend items -->
                        <div class="p-6 rounded-3xl flex flex-col gap-5" style="background: #0d1f17; border: 1px solid rgba(16,185,129,0.12); flex: 1;">
                            <div class="text-sm font-bold uppercase tracking-widest mb-1" style="color: rgba(209,250,229,0.4);">Status Legend</div>

                            <div *ngFor="let leg of legend" class="flex items-center gap-4">
                                <div class="relative shrink-0">
                                    <div class="w-4 h-4 rounded-full border-2 border-white/20" [style]="'background: ' + leg.color + '; box-shadow: 0 0 8px ' + leg.color + '80;'"></div>
                                    <div *ngIf="leg.pulse" class="absolute inset-0 rounded-full animate-ping" [style]="'background: ' + leg.color + '; opacity: 0.4;'"></div>
                                </div>
                                <div class="flex-1">
                                    <div class="text-base font-semibold" style="color: #d1fae5;">{{ leg.label }}</div>
                                    <div class="text-sm" style="color: rgba(209,250,229,0.4);">{{ leg.desc }}</div>
                                </div>
                            </div>

                            <div class="mt-auto pt-4" style="border-top: 1px solid rgba(16,185,129,0.1);">
                                <p class="text-base leading-relaxed" style="color: rgba(209,250,229,0.4);">
                                    Click any marker to see bin details and submit a report. Reports are verified by admins and reward you with Eco Points.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <style>
            .leaflet-popup-content-wrapper {
                background: #0d1f17 !important;
                border: 1px solid rgba(16,185,129,0.2) !important;
                border-radius: 16px !important;
                box-shadow: 0 20px 60px rgba(0,0,0,0.6) !important;
                color: #d1fae5 !important;
            }
            .leaflet-popup-tip { background: #0d1f17 !important; }
            .leaflet-popup-close-button { color: rgba(209,250,229,0.5) !important; }
        </style>
    `
})
export class LiveMapWidget implements AfterViewInit {
    private map!: L.Map;
    bins = signal<BinResponseDto[]>([]);
    isLoading = false;

    legend = [
        { color: '#10b981', label: 'Emptied / Available', desc: 'Ready for deposits. Earn points here!', pulse: false },
        { color: '#f59e0b', label: 'Full', desc: 'At capacity, queued for collection.', pulse: false },
        { color: '#ef4444', label: 'Overflowing', desc: 'Urgent! Needs immediate dispatch.', pulse: true },
        { color: '#6b7280', label: 'Damaged / Offline', desc: 'Under maintenance or faulty.', pulse: false },
    ];

    private binService = inject(BinService);
    private destroyRef = inject(DestroyRef);

    ngAfterViewInit(): void {
        this.initMap();
        this.loadBins();
    }

    private initMap() {
        this.map = L.map('live-map', { zoomControl: true }).setView([0, 0], 2);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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
            [StatusEnum.Emptied]: { bg: '#10b981', shadow: 'rgba(16,185,129,0.5)' },
            [StatusEnum.Full]: { bg: '#f59e0b', shadow: 'rgba(245,158,11,0.5)' },
            [StatusEnum.Overflowing]: { bg: '#ef4444', shadow: 'rgba(239,68,68,0.6)' },
            [StatusEnum.Damaged]: { bg: '#6b7280', shadow: 'rgba(107,114,128,0.4)' },
        };
        const { bg, shadow } = colorMap[status] || colorMap[StatusEnum.Damaged];
        const ping = status === StatusEnum.Overflowing
            ? `<div style="position:absolute;top:-3px;left:-3px;width:40px;height:40px;background:${bg};opacity:0.3;border-radius:50%;animation:ping 1.5s infinite;"></div>`
            : '';
        return L.divIcon({
            html: `<div style="position:relative;width:34px;height:34px;">${ping}<div style="position:absolute;width:34px;height:34px;background:${bg};border:3px solid rgba(255,255,255,0.9);border-radius:50%;box-shadow:0 4px 15px ${shadow};display:flex;align-items:center;justify-content:center;font-size:12px;color:white;"><i class="fa-solid fa-recycle"></i></div></div>`,
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
                            Emptied: '#10b981', Full: '#f59e0b', Overflowing: '#ef4444', Damaged: '#6b7280'
                        };
                        const c = statusColors[bin.status] || '#6b7280';
                        const popup = `
                            <div style="font-family:'Outfit',system-ui,sans-serif;padding:4px;min-width:200px;">
                                <div style="font-size:13px;font-weight:800;color:#d1fae5;margin-bottom:6px;">Smart Bin #${bin.id}</div>
                                <div style="font-size:11px;color:rgba(209,250,229,0.6);margin-bottom:10px;line-height:1.5;">${cleanArea}</div>
                                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid rgba(16,185,129,0.15);">
                                    <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;background:${c}18;border:1px solid ${c}30;color:${c};">${bin.status}</span>
                                    <a href="/report/${bin.id}" style="font-size:10px;font-weight:700;padding:4px 10px;border-radius:8px;background:linear-gradient(135deg,#10b981,#059669);color:white;text-decoration:none;">Report</a>
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
        if (!str) return 'Unknown Area';
        const parts = str.split(',');
        return parts.length <= 3 ? str : parts.slice(0, 3).join(', ').trim();
    }
}
