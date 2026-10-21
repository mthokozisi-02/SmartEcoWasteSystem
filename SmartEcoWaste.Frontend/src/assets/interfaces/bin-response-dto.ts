import { StatusEnum } from '../enums/status-enum';

export interface BinResponseDto {
    id: number;
    wasteZoneId?: number;
    wasteZoneName?: string;
    buildingId?: number;
    buildingName?: string;
    propertyId?: number;
    propertyName?: string;
    binTag: string;
    category: number | string;
    capacityLiters: number;
    area: string;
    latitude: number;
    longitude: number;
    status: StatusEnum;
    qrCode: string;
    qrCodeUrl?: string;
    createdAt: Date;
}
