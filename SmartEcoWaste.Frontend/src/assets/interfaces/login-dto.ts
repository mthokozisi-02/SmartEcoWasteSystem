export interface LoginDto {
    email: string;
    passwordHash: string;
    tenantCode?: string;
    tenantId?: number;
}
