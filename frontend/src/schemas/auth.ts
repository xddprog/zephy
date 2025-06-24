export interface LoginUserInterface {
    email: string;
    password: string;
}


export interface RegisterUserInterface extends LoginUserInterface {
    username: string;
}

