export interface RegistrationRequest {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    photoProfil:  string | Blob ;
}
