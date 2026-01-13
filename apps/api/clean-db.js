const { PrismaClient } = require('.prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Limpiando base de datos...');
  
  try {
    // Eliminar en orden correcto (respetando foreign keys)
    await prisma.parameter.deleteMany();
    console.log('  ✓ Parameters eliminados');
    
    await prisma.forageSample.deleteMany();
    console.log('  ✓ ForageSamples eliminados');
    
    await prisma.movement.deleteMany();
    console.log('  ✓ Movements eliminados');
    
    await prisma.cycle.deleteMany();
    console.log('  ✓ Cycles eliminados');
    
    await prisma.weighing.deleteMany();
    console.log('  ✓ Weighings eliminados');
    
    await prisma.animal.deleteMany();
    console.log('  ✓ Animals eliminados');
    
    await prisma.herd.deleteMany();
    console.log('  ✓ Herds eliminados');
    
    await prisma.paddock.deleteMany();
    console.log('  ✓ Paddocks eliminados');
    
    await prisma.userFarm.deleteMany();
    console.log('  ✓ UserFarms eliminados');
    
    await prisma.farm.deleteMany();
    console.log('  ✓ Farms eliminadas');
    
    await prisma.user.deleteMany();
    console.log('  ✓ Users eliminados');
    
    console.log('\n✅ Base de datos limpiada completamente\n');
  } catch (error) {
    console.error('⚠️ Error durante limpieza:', error.message);
  }
  
  await prisma.$disconnect();
}

cleanDatabase();
