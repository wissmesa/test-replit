#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';

// URL de desarrollo (actual)
const DEV_DATABASE_URL = process.env.DATABASE_URL;

// Para producción, necesitarás configurar esta variable
const PROD_DATABASE_URL = process.env.PROD_DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;

console.log('🚀 Iniciando sincronización completa a producción...\n');

if (!DEV_DATABASE_URL) {
  console.error('❌ DATABASE_URL no encontrada');
  process.exit(1);
}

if (!PROD_DATABASE_URL) {
  console.error('❌ PROD_DATABASE_URL no configurada');
  console.error('💡 Configúrala con: export PROD_DATABASE_URL="tu_url_de_produccion"');
  console.error('📋 O puedes usar el archivo SQL generado manualmente');
  
  // Mostrar resumen de datos disponibles
  console.log('\n📊 Datos disponibles para migrar:');
  console.log('   - 12 usuarios (admin + propietarios)');
  console.log('   - 48 apartamentos (9 pisos)'); 
  console.log('   - 48 pagos (varios estados)');
  console.log('   - 15 tasas de cambio BCV');
  console.log('\n📁 Archivos disponibles:');
  console.log('   - data-export.json (respaldo completo)');
  console.log('   - production-migration.sql (script listo para ejecutar)');
  
  process.exit(1);
}

const devSql = neon(DEV_DATABASE_URL);
const prodSql = neon(PROD_DATABASE_URL);

async function syncDataToProduction() {
  try {
    console.log('🔍 Verificando conexiones...');
    await devSql`SELECT 1`;
    await prodSql`SELECT 1`;
    console.log('✅ Conexiones verificadas\n');

    // Exportar datos de desarrollo
    console.log('📤 Exportando desde desarrollo...');
    
    const [users, apartments, pagos, tasas] = await Promise.all([
      devSql`SELECT * FROM users ORDER BY created_at`,
      devSql`SELECT * FROM apartments ORDER BY piso, numero`,
      devSql`SELECT * FROM pagos ORDER BY fecha_vencimiento`,
      devSql`SELECT * FROM tasas_cambio ORDER BY fecha DESC`
    ]);

    console.log(`   📋 ${users.length} usuarios`);
    console.log(`   🏠 ${apartments.length} apartamentos`);
    console.log(`   💳 ${pagos.length} pagos`);
    console.log(`   💱 ${tasas.length} tasas de cambio`);

    // Migrar usuarios
    console.log('\n👥 Sincronizando usuarios...');
    for (const user of users) {
      await prodSql`
        INSERT INTO users (
          id, email, first_name, last_name, profile_image_url,
          primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
          telefono, correo, contrasena, identificacion, tipo_usuario, 
          tipo_identificacion, id_apartamento, created_at, updated_at
        ) VALUES (
          ${user.id}, ${user.email}, ${user.first_name}, ${user.last_name}, ${user.profile_image_url},
          ${user.primer_nombre}, ${user.segundo_nombre}, ${user.primer_apellido}, ${user.segundo_apellido},
          ${user.telefono}, ${user.correo}, ${user.contrasena}, ${user.identificacion}, 
          ${user.tipo_usuario}, ${user.tipo_identificacion}, ${user.id_apartamento},
          ${user.created_at}, ${user.updated_at}
        ) ON CONFLICT (id) DO UPDATE SET
          primer_nombre = EXCLUDED.primer_nombre,
          primer_apellido = EXCLUDED.primer_apellido,
          correo = EXCLUDED.correo,
          telefono = EXCLUDED.telefono,
          id_apartamento = EXCLUDED.id_apartamento,
          updated_at = EXCLUDED.updated_at
      `;
    }

    // Migrar apartamentos
    console.log('🏠 Sincronizando apartamentos...');
    for (const apt of apartments) {
      await prodSql`
        INSERT INTO apartments (id, piso, numero, alicuota, created_at, updated_at)
        VALUES (${apt.id}, ${apt.piso}, ${apt.numero}, ${apt.alicuota}, ${apt.created_at}, ${apt.updated_at})
        ON CONFLICT (id) DO UPDATE SET
          piso = EXCLUDED.piso,
          numero = EXCLUDED.numero,
          alicuota = EXCLUDED.alicuota,
          updated_at = EXCLUDED.updated_at
      `;
    }

    // Migrar pagos
    console.log('💳 Sincronizando pagos...');
    for (const pago of pagos) {
      await prodSql`
        INSERT INTO pagos (
          id, id_usuario, id_apartamento, monto, monto_bs, tasa_cambio,
          fecha_vencimiento, fecha_pago, estado, metodo_pago, concepto,
          comprobante_url, fecha_operacion, cedula_rif, tipo_operacion,
          correo_electronico, created_at, updated_at
        ) VALUES (
          ${pago.id}, ${pago.id_usuario}, ${pago.id_apartamento}, ${pago.monto},
          ${pago.monto_bs}, ${pago.tasa_cambio}, ${pago.fecha_vencimiento},
          ${pago.fecha_pago}, ${pago.estado}, ${pago.metodo_pago}, ${pago.concepto},
          ${pago.comprobante_url}, ${pago.fecha_operacion}, ${pago.cedula_rif},
          ${pago.tipo_operacion}, ${pago.correo_electronico}, ${pago.created_at}, ${pago.updated_at}
        ) ON CONFLICT (id) DO UPDATE SET
          estado = EXCLUDED.estado,
          fecha_pago = EXCLUDED.fecha_pago,
          metodo_pago = EXCLUDED.metodo_pago,
          updated_at = EXCLUDED.updated_at
      `;
    }

    // Migrar tasas de cambio
    console.log('💱 Sincronizando tasas BCV...');
    for (const tasa of tasas) {
      await prodSql`
        INSERT INTO tasas_cambio (id, fecha, moneda, valor, fuente, created_at)
        VALUES (${tasa.id}, ${tasa.fecha}, ${tasa.moneda}, ${tasa.valor}, ${tasa.fuente}, ${tasa.created_at})
        ON CONFLICT (id) DO UPDATE SET
          valor = EXCLUDED.valor,
          fecha = EXCLUDED.fecha
      `;
    }

    // Actualizar secuencias
    console.log('🔄 Actualizando secuencias...');
    await prodSql`SELECT setval('apartments_id_seq', COALESCE((SELECT MAX(id) FROM apartments), 1))`;
    await prodSql`SELECT setval('tasas_cambio_id_seq', COALESCE((SELECT MAX(id) FROM tasas_cambio), 1))`;

    // Verificación final
    const [finalUsers, finalApartments, finalPagos, finalTasas] = await Promise.all([
      prodSql`SELECT COUNT(*) as count FROM users`,
      prodSql`SELECT COUNT(*) as count FROM apartments`, 
      prodSql`SELECT COUNT(*) as count FROM pagos`,
      prodSql`SELECT COUNT(*) as count FROM tasas_cambio`
    ]);

    console.log('\n✅ ¡Migración completada!');
    console.log(`   👥 ${finalUsers[0].count} usuarios en producción`);
    console.log(`   🏠 ${finalApartments[0].count} apartamentos en producción`);
    console.log(`   💳 ${finalPagos[0].count} pagos en producción`);
    console.log(`   💱 ${finalTasas[0].count} tasas de cambio en producción`);
    console.log('\n🎉 Tu aplicación en producción ahora tiene todos los datos!');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error('💡 Revisa la conectividad y permisos de las bases de datos');
    throw error;
  }
}

// Ejecutar migración
syncDataToProduction()
  .then(() => {
    console.log('\n🚀 Sincronización completa finalizada');
  })
  .catch(error => {
    console.error('💥 Falló la sincronización:', error);
    process.exit(1);
  });