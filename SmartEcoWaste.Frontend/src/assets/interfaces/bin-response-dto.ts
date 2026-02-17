import { StatusEnum } from '../enums/status-enum';

export interface BinResponseDto {
    id: number;
    area: string;
    latitude: number;
    longitude: number;
    status: StatusEnum;
    qrCode: string;
    createdAt: Date;
}
