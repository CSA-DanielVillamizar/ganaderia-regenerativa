import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    // Limpiar datos previos (SQLite compatible)
    try {
        await prisma.parameter.deleteMany({});
        await prisma.forageSample.deleteMany({});
        await prisma.movement.deleteMany({});
        await prisma.cycle.deleteMany({});
        await prisma.weighing.deleteMany({});
        await prisma.animal.deleteMany({});
        await prisma.herd.deleteMany({});
        await prisma.paddock.deleteMany({});
        await prisma.userFarm.deleteMany({});
        await prisma.farm.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('🧹 Base de datos limpiada');
    }
    catch (error) {
        console.log('⚠️  BD ya estaba vacía o primera ejecución');
    }
    // Crear usuarios
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@magrotec.com',
            password: await bcrypt.hash('Admin123!', 10),
            name: 'Admin Magrotec',
            role: 'ADMIN',
        },
    });
    const techUser = await prisma.user.create({
        data: {
            email: 'tecnico@magrotec.com',
            password: await bcrypt.hash('Tech123!', 10),
            name: 'Técnico Agropecuario',
            role: 'TECHNICIAN',
        },
    });
    console.log('👥 Usuarios creados');
    // Crear finca
    const farm = await prisma.farm.create({
        data: {
            name: 'Finca Las Praderas',
            location: 'Cundinamarca, Colombia',
            hectares: 50,
            createdBy: adminUser.id,
            updatedBy: adminUser.id,
        },
    });
    console.log('🏞️  Finca creada');
    // Relacionar usuarios con finca
    await prisma.userFarm.create({ data: { userId: adminUser.id, farmId: farm.id } });
    await prisma.userFarm.create({ data: { userId: techUser.id, farmId: farm.id } });
    // Crear 8 potreros
    const paddockNames = [
        'Potrero 1',
        'Potrero 2',
        'Potrero 3',
        'Potrero 4',
        'Potrero 5',
        'Potrero 6',
        'Potrero 7',
        'Potrero 8',
    ];
    const paddocks = await Promise.all(paddockNames.map((name, idx) => prisma.paddock.create({
        data: {
            farmId: farm.id,
            name,
            hectares: 5 + Math.random() * 3,
            description: `Potrero rotativo ${idx + 1}`,
            createdBy: techUser.id,
            updatedBy: techUser.id,
        },
    })));
    console.log('🌾 8 Potreros creados');
    // Crear lote de 15 cabezas
    const herd = await prisma.herd.create({
        data: {
            farmId: farm.id,
            name: 'Lote A - Novillas',
            initialWeight: 4500,
            currentWeight: 4900,
            animalCount: 15,
            description: 'Lote de 15 novillas en rotación',
            createdBy: techUser.id,
            updatedBy: techUser.id,
        },
    });
    console.log('🐄 Lote creado (15 cabezas, 4500 kg inicial)');
    // Crear 15 animales
    const animals = await Promise.all(Array.from({ length: 15 }).map((_, idx) => prisma.animal.create({
        data: {
            herdId: herd.id,
            earTag: `EAR${String(idx + 1).padStart(3, '0')}`,
            initialWeight: 300 + Math.random() * 50,
        },
    })));
    console.log('🔖 15 Animales creados');
    // Crear pesajes históricos
    const baseDate = new Date('2025-01-01');
    for (let i = 0; i < 5; i++) {
        const recordDate = new Date(baseDate);
        recordDate.setDate(recordDate.getDate() + i * 7);
        await prisma.weighing.create({
            data: {
                herdId: herd.id,
                weight: 4500 + i * 80,
                animalCount: 15,
                recordedAt: recordDate,
                notes: `Pesaje semanal ${i + 1}`,
                createdBy: techUser.id,
            },
        });
    }
    console.log('⚖️  Pesajes históricos creados');
    // Crear ciclo
    const cycle = await prisma.cycle.create({
        data: {
            farmId: farm.id,
            herdId: herd.id,
            status: 'ACTIVE',
            startDate: new Date('2025-01-01'),
            notes: 'Ciclo 1 - Rotación de 8 potreros',
            createdBy: techUser.id,
            updatedBy: techUser.id,
        },
    });
    console.log('📅 Ciclo creado');
    // Crear movimientos (simulando rotación)
    let currentDate = new Date('2025-01-01');
    for (let i = 0; i < 5; i++) {
        const entryDate = new Date(currentDate);
        const exitDate = new Date(currentDate);
        exitDate.setDate(exitDate.getDate() + 10);
        await prisma.movement.create({
            data: {
                herdId: herd.id,
                paddockId: paddocks[i].id,
                cycleId: cycle.id,
                type: 'ENTRY',
                entryDate,
                exitDate,
                notes: `Entrada a ${paddocks[i].name}`,
                createdBy: techUser.id,
            },
        });
        currentDate = exitDate;
    }
    console.log('🔄 Movimientos de rotación creados');
    // Crear aforos
    for (let i = 0; i < 8; i++) {
        await prisma.forageSample.create({
            data: {
                paddockId: paddocks[i].id,
                kgPerHectare: 2500 + Math.random() * 1500,
                dryMatter: 35 + Math.random() * 15,
                sampleDate: new Date('2025-01-15'),
                notes: `Aforo en ${paddocks[i].name}`,
                createdBy: techUser.id,
            },
        });
    }
    console.log('🌱 Aforos creados');
    // Crear parámetros de cálculo
    const parameters = [
        { key: 'UA_WEIGHT', value: '450', description: 'Peso estándar UA en kg' },
        { key: 'DAILY_DEMAND_PERCENT', value: '2.5', description: 'Demanda diaria % PV' },
        { key: 'FORAGE_UTILIZATION', value: '60', description: 'Aprovechamiento forraje %' },
        { key: 'MAX_OCCUPATION_DAYS', value: '15', description: 'Días máximos ocupación' },
        { key: 'MIN_REST_DAYS', value: '40', description: 'Días mínimos descanso' },
    ];
    await Promise.all(parameters.map((param) => prisma.parameter.create({
        data: {
            farmId: farm.id,
            ...param,
        },
    })));
    console.log('⚙️  Parámetros de cálculo creados');
    console.log('✅ Seed completado exitosamente');
}
main()
    .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map