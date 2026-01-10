import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiPath = __dirname;

console.log('🔨 Compilando backend con NestJS...');

// Primero compilamos
const build = spawn('npx', ['nest', 'build'], {
  cwd: apiPath,
  stdio: 'inherit',
  shell: true,
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Error en compilación');
    process.exit(1);
  }

  console.log('✅ Compilación exitosa, iniciando servidor...\n');

  // Luego ejecutamos
  const server = spawn('node', ['dist/main.js'], {
    cwd: apiPath,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });

  server.on('error', (err) => {
    console.error('❌ Error al iniciar servidor:', err);
    process.exit(1);
  });

  server.on('close', (code) => {
    process.exit(code);
  });

  process.on('SIGTERM', () => {
    server.kill();
  });
});
