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
import { AuthService, TenantInfo } from '@/core/services/auth.service';

import { catchError, finalize, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, ProgressSpinner, ToastModule, CommonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    template: `
        <div *ngIf="isLoading" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(3, 8, 6, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999">
            <p-progressSpinner></p-progressSpinner>
        </div>
        <p-toast></p-toast>
        <app-floating-configurator />
        <div class="flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative py-10" style="background: #030806;">
            <!-- Glow background accents -->
            <div class="absolute pointer-events-none" style="top: 15%; left: 10%; width: 450px; height: 450px; background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);"></div>
            <div class="absolute pointer-events-none" style="bottom: 15%; right: 10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);"></div>

            <div class="relative z-10 w-full max-w-lg p-6">
                <div class="p-8 md:p-10 rounded-3xl relative overflow-hidden" style="background: #0d1f17; border: 1px solid rgba(16,185,129,0.25); box-shadow: 0 25px 65px rgba(0,0,0,0.6);">
                    <div class="text-center mb-6">
                        <a routerLink="/" class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 30px rgba(16,185,129,0.45);">
                            <i class="fa-solid fa-recycle text-white text-2xl"></i>
                        </a>
                        <h2 class="text-3xl font-extrabold mb-1" style="color: #f0fdf4;">Organization Portal</h2>
                        <p class="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">Multi-Tenant Waste Operations SaaS</p>
                        <p class="text-sm font-medium" style="color: rgba(209,250,229,0.65);">Sign in with your Organization Workspace & Credentials</p>
                    </div>

                    <!-- Quick Demo Organization Selector Pills -->
                    <div class="mb-5 p-3 rounded-2xl" style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.15);">
                        <div class="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style="color: rgba(209,250,229,0.8);">
                            <i class="fa-solid fa-bolt text-amber-400"></i> Quick Test Workspaces:
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                            <button type="button" (click)="selectDemo('mall')" class="p-2 rounded-xl text-left border transition-all text-xs flex flex-col items-center text-center gap-1"
                                [ngStyle]="{'background': selectedDemo === 'mall' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.03)', 'border-color': selectedDemo === 'mall' ? '#10b981' : 'rgba(255,255,255,0.1)', 'color': '#f0fdf4'}">
                                <i class="fa-solid fa-building-shield text-base text-emerald-400"></i>
                                <span class="font-bold">Commercial Mall</span>
                                <span class="text-[10px] text-emerald-300 opacity-75">MALL-001</span>
                            </button>

                            <button type="button" (click)="selectDemo('estate')" class="p-2 rounded-xl text-left border transition-all text-xs flex flex-col items-center text-center gap-1"
                                [ngStyle]="{'background': selectedDemo === 'estate' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.03)', 'border-color': selectedDemo === 'estate' ? '#10b981' : 'rgba(255,255,255,0.1)', 'color': '#f0fdf4'}">
                                <i class="fa-solid fa-tree-city text-base text-cyan-400"></i>
                                <span class="font-bold">Residential Estate</span>
                                <span class="text-[10px] text-cyan-300 opacity-75">RES-001</span>
                            </button>

                            <button type="button" (click)="selectDemo('municipality')" class="p-2 rounded-xl text-left border transition-all text-xs flex flex-col items-center text-center gap-1"
                                [ngStyle]="{'background': selectedDemo === 'municipality' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.03)', 'border-color': selectedDemo === 'municipality' ? '#10b981' : 'rgba(255,255,255,0.1)', 'color': '#f0fdf4'}">
                                <i class="fa-solid fa-landmark-flag text-base text-amber-400"></i>
                                <span class="font-bold">City Council</span>
                                <span class="text-[10px] text-amber-300 opacity-75">MUN-001</span>
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col gap-4">
                        <!-- Organization / Tenant Selector -->
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider mb-1.5" style="color: rgba(209,250,229,0.8);">
                                Organization Workspace <span class="text-emerald-400">*</span>
                            </label>
                            <div class="relative">
                                <select [(ngModel)]="loginInfo.tenantCode" class="w-full p-3 rounded-xl border appearance-none font-medium text-sm pr-10 cursor-pointer"
                                    style="background: #08160f; border-color: rgba(16,185,129,0.3); color: #f0fdf4;">
                                    <option value="" disabled>-- Select Organization Workspace --</option>
                                    <option *ngFor="let t of tenants" [value]="t.code">
                                        {{ t.name }} ({{ t.code }}) - [{{ t.organizationType }}]
                                    </option>
                                </select>
                                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-emerald-400">
                                    <i class="fa-solid fa-chevron-down text-xs"></i>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label for="email1" class="block text-xs font-bold uppercase tracking-wider mb-1.5" style="color: rgba(209,250,229,0.8);">Staff / Admin Email Address</label>
                            <input pInputText id="email1" type="text" placeholder="name@organization.com" class="w-full p-3 rounded-xl border text-sm" style="background: rgba(255,255,255,0.04); border-color: rgba(16,185,129,0.2); color: #f0fdf4;" [(ngModel)]="loginInfo.email" />
                        </div>

                        <div>
                            <label for="password1" class="block text-xs font-bold uppercase tracking-wider mb-1.5" style="color: rgba(209,250,229,0.8);">Password</label>
                            <p-password id="password1" [(ngModel)]="loginInfo.passwordHash" placeholder="••••••••" [toggleMask]="true" styleClass="w-full" [fluid]="true" [feedback]="false"></p-password>
                        </div>

                        <div class="flex items-center justify-between mt-1 mb-1">
                            <div class="flex items-center gap-2">
                                <p-checkbox [(ngModel)]="checked" id="rememberme1" binary></p-checkbox>
                                <label for="rememberme1" class="text-xs font-medium" style="color: rgba(209,250,229,0.65);">Remember workspace</label>
                            </div>
                            <span class="text-xs font-semibold cursor-pointer transition-colors" style="color: #34d399;" (click)="signUp()">Register Property</span>
                        </div>

                        <button pButton pRipple label="Sign In to Workspace" icon="fa-solid fa-right-to-bracket" class="w-full p-3.5 text-base font-bold rounded-xl border-none transition-all duration-300 mt-2" style="background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 20px rgba(16,185,129,0.35);" (click)="onLogin()"></button>
                    </div>
                </div>
            </div>
        </div>
    `,
    providers: [MessageService]
})
export class Login implements OnInit {
    loginInfo: LoginDto = {
        email: 'admin@smarteco.com',
        passwordHash: 'Admin123!',
        tenantCode: 'MALL-001'
    };

    checked: boolean = true;
    isLoading = false;
    errorMessage = '';
    selectedDemo = 'mall';

    tenants: TenantInfo[] = [
        { id: 1, name: 'Grand City Commercial Mall', code: 'MALL-001', organizationType: 'CommercialMall', isActive: true },
        { id: 2, name: 'Sunset Heights Residential Estate', code: 'RES-001', organizationType: 'ResidentialEstate', isActive: true },
        { id: 3, name: 'Central Metro Municipality', code: 'MUN-001', organizationType: 'Municipality', isActive: true }
    ];

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

        // Fetch tenants from public API to ensure live sync
        this.authService.getPublicTenants().subscribe({
            next: (res) => {
                if (res?.data && res.data.length > 0) {
                    this.tenants = res.data;
                }
            },
            error: () => {
                // Keep default fallback tenants list
            }
        });
    }

    selectDemo(type: string) {
        this.selectedDemo = type;
        if (type === 'mall') {
            this.loginInfo = {
                email: 'admin@smarteco.com',
                passwordHash: 'Admin123!',
                tenantCode: 'MALL-001'
            };
        } else if (type === 'estate') {
            this.loginInfo = {
                email: 'estate.manager@smarteco.com',
                passwordHash: 'Admin123!',
                tenantCode: 'RES-001'
            };
        } else if (type === 'municipality') {
            this.loginInfo = {
                email: 'council.manager@smarteco.com',
                passwordHash: 'Admin123!',
                tenantCode: 'MUN-001'
            };
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
        const message = error?.error?.message || error?.error || error?.message || 'Something went wrong. Please try again.';

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 4000
        });
    }

    onLogin() {
        this.isLoading = true;
        this.errorMessage = '';

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

        this.authService
            .login(this.loginInfo)
            .pipe(
                tap((res) => {
                    const orgType = res?.data?.organizationType || this.authService.getOrganizationType();
                    const tenantName = res?.data?.tenantName || this.authService.getTenantName();
                    this.showSuccess(`Welcome to ${tenantName} (${orgType})`);
                    this.router.navigateByUrl(returnUrl);
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

    signUp() {
        this.router.navigate(['/auth/sign-up'], {});
    }
}
