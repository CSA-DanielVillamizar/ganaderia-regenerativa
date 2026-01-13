import { FarmService } from './farm.service';
import { CreateFarmDto } from '@shared/index';
export declare class FarmController {
    private farmService;
    constructor(farmService: FarmService);
    create(dto: CreateFarmDto, req: any): Promise<{
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
    findAll(req: any): Promise<any[]>;
    findOne(id: string, req: any): Promise<{
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
    update(id: string, dto: Partial<CreateFarmDto>, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
//# sourceMappingURL=farm.controller.d.ts.map