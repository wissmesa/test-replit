#!/usr/bin/env node

import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no configurada');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function applyProductionData() {
  console.log('🚀 Aplicando datos a producción...\n');
  
  try {
    // Leer datos exportados
    const exportData = JSON.parse(fs.readFileSync('data-export.json', 'utf8'));
    const { users, apartments, pagos, exchangeRates } = exportData;
    
    console.log('📊 Datos a migrar:');
    console.log(`   👥 ${users.length} usuarios`);
    console.log(`   🏠 ${apartments.length} apartamentos`);
    console.log(`   💳 ${pagos.length} pagos`);
    console.log(`   💱 ${exchangeRates.length} tasas de cambio\n`);

    let migrated = { users: 0, apartments: 0, pagos: 0, rates: 0 };

    // Insertar usuarios
    console.log('👥 Insertando usuarios...');
    for (const user of users) {
      try {
        await sql`
          INSERT INTO users (
            id, email, first_name, last_name, profile_image_url,
            primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
            telefono, correo, contrasena, identificacion, tipo_usuario,
            tipo_identificacion, id_apartamento, created_at, updated_at
          ) VALUES (
            ${user.id}, ${user.email}, ${user.first_name}, ${user.last_name}, 
            ${user.profile_image_url}, ${user.primer_nombre}, ${user.segundo_nombre}, 
            ${user.primer_apellido}, ${user.segundo_apellido}, ${user.telefono}, 
            ${user.correo}, ${user.contrasena}, ${user.identificacion}, 
            ${user.tipo_usuario}, ${user.tipo_identificacion}, ${user.id_apartamento}, 
            ${user.created_at}, ${user.updated_at}
          ) ON CONFLICT (id) DO UPDATE SET
            primer_nombre = EXCLUDED.primer_nombre,
            primer_apellido = EXCLUDED.primer_apellido,
            telefono = EXCLUDED.telefono,
            id_apartamento = EXCLUDED.id_apartamento,
            updated_at = NOW()
        `;
        migrated.users++;
      } catch (error) {
        if (!error.message.includes('duplicate')) {
          console.error(`Error con usuario ${user.id}:`, error.message);
        }
      }
    }

    // Insertar apartamentos
    console.log('🏠 Insertando apartamentos...');
    for (const apt of apartments) {
      try {
        await sql`
          INSERT INTO apartments (id, piso, numero, alicuota, created_at, updated_at)
          VALUES (${apt.id}, ${apt.piso}, ${apt.numero}, ${apt.alicuota}, 
                  ${apt.created_at}, ${apt.updated_at})
          ON CONFLICT (id) DO UPDATE SET
            piso = EXCLUDED.piso,
            numero = EXCLUDED.numero,
            alicuota = EXCLUDED.alicuota,
            updated_at = NOW()
        `;
        migrated.apartments++;
      } catch (error) {
        if (!error.message.includes('duplicate')) {
          console.error(`Error con apartamento ${apt.id}:`, error.message);
        }
      }
    }

    // Insertar pagos
    console.log('💳 Insertando pagos...');
    for (const pago of pagos) {
      try {
        await sql`
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
            ${pago.tipo_operacion}, ${pago.correo_electronico}, 
            ${pago.created_at}, ${pago.updated_at}
          ) ON CONFLICT (id) DO UPDATE SET
            estado = EXCLUDED.estado,
            fecha_pago = EXCLUDED.fecha_pago,
            metodo_pago = EXCLUDED.metodo_pago,
            updated_at = NOW()
        `;
        migrated.pagos++;
      } catch (error) {
        if (!error.message.includes('duplicate')) {
          console.error(`Error con pago ${pago.id}:`, error.message);
        }
      }
    }

    // Insertar tasas de cambio
    console.log('💱 Insertando tasas de cambio...');
    for (const rate of exchangeRates) {
      try {
        await sql`
          INSERT INTO tasas_cambio (id, fecha, moneda, valor, fuente, created_at)
          VALUES (${rate.id}, ${rate.fecha}, ${rate.moneda}, ${rate.valor}, 
                  ${rate.fuente}, ${rate.created_at})
          ON CONFLICT (id) DO UPDATE SET
            valor = EXCLUDED.valor,
            fecha = EXCLUDED.fecha
        `;
        migrated.rates++;
      } catch (error) {
        if (!error.message.includes('duplicate')) {
          console.error(`Error con tasa ${rate.id}:`, error.message);
        }
      }
    }

    // Actualizar secuencias
    console.log('🔄 Actualizando secuencias...');
    try {
      await sql`SELECT setval('apartments_id_seq', COALESCE((SELECT MAX(id) FROM apartments), 1))`;
      await sql`SELECT setval('tasas_cambio_id_seq', COALESCE((SELECT MAX(id) FROM tasas_cambio), 1))`;
    } catch (error) {
      console.log('ℹ️ Secuencias no necesitan actualización');
    }

    // Verificación final
    const [finalUsers, finalApts, finalPagos, finalRates] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM apartments`,
      sql`SELECT COUNT(*) as count FROM pagos`,
      sql`SELECT COUNT(*) as count FROM tasas_cambio`
    ]);

    console.log('\n✅ ¡Migración completada exitosamente!');
    console.log(`   👥 ${finalUsers[0].count} usuarios en producción`);
    console.log(`   🏠 ${finalApts[0].count} apartamentos en producción`);
    console.log(`   💳 ${finalPagos[0].count} pagos en producción`);
    console.log(`   💱 ${finalRates[0].count} tasas de cambio en producción`);
    
    console.log('\n📈 Registros procesados:');
    console.log(`   ✅ ${migrated.users} usuarios migrados`);
    console.log(`   ✅ ${migrated.apartments} apartamentos migrados`);
    console.log(`   ✅ ${migrated.pagos} pagos migrados`);
    console.log(`   ✅ ${migrated.rates} tasas migradas`);

    console.log('\n🎉 Tu aplicación de producción ahora tiene todos los datos!');
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar
applyProductionData()
  .then(() => {
    console.log('\n🚀 Sincronización completa');
  })
  .catch(error => {
    console.error('💥 Error en migración:', error.message);
    process.exit(1);
  });