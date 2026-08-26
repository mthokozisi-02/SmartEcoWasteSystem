import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';
import { Component, DestroyRef, inject, OnInit, AfterViewInit } from '@angular/core';
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
        AppFloatingConfigurator,
        ButtonModule,
        RouterLink,
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
    templateUrl: './report-bin.html',
    styleUrl: './report-bin.scss',
    providers: [MessageService]
})
export class ReportBin implements OnInit {
    binId!: number;
    bin: any = null;
    map!: L.Map;

    newReport: ReportBinDto = {
        binId: 0,
        userId: 0,
        status: StatusEnum.Full
    };

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
            console.log('Reporting bin ID:', this.binId);
            this.loadBinDetails();
        });
    }

    loadBinDetails() {
        this.isLoading = true;
        this.binService
            .getAll()
            .pipe(
                tap((res) => {
                    const bins = res.data || [];
                    this.bin = bins.find((b: any) => b.id === this.binId) || null;
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
            this.map = L.map('report-map').setView([this.bin.latitude, this.bin.longitude], 16);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.map);

            // Add marker for bin
            L.marker([this.bin.latitude, this.bin.longitude]).addTo(this.map)
                .bindPopup(`<b>Smart Bin #${this.bin.id}</b><br>${this.trimToThirdComma(this.bin.area)}`)
                .openPopup();
        }, 150);
    }

    selectStatus(status: string) {
        this.newReport.status = status as StatusEnum;
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
        this.newReport.userId = Number(localStorage.getItem('user_id'));

        this.binService
            .reportBin(this.newReport)
            .pipe(
                tap((res) => {
                    console.log('Report response:', res);
                    this.showSuccess('Bin reported successfully! +25 Eco Points added to your profile.');
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
