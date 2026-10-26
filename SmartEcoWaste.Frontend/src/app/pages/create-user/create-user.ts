import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { User } from 'src/assets/interfaces/user';
import { CommonModule, DatePipe } from '@angular/common';
import { CreateUserDto } from 'src/assets/interfaces/create-user-dto';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from '@/core/services/user.service';
import { AuthService } from '@/core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-create-user',
    standalone: true,
    imports: [
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
        ConfirmDialogModule
    ],
    templateUrl: './create-user.html',
    styleUrl: './create-user.scss',
    providers: [MessageService, ConfirmationService, UserService]
})
export class CreateUser implements OnInit {
    users = signal<User[]>([]);
    activeTenantName = signal<string>('');
    activeTenantId = signal<number>(0);

    newUser: CreateUserDto = {} as CreateUserDto;

    submitted: boolean = false;

    private destroyRef = inject(DestroyRef);

    isLoading = false;
    createUserDialog = false;

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
        private messageService: MessageService,
        private userService: UserService,
        private authService: AuthService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.activeTenantId.set(this.authService.getTenantId());
        this.activeTenantName.set(this.authService.getTenantName());
        this.loadUsers();
    }

    saveUser() {
        this.isLoading = true;

        // Ensure newly created user inherits the active logged-in tenant
        const activeTenantId = this.authService.getTenantId();
        if (activeTenantId && activeTenantId > 0) {
            this.newUser.tenantId = activeTenantId;
        }
        const activeTenantCode = this.authService.getTenantCode();
        if (activeTenantCode) {
            this.newUser.tenantCode = activeTenantCode;
        }

        this.userService
            .createUser(this.newUser)
            .pipe(
                tap(() => {
                    this.showSuccess('User created successfully in your organization');
                    this.loadUsers();
                }),
                catchError((err) => {
                    this.showError(err);
                    return [];
                }),
                finalize(() => {
                    this.isLoading = false;
                    this.createUserDialog = false;
                    this.newUser = {} as CreateUserDto;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    loadUsers() {
        this.isLoading = true;

        this.userService
            .getAll()
            .pipe(
                tap((res) => {
                    this.users.set(res.data);
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

    deleteUser(id: number) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete this user?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.isLoading = true;

                this.userService
                    .deleteUser(id)
                    .pipe(
                        tap(() => {
                            this.showSuccess('User deleted successfully');
                            this.loadUsers();
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
        });
    }

    hideDialog() {
        this.createUserDialog = false;
    }

    createUser() {
        this.createUserDialog = true;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
