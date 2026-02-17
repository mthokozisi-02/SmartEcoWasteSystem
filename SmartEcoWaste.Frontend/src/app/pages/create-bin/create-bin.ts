import { BinService } from '@/core/services/bin.service';
import { Component, DestroyRef, inject, signal } from '@angular/core';
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
export class CreateBin {
    bins = signal<BinResponseDto[]>([]);

    map!: L.Map;

    file = '';

    newBin: CreateBinDto = {} as CreateBinDto;

    isLoading = false;

    qrCodeDialog = false;

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
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngAfterViewInit(): void {
        this.map = L.map('map').setView([0, 0], 2); // temporary default

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.setUserLocation();
        this.loadBins();

        this.map.on('click', (e: L.LeafletMouseEvent) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            console.log('Latitude:', lat);
            console.log('Longitude:', lng);

            this.newBin.latitude = lat;
            this.newBin.longitude = lng;

            this.isLoading = true;
            this.binService.reverseGeocode(lat, lng).subscribe((res) => {
                const address = res.display_name;
                console.log(address);
                this.newBin.area = address;

                L.popup().setLatLng([lat, lng]).setContent(address).openOn(this.map);
                this.isLoading = false;
            });
        });
    }

    setUserLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation not supported by your browser');
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
                alert('Please allow location access');
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

    saveBin() {
        this.isLoading = true;

        this.binService
            .createBin(this.newBin)
            .pipe(
                tap((res) => {
                    this.file = res.data;
                    console.log('Bin created with ID:', res);
                    this.showSuccess('Bin created successfully');
                    this.loadBins();
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                finalize(() => ((this.isLoading = false), (this.qrCodeDialog = true))),
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
                    const bins = res.data;
                    this.bins.set(bins);

                    console.log('Bins loaded:', bins);

                    // Add markers for each bin
                    bins.forEach((bin: BinResponseDto) => {
                        L.marker([bin.latitude, bin.longitude], {
                            icon: this.getIcon(bin.status)
                        }).addTo(this.map).bindPopup(`
                        Bin #${bin.id}
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
        a.download = `bin-qrcode.png`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}
