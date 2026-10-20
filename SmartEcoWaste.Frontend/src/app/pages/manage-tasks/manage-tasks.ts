import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { MessageService } from 'primeng/api';
import { CollectionTaskService } from '@/core/services/collection-task.service';
import {
    CreateCollectionTaskDto,
    ResponseCollectionTaskDto,
    ResponseInspectionLogDto,
    SubmitInspectionDto
} from 'src/assets/interfaces/commercial-saas-dtos';

@Component({
    selector: 'app-manage-tasks',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TagModule,
        ToastModule,
        SliderModule
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card flex flex-col gap-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-0 m-0">Collection & Inspection Workflows</h2>
                    <p class="text-muted-color text-sm mt-1 mb-0">Track contractor tasks, verify QR code inspections, and audit waste conditions.</p>
                </div>
                <div class="flex gap-2">
                    <button pButton label="New Task" icon="pi pi-plus" class="p-button-primary" (click)="openNewTaskDialog()"></button>
                    <button pButton label="Field QR Scan" icon="pi pi-qrcode" class="p-button-success" (click)="openInspectionDialog()"></button>
                </div>
            </div>

            <!-- Task Board Table -->
            <p-table [value]="tasks" [paginator]="true" [rows]="10" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th>ID</th>
                        <th>Task Title</th>
                        <th>Bin Tag</th>
                        <th>Zone / Property</th>
                        <th>Assigned / Contractor</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-t>
                    <tr>
                        <td>#{{ t.id }}</td>
                        <td><span class="font-bold">{{ t.title }}</span></td>
                        <td><p-tag [value]="t.binTag || ('Bin #' + t.binId)" severity="secondary"></p-tag></td>
                        <td>{{ t.zoneName || 'Main' }} <span *ngIf="t.propertyName" class="text-muted-color text-xs">({{ t.propertyName }})</span></td>
                        <td>{{ t.contractorName || t.assignedUserName || 'Unassigned' }}</td>
                        <td><p-tag [value]="getStatusName(t.status)" [severity]="getStatusSeverity(t.status)"></p-tag></td>
                        <td>{{ t.dueDate | date:'mediumDate' }}</td>
                        <td class="flex gap-2">
                            <button *ngIf="t.status === 0 || t.status === 'Pending'" pButton icon="pi pi-play" class="p-button-outlined p-button-sm p-button-info" (click)="startTask(t)" pTooltip="Start Work"></button>
                            <button *ngIf="t.status === 1 || t.status === 'InProgress'" pButton icon="pi pi-check" class="p-button-outlined p-button-sm p-button-success" (click)="completeTask(t)" pTooltip="Mark Complete"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Inspection & Anomaly Feed -->
            <div class="mt-6 border-t border-surface-200 dark:border-surface-700 pt-6">
                <h3 class="text-xl font-bold mb-4 text-surface-900 dark:text-surface-0">Recent Inspection Audit Logs</h3>
                <p-table [value]="inspections" [paginator]="true" [rows]="5" responsiveLayout="scroll">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Bin</th>
                            <th>Inspector</th>
                            <th>Fill Level</th>
                            <th>Measured Weight</th>
                            <th>QR Scanned</th>
                            <th>Condition</th>
                            <th>Anomaly</th>
                            <th>Supervisor Approval</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-ins>
                        <tr>
                            <td>{{ ins.binTag || ('#' + ins.binId) }}</td>
                            <td>{{ ins.inspectorUserName }}</td>
                            <td>{{ ins.fillLevelPercentage }}%</td>
                            <td>{{ ins.measuredWeightKg ? ins.measuredWeightKg + ' kg' : 'N/A' }}</td>
                            <td>
                                <i class="pi" [ngClass]="ins.qrCodeScanned ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'"></i>
                            </td>
                            <td>{{ getConditionName(ins.condition) }}</td>
                            <td>
                                <p-tag *ngIf="ins.hasAnomaly" [value]="ins.anomalyReason || 'Anomaly Flagged'" severity="danger"></p-tag>
                                <span *ngIf="!ins.hasAnomaly" class="text-muted-color text-xs">None</span>
                            </td>
                            <td>
                                <p-tag *ngIf="ins.isApproved" value="Approved" severity="success"></p-tag>
                                <button *ngIf="!ins.isApproved" pButton label="Review & Approve" icon="pi pi-shield" class="p-button-warning p-button-sm" (click)="approveAnomaly(ins)"></button>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Dialog: New Task -->
        <p-dialog [(visible)]="displayNewTaskDialog" [modal]="true" header="Create Collection Task" [style]="{ width: '450px' }">
            <div class="flex flex-col gap-4 py-2">
                <div>
                    <label class="block text-sm font-semibold mb-1">Task Title</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="newTask.title" placeholder="E.g., Morning Food Court Waste Pickup" />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Bin ID</label>
                    <input pInputText type="number" class="w-full" [(ngModel)]="newTask.binId" placeholder="Bin ID number" />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Contractor / Team Name</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="newTask.contractorName" placeholder="E.g., EcoClean Services Ltd" />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Instructions</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="newTask.instructions" placeholder="Special handling or disposal notes" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" class="p-button-text" (click)="displayNewTaskDialog = false"></button>
                <button pButton label="Schedule Task" icon="pi pi-calendar-plus" (click)="saveTask()"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog: Field Inspection & QR Scan -->
        <p-dialog [(visible)]="displayInspectionDialog" [modal]="true" header="Field Inspection & Collection Log" [style]="{ width: '500px' }">
            <div class="flex flex-col gap-4 py-2">
                <div>
                    <label class="block text-sm font-semibold mb-1">Bin ID (from QR Scan)</label>
                    <input pInputText type="number" class="w-full" [(ngModel)]="newInspection.binId" placeholder="Scan or enter Bin ID" />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Fill Level: {{ newInspection.fillLevelPercentage }}%</label>
                    <p-slider [(ngModel)]="newInspection.fillLevelPercentage" [min]="0" [max]="100"></p-slider>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Measured Weight (kg)</label>
                    <input pInputText type="number" class="w-full" [(ngModel)]="newInspection.measuredWeightKg" placeholder="Measured scale weight in kg" />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Condition</label>
                    <select class="w-full p-2 border rounded border-surface-300 dark:border-surface-600 dark:bg-surface-900" [(ngModel)]="newInspection.condition">
                        <option [value]="0">Normal Clean</option>
                        <option [value]="1">Overflowing</option>
                        <option [value]="2">Contaminated Waste</option>
                        <option [value]="3">Damaged Lid / Pedal</option>
                        <option [value]="4">Vandalized / Graffiti</option>
                        <option [value]="5">Foul Odour / Infestation</option>
                        <option [value]="6">Missing Bin</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Photo Proof URL (Optional)</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="newInspection.photoProofUrl" placeholder="https://..." />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Notes / Anomaly Details</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="newInspection.notes" placeholder="Observations or contractor comments" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" class="p-button-text" (click)="displayInspectionDialog = false"></button>
                <button pButton label="Submit Verification" icon="pi pi-check" (click)="saveInspection()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class ManageTasks implements OnInit {
    private taskService = inject(CollectionTaskService);
    private messageService = inject(MessageService);

    tasks: ResponseCollectionTaskDto[] = [];
    inspections: ResponseInspectionLogDto[] = [];
    loading = false;

    displayNewTaskDialog = false;
    displayInspectionDialog = false;

    newTask: CreateCollectionTaskDto = {
        binId: 0,
        title: '',
        scheduledAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 86400000).toISOString()
    };

    newInspection: SubmitInspectionDto = {
        binId: 0,
        qrCodeScanned: true,
        fillLevelPercentage: 50,
        condition: 0,
        hasAnomaly: false
    };

    ngOnInit(): void {
        this.loadTasks();
        this.loadInspections();
    }

    loadTasks(): void {
        this.loading = true;
        this.taskService.getAllTasks().subscribe({
            next: (res) => {
                this.tasks = res.data || [];
                this.loading = false;
            },
            error: () => (this.loading = false)
        });
    }

    loadInspections(): void {
        this.taskService.getInspections().subscribe({
            next: (res) => {
                this.inspections = res.data || [];
            }
        });
    }

    openNewTaskDialog(): void {
        this.newTask = {
            binId: 1,
            title: '',
            scheduledAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 86400000).toISOString()
        };
        this.displayNewTaskDialog = true;
    }

    saveTask(): void {
        if (!this.newTask.title || !this.newTask.binId) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Title and Bin ID are required' });
            return;
        }
        this.taskService.createTask(this.newTask).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Collection task scheduled' });
                this.displayNewTaskDialog = false;
                this.loadTasks();
            }
        });
    }

    startTask(task: ResponseCollectionTaskDto): void {
        this.taskService.updateTaskStatus(task.id, 1).subscribe({
            next: () => {
                this.messageService.add({ severity: 'info', summary: 'Updated', detail: 'Task marked In Progress' });
                this.loadTasks();
            }
        });
    }

    completeTask(task: ResponseCollectionTaskDto): void {
        this.taskService.updateTaskStatus(task.id, 2).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Completed', detail: 'Task completed' });
                this.loadTasks();
            }
        });
    }

    openInspectionDialog(): void {
        this.newInspection = {
            binId: 1,
            qrCodeScanned: true,
            fillLevelPercentage: 50,
            condition: 0,
            hasAnomaly: false
        };
        this.displayInspectionDialog = true;
    }

    saveInspection(): void {
        if (!this.newInspection.binId) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Bin ID is required' });
            return;
        }
        this.newInspection.hasAnomaly = Number(this.newInspection.condition) !== 0;
        this.taskService.submitInspection(this.newInspection).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Verified', detail: 'Inspection logged' });
                this.displayInspectionDialog = false;
                this.loadTasks();
                this.loadInspections();
            }
        });
    }

    approveAnomaly(ins: ResponseInspectionLogDto): void {
        this.taskService.approveAnomaly(ins.id, 'Approved by supervisor on audit').subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Anomaly closed' });
                this.loadInspections();
            }
        });
    }

    getStatusName(status: number | string): string {
        const statuses = ['Pending', 'In Progress', 'Completed', 'Overdue', 'Requires Approval', 'Cancelled'];
        return statuses[Number(status)] || 'Pending';
    }

    getStatusSeverity(status: number | string): 'secondary' | 'info' | 'success' | 'warn' | 'danger' | 'contrast' {
        const s = Number(status);
        if (s === 1) return 'info';
        if (s === 2) return 'success';
        if (s === 3) return 'danger';
        if (s === 4) return 'warn';
        return 'secondary';
    }

    getConditionName(cond: number | string): string {
        const conditions = ['Clean / Normal', 'Overflowing', 'Contaminated', 'Damaged Lid/Pedal', 'Vandalized', 'Foul Odour', 'Missing Bin'];
        return conditions[Number(cond)] || 'Normal';
    }
}
