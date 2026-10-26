import { Component, DestroyRef, OnInit, inject } from '@angular/core';
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
import { ToastModule } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, ProgressSpinner, ToastModule, CommonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    template: `
        <div *ngIf="isLoading" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 9999">
            <p-progressspinner></p-progressspinner>
        </div>
        <p-toast></p-toast>
        <app-floating-configurator />

        <div class="flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative py-12 px-4" style="background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 40%, #f8fafc 100%);">
            <!-- Glow background accents -->
            <div class="absolute pointer-events-none" style="top: 10%; left: 15%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);"></div>
            <div class="absolute pointer-events-none" style="bottom: 10%; right: 15%; width: 450px; height: 450px; background: radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%);"></div>

            <div class="relative z-10 w-full max-w-lg">
                <div class="p-8 md:p-10 rounded-3xl relative overflow-hidden bg-white" style="border: 1px solid #e2e8f0; box-shadow: 0 20px 45px -10px rgba(16, 185, 129, 0.12), 0 10px 25px -5px rgba(0, 0, 0, 0.04);">
                    <div class="text-center mb-6">
                        <a routerLink="/" class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 10px 25px rgba(16,185,129,0.35);">
                            <i class="fa-solid fa-recycle text-white text-2xl"></i>
                        </a>
                        <h2 class="text-3xl font-extrabold mb-1 text-slate-900">Sign In</h2>
                        <p class="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Smart Eco-Waste Management</p>
                        <p class="text-sm font-medium text-slate-500">Enter your credentials to access your portal</p>
                    </div>

                    <div class="flex flex-col gap-4">
                        <div>
                            <label for="email1" class="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700">Email Address</label>
                            <input pInputText id="email1" type="email" autocomplete="username" placeholder="name@domain.com" class="w-full p-3 rounded-xl border border-slate-300 text-sm bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" [(ngModel)]="loginInfo.email" />
                        </div>

                        <div>
                            <label for="password1" class="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700">Password</label>
                            <p-password id="password1" [(ngModel)]="loginInfo.passwordHash" autocomplete="current-password" placeholder="••••••••" [toggleMask]="true" styleClass="w-full" [fluid]="true" [feedback]="false"></p-password>
                        </div>

                        <div class="flex items-center justify-between mt-1 mb-1">
                            <div class="flex items-center gap-2">
                                <p-checkbox [(ngModel)]="checked" id="rememberme1" binary></p-checkbox>
                                <label for="rememberme1" class="text-xs font-medium text-slate-600">Remember me</label>
                            </div>
                            <span class="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors" (click)="signUp()">Register Property</span>
                        </div>

                        <button pButton pRipple label="Sign In" icon="fa-solid fa-right-to-bracket" [disabled]="!loginInfo.email || !loginInfo.passwordHash" class="w-full p-3.5 text-base font-bold rounded-xl border-none transition-all duration-300 mt-2 shadow-lg" style="background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 20px rgba(16,185,129,0.3);" (click)="onLogin()"></button>
                    </div>
                </div>
            </div>
        </div>
    `,
    providers: [MessageService]
})
export class Login implements OnInit {
    loginInfo: LoginDto = {
        email: '',
        passwordHash: '',
        tenantCode: ''
    };

    checked: boolean = false;
    isLoading = false;
    errorMessage = '';

    private destroyRef = inject(DestroyRef);

    constructor(
        private authService: AuthService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/'], {});
            return;
        }
    }

    private showSuccess(message: string) {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
            life: 3000
        });
    }

    private showError(error: any) {
        const message = error?.error?.message || error?.error || error?.message || (typeof error === 'string' ? error : 'Authentication failed. Please check your credentials.');

        this.messageService.add({
            severity: 'error',
            summary: 'Sign In Failed',
            detail: message,
            life: 4000
        });
    }

    onLogin() {
        if (!this.loginInfo.email || !this.loginInfo.passwordHash) {
            this.showError('Please enter both your email address and password.');
            return;
        }

        this.isLoading = true;

        this.authService
            .login(this.loginInfo)
            .pipe(
                tap((res) => {
                    this.showSuccess('Login successful');
                    const redirectUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                    setTimeout(() => {
                        this.router.navigate([redirectUrl]);
                    }, 500);
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

    signUp() {
        this.router.navigate(['auth/signup']);
    }
}
