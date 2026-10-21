import { StatusEnum } from '../enums/status-enum';

export interface ReportBinDto {
    userId?: number; // Derived from JWT on the backend; do not set from the client
    binId: number;
    status: StatusEnum;
}
