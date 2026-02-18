import { UserService } from '@/core/services/user.service';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { tap, catchError, finalize } from 'rxjs';
import { Roles } from 'src/assets/interfaces/roles';
import { UpdateRoleDto } from 'src/assets/interfaces/update-role-dto';
import { User } from 'src/assets/interfaces/user';

@Component({
    selector: 'app-manage-users',
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
        ConfirmDialogModule,
        BadgeModule,
        SelectModule
    ],
    templateUrl: './manage-users.html',
    styleUrl: './manage-users.scss',
    providers: [MessageService, ConfirmationService]
})
export class ManageUsers {
    users = signal<User[]>([]);

    roles: Roles[] = [];
    selectedRole: Roles = {} as Roles;

    selectedUser: UpdateRoleDto = {} as UpdateRoleDto;

    submitted: boolean = false;

    private destroyRef = inject(DestroyRef);

    isLoading = false;
    updateUserDialog = false;

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
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.isLoading = true;

        this.userService
            .getAll()
            .pipe(
                tap((res) => {
                    (this.users.set(res.data), this.getAllRoles());
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

    getAllRoles() {
        this.isLoading = true;

        this.userService
            .getAllRoles()
            .pipe(
                tap((res) => {
                    ((this.roles = res.data), console.log('roles:', res));
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

    updateRole(user: User) {
        console.log(user.role);
        this.selectedRole = user.role;
        this.selectedUser.userId = user.id;
        this.updateUserDialog = true;
    }

    saveRole() {
        this.isLoading = true;
        this.selectedUser.roleId = this.selectedRole?.id;

        this.userService
            .UpdateRole(this.selectedUser)
            .pipe(
                tap(() => {
                    this.showSuccess('User updated successfully');
                    this.updateUserDialog = false;
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

    deleteUser(id: number) {
        console.log(id);
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

    userSeverity(user: User) {
        if (user.userPoints === 0) return 'danger';
        else if (user.userPoints > 0 && user.userPoints < 500) return 'warn';
        else return 'success';
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hideDialog() {
        this.updateUserDialog = false;
    }
}
