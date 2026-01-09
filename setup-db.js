const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const apiPath = path.resolve(__dirname, 'apps', 'api');

console.log('🔧 Configurando base de datos...\n');

try {
  console.log('[1/3] Generando cliente Prisma...');
  execSync('npx prisma generate', {
    cwd: apiPath,
    stdio: 'inherit',
  });
  console.log('✓ Cliente Prisma generado\n');

  console.log('[2/3] Creando base de datos SQLite...');
  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    cwd: apiPath,
    stdio: 'inherit',
  });
  console.log('✓ Base de datos creada\n');

  // Verificar que la BD existe
  const dbPath = path.join(apiPath, 'prisma', 'dev.db');
  if (fs.existsSync(dbPath)) {
    console.log('✓ Archivo dev.db existe\n');
  } else {
    console.log('⚠ dev.db no encontrado\n');
  }

  console.log('✓ Configuración completada exitosamente!\n');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
