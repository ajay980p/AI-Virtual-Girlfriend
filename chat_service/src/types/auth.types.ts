export interface IAuthUser {
    id: string;               // userId from JWT (sub)
    email?: string;           // optional for convenience
    roles: string[];          // from JWT, e.g. ['user', 'admin']
    token?: string;           // raw access token (optional, if needed downstream)
}