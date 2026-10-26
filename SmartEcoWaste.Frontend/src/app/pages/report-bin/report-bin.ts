import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';
import { Component, DestroyRef, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/core/services/auth.service';
import { BinService } from '@/core/services/bin.service';
import { ReportBinDto } from 'src/assets/interfaces/report-bin-dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { StatusEnum } from 'src/assets/enums/status-enum';
import * as L from 'leaflet';

@Component({
    selector: 'app-report-bin',
    standalone: true,
    imports: [
        CommonModule,
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
        TabsModule,
        TableModule,
        ProgressSpinnerModule,
        RouterLink,
        AppFloatingConfigurator,
        ImageModule
    ],
    templateUrl: './report-bin.html',
    styleUrl: './report-bin.scss',
    providers: [MessageService]
})
export class ReportBin implements OnInit, OnDestroy {
    binId!: number;
    bin: any = null;
    map!: L.Map;

    newReport: ReportBinDto = {
        binId: 0,
        // userId is intentionally omitted — derived from JWT on the backend
        status: StatusEnum.Full
    };

    // Photo options
    selectedPhotoFile: File | null = null;
    photoPreviewUrl: string | null = null;
    manualPhotoUrl: string = '';

    // Expose enum so the template can reference it
    StatusEnum = StatusEnum;
    statusList = Object.values(StatusEnum);
    isLoading = false;

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
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService,
        private authService: AuthService,
        private binService: BinService
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            this.binId = Number(params.get('id'));
            this.loadBinDetails();
        });
    }

    loadBinDetails() {
        this.isLoading = true;
        this.binService
            .getPublicBin(this.binId)
            .pipe(
                tap((res) => {
                    this.bin = res.data || res || null;
                    if (this.bin) {
                        this.initializeMap();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Bin not found in system',
                            life: 4000
                        });
                    }
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

    initializeMap() {
        setTimeout(() => {
            if (!this.bin) return;

            // Set up map centered on bin coordinates
            const container = L.DomUtil.get('report-map');
            if (container != null) {
                (container as any)._leaflet_id = null;
            }
            if (this.map) {
                this.map.remove();
            }
            this.map = L.map('report-map').setView([this.bin.latitude, this.bin.longitude], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.map);

            const binMarkerIcon = L.icon({
                iconRetinaUrl: 'images/marker-icon-2x.png',
                iconUrl: 'images/marker-icon.png',
                shadowUrl: 'images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            // Add marker for bin
            L.marker([this.bin.latitude, this.bin.longitude], { icon: binMarkerIcon }).addTo(this.map)
                .bindPopup(`<b>Smart Bin #${this.bin.id}</b><br>${this.trimToThirdComma(this.bin.area)}`)
                .openPopup();
        }, 150);
    }

    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove();
        }
    }

    selectStatus(status: string) {
        this.newReport.status = status as StatusEnum;
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showError({ message: 'Please select a valid image file (JPG, PNG, WebP).' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showError({ message: 'Photo size cannot exceed 5MB.' });
            return;
        }

        this.selectedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = () => {
            this.photoPreviewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    removePhoto(): void {
        this.selectedPhotoFile = null;
        this.photoPreviewUrl = null;
        this.manualPhotoUrl = '';
        this.newReport.photoUrl = undefined;
    }

    reportBin() {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/auth/login'], {
                queryParams: { returnUrl: `/report/${this.binId}` }
            });
        } else {
            this.submitReport();
        }
    }

    submitReport() {
        this.isLoading = true;
        this.newReport.binId = this.binId;
        const currentUserId = this.authService.getUserId();
        if (currentUserId && currentUserId > 0) {
            this.newReport.userId = currentUserId;
        }

        // If a photo file was captured, upload it first
        if (this.selectedPhotoFile) {
            this.binService.uploadPhoto(this.selectedPhotoFile).pipe(
                tap((uploadRes) => {
                    const uploadedUrl = uploadRes.data || uploadRes.url || '';
                    this.newReport.photoUrl = uploadedUrl;
                    this.executeReportSubmission();
                }),
                catchError((err) => {
                    this.showError(err);
                    this.isLoading = false;
                    return [];
                }),
                takeUntilDestroyed(this.destroyRef)
            ).subscribe();
        } else {
            if (this.manualPhotoUrl.trim()) {
                this.newReport.photoUrl = this.manualPhotoUrl.trim();
            }
            this.executeReportSubmission();
        }
    }

    private executeReportSubmission() {
        this.binService
            .reportBin(this.newReport)
            .pipe(
                tap((res) => {
                    this.showSuccess(res.message || 'Bin reported successfully! Points will be awarded upon collection verification.');
                    setTimeout(() => {
                        this.router.navigateByUrl('/landing');
                    }, 2000);
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

    getSeverity(status: StatusEnum): string {
        switch (status) {
            case StatusEnum.Emptied:
                return 'success';
            case StatusEnum.Full:
                return 'warn';
            case StatusEnum.Overflowing:
                return 'danger';
            default:
                return 'info';
        }
    }

    trimToThirdComma(str: string | null): string {
        if (!str) return 'Unknown Area';
        const parts = str.split(',');
        if (parts.length <= 3) return str;
        return parts.slice(0, 3).join(',').trim();
    }
}
