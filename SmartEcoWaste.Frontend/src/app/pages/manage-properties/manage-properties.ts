import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PropertyService } from '@/core/services/property.service';
import {
    CreateBuildingDto,
    CreatePropertyDto,
    CreateWasteZoneDto,
    ResponseBuildingDto,
    ResponsePropertyDto,
    ResponseWasteZoneDto
} from 'src/assets/interfaces/commercial-saas-dtos';

@Component({
    selector: 'app-manage-properties',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TagModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="card flex flex-col gap-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 class="text-2xl font-bold tracking-tight text-surface-900 dark:text-surface-0 m-0">Properties & Facility Zones</h2>
                    <p class="text-muted-color text-sm mt-1 mb-0">Manage estate, shopping mall, and campus hierarchy with indoor waste stations.</p>
                </div>
                <button pButton label="New Property" icon="pi pi-plus" class="p-button-success" (click)="openNewPropertyDialog()"></button>
            </div>

            <p-table [value]="properties" [paginator]="true" [rows]="10" [loading]="loading" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Buildings</th>
                        <th>Waste Zones</th>
                        <th>Address</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-prop>
                    <tr>
                        <td><span class="font-bold text-primary">{{ prop.code }}</span></td>
                        <td>{{ prop.name }}</td>
                        <td><p-tag [value]="getPropertyTypeName(prop.type)" severity="info"></p-tag></td>
                        <td>{{ prop.buildingCount }}</td>
                        <td>{{ prop.wasteZoneCount }}</td>
                        <td>{{ prop.address || 'N/A' }}</td>
                        <td class="flex gap-2">
                            <button pButton icon="pi pi-building" class="p-button-outlined p-button-sm p-button-secondary" (click)="viewBuildings(prop)" pTooltip="Buildings"></button>
                            <button pButton icon="pi pi-map-marker" class="p-button-outlined p-button-sm p-button-help" (click)="viewWasteZones(prop)" pTooltip="Waste Zones"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Dialog: New Property -->
        <p-dialog [(visible)]="displayPropertyDialog" [modal]="true" header="Register New Facility Property" [style]="{ width: '450px' }">
            <div class="flex flex-col gap-4 py-2">
                <div>
                    <label class="block text-sm font-semibold mb-1">Property Name</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="newProperty.name" placeholder="E.g., Northgate Mall" />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Code / Slug</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="newProperty.code" placeholder="E.g., NORTHGATE" />
                </div>
                <div>
                    <label class="block text-sm font-semibold mb-1">Address / Region</label>
                    <input pInputText type="text" class="w-full" [(ngModel)]="newProperty.address" placeholder="Physical address or ward" />
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton label="Cancel" class="p-button-text" (click)="displayPropertyDialog = false"></button>
                <button pButton label="Save Property" icon="pi pi-check" (click)="saveProperty()"></button>
            </ng-template>
        </p-dialog>

        <!-- Dialog: Buildings & Wings -->
        <p-dialog [(visible)]="displayBuildingDialog" [modal]="true" [header]="'Buildings for ' + selectedProperty?.name" [style]="{ width: '650px' }">
            <div class="flex flex-col gap-4 py-2">
                <div class="flex gap-3">
                    <input pInputText type="text" class="flex-1" [(ngModel)]="newBuilding.name" placeholder="Building/Wing Name (e.g. Food Court)" />
                    <input pInputText type="number" style="width: 120px" [(ngModel)]="newBuilding.numberOfFloors" placeholder="Floors" />
                    <button pButton label="Add" icon="pi pi-plus" (click)="addBuilding()"></button>
                </div>
                <p-table [value]="buildings" [rows]="5" responsiveLayout="scroll">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Name</th>
                            <th>Floors</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-b>
                        <tr>
                            <td>{{ b.name }}</td>
                            <td>{{ b.numberOfFloors }}</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </p-dialog>

        <!-- Dialog: Waste Stations / Zones -->
        <p-dialog [(visible)]="displayZoneDialog" [modal]="true" [header]="'Waste Zones for ' + selectedProperty?.name" [style]="{ width: '700px' }">
            <div class="flex flex-col gap-4 py-2">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input pInputText type="text" [(ngModel)]="newZone.name" placeholder="Zone Name (e.g. Loading Bay B)" />
                    <input pInputText type="text" [(ngModel)]="newZone.floorLevel" placeholder="Floor (e.g. Ground)" />
                    <input pInputText type="text" [(ngModel)]="newZone.description" placeholder="Indoor Description" />
                </div>
                <button pButton label="Create Waste Station" icon="pi pi-plus" class="self-end" (click)="addZone()"></button>

                <p-table [value]="zones" [rows]="5" responsiveLayout="scroll">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Zone Name</th>
                            <th>Floor</th>
                            <th>Description</th>
                            <th>Bins</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-z>
                        <tr>
                            <td>{{ z.name }}</td>
                            <td>{{ z.floorLevel || 'Ground' }}</td>
                            <td>{{ z.description || 'N/A' }}</td>
                            <td><p-tag [value]="z.binCount + ' bins'" severity="success"></p-tag></td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </p-dialog>
    `
})
export class ManageProperties implements OnInit {
    private propertyService = inject(PropertyService);
    private messageService = inject(MessageService);

    properties: ResponsePropertyDto[] = [];
    buildings: ResponseBuildingDto[] = [];
    zones: ResponseWasteZoneDto[] = [];

    loading = false;
    displayPropertyDialog = false;
    displayBuildingDialog = false;
    displayZoneDialog = false;

    selectedProperty: ResponsePropertyDto | null = null;
    newProperty: CreatePropertyDto = { name: '', code: '', type: 0 };
    newBuilding: CreateBuildingDto = { propertyId: 0, name: '', numberOfFloors: 1 };
    newZone: CreateWasteZoneDto = { propertyId: 0, name: '', floorLevel: 'Ground' };

    ngOnInit(): void {
        this.loadProperties();
    }

    loadProperties(): void {
        this.loading = true;
        this.propertyService.getAllProperties().subscribe({
            next: (res) => {
                this.properties = res.data || [];
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    openNewPropertyDialog(): void {
        this.newProperty = { name: '', code: '', type: 0, address: '' };
        this.displayPropertyDialog = true;
    }

    saveProperty(): void {
        if (!this.newProperty.name || !this.newProperty.code) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Name and Code are required' });
            return;
        }
        this.propertyService.createProperty(this.newProperty).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Property created' });
                this.displayPropertyDialog = false;
                this.loadProperties();
            }
        });
    }

    viewBuildings(prop: ResponsePropertyDto): void {
        this.selectedProperty = prop;
        this.newBuilding.propertyId = prop.id;
        this.propertyService.getBuildings(prop.id).subscribe({
            next: (res) => {
                this.buildings = res.data || [];
                this.displayBuildingDialog = true;
            }
        });
    }

    addBuilding(): void {
        if (!this.newBuilding.name) return;
        this.propertyService.createBuilding(this.newBuilding).subscribe({
            next: () => {
                this.newBuilding.name = '';
                if (this.selectedProperty) this.viewBuildings(this.selectedProperty);
            }
        });
    }

    viewWasteZones(prop: ResponsePropertyDto): void {
        this.selectedProperty = prop;
        this.newZone.propertyId = prop.id;
        this.propertyService.getWasteZones(prop.id).subscribe({
            next: (res) => {
                this.zones = res.data || [];
                this.displayZoneDialog = true;
            }
        });
    }

    addZone(): void {
        if (!this.newZone.name) return;
        this.propertyService.createWasteZone(this.newZone).subscribe({
            next: () => {
                this.newZone.name = '';
                if (this.selectedProperty) this.viewWasteZones(this.selectedProperty);
            }
        });
    }

    getPropertyTypeName(type: number | string): string {
        const types = ['Commercial Mall', 'Residential Estate', 'Office Park', 'Campus', 'Industrial', 'Municipal Ward'];
        return types[Number(type)] || 'Commercial';
    }
}
