import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService, TenantInfo } from '@/core/services/auth.service';

import { catchError, finalize, tap } from 'rxjs';
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
        <div class="flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative py-12 px-4" style="background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 40%, #f8fafc 100%);">
            <!-- Glow background accents -->
            <div class="absolute pointer-events-none" style="top: 15%; right: 15%; width: 450px; height: 450px; background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);"></div>
            <div class="absolute pointer-events-none" style="bottom: 15%; left: 15%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%);"></div>

            <div class="relative z-10 w-full max-w-md">
                <!-- Registration Pending State -->
                <div *ngIf="isSubmitted" class="p-8 md:p-10 rounded-3xl relative overflow-hidden bg-white text-center" style="border: 1px solid #e2e8f0; box-shadow: 0 20px 45px -10px rgba(245, 158, 11, 0.12), 0 10px 25px -5px rgba(0, 0, 0, 0.04);">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style="background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 10px 25px rgba(245,158,11,0.35);">
                        <i class="fa-solid fa-hourglass-half text-white text-3xl"></i>
                    </div>
                    <h2 class="text-2xl font-extrabold mb-2 text-slate-900">Awaiting Approval</h2>
                    <div class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4" style="background: #fef3c7; color: #b45309;">
                        Registration Pending
                    </div>
                    <p class="text-sm font-medium text-slate-600 mb-4 leading-relaxed">
                        Your account has been registered successfully and is currently waiting to be approved by your organization administrator.
                    </p>
                    <div class="p-4 rounded-xl text-xs text-left mb-6" style="background: #f8fafc; border: 1px solid #e2e8f0; color: #475569;">
                        <div class="flex items-start gap-2.5">
                            <i class="fa-solid fa-envelope text-amber-500 mt-0.5"></i>
                            <div>
                                <strong>Email Notification:</strong><br>
                                You will receive an email as soon as an administrator approves your account, after which you will be able to log in immediately.
                            </div>
                        </div>
                    </div>
                    <button pButton pRipple label="Back to Sign In" icon="fa-solid fa-arrow-left" routerLink="/auth/login" class="w-full p-3 text-sm font-bold rounded-xl border-none" style="background: #0f172a; color: white;"></button>
                </div>

                <!-- Registration Form -->
                <div *ngIf="!isSubmitted" class="p-8 md:p-10 rounded-3xl relative overflow-hidden bg-white" style="border: 1px solid #e2e8f0; box-shadow: 0 20px 45px -10px rgba(16, 185, 129, 0.12), 0 10px 25px -5px rgba(0, 0, 0, 0.04);">
                    <div class="text-center mb-6">
                        <a routerLink="/" class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 10px 25px rgba(16,185,129,0.35);">
                            <i class="fa-solid fa-user-plus text-white text-2xl"></i>
                        </a>
                        <h2 class="text-3xl font-extrabold mb-1 text-slate-900">Create Account</h2>
                        <p class="text-sm font-medium text-slate-500">Join SmartEcoWaste to start earning eco points</p>
                    </div>

                    <div class="flex flex-col gap-4">
                        <!-- Organization / Tenant Selector -->
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                                Organization / Estate Workspace <span class="text-emerald-600">*</span>
                            </label>
                            <div class="relative">
                                <select [(ngModel)]="newUser.tenantCode" class="w-full p-3 rounded-xl border appearance-none font-medium text-sm pr-10 cursor-pointer bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all">
                                    <option value="" disabled>-- Select Organization / Estate --</option>
                                    <option *ngFor="let t of tenants" [value]="t.code">
                                        {{ t.name }} ({{ t.code }}) - [{{ t.organizationType }}]
                                    </option>
                                </select>
                                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-emerald-600">
                                    <i class="fa-solid fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label for="name" class="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700">Full Name / Username</label>
                            <input pInputText id="name" type="text" placeholder="John Doe" class="w-full p-3 rounded-xl border border-slate-300 text-sm bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" [(ngModel)]="newUser.name" />
                        </div>

                        <div>
                            <label for="email1" class="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700">Email Address</label>
                            <input pInputText id="email1" type="email" placeholder="name@example.com" class="w-full p-3 rounded-xl border border-slate-300 text-sm bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" [(ngModel)]="newUser.email" />
                        </div>

                        <div>
                            <label for="password1" class="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-700">Password</label>
                            <p-password id="password1" [(ngModel)]="newUser.passwordHash" placeholder="••••••••" [toggleMask]="true" styleClass="w-full" [fluid]="true" [feedback]="false"></p-password>
                            <p class="text-[11px] text-slate-500 mt-1">Minimum 12 characters (uppercase, lowercase, number & symbol)</p>
                        </div>

                        <div class="flex items-center justify-between mt-1 mb-2">
                            <span class="text-sm font-medium text-slate-600">Already have an account?</span>
                            <span class="text-sm font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors" routerLink="/auth/login">Sign In</span>
                        </div>

                        <button pButton pRipple label="Create Account" icon="fa-solid fa-user-check" [disabled]="!newUser.name || !newUser.email || !newUser.passwordHash" class="w-full p-3.5 text-base font-bold rounded-xl border-none transition-all duration-300 shadow-lg" style="background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 20px rgba(16,185,129,0.3);" (click)="signUp()"></button>
                    </div>
                </div>
            </div>
        </div>
    `,
    providers: [MessageService]
})
export class Signup implements OnInit {
    newUser: CreateUserDto = {
        name: '',
        email: '',
        passwordHash: '',
        tenantCode: ''
    } as CreateUserDto;

    tenants: TenantInfo[] = [];

    checked: boolean = false;
    isLoading = false;
    isSubmitted = false;
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
            return;
        }

        // Fetch registered active tenant organizations
        this.authService.getPublicTenants().subscribe({
            next: (res) => {
                if (res?.data && res.data.length > 0) {
                    this.tenants = res.data;
                    const paramCode = this.route.snapshot.queryParams['tenant'] || this.route.snapshot.queryParams['tenantCode'];
                    const match = this.tenants.find(t => t.code === paramCode);
                    if (match) {
                        this.newUser.tenantCode = match.code;
                    } else {
                        // Pre-select Sunset Heights if available or first
                        const sunset = this.tenants.find(t => t.id === 2);
                        this.newUser.tenantCode = sunset ? sunset.code : this.tenants[0].code;
                    }
                }
            },
            error: () => {
                console.warn('Could not load organization list');
            }
        });
    }

    signUp() {
        if (!this.newUser.name || !this.newUser.email || !this.newUser.passwordHash) {
            this.showError('Please fill in all required fields.');
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.userService
            .createUser(this.newUser)
            .pipe(
                tap((res) => {
                    this.isSubmitted = true;
                    this.showSuccess('Registration submitted! Your account is awaiting administrator approval.');
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                finalize(() => {
                    this.isLoading = false;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }
}
