import { UserService } from '@/core/services/user.service';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
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
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UpdatePasswordDto } from 'src/assets/interfaces/update-password-dto';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [
        ButtonModule,
        BadgeModule,
        DialogModule,
        ImageModule,
        DataViewModule,
        FormsModule,
        TagModule,
        ProgressSpinnerModule,
        ToastModule,
        CommonModule,
        InputTextModule,
        PasswordModule
    ],
    templateUrl: './user-profile.html',
    styleUrl: './user-profile.scss',
    providers: [MessageService]
})
export class UserProfile implements OnInit {
    user: GetUserDto = {} as GetUserDto;
    newPassword: UpdatePasswordDto = {} as UpdatePasswordDto;
    confirmPassword = '';

    isLoading = false;
    updateUserDialog = false;

    userRole = '';
    tenantName = '';
    userId = 0;
    isUser = false;
    isStaff = false;
    isAdmin = false;

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
        private messageService: MessageService,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        const role = (this.authService.getUserRole() || '').toLowerCase();
        this.userRole = this.authService.getUserRole() || 'Staff';
        this.tenantName = this.authService.getTenantName();
        this.isUser = role === 'user';
        this.isStaff = role === 'staff';
        this.isAdmin = role === 'admin' || role === 'superadmin';

        // Pre-populate with auth cached data
        this.user = {
            name: this.authService.getUserName(),
            email: this.authService.getUserEmail() || localStorage.getItem('user_email') || '',
            reports: 0,
            points: 0
        };

        this.userId = this.authService.getUserId() || Number(localStorage.getItem('user_id')) || 0;

        if (!this.userId || this.userId <= 0) {
            return;
        }

        this.isLoading = true;
        this.userService
            .getUser(this.userId)
            .pipe(
                tap((res) => {
                    if (res && res.data) {
                        this.user = {
                            ...res.data,
                            name: res.data.name || this.user.name,
                            email: res.data.email || this.user.email
                        };
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

    userSeverity(points: number) {
        if (points === 0) return 'danger';
        else if (points > 0 && points < 500) return 'warn';
        else return 'success';
    }

    changePassword() {
        this.newPassword = {} as UpdatePasswordDto;
        this.confirmPassword = '';
        this.updateUserDialog = true;
    }

    updatePassword() {
        if (!this.newPassword.password || this.newPassword.password.length < 6) {
            this.showError({ message: 'Password must be at least 6 characters long.' });
            return;
        }

        if (this.confirmPassword && this.confirmPassword !== this.newPassword.password) {
            this.showError({ message: 'Passwords do not match.' });
            return;
        }

        this.isLoading = true;
        this.newPassword.userId = this.userId || Number(localStorage.getItem('user_id'));

        this.userService
            .updateUserPassword(this.newPassword)
            .pipe(
                tap((res) => {
                    this.showSuccess('Password updated successfully. Please sign in with your new password.');
                    setTimeout(() => {
                        this.authService.logout();
                        this.router.navigate(['/auth/login']);
                    }, 1200);
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                finalize(() => {
                    this.isLoading = false;
                    this.updateUserDialog = false;
                    this.newPassword = {} as UpdatePasswordDto;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }
}
