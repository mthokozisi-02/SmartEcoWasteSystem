export interface CreateBinDto {
    id?: number;
    wasteZoneId?: number;
    binTag: string;
    category: number | string;
    capacityLiters: number;
    area: string;
    latitude: number;
    longitude: number;
    url: string;
}
