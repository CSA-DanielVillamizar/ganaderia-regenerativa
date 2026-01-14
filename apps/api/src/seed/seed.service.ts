import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

/**
 * Servicio para generar datos de prueba
 */
@Injectable()
export class SeedService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea datos de prueba para una finca
   * PRIMERO limpia todos los datos existentes de esa finca
   */
  async createDemoData(farmId?: string) {
    const now = new Date();

    // Si no hay farmId, obtener la primera finca de la DB
    if (!farmId) {
      const farm = await this.prisma.farm.findFirst({
        where: { active: true },
      });

      if (!farm) {
        throw new Error('No hay fincas disponibles. Crea una finca primero.');
      }

      farmId = farm.id;
    }

    // ⚠️ LIMPIAR PRIMERO: Eliminar todos los datos existentes de esta finca
    console.log(`🧹 Limpiando datos existentes de la finca ${farmId}...`);

    // Primero movimientos (dependen de herdos y potreros)
    await this.prisma.movement.deleteMany({
      where: {
        paddock: {
          farmId,
        },
      },
    });

    // Pesajes (dependen de hatos)
    await this.prisma.weighing.deleteMany({
      where: {
        herd: {
          farmId,
        },
      },
    });

    // Ciclos (dependen de hatos)
    await this.prisma.cycle.deleteMany({
      where: {
        herd: {
          farmId,
        },
      },
    });

    // Muestras de forraje (necesitan paddockId o filtro por finca)
    const paddocksToDelete = await this.prisma.paddock.findMany({
      where: { farmId },
      select: { id: true },
    });

    if (paddocksToDelete.length > 0) {
      await this.prisma.forageSample.deleteMany({
        where: {
          paddockId: { in: paddocksToDelete.map((p) => p.id) },
        },
      });
    }

    // Hatos/Lotes
    await this.prisma.herd.deleteMany({
      where: {
        farmId,
      },
    });

    // Potreros
    await this.prisma.paddock.deleteMany({
      where: {
        farmId,
      },
    });

    console.log(`✅ Datos de la finca limpiados`);

    // 1. Crear 3 potreros
    const paddocks = await this.prisma.$transaction([
      this.prisma.paddock.create({
        data: {
          farmId,
          name: 'El Roble',
          hectares: 8,
          lastExitDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          description: 'Potrero de prueba - Disponible',
        },
      }),
      this.prisma.paddock.create({
        data: {
          farmId,
          name: 'La Ceiba',
          hectares: 12,
          lastExitDate: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
          description: 'Potrero de prueba - En descanso',
        },
      }),
      this.prisma.paddock.create({
        data: {
          farmId,
          name: 'Samán',
          hectares: 10,
          description: 'Potrero de prueba - Ocupado',
        },
      }),
    ]);

    // 2. Crear 1 hato (lote)
    const herd = await this.prisma.herd.create({
      data: {
        farmId,
        name: 'Novillos Levante',
        initialWeight: 7000,
        currentWeight: 7000,
        currentUA: 20, // 20 animales = 20 UA
        animalCount: 20,
        description: 'Lote de prueba - Ganado Joven',
        active: true,
      },
    });

    // 3. Crear movimiento activo al potrero Samán
    const movement = await this.prisma.movement.create({
      data: {
        herdId: herd.id,
        paddockId: paddocks[2].id, // Samán
        type: 'ROTATION',
        entryDate: now,
        status: 'ACTIVE',
      },
    });

    return {
      success: true,
      data: {
        paddocks: paddocks.map((p) => ({ id: p.id, name: p.name })),
        herd: { id: herd.id, name: herd.name, animalCount: herd.animalCount },
        movement: { id: movement.id, paddockName: paddocks[2].name },
      },
      message: 'Datos de prueba creados exitosamente',
    };
  }
}
