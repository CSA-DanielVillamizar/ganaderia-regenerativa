import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto, AuthResponse } from '@shared/index';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    /**
     * Autentica usuario con email y contraseña
     */
    login(dto: LoginDto): Promise<AuthResponse>;
    /**
     * Valida token JWT y retorna usuario
     */
    validateToken(userId: string): Promise<{
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
//# sourceMappingURL=auth.service.d.ts.map