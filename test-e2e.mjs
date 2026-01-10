#!/usr/bin/env node

/**
 * Test E2E: Decision Today Endpoint
 * Fecha: 2026-01-10
 */

import http from 'http';

function makeRequest(method, host, port, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTest() {
  console.log('\n========================================');
  console.log('  TEST E2E: DECISION TODAY PAGE');
  console.log('========================================\n');

  try {
    // 1. Verificar servidor API
    console.log('1️⃣  VERIFICANDO SERVIDOR API...');
    const healthRes = await makeRequest('GET', 'localhost', 3000, '/api/v1/health');
    if (healthRes.statusCode === 200) {
      console.log('   ✅ API en línea (puerto 3000)\n');
    } else {
      console.log('   ❌ API no responde correctamente\n');
      process.exit(1);
    }

    // 2. Autenticación
    console.log('2️⃣  AUTENTICACIÓN...');
    const authRes = await makeRequest('POST', 'localhost', 3000, '/api/v1/auth/login', {
      email: 'admin@magrotec.com',
      password: 'Admin123!'
    });

    if (authRes.statusCode !== 200 && authRes.statusCode !== 201) {
      console.log(`   ❌ Login fallido (${authRes.statusCode})`);
      console.log(`   Error: ${authRes.data.message || JSON.stringify(authRes.data)}`);
      if (authRes.data.traceId) console.log(`   TraceId: ${authRes.data.traceId}`);
      process.exit(1);
    }

    const token = authRes.data.accessToken || authRes.data.access_token || authRes.data.token;
    if (!token) {
      console.log('   ❌ No token en respuesta');
      console.log(JSON.stringify(authRes.data));
      process.exit(1);
    }
    console.log(`   ✅ Login exitoso`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // 3. Obtener fincas
    console.log('3️⃣  OBTENIENDO FINCAS...');
    const farmsRes = await makeRequest('GET', 'localhost', 3000, '/api/v1/farms', null, {
      Authorization: `Bearer ${token}`
    });

    if (farmsRes.statusCode !== 200) {
      console.log(`   ❌ Error obteniendo fincas (${farmsRes.statusCode})\n`);
      process.exit(1);
    }

    const farms = farmsRes.data;
    if (!Array.isArray(farms) || farms.length === 0) {
      console.log('   ⚠️  No hay fincas disponibles\n');
      process.exit(1);
    }

    const farm = farms[0];
    console.log(`   ✅ Fincas encontradas: ${farms.length}`);
    console.log(`   Seleccionada: ${farm.name} (ID: ${farm.id})\n`);

    // 4. Llamar endpoint Decision Today
    console.log('4️⃣  CONSULTANDO DECISION-TODAY ENDPOINT...');
    const decisionRes = await makeRequest('GET', 'localhost', 3000, `/api/v1/dashboard/${farm.id}/decision-today`, null, {
      Authorization: `Bearer ${token}`
    });

    if (decisionRes.statusCode !== 200) {
      console.log(`   ❌ Error (${decisionRes.statusCode})`);
      console.log(`   ${JSON.stringify(decisionRes.data)}\n`);
      process.exit(1);
    }

    const decision = decisionRes.data;
    console.log('   ✅ Endpoint respondió correctamente\n');

    // 5. Validar estructura
    console.log('5️⃣  VALIDANDO ESTRUCTURA...\n');

    const validations = [];

    // Confidence Level
    if (decision.confidenceLevel) {
      console.log(`   ✅ confidenceLevel: ${decision.confidenceLevel}`);
      validations.push(true);
    } else {
      console.log('   ❌ confidenceLevel: FALTA');
      validations.push(false);
    }

    // Explainability
    if (decision.explainability && Array.isArray(decision.explainability)) {
      console.log(`   ✅ explainability: ${decision.explainability.length} razones`);
      if (decision.explainability.length > 0) {
        const reason = decision.explainability[0];
        console.log(`      └─ "${reason.reason}" (source: ${reason.source}, weight: ${reason.weight})`);
      }
      validations.push(true);
    } else {
      console.log('   ❌ explainability: VACÍO');
      validations.push(false);
    }

    // Recommended Paddock
    if (decision.recommendedNextPaddock) {
      console.log(`   ✅ recommendedNextPaddock: ${decision.recommendedNextPaddock.name}`);
      console.log(`      └─ Hectáreas: ${decision.recommendedNextPaddock.hectares}`);
      console.log(`      └─ Forraje: ${decision.recommendedNextPaddock.availableForageKg} kg MS`);
      validations.push(true);
    } else {
      console.log('   ⚠️  recommendedNextPaddock: SIN RECOMENDACIÓN');
      validations.push(true);
    }

    // Recommended Herd
    if (decision.recommendedHerd) {
      console.log(`   ✅ recommendedHerd: ${decision.recommendedHerd.name}`);
      console.log(`      └─ UA actual: ${decision.recommendedHerd.currentUA}`);
      validations.push(true);
    } else {
      console.log('   ⚠️  recommendedHerd: SIN RECOMENDACIÓN');
      validations.push(true);
    }

    // Min Rest Days
    if (decision.minRestDays !== undefined) {
      console.log(`   ✅ minRestDays: ${decision.minRestDays} días`);
      validations.push(true);
    } else {
      console.log('   ❌ minRestDays: FALTA');
      validations.push(false);
    }

    // Action Checklist
    if (decision.actionChecklist && Array.isArray(decision.actionChecklist)) {
      console.log(`   ✅ actionChecklist: ${decision.actionChecklist.length} acciones`);
      if (decision.actionChecklist.length > 0) {
        const action = decision.actionChecklist[0];
        console.log(`      └─ "${action.action}" (priority: ${action.priority}, status: ${action.status})`);
      }
      validations.push(true);
    } else {
      console.log('   ⚠️  actionChecklist: VACÍO O NO PRESENTE');
      validations.push(true);
    }

    // 6. Resultado Final
    console.log('\n========================================');
    const passed = validations.filter(v => v === true).length;
    const total = validations.length;
    
    if (passed === total) {
      console.log(`  ✅ TEST: PASS (${passed}/${total} validaciones)`);
    } else {
      console.log(`  ⚠️  TEST: PARTIAL (${passed}/${total} validaciones)`);
    }
    console.log('========================================\n');

    // 7. URL para prueba manual
    console.log('📍 PRUEBA MANUAL EN NAVEGADOR:');
    console.log(`   http://localhost:3001/farms/${farm.id}/decision-today\n`);

    // 8. Guardar respuesta completa
    console.log('📁 RESPUESTA COMPLETA:');
    console.log(JSON.stringify(decision, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runTest();
