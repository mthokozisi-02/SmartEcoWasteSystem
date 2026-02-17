import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
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

    newReport: ReportBinDto = {} as ReportBinDto;

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
        // Get the 'id' parameter from the route
        this.route.paramMap.subscribe((params) => {
            this.binId = Number(params.get('id'));
            console.log('Reporting bin ID:', this.binId);
        });
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
                    this.showSuccess('Bin reported successfully');
                    this.router.navigateByUrl('/');
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
}
