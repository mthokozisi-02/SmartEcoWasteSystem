import { Roles } from './roles';

export interface User {
    id: number;
    tenantId?: number;
    tenantName?: string;
    name: string;
    email: string;
    roleId: number;
    role: Roles;
    reports: number;
    userPoints: number;
    roleName: string;
    createdAt: Date;
}
