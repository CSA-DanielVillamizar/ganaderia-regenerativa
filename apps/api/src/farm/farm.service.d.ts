import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFarmDto } from '@shared/index';
export declare class FarmService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Crear finca
     */
    create(dto: CreateFarmDto, userId: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        hectares: number | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    }>;
    /**
     * Obtener todas las fincas del usuario
     */
    findAll(userId: string): Promise<any[]>;
    /**
     * Obtener finca por ID (verificar acceso)
     */
    findOne(farmId: string, userId: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        hectares: number | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    }>;
    /**
     * Actualizar finca
     */
    update(farmId: string, dto: Partial<CreateFarmDto>, userId: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        hectares: number | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    }>;
    /**
     * Eliminar finca (soft delete)
     */
    remove(farmId: string, userId: string): Promise<{
        id: string;
        name: string;
        location: string | null;
        hectares: number | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
    }>;
}
//# sourceMappingURL=farm.service.d.ts.map