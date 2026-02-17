export interface AuthResponse {
    data: data;
}

export interface data {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // seconds
}
