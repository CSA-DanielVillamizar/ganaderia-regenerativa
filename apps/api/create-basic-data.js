const { PrismaClient } = require('.prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createBasicData() {
  console.log('🔧 Creando datos básicos...\n');
  
  // Crear usuario admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@magrotec.com',
      password: await bcrypt.hashSync('Admin123!', 10),
      name: 'Admin Magrotec',
      role: 'ADMIN',
    },
  });
  console.log('  ✓ Usuario admin creado: admin@magrotec.com / Admin123!');
  
  // Crear finca base
  const farm = await prisma.farm.create({
    data: {
      name: 'Finca Demo',
      location: 'Colombia',
      hectares: 150,
      active: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });
  console.log('  ✓ Finca demo creada:', farm.name);
  
  // Asociar usuario con finca
  await prisma.userFarm.create({
    data: {
      userId: adminUser.id,
      farmId: farm.id,
    },
  });
  console.log('  ✓ Usuario asociado a finca');
  
  console.log('\n✅ Datos básicos creados correctamente');
  console.log('\n📋 Credenciales:');
  console.log('   Email: admin@magrotec.com');
  console.log('   Password: Admin123!');
  console.log('\n🎯 Ahora recarga el dashboard y usa el botón "🌱 Cargar Datos Demo"\n');
  
  await prisma.$disconnect();
}

createBasicData()
  .catch(error => {
    console.error('❌ Error creando datos básicos:', error);
    process.exit(1);
  });
