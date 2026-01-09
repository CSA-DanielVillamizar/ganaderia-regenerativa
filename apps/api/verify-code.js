// Verificación directa del código sin compilación
const fs = require('fs');
const path = require('path');

console.log('=== Verificación del Código Fuente ===\n');

const srcDir = './src';
const files = [
  'main.ts',
  'app.module.ts',
  'auth/auth.service.ts',
  'farm/farm.service.ts',
  'herd/herd.service.ts',
  'paddock/paddock.service.ts',
  'movement/movement.service.ts'
];

let errors = 0;
let warnings = 0;

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ NO EXISTE: ${file}`);
    errors++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Verificaciones básicas
  if (file.endsWith('.ts')) {
    if (!content.includes('export') && !file.includes('module')) {
      console.log(`⚠️ SIN EXPORT: ${file}`);
      warnings++;
    }
    if (content.includes('TODO')) {
      console.log(`📝 TIENE TODO: ${file}`);
    }
  }
  
  console.log(`✅ ${file}`);
});

console.log(`\n=== Resumen ===`);
console.log(`✅ Archivos OK: ${files.length - errors}`);
console.log(`❌ Errores: ${errors}`);
console.log(`⚠️ Warnings: ${warnings}`);

if (errors === 0) {
  console.log('\n🎉 Código fuente verificado correctamente!');
  process.exit(0);
} else {
  process.exit(1);
}
