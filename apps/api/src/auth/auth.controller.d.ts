import { AuthService } from './auth.service';
import { LoginDto } from '@shared/index';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@shared/index").Role;
        };
    }>;
    getProfile(req: any): Promise<{
        id: any;
        email: any;
        name: any;
        role: any;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map