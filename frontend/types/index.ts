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

export interface NewFile {
    label: string;
    description?: string;
    file?: File;
    gottenLicenses: Array<{ label: string; value: string }>;
    gottenTags: Array<{ label: string; value: string }>;
    gottenFiles: Array<{ value: number; label: string }>;
    gottenFamilies: Array<{ value: number; label: string }>;
    newVersionOf: string;
    featureFamily: string;
    license: string;
    tags: string;
    loading: boolean;
    legalShare: boolean;
    userData: boolean;
    openSource: boolean;
    newVersionOfSelection: boolean;
    featureModelFamilySelection: boolean;
}