import { StatusEnum } from '../enums/status-enum';

export interface ReportResponseDto {
    id: number;
    binId: number;
    binArea: string;
    userId: number;
    userName: string;
    status: StatusEnum;
    verifiedAt: Date;
    createdAt: Date;
    verifiedBy: string;
}
