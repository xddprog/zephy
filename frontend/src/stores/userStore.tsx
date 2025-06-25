import { message } from 'antd';
import { makeAutoObservable, runInAction } from 'mobx';
import AuthService from '../api/services/authService';
import type { BaseUserModel } from '../schemas/user';
import { axiosClientWithAuth } from '../api/client/axiosClient';



export class UserStore {
    user: BaseUserModel | null = null;
    isLoading: boolean = false;
    private messageApi = message.useMessage()[0];
    private authService: AuthService;

    constructor() {
        makeAutoObservable(this);
        this.authService = new AuthService(axiosClientWithAuth)
        this.fetchUser()
    }

    async fetchUser() {
        if (this.user || this.isLoading) {
            return;
        }

        this.isLoading = true;
        try {
            const res = await this.authService.getCurrentUser()
            if (res.status === 200) {
                runInAction(() => {
                    this.user = res.data;
                    this.isLoading = false;
                });
            } else {
                throw new Error('Ошибка при получении данных пользователя');
            }
        } catch (err) {
            console.error('Ошибка при загрузке пользователя:', err);
            this.messageApi.error('Ошибка при загрузке пользователя');
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    setUser(user: BaseUserModel) {
        this.user = user;
    }

    clearUser() {
        this.user = null;
    }

    get isAuthenticated() {
        return !!this.user;
    }
}