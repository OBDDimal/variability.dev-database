export interface Register {
    email?: string;
    password?: string;
    passwordConfirmation?: string;
    loading: boolean;
}

export interface Login {
    email?: string;
    password?: string;
    loading: boolean;
}