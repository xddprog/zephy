import axios, { type CreateAxiosDefaults } from "axios";
import AuthService from '../services/authService';

const baseQueryInstance: CreateAxiosDefaults = {
    baseURL: import.meta.env.VITE_BASE_API_URL,
    withCredentials: true,
    headers: {
        ["Content-Type"]: "application/json"
    }
}


export const axiosClient = axios.create(baseQueryInstance);
const authService = new AuthService(axiosClient);

export const axiosClientWithAuth = axios.create(baseQueryInstance);

axiosClientWithAuth.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


axiosClientWithAuth.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh") {
            originalRequest._retry = true;

            try {
                const response = await authService.refreshToken();
                const { accessToken, refreshToken } = response.data;
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                return axiosClient(originalRequest);
            } catch (error) {
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);
