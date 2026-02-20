import { BinService } from '@/core/services/bin.service';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import L from 'leaflet';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
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
import { Table, TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { catchError, finalize, tap } from 'rxjs';
import { StatusEnum } from 'src/assets/enums/status-enum';
import { BinResponseDto } from 'src/assets/interfaces/bin-response-dto';

@Component({
    selector: 'app-manage-bins',
    standalone: true,
    imports: [
        TabsModule,
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
        BadgeModule,
        SelectModule,
        ImageModule
    ],
    templateUrl: './manage-bins.html',
    styleUrl: './manage-bins.scss',
    providers: [MessageService, ConfirmationService]
})
export class ManageBins {
    bins = signal<BinResponseDto[]>([]);

    selectedBin: BinResponseDto = {} as BinResponseDto;

    viewBinDialog = false;

    isLoading = true;

    map!: L.Map;

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

    loadBins() {
        this.isLoading = true;

        this.binService
            .getAll()
            .pipe(
                tap((res) => {
                    const bins = res.data;
                    this.bins.set(res.data);

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

    deleteReport(id: number) {
        console.log(id);
        this.confirmationService.confirm({
            message: `Are you sure you want to delete this bin?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.isLoading = true;

                this.binService
                    .deleteBin(id)
                    .pipe(
                        tap(() => {
                            this.showSuccess('Bin deleted successfully');
                            this.loadBins();
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
        });
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
                iconSize: [40, 40],
                iconAnchor: [10, 10]
            });
        } else if (status === StatusEnum.Overflowing) {
            return L.divIcon({
                html: `<i class="fa-solid fa-trash" style="color: rgba(255, 165, 0, 1); font-size: 20px;"></i>`,
                className: '',
                iconSize: [40, 40],
                iconAnchor: [10, 10]
            });
        } else if (status === StatusEnum.Damaged) {
            return L.divIcon({
                html: `<i class="fa-solid fa-trash" style="color: rgba(255, 165, 0, 1); font-size: 20px;"></i>`,
                className: '',
                iconSize: [40, 40],
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

    viewBin(bin: BinResponseDto) {
        this.selectedBin = bin;
        this.viewBinDialog = true;
    }

    trimToThirdComma(text: string): string {
        if (!text) return '';

        const parts = text.split(',');
        return parts.slice(0, 3).join(',').trim();
    }

    getSeverity(status: string) {
        switch (status) {
            case 'Emptied':
                return 'success';
            case 'Full':
                return 'danger';
            case 'Overflowing':
                return 'warn';
            case 'Damaged':
                return 'help';
            default:
                return 'info';
        }
    }

    downloadQrCode() {
        if (!this.selectedBin) return;

        const base64Data = this.selectedBin.qrCode;
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

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hideDialog() {
        this.viewBinDialog = false;
    }
}
