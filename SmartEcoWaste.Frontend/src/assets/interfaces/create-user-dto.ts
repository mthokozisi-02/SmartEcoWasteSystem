export interface CreateUserDto {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    tenantId?: number;
    tenantCode?: string;
}
