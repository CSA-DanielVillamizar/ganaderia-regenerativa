import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePaddockDto } from '@shared/index';
export declare class PaddockService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Crear potrero
     */
    create(dto: CreatePaddockDto, userId: string): Promise<{
        id: string;
        farmId: string;
        name: string;
        hectares: number;
        pastureType: string | null;
        minRestDays: number | null;
        description: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
        lastExitDate: Date | null;
    }>;
    /**
     * Obtener potreros de finca
     */
    findByFarm(farmId: string, userId: string): Promise<{
        id: string;
        farmId: string;
        name: string;
        hectares: number;
        pastureType: string | null;
        minRestDays: number | null;
        description: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
        lastExitDate: Date | null;
    }[]>;
    /**
     * Obtener potrero por ID
     */
    findOne(id: string, userId: string): Promise<{
        id: string;
        farmId: string;
        name: string;
        hectares: number;
        pastureType: string | null;
        minRestDays: number | null;
        description: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
        lastExitDate: Date | null;
    }>;
    /**
     * Actualizar potrero
     */
    update(id: string, dto: Partial<CreatePaddockDto>, userId: string): Promise<{
        id: string;
        farmId: string;
        name: string;
        hectares: number;
        pastureType: string | null;
        minRestDays: number | null;
        description: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
        lastExitDate: Date | null;
    }>;
    /**
     * Eliminar potrero
     */
    remove(id: string, userId: string): Promise<{
        id: string;
        farmId: string;
        name: string;
        hectares: number;
        pastureType: string | null;
        minRestDays: number | null;
        description: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string | null;
        updatedBy: string | null;
        deletedAt: Date | null;
        lastExitDate: Date | null;
    }>;
    /**
     * Obtener carga animal del potrero
     * Retorna: {ua: número de UA, uaPerHectare: UA/hectárea}
     */
    getStockingRate(id: string, userId: string): Promise<{
        ua: number;
        uaPerHectare: number;
        herdName: null;
        startDate: null;
    } | {
        ua: number;
        uaPerHectare: number;
        herdName: string;
        startDate: Date;
    }>;
    private verifyFarmAccess;
}
//# sourceMappingURL=paddock.service.d.ts.map