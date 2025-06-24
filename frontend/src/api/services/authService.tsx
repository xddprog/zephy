import type { LoginUserInterface, RegisterUserInterface } from "../../schemas/auth";
import type { AxiosInstance, AxiosResponse } from "axios";



export default class AuthService {
    axiosInstance: AxiosInstance;

    constructor(axiosInstance: AxiosInstance) {
        this.axiosInstance = axiosInstance;
    }
    
    public BASE_URL = "/auth";

    public async loginUser(loginData: LoginUserInterface): Promise<AxiosResponse> {
        return this.axiosInstance.post(`${this.BASE_URL}/login`, loginData);
    }

    public async registerUser(registerData: RegisterUserInterface): Promise<AxiosResponse> {
        return this.axiosInstance.post(`${this.BASE_URL}/register`, registerData);
    }

    public async getCurrentUser(): Promise<AxiosResponse> {
        return this.axiosInstance.get(`${this.BASE_URL}/current`);
    }

    public async logoutUser(): Promise<AxiosResponse> {
        return this.axiosInstance.delete(`${this.BASE_URL}/logout`);
    }

    public async refreshToken(): Promise<AxiosResponse<{ accessToken: string, refreshToken: string }>> {
        const refreshToken = localStorage.getItem("refreshToken");
        return this.axiosInstance.get(`${this.BASE_URL}/refresh`, {params: { refreshToken: refreshToken }});
    }
}