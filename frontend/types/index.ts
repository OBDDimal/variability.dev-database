export interface Register {
    email: string;
    password: string;
    passwordConfirmation: string;
    loading: boolean;
}

export interface Login {
    email: string;
    password: string;
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

export interface Cookie {
    name: string;
    purpose: string;
    retentionPeriod: string;
}

export interface PersonalData {
    typeOfData: string;
    typeOfCollection: string;
    purpose: string;
}

export interface Family {
    label: string;
    description: string;
    owner: boolean;     //TODO: the owner that comes from the server is an email string like 'bla@blub.de'. Somehow verify if logged in user is the owner, then set this boolean accordingly.
}

export interface Tag {
    label: string;
    owner: boolean;     //TODO: the owner that comes from the server is an email string like 'bla@blub.de'. Somehow verify if logged in user is the owner, then set this boolean accordingly.
    description: string;
    dateCreated: Date;
    public: boolean;
}