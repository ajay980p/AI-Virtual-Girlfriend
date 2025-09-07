import 'express-serve-static-core';

export interface IAuthUser {
    id: string;
    email?: string;
    roles: string[];
    token?: string;
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: IAuthUser;
    }
}