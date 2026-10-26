import { BinService } from '@/core/services/bin.service';
import { ReportService } from '@/core/services/report.service';
import { UserService } from '@/core/services/user.service';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
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
import { ImageModule } from 'primeng/image';
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
import { environment } from 'src/environments/environment';

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
        SelectModule,
        ImageModule
    ],
    templateUrl: './manage-reports.html',
    styleUrl: './manage-reports.scss',
    providers: [MessageService, ConfirmationService]
})
export class ManageReports implements OnInit {
    reports = signal<ReportResponseDto[]>([]);
    filteredReports = signal<ReportResponseDto[]>([]);
    staffUsers = signal<any[]>([]);

    category: any = 'All';
    verify: VerifyBinDto = {} as VerifyBinDto;
    submitted: boolean = false;
    isLoading = false;
    clearReportDialog = false;

    // Assignment Dialog State
    assignDialog = false;
    selectedReportToAssign: ReportResponseDto | null = null;
    selectedStaffUser: any = null;

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
        private reportService: ReportService,
        private binService: BinService,
        private userService: UserService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {}

    ngOnInit() {
        this.category = 'All';
        this.loadReports(this.category);
        this.loadStaffUsers();
    }

    getImageUrl(url: string | undefined | null): string {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
        return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    private loadReports(report: any) {
        this.isLoading = true;

        this.reportService
            .getAll()
            .pipe(
                tap((res) => {
                    const data = res.data || [];
                    this.reports.set(data);
                    if (report == 'All') {
                        this.filteredReports.set(data);
                    } else if (report == 'Emptied') {
                        this.filteredReports.set(data.filter((r: ReportResponseDto) => r.status == StatusEnum.Emptied));
                    } else if (report == 'Full') {
                        this.filteredReports.set(data.filter((r: ReportResponseDto) => r.status == StatusEnum.Full));
                    } else if (report == 'Overflowing') {
                        this.filteredReports.set(data.filter((r: ReportResponseDto) => r.status == StatusEnum.Overflowing));
                    } else if (report == 'Damaged') {
                        this.filteredReports.set(data.filter((r: ReportResponseDto) => r.status == StatusEnum.Damaged));
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

    loadStaffUsers() {
        this.userService
            .getAll()
            .pipe(
                tap((res) => {
                    const allUsers: any[] = res.data || [];
                    // Filter for Staff members (or all users if needed)
                    const staffOnly = allUsers
                        .filter((u: any) => u.roleName === 'Staff' || (u.role && u.role.name === 'Staff'))
                        .map((u: any) => ({
                            id: u.id,
                            name: u.name,
                            email: u.email,
                            displayName: `${u.name} (${u.email}) [${u.tenantName || 'Tenant #' + u.tenantId}]`
                        }));
                    this.staffUsers.set(staffOnly);
                }),
                catchError((err) => {
                    console.error('Failed to load staff list', err);
                    return [];
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    openAssignDialog(report: ReportResponseDto) {
        this.selectedReportToAssign = report;
        this.loadStaffUsers();
        if (report.assignedTo) {
            const match = this.staffUsers().find((s) => s.id === report.assignedTo);
            this.selectedStaffUser = match || null;
        } else {
            this.selectedStaffUser = null;
        }
        this.assignDialog = true;
    }

    saveAssignment() {
        if (!this.selectedReportToAssign || !this.selectedStaffUser) {
            this.showError({ message: 'Please select a staff member to assign this report to.' });
            return;
        }

        this.isLoading = true;
        this.reportService
            .assignReport(this.selectedReportToAssign.id, this.selectedStaffUser.id)
            .pipe(
                tap((res) => {
                    this.showSuccess(res.message || 'Report assigned to staff member successfully.');
                    this.assignDialog = false;
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
                            this.showSuccess('Bin cleared successfully');
                            this.loadReports(this.category);
                        }),
                        catchError((err) => {
                            this.showError(err);
                            return [];
                        }),
                        finalize(() => {
                            this.isLoading = false;
                            this.clearReportDialog = false;
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
        this.assignDialog = false;
    }

    deleteReport(id: number) {
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
            case 'Assigned':
                return 'info';
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
