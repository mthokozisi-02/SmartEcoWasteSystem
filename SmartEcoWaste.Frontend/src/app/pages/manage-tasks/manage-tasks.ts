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
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ImageModule } from 'primeng/image';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CollectionTaskService } from '@/core/services/collection-task.service';
import { BinService } from '@/core/services/bin.service';
import { UserService } from '@/core/services/user.service';
import { AuthService } from '@/core/services/auth.service';
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
        SliderModule,
        SelectModule,
        ProgressSpinnerModule,
        ImageModule,
        TextareaModule,
        TooltipModule
    ],
    providers: [MessageService],
    template: `
        <div *ngIf="isUploading" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); display: flex; align-items: center; justify-content: center; z-index: 9999">
            <p-progressSpinner></p-progressSpinner>
        </div>
        <p-toast></p-toast>
        <div class="card flex flex-col gap-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-0 m-0">Collection & Inspection Workflows</h2>
                    <p class="text-muted-color text-sm mt-1 mb-0">Track contractor tasks, verify QR code inspections, and audit waste conditions.</p>
                </div>
                <div class="flex gap-2">
                    <button *ngIf="userRole !== 'Staff'" pButton label="New Task" icon="pi pi-plus" class="p-button-primary" (click)="openNewTaskDialog()"></button>
                    <button *ngIf="userRole === 'Staff'" pButton label="Field QR Scan" icon="pi pi-qrcode" class="p-button-success" (click)="openInspectionDialog()"></button>
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
                            <button *ngIf="userRole !== 'Staff'" pButton icon="pi pi-pencil" class="p-button-outlined p-button-sm p-button-warn" (click)="openEditTaskDialog(t)" pTooltip="Edit / Reassign Task"></button>
                            <button *ngIf="t.status === 0 || t.status === 'Pending'" pButton icon="pi pi-play" class="p-button-outlined p-button-sm p-button-info" (click)="startTask(t)" pTooltip="Start Work"></button>
                            <button *ngIf="t.status === 1 || t.status === 'InProgress'" pButton icon="pi pi-camera" label="Complete" class="p-button-outlined p-button-sm p-button-success" (click)="openCompleteTaskDialog(t)" pTooltip="Complete Task with Photo"></button>
                            <button *ngIf="t.photoProofUrl" pButton icon="pi pi-image" class="p-button-outlined p-button-sm p-button-secondary" (click)="openTaskProofDialog(t)" pTooltip="View Photo Proof"></button>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="8" class="text-center py-6 text-muted-color">
                            No tasks found for your workspace.
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
                            <th>Photo Proof</th>
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
                                <p-image *ngIf="ins.photoProofUrl" [src]="ins.photoProofUrl" [preview]="true" alt="Inspection Proof" width="44" imageClass="w-11 h-11 object-cover rounded-lg shadow-sm border border-surface-200 dark:border-surface-700"></p-image>
                                <span *ngIf="!ins.photoProofUrl" class="text-muted-color text-xs italic">No photo</span>
                            </td>
                            <td>
                                <div class="flex items-center gap-2">
                                    <p-tag *ngIf="ins.isApproved" value="Approved" severity="success"></p-tag>
                                    <button pButton label="Review" icon="pi pi-search" class="p-button-sm" [ngClass]="ins.isApproved ? 'p-button-outlined p-button-secondary' : 'p-button-warning'" (click)="openReviewInspectionDialog(ins)" [pTooltip]="ins.isApproved ? 'View Details' : 'Review & Approve / Reject'"></button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- Dialog: New Task -->
        <p-dialog [(visible)]="displayNewTaskDialog" [modal]="true" header="Create Collection Task" [style]="{ width: '500px' }">
            <div class="flex flex-col gap-4 py-2">
                <div>
                    <label class="block text-sm font-semibold mb-1">Task Title</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="newTask.title" placeholder="E.g., Morning Food Court Waste Pickup" />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Select Bin</label>
                    <p-select
                        [options]="binOptions"
                        [(ngModel)]="newTask.binId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Choose a bin..."
                        [filter]="true"
                        filterPlaceholder="Search bins..."
                        appendTo="body"
                        class="w-full"
                        styleClass="w-full">
                    </p-select>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Assign Staff Member</label>
                    <p-select
                        [options]="contractorOptions"
                        [(ngModel)]="newTask.assignedUserId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Choose staff member..."
                        [filter]="true"
                        filterPlaceholder="Search staff..."
                        appendTo="body"
                        class="w-full"
                        styleClass="w-full">
                    </p-select>
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

        <!-- Dialog: Edit / Reassign Task -->
        <p-dialog [(visible)]="displayEditTaskDialog" [modal]="true" header="Edit & Reassign Task" [style]="{ width: '500px' }">
            <div class="flex flex-col gap-4 py-2" *ngIf="selectedTaskForEdit">
                <div>
                    <label class="block text-sm font-semibold mb-1">Task Title</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="selectedTaskForEdit.title" placeholder="Task Title" />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Select Bin</label>
                    <p-select
                        [options]="binOptions"
                        [(ngModel)]="selectedTaskForEdit.binId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Choose a bin..."
                        [filter]="true"
                        filterPlaceholder="Search bins..."
                        appendTo="body"
                        class="w-full"
                        styleClass="w-full">
                    </p-select>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Assign Staff Member</label>
                    <p-select
                        [options]="contractorOptions"
                        [(ngModel)]="selectedTaskForEdit.assignedUserId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Choose staff member..."
                        [filter]="true"
                        filterPlaceholder="Search staff..."
                        appendTo="body"
                        class="w-full"
                        styleClass="w-full">
                    </p-select>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Due Date</label>
                    <input pInputText type="date" class="w-full" [(ngModel)]="editTaskDueDate" />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Status</label>
                    <p-select
                        [options]="statusOptions"
                        [(ngModel)]="selectedTaskForEdit.status"
                        optionLabel="label"
                        optionValue="value"
                        appendTo="body"
                        class="w-full"
                        styleClass="w-full">
                    </p-select>
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Instructions</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="selectedTaskForEdit.instructions" placeholder="Special handling notes" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" class="p-button-text" (click)="displayEditTaskDialog = false"></button>
                <button pButton label="Update Task" icon="pi pi-check" (click)="saveEditTask()"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog: Complete Task with Photo Proof -->
        <p-dialog [(visible)]="displayCompleteTaskDialog" [modal]="true" header="Complete Task & Attach Photo Proof" [style]="{ width: '480px' }">
            <div class="flex flex-col gap-4 py-2" *ngIf="selectedTaskForCompletion">
                <div class="p-3 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg">
                    <div class="text-xs uppercase font-bold text-muted-color mb-1">Task Details</div>
                    <div class="font-bold text-base text-surface-900 dark:text-surface-0 mb-1">#{{ selectedTaskForCompletion.id }} - {{ selectedTaskForCompletion.title }}</div>
                    <div class="text-xs text-muted-color">Bin: {{ selectedTaskForCompletion.binTag || ('#' + selectedTaskForCompletion.binId) }}</div>
                </div>

                <!-- Photo Capture Section -->
                <div>
                    <label class="block text-sm font-semibold mb-2">Photo Proof (Take photo of emptied bin)</label>

                    <!-- Preview -->
                    <div *ngIf="completePhotoPreviewUrl" class="relative rounded-xl overflow-hidden mb-2" style="max-height: 220px; border: 1px solid rgba(16,185,129,0.3);">
                        <img [src]="completePhotoPreviewUrl" alt="Emptied bin proof preview" class="w-full object-cover rounded-xl" style="max-height: 220px;" />
                        <button type="button" (click)="removeCompletePhoto()"
                                class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-none cursor-pointer shadow-lg">
                            <i class="pi pi-times text-xs"></i>
                        </button>
                    </div>

                    <!-- File & Camera Chooser -->
                    <div *ngIf="!completePhotoPreviewUrl" class="flex flex-col gap-2">
                        <input type="file" #completeCameraInput (change)="onCompletePhotoSelected($event)" accept="image/*" capture="environment" class="hidden" />
                        <button type="button" (click)="completeCameraInput.click()" pButton pRipple
                                class="w-full py-4 rounded-xl border border-dashed flex items-center justify-center gap-2"
                                style="background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.3); color: #10b981;">
                            <i class="pi pi-camera text-xl"></i>
                            <span class="text-sm font-bold">Take Photo of Emptied Bin</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-semibold mb-1">Completion Notes (Optional)</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="completionNotes" placeholder="E.g., Bin fully emptied and sanitized" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" class="p-button-text" (click)="displayCompleteTaskDialog = false"></button>
                <button pButton label="Mark Task Complete" icon="pi pi-check" severity="success" (click)="submitCompleteTaskWithPhoto()"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog: Field Inspection & QR Scan -->
        <p-dialog [(visible)]="displayInspectionDialog" [modal]="true" header="Field Inspection & Collection Log" [style]="{ width: '500px' }">
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <div class="flex items-start gap-2">
                    <i class="pi pi-info-circle text-blue-500 mt-0.5"></i>
                    <p class="text-sm text-blue-700 dark:text-blue-300 m-0">
                        Use this form when doing a physical bin inspection. Record the fill level, condition, and capture a photo.
                    </p>
                </div>
            </div>
            <div class="flex flex-col gap-4 py-2">
                <div>
                    <label class="block text-sm font-semibold mb-1">Bin (from QR Scan)</label>
                    <p-select
                        [options]="binOptions"
                        [(ngModel)]="newInspection.binId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Scan or select bin..."
                        [filter]="true"
                        filterPlaceholder="Search bins..."
                        class="w-full"
                        styleClass="w-full">
                    </p-select>
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

                <!-- Photo Proof (Take Photo option) -->
                <div>
                    <label class="block text-sm font-semibold mb-2">Photo Proof (Optional)</label>
                    <div *ngIf="inspectionPhotoPreviewUrl" class="relative rounded-xl overflow-hidden mb-2" style="max-height: 200px; border: 1px solid rgba(16,185,129,0.3);">
                        <img [src]="inspectionPhotoPreviewUrl" alt="Inspection photo preview" class="w-full object-cover rounded-xl" style="max-height: 200px;" />
                        <button type="button" (click)="removeInspectionPhoto()"
                                class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-none cursor-pointer shadow-lg">
                            <i class="pi pi-times text-xs"></i>
                        </button>
                    </div>

                    <div *ngIf="!inspectionPhotoPreviewUrl" class="flex flex-col gap-2">
                        <input type="file" #inspectionCameraInput (change)="onInspectionPhotoSelected($event)" accept="image/*" capture="environment" class="hidden" />
                        <button type="button" (click)="inspectionCameraInput.click()" pButton pRipple
                                class="w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2"
                                style="background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.3); color: #10b981;">
                            <i class="pi pi-camera text-lg"></i>
                            <span class="text-sm font-semibold">Take or Select Photo</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-semibold mb-1">Notes / Observations</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="newInspection.notes" placeholder="Observations or remarks" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" class="p-button-text" (click)="displayInspectionDialog = false"></button>
                <button pButton label="Submit Verification" icon="pi pi-check" (click)="saveInspection()"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog: Review Inspection & Proof -->
        <p-dialog [(visible)]="displayReviewDialog" [modal]="true" header="Inspection Audit & Photo Proof" [style]="{ width: '600px', maxWidth: '95vw' }">
            <div *ngIf="selectedInspection" class="flex flex-col gap-4 py-2">
                <!-- Photo Proof Preview -->
                <div class="flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-800 p-3 rounded-xl border border-surface-200 dark:border-surface-700">
                    <div *ngIf="selectedInspection.photoProofUrl" class="w-full flex flex-col items-center">
                        <p-image [src]="selectedInspection.photoProofUrl" [preview]="true" alt="Inspection Proof" width="100%" imageClass="max-h-72 object-contain rounded-lg shadow-md mx-auto"></p-image>
                        <span class="text-xs text-muted-color mt-2"><i class="pi pi-search-plus mr-1"></i>Click photo to enlarge full-screen</span>
                    </div>
                    <div *ngIf="!selectedInspection.photoProofUrl" class="py-8 text-center text-muted-color">
                        <i class="pi pi-image text-4xl mb-2 text-surface-400"></i>
                        <p class="m-0 text-sm">No photo proof was attached for this inspection.</p>
                    </div>
                </div>

                <!-- Meta Info Grid -->
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <span class="text-xs text-muted-color block">Target Bin</span>
                        <span class="font-bold">{{ selectedInspection.binTag || ('#' + selectedInspection.binId) }}</span>
                    </div>
                    <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <span class="text-xs text-muted-color block">Inspector / Staff</span>
                        <span class="font-bold">{{ selectedInspection.inspectorUserName }}</span>
                    </div>
                    <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <span class="text-xs text-muted-color block">Fill Level</span>
                        <span class="font-bold">{{ selectedInspection.fillLevelPercentage }}%</span>
                    </div>
                    <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <span class="text-xs text-muted-color block">Measured Weight</span>
                        <span class="font-bold">{{ selectedInspection.measuredWeightKg ? selectedInspection.measuredWeightKg + ' kg' : 'N/A' }}</span>
                    </div>
                    <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <span class="text-xs text-muted-color block">Physical Condition</span>
                        <span class="font-bold">{{ getConditionName(selectedInspection.condition) }}</span>
                    </div>
                    <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <span class="text-xs text-muted-color block">On-Site QR Status</span>
                        <span class="font-bold" [ngClass]="selectedInspection.qrCodeScanned ? 'text-green-500' : 'text-red-500'">
                            {{ selectedInspection.qrCodeScanned ? 'Verified On-Site' : 'Not Verified' }}
                        </span>
                    </div>
                </div>

                <!-- Flagged Anomaly Details -->
                <div *ngIf="selectedInspection.hasAnomaly" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <span class="text-xs font-bold text-red-700 dark:text-red-300 block mb-1">Flagged Anomaly</span>
                    <span class="text-sm text-red-600 dark:text-red-400">{{ selectedInspection.anomalyReason || 'Anomaly flagged during field inspection' }}</span>
                </div>

                <!-- Inspector Remarks -->
                <div *ngIf="selectedInspection.notes" class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                    <span class="text-xs text-muted-color block mb-1">Inspector Notes</span>
                    <span class="text-sm">{{ selectedInspection.notes }}</span>
                </div>

                <!-- Resolution / Rework Notes -->
                <div>
                    <label class="block text-sm font-semibold mb-1">Audit / Resolution Notes</label>
                    <textarea pTextarea [(ngModel)]="reviewNotes" rows="2" class="w-full" placeholder="Enter approval resolution or rework instructions..."></textarea>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <div class="flex justify-between items-center w-full">
                    <button pButton label="Cancel" class="p-button-text" (click)="displayReviewDialog = false"></button>
                    <div class="flex gap-2">
                        <button *ngIf="!selectedInspection?.isApproved" pButton label="Reject / Request Rework" icon="pi pi-times" class="p-button-danger" (click)="rejectCurrentInspection()"></button>
                        <button *ngIf="!selectedInspection?.isApproved" pButton label="Approve & Resolve" icon="pi pi-check" class="p-button-success" (click)="approveCurrentInspection()"></button>
                        <p-tag *ngIf="selectedInspection?.isApproved" value="Approved by {{ selectedInspection?.approvedByUserName || 'Supervisor' }}" severity="success"></p-tag>
                    </div>
                </div>
            </ng-template>
        </p-dialog>

        <!-- Dialog: Task Execution Proof -->
        <p-dialog [(visible)]="displayTaskProofDialog" [modal]="true" header="Task Execution Photo Proof" [style]="{ width: '500px', maxWidth: '95vw' }">
            <div *ngIf="taskProofToView" class="flex flex-col gap-3 py-2 items-center">
                <p-image *ngIf="taskProofToView.photoProofUrl" [src]="taskProofToView.photoProofUrl" [preview]="true" alt="Task Proof" width="100%" imageClass="max-h-80 object-contain rounded-lg shadow-md mx-auto"></p-image>
                <div class="w-full bg-surface-50 dark:bg-surface-800 p-3 rounded-lg text-sm flex flex-col gap-1">
                    <div class="font-bold text-base">{{ taskProofToView.title }}</div>
                    <div class="text-muted-color">Bin: <span class="font-semibold text-surface-900 dark:text-surface-0">{{ taskProofToView.binTag || ('#' + taskProofToView.binId) }}</span></div>
                    <div class="text-muted-color">Executed by: <span class="font-semibold text-surface-900 dark:text-surface-0">{{ taskProofToView.contractorName || taskProofToView.assignedUserName || 'Staff' }}</span></div>
                    <div class="text-muted-color">Status: <span class="font-semibold text-surface-900 dark:text-surface-0">{{ getStatusName(taskProofToView.status) }}</span></div>
                    <div *ngIf="taskProofToView.completedAt" class="text-muted-color">Completed At: <span class="font-semibold text-surface-900 dark:text-surface-0">{{ taskProofToView.completedAt | date:'medium' }}</span></div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Close" class="p-button-text" (click)="displayTaskProofDialog = false"></button>
            </ng-template>
        </p-dialog>
    `
})
export class ManageTasks implements OnInit {
    private taskService = inject(CollectionTaskService);
    private binService = inject(BinService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    userRole: string | null = null;
    tasks: ResponseCollectionTaskDto[] = [];
    inspections: ResponseInspectionLogDto[] = [];
    loading = false;
    isUploading = false;

    displayNewTaskDialog = false;
    displayInspectionDialog = false;

    // Complete Task Dialog State
    displayCompleteTaskDialog = false;
    selectedTaskForCompletion: ResponseCollectionTaskDto | null = null;
    completePhotoFile: File | null = null;
    completePhotoPreviewUrl: string | null = null;
    completionNotes = '';

    // Review Inspection Dialog State
    displayReviewDialog = false;
    selectedInspection: ResponseInspectionLogDto | null = null;
    reviewNotes = '';

    // Task Proof Dialog State
    displayTaskProofDialog = false;
    taskProofToView: ResponseCollectionTaskDto | null = null;

    // Inspection Photo State
    inspectionPhotoFile: File | null = null;
    inspectionPhotoPreviewUrl: string | null = null;

    // Dropdown options
    binOptions: { label: string; value: number }[] = [];
    contractorOptions: { label: string; value: any; name?: string }[] = [];

    // Edit Task Dialog State
    displayEditTaskDialog = false;
    selectedTaskForEdit: any = null;
    editTaskDueDate = '';

    statusOptions = [
        { label: 'Pending', value: 0 },
        { label: 'In Progress', value: 1 },
        { label: 'Requires Approval', value: 2 },
        { label: 'Completed', value: 3 },
        { label: 'Cancelled', value: 4 }
    ];

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
        this.userRole = this.authService.getUserRole();
        this.loadTasks();
        this.loadInspections();
        this.loadBinOptions();
        this.loadContractorOptions();
    }

    loadBinOptions(): void {
        this.binService.getAll().subscribe({
            next: (res) => {
                const bins = res.data || [];
                this.binOptions = bins.map((b: any) => ({
                    label: `Bin #${b.id} — ${b.area ? b.area.split(',').slice(0, 2).join(',').trim() : 'No location'}`,
                    value: b.id
                }));
            },
            error: () => {
                this.binOptions = [];
            }
        });
    }

    loadContractorOptions(): void {
        this.userService.getAll().subscribe({
            next: (res) => {
                const users = res.data || res || [];
                // Only show staff members in the assignment dropdown
                const staffMembers = users.filter((u: any) => {
                    const r = (u.roleName || u.role?.name || u.role || '').toLowerCase();
                    return r === 'staff';
                });
                const listToUse = staffMembers.length > 0 ? staffMembers : users;

                this.contractorOptions = listToUse.map((u: any) => ({
                    label: `${u.fullName || u.name || u.email} (Staff)`,
                    value: u.id,
                    name: u.fullName || u.name || u.email
                }));
            },
            error: () => {
                this.contractorOptions = [];
            }
        });
    }

    loadTasks(): void {
        this.loading = true;
        const taskObservable = this.userRole === 'Staff'
            ? this.taskService.getMyTasks()
            : this.taskService.getAllTasks();

        taskObservable.subscribe({
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
            binId: 0,
            title: '',
            scheduledAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 86400000).toISOString()
        };
        this.displayNewTaskDialog = true;
    }

    saveTask(): void {
        if (!this.newTask.title || !this.newTask.binId) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Title and Bin are required' });
            return;
        }

        if (this.newTask.assignedUserId) {
            const foundStaff = this.contractorOptions.find((c) => c.value === this.newTask.assignedUserId);
            if (foundStaff) {
                this.newTask.contractorName = foundStaff.name;
            }
        }

        this.taskService.createTask(this.newTask).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Collection task scheduled' });
                this.displayNewTaskDialog = false;
                this.loadTasks();
            },
            error: (err: any) => {
                const msg = err?.error?.message || 'Failed to create task';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
            }
        });
    }

    openEditTaskDialog(task: ResponseCollectionTaskDto): void {
        let statusVal = 0;
        if (typeof task.status === 'number') {
            statusVal = task.status;
        } else if (task.status === 'InProgress') {
            statusVal = 1;
        } else if (task.status === 'RequiresApproval') {
            statusVal = 2;
        } else if (task.status === 'Completed') {
            statusVal = 3;
        } else if (task.status === 'Cancelled') {
            statusVal = 4;
        }

        this.selectedTaskForEdit = {
            id: task.id,
            title: task.title,
            binId: task.binId,
            assignedUserId: task.assignedUserId,
            contractorName: task.contractorName,
            instructions: task.instructions || '',
            status: statusVal
        };

        if (task.dueDate) {
            this.editTaskDueDate = new Date(task.dueDate).toISOString().substring(0, 10);
        } else {
            this.editTaskDueDate = new Date().toISOString().substring(0, 10);
        }

        this.displayEditTaskDialog = true;
    }

    saveEditTask(): void {
        if (!this.selectedTaskForEdit || !this.selectedTaskForEdit.title || !this.selectedTaskForEdit.binId) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Title and Bin are required' });
            return;
        }

        if (this.selectedTaskForEdit.assignedUserId) {
            const found = this.contractorOptions.find((c) => c.value === this.selectedTaskForEdit.assignedUserId);
            if (found) {
                this.selectedTaskForEdit.contractorName = found.name;
            }
        }

        const payload = {
            title: this.selectedTaskForEdit.title,
            binId: this.selectedTaskForEdit.binId,
            assignedUserId: this.selectedTaskForEdit.assignedUserId,
            contractorName: this.selectedTaskForEdit.contractorName,
            instructions: this.selectedTaskForEdit.instructions,
            dueDate: this.editTaskDueDate ? new Date(this.editTaskDueDate).toISOString() : new Date().toISOString(),
            status: Number(this.selectedTaskForEdit.status)
        };

        this.taskService.updateTask(this.selectedTaskForEdit.id, payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Task updated and re-assigned successfully' });
                this.displayEditTaskDialog = false;
                this.loadTasks();
            },
            error: (err: any) => {
                const msg = err?.error?.message || 'Failed to update task';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
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

    // --- COMPLETE TASK WITH PHOTO ---
    openCompleteTaskDialog(task: ResponseCollectionTaskDto): void {
        this.selectedTaskForCompletion = task;
        this.completePhotoFile = null;
        this.completePhotoPreviewUrl = null;
        this.completionNotes = '';
        this.displayCompleteTaskDialog = true;
    }

    onCompletePhotoSelected(event: any): void {
        const file: File = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.messageService.add({ severity: 'error', summary: 'Invalid File', detail: 'Please select an image file (JPG, PNG, WebP).' });
            return;
        }

        this.completePhotoFile = file;
        const reader = new FileReader();
        reader.onload = () => {
            this.completePhotoPreviewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    removeCompletePhoto(): void {
        this.completePhotoFile = null;
        this.completePhotoPreviewUrl = null;
    }

    submitCompleteTaskWithPhoto(): void {
        if (!this.selectedTaskForCompletion) return;
        const task = this.selectedTaskForCompletion;
        this.isUploading = true;

        if (this.completePhotoFile) {
            this.binService.uploadPhoto(this.completePhotoFile).subscribe({
                next: (uploadRes) => {
                    const photoUrl = uploadRes.data || uploadRes.url || '';
                    this.finalizeTaskCompletion(task, photoUrl);
                },
                error: () => {
                    this.isUploading = false;
                    this.messageService.add({ severity: 'error', summary: 'Photo Upload Failed', detail: 'Could not upload photo proof. Please try again.' });
                }
            });
        } else {
            this.finalizeTaskCompletion(task, null);
        }
    }

    private finalizeTaskCompletion(task: ResponseCollectionTaskDto, photoUrl: string | null): void {
        // Log inspection record with photo proof
        const inspectionLog: SubmitInspectionDto = {
            binId: task.binId,
            collectionTaskId: task.id,
            qrCodeScanned: true,
            fillLevelPercentage: 0,
            condition: 0, // Clean / Normal
            photoProofUrl: photoUrl || undefined,
            notes: this.completionNotes || 'Bin emptied and collection verified with photo proof',
            hasAnomaly: false
        };

        this.taskService.submitInspection(inspectionLog).subscribe({
            next: () => {
                this.taskService.updateTaskStatus(task.id, 2).subscribe({
                    next: () => {
                        this.isUploading = false;
                        this.displayCompleteTaskDialog = false;
                        this.messageService.add({ severity: 'success', summary: 'Completed', detail: 'Task marked as completed with verification photo!' });
                        this.loadTasks();
                        this.loadInspections();
                    },
                    error: () => {
                        this.isUploading = false;
                    }
                });
            },
            error: () => {
                // Fallback direct status update
                this.taskService.updateTaskStatus(task.id, 2).subscribe({
                    next: () => {
                        this.isUploading = false;
                        this.displayCompleteTaskDialog = false;
                        this.messageService.add({ severity: 'success', summary: 'Completed', detail: 'Task completed successfully' });
                        this.loadTasks();
                    },
                    error: () => {
                        this.isUploading = false;
                    }
                });
            }
        });
    }

    // --- FIELD INSPECTION WITH PHOTO ---
    openInspectionDialog(): void {
        this.newInspection = {
            binId: 0,
            qrCodeScanned: true,
            fillLevelPercentage: 50,
            condition: 0,
            hasAnomaly: false
        };
        this.inspectionPhotoFile = null;
        this.inspectionPhotoPreviewUrl = null;
        this.displayInspectionDialog = true;
    }

    onInspectionPhotoSelected(event: any): void {
        const file: File = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.messageService.add({ severity: 'error', summary: 'Invalid File', detail: 'Please select an image file.' });
            return;
        }

        this.inspectionPhotoFile = file;
        const reader = new FileReader();
        reader.onload = () => {
            this.inspectionPhotoPreviewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    removeInspectionPhoto(): void {
        this.inspectionPhotoFile = null;
        this.inspectionPhotoPreviewUrl = null;
        this.newInspection.photoProofUrl = undefined;
    }

    saveInspection(): void {
        if (!this.newInspection.binId) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please select a bin' });
            return;
        }
        this.newInspection.hasAnomaly = Number(this.newInspection.condition) !== 0;

        if (this.inspectionPhotoFile) {
            this.isUploading = true;
            this.binService.uploadPhoto(this.inspectionPhotoFile).subscribe({
                next: (res) => {
                    this.newInspection.photoProofUrl = res.data || res.url || '';
                    this.executeInspectionSubmission();
                },
                error: () => {
                    this.isUploading = false;
                    this.messageService.add({ severity: 'error', summary: 'Upload Error', detail: 'Photo upload failed. Proceeding without photo.' });
                    this.executeInspectionSubmission();
                }
            });
        } else {
            this.executeInspectionSubmission();
        }
    }

    private executeInspectionSubmission(): void {
        this.taskService.submitInspection(this.newInspection).subscribe({
            next: () => {
                this.isUploading = false;
                this.messageService.add({ severity: 'success', summary: 'Verified', detail: 'Inspection logged' });
                this.displayInspectionDialog = false;
                this.loadTasks();
                this.loadInspections();
            },
            error: () => {
                this.isUploading = false;
            }
        });
    }

    openReviewInspectionDialog(ins: ResponseInspectionLogDto): void {
        this.selectedInspection = ins;
        this.reviewNotes = '';
        this.displayReviewDialog = true;
    }

    openTaskProofDialog(task: ResponseCollectionTaskDto): void {
        this.taskProofToView = task;
        this.displayTaskProofDialog = true;
    }

    approveCurrentInspection(): void {
        if (!this.selectedInspection) return;
        const notes = this.reviewNotes || 'Approved by supervisor on audit';
        this.taskService.approveAnomaly(this.selectedInspection.id, notes).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Inspection approved and resolved' });
                this.displayReviewDialog = false;
                this.loadInspections();
                this.loadTasks();
            },
            error: (err) => {
                const detail = err?.error?.message || err?.error || 'Failed to approve inspection';
                this.messageService.add({ severity: 'error', summary: 'Error', detail });
            }
        });
    }

    rejectCurrentInspection(): void {
        if (!this.selectedInspection) return;
        const reason = this.reviewNotes || 'Inspection rejected. Please rework and reinspect.';
        this.taskService.rejectAnomaly(this.selectedInspection.id, reason).subscribe({
            next: () => {
                this.messageService.add({ severity: 'warn', summary: 'Returned for Rework', detail: 'Task returned to staff for rework' });
                this.displayReviewDialog = false;
                this.loadInspections();
                this.loadTasks();
            },
            error: (err) => {
                const detail = err?.error?.message || err?.error || 'Failed to reject inspection';
                this.messageService.add({ severity: 'error', summary: 'Error', detail });
            }
        });
    }

    approveAnomaly(ins: ResponseInspectionLogDto): void {
        this.openReviewInspectionDialog(ins);
    }

    getStatusName(status: number | string): string {
        const statuses = ['Pending', 'In Progress', 'Completed', 'Overdue', 'Requires Approval', 'Cancelled'];
        return statuses[Number(status)] || 'Pending';
    }

    getStatusSeverity(status: number | string): 'secondary' | 'info' | 'success' | 'warn' | 'danger' {
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
