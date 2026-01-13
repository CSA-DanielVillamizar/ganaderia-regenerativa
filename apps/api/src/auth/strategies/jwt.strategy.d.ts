import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map