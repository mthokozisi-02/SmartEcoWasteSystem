import { BinService } from '@/core/services/bin.service';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { ImageModule } from 'primeng/image';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { tap, catchError, finalize } from 'rxjs';
import { StatusEnum } from 'src/assets/enums/status-enum';
import { BinResponseDto } from 'src/assets/interfaces/bin-response-dto';

@Component({
    selector: 'app-view-bins',
    standalone: true,
    imports: [
        CommonModule,
        ProgressSpinnerModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        ImageModule
    ],
    templateUrl: './view-bins.html',
    styleUrl: './view-bins.scss',
    providers: [MessageService]
})
export class ViewBins implements AfterViewInit, OnDestroy {
    bins = signal<BinResponseDto[]>([]);

    map!: L.Map;
    markersLayer: L.LayerGroup = L.layerGroup();

    file = '';

    isLoading = false;

    qrCodeDialog = false;

    private destroyRef = inject(DestroyRef);

    private showError(error: any) {
        const message = error?.error?.message || error?.error || error?.message || 'Something went wrong. Please try again.';

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 4000
        });
    }
    constructor(
        private binService: BinService,
        private messageService: MessageService
    ) {}

    ngAfterViewInit(): void {
        const container = L.DomUtil.get('map');
        if (container != null) {
            (container as any)._leaflet_id = null;
        }
        if (this.map) {
            this.map.remove();
        }

        this.map = L.map('map').setView([0, 0], 2); // temporary default

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.setUserLocation();
        this.loadBins();
    }

    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove();
        }
    }

    setUserLocation() {
        if (!navigator.geolocation) {
            // Geolocation unsupported
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Center map to user
                this.map.setView([lat, lng], 15);

                // Add marker for user
                L.marker([lat, lng]).addTo(this.map).bindPopup('You are here').openPopup();
            },
            (error) => {
                console.error('Error getting location:', error);
                // Geolocation access denied
            }
        );
    }

    getIcon(status: StatusEnum): L.DivIcon {
        if (status === StatusEnum.Emptied) {
            return L.divIcon({
                html: `<i class="fa-solid fa-trash" style="color: rgba(50, 209, 30, 1); font-size: 20px;"></i>`,
                className: '',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
        }

        if (status === StatusEnum.Full) {
            return L.divIcon({
                html: `<i class="fa-solid fa-trash" style="color: rgba(209, 30, 30, 1); font-size: 20px;"></i>`,
                className: '',
                iconSize: [40, 40],
                iconAnchor: [10, 10]
            });
        }

        // Default fallback
        return L.divIcon({
            html: `<i class="fa-solid fa-trash" style="color: gray; font-size: 20px;"></i>`,
            className: '',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }

    loadBins() {
        this.isLoading = true;

        this.binService
            .getAll()
            .pipe(
                tap((res) => {
                    const bins = res.data;
                    this.bins.set(res.data);

                    // Add markers for each bin
                    this.markersLayer.clearLayers();
                    bins.forEach((bin: BinResponseDto) => { const tag = bin.binTag || ('Bin #' + bin.id); L.marker([bin.latitude, bin.longitude], { icon: this.getIcon(bin.status) }).addTo(this.markersLayer).bindPopup('<strong>' + tag + '</strong><br/>' + (bin.area || '')); });
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                finalize(() => (this.isLoading = false)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }
}


