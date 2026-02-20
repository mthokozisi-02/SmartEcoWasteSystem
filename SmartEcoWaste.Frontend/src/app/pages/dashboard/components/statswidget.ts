import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from 'src/assets/interfaces/user';
import { BinResponseDto } from 'src/assets/interfaces/bin-response-dto';
import { ReportResponseDto } from 'src/assets/interfaces/report-response-dto';
import { UserService } from '@/core/services/user.service';
import { BinService } from '@/core/services/bin.service';
import { ReportService } from '@/core/services/report.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { StatusEnum } from 'src/assets/enums/status-enum';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule, ToastModule, ProgressSpinnerModule],
    providers: [MessageService],
    template: ` <p-toast></p-toast>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Users</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ users().length }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ userRoles }} </span>
                <span class="text-muted-color">users</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Bins</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ bins().length }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-trash text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ emptied }} </span>
                <span class="text-muted-color">bins emptied</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Reports</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ reports().length }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-file-check text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ attendedTo }} </span>
                <span class="text-muted-color">attended to</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total Points</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ points }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-check-circle text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">0 </span>
                <span class="text-muted-color">claimed</span>
            </div>
        </div>`
})
export class StatsWidget {
    users = signal<User[]>([]);

    bins = signal<BinResponseDto[]>([]);

    reports = signal<ReportResponseDto[]>([]);

    points = 0;

    emptied = 0;

    attendedTo = 0;

    userRoles = 0;

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
        private reportService: ReportService,
        private binService: BinService,
        private userService: UserService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadBins();
        this.loadReports();
        this.loadUsers();
    }

    loadUsers() {
        this.userService
            .getAll()
            .pipe(
                tap((res) => {
                    this.users.set(res.data);
                    this.users().forEach((user) => {
                        this.points += user.userPoints;
                    });
                    this.userRoles = this.users().filter((user) => user.roleId == 2).length;
                    console.log('Users loaded:', res.data);
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    loadReports() {
        this.reportService
            .getAll()
            .pipe(
                tap((res) => {
                    this.reports.set(res.data);
                    this.attendedTo = this.reports().filter((bin) => bin.status == StatusEnum.Emptied).length;
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    loadBins() {
        this.binService
            .getAll()
            .pipe(
                tap((res) => {
                    this.bins.set(res.data);
                    this.emptied = this.bins().filter((bin) => bin.status == StatusEnum.Emptied).length;
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }
}
