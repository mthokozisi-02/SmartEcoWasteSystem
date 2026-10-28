import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { UserService } from '@/core/services/user.service';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, ProgressSpinner],
    template: `
        <div class="flex items-center justify-center min-h-screen min-w-screen overflow-hidden relative py-12 px-4" style="background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 40%, #f8fafc 100%);">
            <div class="relative z-10 w-full max-w-md">
                <div class="p-8 md:p-10 rounded-3xl relative overflow-hidden bg-white text-center" style="border: 1px solid #e2e8f0; box-shadow: 0 20px 45px -10px rgba(16, 185, 129, 0.12), 0 10px 25px -5px rgba(0, 0, 0, 0.04);">
                    
                    <!-- Loading state -->
                    <div *ngIf="isLoading" class="py-12">
                        <p-progressSpinner></p-progressSpinner>
                        <h3 class="text-xl font-bold mt-4 text-slate-800">Verifying Email...</h3>
                        <p class="text-sm text-slate-500 mt-2">Please wait while we confirm your email address.</p>
                    </div>

                    <!-- Success state -->
                    <div *ngIf="!isLoading && isSuccess">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <i class="fa-solid fa-circle-check text-3xl"></i>
                        </div>
                        <h2 class="text-2xl font-extrabold text-slate-900 mb-2">Email Verified!</h2>
                        <p class="text-sm text-slate-600 mb-6 leading-relaxed">{{ message }}</p>
                        
                        <a routerLink="/auth/login" pButton label="Sign In to Your Account" icon="fa-solid fa-arrow-right" class="w-full p-3.5 font-bold rounded-xl border-none" style="background: linear-gradient(135deg, #10b981, #059669); color: white;"></a>
                    </div>

                    <!-- Error state -->
                    <div *ngIf="!isLoading && !isSuccess">
                        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-rose-50 text-rose-600 border border-rose-200">
                            <i class="fa-solid fa-circle-xmark text-3xl"></i>
                        </div>
                        <h2 class="text-2xl font-extrabold text-slate-900 mb-2">Verification Failed</h2>
                        <p class="text-sm text-slate-600 mb-6 leading-relaxed">{{ message }}</p>

                        <div class="flex flex-col gap-3">
                            <a routerLink="/auth/sign-up" pButton label="Back to Registration" icon="fa-solid fa-user-plus" class="w-full p-3 font-semibold rounded-xl" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;"></a>
                            <a routerLink="/auth/login" class="text-sm font-bold text-emerald-600 hover:text-emerald-700">Already verified? Sign In</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class VerifyEmail implements OnInit {
    isLoading = true;
    isSuccess = false;
    message = '';

    constructor(
        private route: ActivatedRoute,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        const token = this.route.snapshot.queryParams['token'];
        const email = this.route.snapshot.queryParams['email'];

        if (!token || !email) {
            this.isLoading = false;
            this.isSuccess = false;
            this.message = 'Missing verification parameters. Please use the exact link sent to your email address.';
            return;
        }

        this.userService.verifyEmail(email, token).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.isSuccess = res?.isSuccess ?? true;
                this.message = res?.data || res?.message || 'Email verified successfully! You may now sign in.';
            },
            error: (err) => {
                this.isLoading = false;
                this.isSuccess = false;
                this.message = err?.error?.message || err?.error || err?.message || 'Verification token is invalid or has expired.';
            }
        });
    }
}
