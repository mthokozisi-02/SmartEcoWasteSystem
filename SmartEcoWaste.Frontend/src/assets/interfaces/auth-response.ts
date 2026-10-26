export interface AuthResponse {
    isSuccess: boolean;
    message?: string;
    data: AuthData;
}

export interface AuthData {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // seconds
    tenantId: number;
    tenantName?: string;
    tenantCode?: string;
    organizationType?: 'CommercialMall' | 'ResidentialEstate' | 'Municipality' | string;
    role?: string;
    userName?: string;
    userId?: number;
    email?: string;
}
