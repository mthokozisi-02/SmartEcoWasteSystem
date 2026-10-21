import { BinService } from '@/core/services/bin.service';
import { PropertyService } from '@/core/services/property.service';
import { Component, DestroyRef, inject, signal, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import * as L from 'leaflet';
import { CreateBinDto } from 'src/assets/interfaces/create-bin-dto';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, finalize } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { BinResponseDto } from 'src/assets/interfaces/bin-response-dto';
import { StatusEnum } from 'src/assets/enums/status-enum';
import { ImageModule } from 'primeng/image';
import {
    ResponsePropertyDto,
    ResponseBuildingDto,
    ResponseWasteZoneDto
} from 'src/assets/interfaces/commercial-saas-dtos';

@Component({
    selector: 'app-create-bin',
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
    templateUrl: './create-bin.html',
    styleUrl: './create-bin.scss',
    providers: [MessageService, ConfirmationService]
})
export class CreateBin implements OnInit, AfterViewInit {
    bins = signal<BinResponseDto[]>([]);

    map!: L.Map;

    file = '';

    newBin: CreateBinDto = {
        binTag: '',
        category: 0,
        capacityLiters: 240,
        area: '',
        latitude: 0,
        longitude: 0,
        url: ''
    };

    // Hierarchy selection
    properties: ResponsePropertyDto[] = [];
    buildings: ResponseBuildingDto[] = [];
    allWasteZones: ResponseWasteZoneDto[] = [];
    filteredWasteZones: ResponseWasteZoneDto[] = [];

    selectedPropertyId?: number;
    selectedBuildingId?: number;

    categoryOptions = [
        { label: 'General Waste', value: 0 },
        { label: 'Plastic & Bottles', value: 1 },
        { label: 'Paper & Cardboard', value: 2 },
        { label: 'Glass', value: 3 },
        { label: 'Organic / Food Waste', value: 4 },
        { label: 'Electronic Waste', value: 5 },
        { label: 'Hazardous Chemical', value: 6 }
    ];

    isLoading = false;

    qrCodeDialog = false;

    frontendUrl = window.location.origin;

    private destroyRef = inject(DestroyRef);

    private showSuccess(message: string) {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
            life: 3000
        });
    }

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
        private propertyService: PropertyService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadProperties();
    }

    loadProperties() {
        this.propertyService.getAllProperties().pipe(
            tap((res) => {
                if (res.isSuccess) {
                    this.properties = res.data || [];
                }
            }),
            catchError((err) => {
                this.showError(err);
                return [];
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();
    }

    onPropertyChange() {
        this.selectedBuildingId = undefined;
        this.newBin.wasteZoneId = undefined;
        this.buildings = [];
        this.allWasteZones = [];
        this.filteredWasteZones = [];

        if (!this.selectedPropertyId) return;

        // Load buildings for this property
        this.propertyService.getBuildings(this.selectedPropertyId).pipe(
            tap((res) => {
                if (res.isSuccess) {
                    this.buildings = res.data || [];
                }
            }),
            catchError((err) => {
                this.showError(err);
                return [];
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();

        // Load waste zones for this property
        this.propertyService.getWasteZones(this.selectedPropertyId).pipe(
            tap((res) => {
                if (res.isSuccess) {
                    this.allWasteZones = res.data || [];
                    this.filteredWasteZones = [...this.allWasteZones];
                }
            }),
            catchError((err) => {
                this.showError(err);
                return [];
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe();
    }

    onBuildingChange() {
        this.newBin.wasteZoneId = undefined;
        if (this.selectedBuildingId) {
            this.filteredWasteZones = this.allWasteZones.filter(z => z.buildingId === this.selectedBuildingId);
        } else {
            this.filteredWasteZones = [...this.allWasteZones];
        }
    }

    ngAfterViewInit(): void {
        this.map = L.map('map').setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.setUserLocation();
        setTimeout(() => { this.loadBins(); });

        this.map.on('click', (e: L.LeafletMouseEvent) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            this.newBin.latitude = Number(lat.toFixed(6));
            this.newBin.longitude = Number(lng.toFixed(6));

            this.isLoading = true;
            this.binService.reverseGeocode(lat, lng).subscribe({
                next: (res) => {
                    const address = res.display_name;
                    if (!this.newBin.area) {
                        this.newBin.area = address;
                    }
                    L.popup().setLatLng([lat, lng]).setContent(address).openOn(this.map);
                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                }
            });
        });
    }

    setUserLocation() {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                this.map.setView([lat, lng], 15);
                L.marker([lat, lng]).addTo(this.map).bindPopup('You are here').openPopup();
            },
            (error) => {
                console.error('Error getting location:', error);
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
        } else if (status === StatusEnum.Full) {
            return L.divIcon({
                html: `<i class="fa-solid fa-trash" style="color: rgba(209, 30, 30, 1); font-size: 20px;"></i>`,
                className: '',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
        } else if (status === StatusEnum.Overflowing) {
            return L.divIcon({
                html: `<i class="fa-solid fa-trash" style="color: rgba(255, 165, 0, 1); font-size: 20px;"></i>`,
                className: '',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
        } else if (status === StatusEnum.Damaged) {
            return L.divIcon({
                html: `<i class="fa-solid fa-trash" style="color: rgba(147, 51, 234, 1); font-size: 20px;"></i>`,
                className: '',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
        } else {
            return L.divIcon({
                html: `<i class="fa-solid fa-trash" style="color: gray; font-size: 20px;"></i>`,
                className: '',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
        }
    }

    isFormValid(): boolean {
        return !!(
            this.selectedPropertyId &&
            this.newBin.wasteZoneId &&
            this.newBin.binTag?.trim() &&
            this.newBin.area?.trim() &&
            this.newBin.capacityLiters > 0 &&
            this.newBin.latitude &&
            this.newBin.longitude
        );
    }

    saveBin() {
        if (!this.isFormValid()) {
            this.showError({ error: { message: 'Please fill in all required fields: Property, Waste Zone, Bin Tag, Area, and GPS coordinates.' } });
            return;
        }

        this.isLoading = true;
        this.newBin.url = this.frontendUrl;

        this.binService
            .createBin(this.newBin)
            .pipe(
                tap((res) => {
                    this.file = res.data;
                    this.showSuccess('Bin registered and integrated into facility successfully!');
                    this.loadBins();
                    // Reset tag and coordinates
                    this.newBin.binTag = '';
                    this.newBin.area = '';
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                finalize(() => {
                    this.isLoading = false;
                    if (this.file) {
                        this.qrCodeDialog = true;
                    }
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    loadBins() {
        this.isLoading = true;

        this.binService
            .getAll()
            .pipe(
                tap((res) => {
                    const bins = res.data || [];
                    this.bins.set(bins);

                    bins.forEach((bin: BinResponseDto) => {
                        const tag = bin.binTag || `Bin #${bin.id}`;
                        const zone = bin.wasteZoneName ? ` (${bin.wasteZoneName})` : '';
                        L.marker([bin.latitude, bin.longitude], {
                            icon: this.getIcon(bin.status)
                        }).addTo(this.map).bindPopup(`
                            <strong>${tag}</strong>${zone}<br/>
                            <small>${bin.area || ''}</small>
                        `);
                    });
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

    downloadQrCode() {
        if (!this.file) return;

        const base64Data = this.file;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        const tag = this.newBin.binTag ? this.newBin.binTag.replace(/[^a-zA-Z0-9_-]/g, '_') : 'bin';
        a.download = `${tag}-qrcode.png`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}
