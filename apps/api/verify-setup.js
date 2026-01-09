const { PrismaClient } = require('@prisma/client');

async function verifySetup() {
  console.log('\n🔍 VERIFICACIÓN DE SETUP\n');
  console.log('========================================');

  const prisma = new PrismaClient();

  try {
    // 1. Test de conexión
    console.log('1️⃣  Conexión a BD...');
    const ping = await prisma.$queryRaw`SELECT 1`;
    console.log('   ✅ Conectado a SQLite');

    // 2. Contar usuarios
    console.log('\n2️⃣  Usuarios en BD...');
    const users = await prisma.user.findMany({ select: { email: true, role: true } });
    if (users.length > 0) {
      console.log(`   ✅ ${users.length} usuario(s) encontrados:`);
      users.forEach(u => console.log(`      - ${u.email} (${u.role})`));
    } else {
      console.log('   ❌ Sin usuarios. Ejecutar: node prisma/seed.js');
    }

    // 3. Contar fincas
    console.log('\n3️⃣  Datos en BD...');
    const farms = await prisma.farm.findMany({ select: { id: true, name: true } });
    const paddocks = await prisma.paddock.count();
    const herds = await prisma.herd.count();
    console.log(`   ✅ ${farms.length} finca(s), ${paddocks} potrero(s), ${herds} rebaño(s)`);

    // 4. Test de autenticación
    console.log('\n4️⃣  Test de Auth...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@magrotec.com' }
    });
    if (adminUser) {
      console.log('   ✅ Usuario admin encontrado');
      console.log(`   📧 Email: ${adminUser.email}`);
      console.log(`   👤 Rol: ${adminUser.role}`);
      console.log(`   ✨ Activo: ${adminUser.active}`);
    } else {
      console.log('   ❌ Usuario admin NO encontrado');
    }

    console.log('\n========================================');
    console.log('\n✅ SETUP LISTO PARA LOGIN\n');
    console.log('Credenciales:');
    console.log('  Email:    admin@magrotec.com');
    console.log('  Password: Admin123!\n');

  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    console.log('\nVerifica que:');
    console.log('1. BD SQLite existe: prisma/dev.db');
    console.log('2. NODE_ENV y DATABASE_URL están configurados');
    console.log('3. Ejecutar: npx prisma db push');
    console.log('4. Ejecutar: node prisma/seed.js\n');
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();
