import { UserService } from '@/core/services/user.service';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
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
export class ManageUsers implements OnInit {
    users = signal<User[]>([]);
    candidateUsers = signal<any[]>([]);
    pendingUsers = signal<any[]>([]);

    roles: Roles[] = [];
    selectedRole: Roles = {} as Roles;
    selectedUser: UpdateRoleDto = {} as UpdateRoleDto;

    submitted: boolean = false;
    isLoading = false;
    updateUserDialog = false;

    // Add Existing User as Staff Dialog
    addStaffDialog = false;
    selectedCandidateUser: any = null;

    // Pending User Approvals Dialog
    pendingDialog = false;

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
        private messageService: MessageService,
        private userService: UserService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadUsers();
        this.loadPendingUsers();
    }

    loadPendingUsers() {
        this.userService
            .getPendingApprovals()
            .pipe(
                tap((res) => {
                    this.pendingUsers.set(res?.data || []);
                }),
                catchError(() => []),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    openPendingDialog() {
        this.loadPendingUsers();
        this.pendingDialog = true;
    }

    approveRegistration(user: any) {
        this.confirmationService.confirm({
            message: `Approve account for '${user.name}' (${user.email})? They will be granted access to your organization workspace.`,
            header: 'Approve User Registration',
            icon: 'pi pi-check-circle',
            accept: () => {
                this.isLoading = true;
                this.userService
                    .approveUser(user.id)
                    .pipe(
                        tap((res) => {
                            this.showSuccess(res.message || `'${user.name}' approved successfully.`);
                            this.loadPendingUsers();
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

    rejectRegistration(user: any) {
        this.confirmationService.confirm({
            message: `Reject and delete registration request for '${user.name}'?`,
            header: 'Reject Registration',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.isLoading = true;
                this.userService
                    .rejectUser(user.id)
                    .pipe(
                        tap((res) => {
                            this.showSuccess(res.message || 'Registration rejected.');
                            this.loadPendingUsers();
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

    loadUsers() {
        this.isLoading = true;

        this.userService
            .getAll()
            .pipe(
                tap((res) => {
                    this.users.set(res.data || []);
                    this.getAllRoles();
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
                    this.roles = res.data;
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

    openAddStaffDialog() {
        const available = this.users()
            .filter((u: any) => u.roleName !== 'Staff' && u.roleName !== 'Admin')
            .map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                roleName: u.roleName,
                tenantName: u.tenantName,
                displayName: `${u.name} (${u.email}) [${u.tenantName || 'Tenant #' + u.tenantId}]`
            }));
        this.candidateUsers.set(available);
        this.selectedCandidateUser = null;
        this.addStaffDialog = true;
    }

    saveAddStaff() {
        if (!this.selectedCandidateUser) {
            this.showError({ message: 'Please select an existing user to promote to Staff.' });
            return;
        }

        this.isLoading = true;
        this.userService
            .makeStaff(this.selectedCandidateUser.id)
            .pipe(
                tap((res) => {
                    this.showSuccess(res.message || 'User successfully promoted to Staff.');
                    this.addStaffDialog = false;
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

    promoteToStaff(user: User) {
        this.confirmationService.confirm({
            message: `Are you sure you want to add '${user.name}' as Staff? They will be able to log in and receive assigned bin collection tasks.`,
            header: 'Add User as Staff',
            icon: 'pi pi-user-plus',
            accept: () => {
                this.isLoading = true;
                this.userService
                    .makeStaff(user.id)
                    .pipe(
                        tap((res) => {
                            this.showSuccess(res.message || `'${user.name}' has been added as Staff.`);
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

    updateRole(user: User) {
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
                    this.showSuccess('User role updated successfully');
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

    getRoleSeverity(roleName: string): string {
        switch (roleName?.toLowerCase()) {
            case 'admin':
                return 'danger';
            case 'staff':
                return 'success';
            case 'supervisor':
                return 'warn';
            default:
                return 'info';
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hideDialog() {
        this.updateUserDialog = false;
        this.addStaffDialog = false;
        this.pendingDialog = false;
    }
}
