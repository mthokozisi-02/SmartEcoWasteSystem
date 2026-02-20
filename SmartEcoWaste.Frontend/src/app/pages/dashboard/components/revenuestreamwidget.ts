import { Component, DestroyRef, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { catchError, debounceTime, finalize, Subscription, tap } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { GraphDataDto } from 'src/assets/interfaces/graph-data-dto';
import { ReportService } from '@/core/services/report.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import L from 'leaflet';
import { BinResponseDto } from 'src/assets/interfaces/bin-response-dto';
import { MessageService } from 'primeng/api';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule],
    providers: [MessageService],
    template: `<div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">User Report Stream</div>
        <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-100" />
    </div>`
})
export class RevenueStreamWidget {
    chartData: any;

    userData: GraphDataDto = {} as GraphDataDto;

    chartOptions: any;

    private destroyRef = inject(DestroyRef);

    subscription!: Subscription;

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
        public layoutService: LayoutService,
        private reportSevice: ReportService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadReports();
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartData = {
            labels: this.userData.users,
            datasets: [
                {
                    type: 'bar',
                    label: 'Emptied',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    data: this.userData.emptiedData,
                    barThickness: 32
                },
                {
                    type: 'bar',
                    label: 'Damaged',
                    backgroundColor: documentStyle.getPropertyValue('--p-purple-400'),
                    data: this.userData.damagedData,
                    barThickness: 32
                },
                {
                    type: 'bar',
                    label: 'Overflowing',
                    backgroundColor: documentStyle.getPropertyValue('--p-yellow-400'),
                    data: this.userData.overflowingData,
                    barThickness: 32
                },
                {
                    type: 'bar',
                    label: 'Full',
                    backgroundColor: documentStyle.getPropertyValue('--p-red-400'),
                    data: this.userData.fullData,
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    borderSkipped: false,
                    barThickness: 32
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: 'transparent',
                        borderColor: 'transparent'
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    loadReports() {
        this.reportSevice
            .getAllUserData()
            .pipe(
                tap((res) => {
                    this.userData = res.data;
                    this.initChart();
                    console.log('Data loaded:', res);
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
