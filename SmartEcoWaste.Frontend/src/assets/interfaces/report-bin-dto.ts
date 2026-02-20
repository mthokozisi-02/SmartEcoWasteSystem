import { StatusEnum } from '../enums/status-enum';

export interface ReportBinDto {
    userId: number;
    binId: number;
    status: StatusEnum;
}
