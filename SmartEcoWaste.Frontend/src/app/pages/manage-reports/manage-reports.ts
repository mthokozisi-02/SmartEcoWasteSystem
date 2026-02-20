import { BinService } from '@/core/services/bin.service';
import { ReportService } from '@/core/services/report.service';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
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
import { tap, catchError, finalize } from 'rxjs';
import { StatusEnum } from 'src/assets/enums/status-enum';
import { ReportResponseDto } from 'src/assets/interfaces/report-response-dto';
import { VerifyBinDto } from 'src/assets/interfaces/verify-bin-dto';

@Component({
    selector: 'app-manage-reports',
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
        SelectModule
    ],
    templateUrl: './manage-reports.html',
    styleUrl: './manage-reports.scss',
    providers: [MessageService, ConfirmationService]
})
export class ManageReports {
    reports = signal<ReportResponseDto[]>([]);

    filteredReports = signal<ReportResponseDto[]>([]);

    category: any;

    verify: VerifyBinDto = {} as VerifyBinDto;

    submitted: boolean = false;

    private destroyRef = inject(DestroyRef);

    isLoading = false;

    clearReportDialog = false;

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
        private reportService: ReportService,
        private binService: BinService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {}

    ngOnInit() {
        this.category = 'All';
        this.loadReports(this.category);
    }

    private loadReports(report: any) {
        this.isLoading = true;

        this.reportService
            .getAll()
            .pipe(
                tap((res) => {
                    if (report == 'All') {
                        this.filteredReports.set(res.data);
                    } else if (report == 'Emptied') {
                        this.filteredReports.set(res.data.filter((r: ReportResponseDto) => r.status == StatusEnum.Emptied));
                    } else if (report == 'Full') {
                        this.filteredReports.set(res.data.filter((r: ReportResponseDto) => r.status == StatusEnum.Full));
                    } else if (report == 'Overflowing') {
                        this.filteredReports.set(res.data.filter((r: ReportResponseDto) => r.status == StatusEnum.Overflowing));
                    } else if (report == 'Damaged') {
                        this.filteredReports.set(res.data.filter((r: ReportResponseDto) => r.status == StatusEnum.Damaged));
                    }
                    console.log('reports:', this.filteredReports());
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

    clearReport(report: ReportResponseDto) {
        this.verify.binId = report.binId;
        this.verify.reportId = report.id;
        this.verify.collecterId = Number(localStorage.getItem('user_id'));
        this.verify.userId = report.userId;

        this.confirmationService.confirm({
            message: `Are you sure you want to clear this report?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.isLoading = true;

                this.reportService
                    .clearReport(this.verify)
                    .pipe(
                        tap((res) => {
                            console.log('Report response:', res);
                            this.showSuccess('Bin cleared successfully');
                            this.loadReports(this.category);
                        }),
                        catchError((err) => {
                            this.showError(err);
                            return [];
                        }),
                        finalize(() => {
                            ((this.isLoading = false), (this.clearReportDialog = false));
                        }),
                        takeUntilDestroyed(this.destroyRef)
                    )
                    .subscribe();
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hideDialog() {
        this.clearReportDialog = false;
    }

    deleteReport(id: number) {
        console.log(id);
        this.confirmationService.confirm({
            message: `Are you sure you want to delete this report?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.isLoading = true;

                this.reportService
                    .deleteReport(id)
                    .pipe(
                        tap(() => {
                            this.showSuccess('Report deleted successfully');
                            this.loadReports(this.category);
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

    allReports() {
        this.category = 'All';
        this.loadReports(this.category);
    }

    EmptyReports() {
        this.category = 'Emptied';
        this.loadReports(this.category);
    }

    FullReports() {
        this.category = 'Full';
        this.loadReports(this.category);
    }

    OverflowingReports() {
        this.category = 'Overflowing';
        this.loadReports(this.category);
    }

    DamagedReports() {
        this.category = 'Damaged';
        this.loadReports(this.category);
    }
}
