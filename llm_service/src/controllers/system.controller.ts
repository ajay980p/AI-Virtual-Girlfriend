import { Request, Response } from 'express';
import { getAuthClient } from '../services/auth.service';

export function rootHandler(_req: Request, res: Response) {
    res.json({ msg: 'This is the root endpoint!' });
}

export async function healthHandler(_req: Request, res: Response) {
    try {
        const authClient = getAuthClient();
        const authHealthy = await authClient.healthCheck();
        res.json({
            status: 'ok',
            services: {
                auth_service: authHealthy ? 'healthy' : 'unhealthy',
            },
        });
    } catch {
        res.status(200).json({ status: 'ok' });
    }
}
