export interface ResponsePropertyDto {
    id: number;
    tenantId: number;
    name: string;
    code: string;
    type: number | string;
    address?: string;
    latitude?: number;
    longitude?: number;
    buildingCount: number;
    wasteZoneCount: number;
    createdAt: string;
}

export interface CreatePropertyDto {
    name: string;
    code: string;
    type: number;
    address?: string;
    latitude?: number;
    longitude?: number;
}

export interface ResponseBuildingDto {
    id: number;
    propertyId: number;
    propertyName: string;
    name: string;
    code?: string;
    numberOfFloors: number;
}

export interface CreateBuildingDto {
    propertyId: number;
    name: string;
    code?: string;
    numberOfFloors: number;
}

export interface ResponseWasteZoneDto {
    id: number;
    propertyId: number;
    propertyName: string;
    buildingId?: number;
    buildingName?: string;
    name: string;
    floorLevel?: string;
    description?: string;
    binCount: number;
}

export interface CreateWasteZoneDto {
    propertyId: number;
    buildingId?: number;
    name: string;
    floorLevel?: string;
    description?: string;
}

export interface ResponseCollectionTaskDto {
    id: number;
    binId: number;
    binTag: string;
    zoneName?: string;
    propertyName?: string;
    assignedUserId?: number;
    assignedUserName?: string;
    contractorName?: string;
    title: string;
    instructions?: string;
    status: number | string;
    scheduledAt: string;
    startedAt?: string;
    completedAt?: string;
    dueDate: string;
    photoProofUrl?: string;
}

export interface CreateCollectionTaskDto {
    binId: number;
    assignedUserId?: number;
    contractorName?: string;
    title: string;
    instructions?: string;
    scheduledAt: string;
    dueDate: string;
}

export interface SubmitInspectionDto {
    binId: number;
    collectionTaskId?: number;
    qrCodeScanned: boolean;
    fillLevelPercentage: number;
    measuredWeightKg?: number;
    condition: number;
    photoProofUrl?: string;
    notes?: string;
    hasAnomaly: boolean;
    anomalyReason?: string;
}

export interface ResponseInspectionLogDto {
    id: number;
    binId: number;
    binTag: string;
    collectionTaskId?: number;
    inspectorUserId: number;
    inspectorUserName: string;
    qrCodeScanned: boolean;
    fillLevelPercentage: number;
    measuredWeightKg?: number;
    condition: number | string;
    photoProofUrl?: string;
    notes?: string;
    hasAnomaly: boolean;
    anomalyReason?: string;
    isApproved: boolean;
    approvedByUserName?: string;
    approvedAt?: string;
    createdAt: string;
}

export type CollectionTaskDto = ResponseCollectionTaskDto;
export type PropertyDto = ResponsePropertyDto;
export type BuildingDto = ResponseBuildingDto;
export type WasteZoneDto = ResponseWasteZoneDto;