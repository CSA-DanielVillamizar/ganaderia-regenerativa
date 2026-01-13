import { PaddockService } from './paddock.service';
import { CreatePaddockDto } from '@shared/index';
export declare class PaddockController {
    private paddockService;
    constructor(paddockService: PaddockService);
    create(dto: CreatePaddockDto, req: any): Promise<{
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
    findByFarm(farmId: string, req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, dto: Partial<CreatePaddockDto>, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
    getStockingRate(id: string, req: any): Promise<{
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
}
//# sourceMappingURL=paddock.controller.d.ts.map