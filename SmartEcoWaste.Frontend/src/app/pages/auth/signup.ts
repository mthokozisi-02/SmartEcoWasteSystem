import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { LoginDto } from 'src/assets/interfaces/login-dto';
import { AuthService } from '@/core/services/auth.service';

import { catchError, finalize, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { CreateUserDto } from 'src/assets/interfaces/create-user-dto';
import { UserService } from '@/core/services/user.service';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [ButtonModule, ProgressSpinner, ToastModule, CommonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    template: `
        <div *ngIf="isLoading" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 8, 6, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999">
            <p-progressSpinner></p-progressSpinner>
        </div>
        <p-toast></p-toast>
        <app-floating-configurator />
        <div class="flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative" style="background: #030806;">
            <!-- Glow background accents -->
            <div class="absolute pointer-events-none" style="top: 20%; right: 15%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);"></div>
            <div class="absolute pointer-events-none" style="bottom: 20%; left: 15%; width: 350px; height: 350px; background: radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%);"></div>

            <div class="relative z-10 w-full max-w-md p-6">
                <div class="p-8 md:p-10 rounded-3xl relative overflow-hidden" style="background: #0d1f17; border: 1px solid rgba(16,185,129,0.2); box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                    <div class="text-center mb-8">
                        <a routerLink="/" class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 30px rgba(16,185,129,0.4);">
                            <i class="fa-solid fa-user-plus text-white text-2xl"></i>
                        </a>
                        <h2 class="text-3xl font-extrabold mb-2" style="color: #f0fdf4;">Create Account</h2>
                        <p class="text-sm font-medium" style="color: rgba(209,250,229,0.55);">Join SmartEcoWaste to start earning eco points</p>
                    </div>

                    <div class="flex flex-col gap-5">
                        <div>
                            <label for="name" class="block text-sm font-bold uppercase tracking-wider mb-2" style="color: rgba(209,250,229,0.7);">Full Name / Username</label>
                            <input pInputText id="name" type="text" placeholder="John Doe" class="w-full p-3 rounded-xl border" style="background: rgba(255,255,255,0.04); border-color: rgba(16,185,129,0.2); color: #f0fdf4;" [(ngModel)]="newUser.name" />
                        </div>

                        <div>
                            <label for="email1" class="block text-sm font-bold uppercase tracking-wider mb-2" style="color: rgba(209,250,229,0.7);">Email Address</label>
                            <input pInputText id="email1" type="text" placeholder="name@example.com" class="w-full p-3 rounded-xl border" style="background: rgba(255,255,255,0.04); border-color: rgba(16,185,129,0.2); color: #f0fdf4;" [(ngModel)]="newUser.email" />
                        </div>

                        <div>
                            <label for="password1" class="block text-sm font-bold uppercase tracking-wider mb-2" style="color: rgba(209,250,229,0.7);">Password</label>
                            <p-password id="password1" [(ngModel)]="newUser.passwordHash" placeholder="••••••••" [toggleMask]="true" styleClass="w-full" [fluid]="true" [feedback]="false"></p-password>
                        </div>

                        <div class="flex items-center justify-between mt-1 mb-2">
                            <span class="text-sm font-medium" style="color: rgba(209,250,229,0.6);">Already have an account?</span>
                            <span class="text-sm font-semibold cursor-pointer transition-colors" style="color: #34d399;" routerLink="/auth/login">Sign In</span>
                        </div>

                        <button pButton pRipple label="Create Account" icon="fa-solid fa-user-check" class="w-full p-3.5 text-base font-bold rounded-xl border-none transition-all duration-300" style="background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 20px rgba(16,185,129,0.35);" (click)="signUp()"></button>
                    </div>
                </div>
            </div>
        </div>
    `,
    providers: [MessageService]
})
export class Signup {
    newUser: CreateUserDto = {} as CreateUserDto;

    checked: boolean = false;
    isLoading = false;
    errorMessage = '';

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
        private authService: AuthService,
        private messageService: MessageService,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/'], {});
        }
    }

    signUp() {
        this.isLoading = true;
        this.errorMessage = '';

        this.userService
            .createUser(this.newUser)
            .pipe(
                tap((res) => {
                    console.log('Sign up response:', res);
                    this.showSuccess('Sign up successful');
                    this.router.navigate(['/auth/login'], {});
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                finalize(() => {
                    this.isLoading = false;
                    this.newUser = {} as CreateUserDto;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }
}
