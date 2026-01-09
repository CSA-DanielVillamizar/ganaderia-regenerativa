import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFarmDto } from '@shared/index';

@Injectable()
export class FarmService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear finca
   */
  async create(dto: CreateFarmDto, userId: string) {
    const farm = await this.prisma.farm.create({
      data: {
        ...dto,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Relacionar usuario con finca
    await this.prisma.userFarm.create({
      data: {
        userId,
        farmId: farm.id,
      },
    });

    return farm;
  }

  /**
   * Obtener todas las fincas del usuario
   */
  async findAll(userId: string) {
    const userFarms = await this.prisma.userFarm.findMany({
      where: { userId },
      include: {
        farm: true,
      },
    });

    return userFarms.map((uf) => uf.farm);
  }

  /**
   * Obtener finca por ID (verificar acceso)
   */
  async findOne(farmId: string, userId: string) {
    // Verificar que usuario tiene acceso a finca
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId } },
    });

    if (!userFarm) {
      throw new ForbiddenException('No tienes acceso a esta finca');
    }

    const farm = await this.prisma.farm.findUniqueOrThrow({
      where: { id: farmId },
    });

    return farm;
  }

  /**
   * Actualizar finca
   */
  async update(farmId: string, dto: Partial<CreateFarmDto>, userId: string) {
    await this.findOne(farmId, userId);

    return this.prisma.farm.update({
      where: { id: farmId },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });
  }

  /**
   * Eliminar finca (soft delete)
   */
  async remove(farmId: string, userId: string) {
    await this.findOne(farmId, userId);

    return this.prisma.farm.update({
      where: { id: farmId },
      data: { deletedAt: new Date() },
    });
  }
}
