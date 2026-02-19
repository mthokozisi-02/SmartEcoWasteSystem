import { UserService } from '@/core/services/user.service';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { tap, catchError, finalize } from 'rxjs';
import { DataViewModule } from 'primeng/dataview';
import { GetUserDto } from 'src/assets/interfaces/get-user-dto';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ImageModule } from 'primeng/image';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [ButtonModule, BadgeModule, ImageModule, DataViewModule, FormsModule, TagModule, ProgressSpinnerModule, ToastModule, CommonModule],
    templateUrl: './user-profile.html',
    styleUrl: './user-profile.scss',
    providers: [MessageService]
})
export class UserProfile {
    user: GetUserDto = {} as GetUserDto;

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
        private userService: UserService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.isLoading = true;

        const userId = Number(localStorage.getItem('user_id'));

        this.userService
            .getUser(userId)
            .pipe(
                tap((res) => {
                    this.user = res.data;
                    console.log('user', this.user);
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

    userSeverity(points: number) {
        if (points === 0) return 'danger';
        else if (points > 0 && points < 500) return 'warn';
        else return 'success';
    }
}
