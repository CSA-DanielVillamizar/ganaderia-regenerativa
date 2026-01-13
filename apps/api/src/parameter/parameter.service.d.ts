import { PrismaService } from '../common/prisma/prisma.service';
/**
 * Parámetros de cálculo configurables por finca.
 * P0.2, P0.3, P0.4, P0.5 dependen de esta configuración.
 */
export declare class ParameterService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Obtener valor de parámetro con fallback a default
     */
    getParameter(farmId: string, key: string, defaultValue: string): Promise<string>;
    /**
     * Obtener parámetro como número
     */
    getParameterAsNumber(farmId: string, key: string, defaultValue: number): Promise<number>;
    /**
     * Establecer parámetro
     */
    setParameter(farmId: string, key: string, value: string, userId: string, description?: string): Promise<{
        id: string;
        farmId: string;
        key: string;
        value: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        updatedBy: string | null;
    }>;
    /**
     * Listar parámetros de finca
     */
    listByFarm(farmId: string): Promise<{
        id: string;
        farmId: string;
        key: string;
        value: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        updatedBy: string | null;
    }[]>;
    /**
     * Inicializar parámetros default para nueva finca
     */
    initializeDefaults(farmId: string, _userId: string): Promise<number>;
    /**
     * Validar acceso a parámetros de finca
     */
    private verifyFarmAccess;
}
//# sourceMappingURL=parameter.service.d.ts.map