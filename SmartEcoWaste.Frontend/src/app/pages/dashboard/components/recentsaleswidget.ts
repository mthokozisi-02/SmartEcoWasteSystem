import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { BinService } from '@/core/services/bin.service';
import { MessageService } from 'primeng/api';
import { BinResponseDto } from 'src/assets/interfaces/bin-response-dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, ToastModule, TableModule, ButtonModule, TagModule, RippleModule],
    template: ` <p-toast></p-toast>
        <div class="card mb-8!">
            <div class="font-semibold text-xl mb-4">Recent Bins</div>
            <p-table [paginator]="true" [value]="bins()" [rows]="5" responsiveLayout="scroll">
                <ng-template #header>
                    <tr>
                        <th>ID</th>
                        <th pSortableColumn="name">Area <p-sortIcon field="name"></p-sortIcon></th>
                        <th pSortableColumn="price">Status <p-sortIcon field="price"></p-sortIcon></th>
                    </tr>
                </ng-template>
                <ng-template #body let-bin>
                    <tr>
                        <td style="width: 15%; min-width: 3rem;">
                            {{ bin.id }}
                        </td>
                        <td style="width: 50%; min-width: 8rem;">{{ trimToThirdComma(bin.area) }}</td>
                        <td style="width: 30%; min-width: 6rem;"><p-tag [value]="bin.status" [severity]="getSeverity(bin.status)" /></td>
                    </tr>
                </ng-template>
            </p-table>
        </div>`,
    providers: [MessageService]
})
export class RecentSalesWidget {
    bins = signal<BinResponseDto[]>([]);

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

    ngOnInit() {
        this.loadBins();
    }

    loadBins() {
        this.binService
            .getAll()
            .pipe(
                tap((res) => {
                    this.bins.set(res.data);
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
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
}
