const { PrismaClient } = require('@prisma/client');

async function checkDB() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    console.log('✅ Usuarios en BD:', users.length);
    users.forEach(u => console.log(`  - ${u.email} (${u.role})`));
    
    const farms = await prisma.farm.findMany();
    console.log('✅ Fincas en BD:', farms.length);
    
    if (users.length > 0) {
      console.log('\n🔐 Credenciales de login:');
      console.log('  Email:    admin@magrotec.com');
      console.log('  Password: Admin123!');
    } else {
      console.log('\n❌ BD sin datos. Ejecutar: node prisma/seed.js');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
