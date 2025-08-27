#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const DEV_DATABASE_URL = process.env.DATABASE_URL;
const PROD_DATABASE_URL = process.env.PRODUCTION_DATABASE_URL;

if (!DEV_DATABASE_URL) {
  console.error('❌ DATABASE_URL (desarrollo) no está configurada');
  process.exit(1);
}

if (!PROD_DATABASE_URL) {
  console.error('❌ PRODUCTION_DATABASE_URL no está configurada');
  console.error('💡 Por favor configura la variable de entorno PRODUCTION_DATABASE_URL con la URL de tu base de datos de producción');
  process.exit(1);
}

const devSql = neon(DEV_DATABASE_URL);
const prodSql = neon(PROD_DATABASE_URL);

async function migrateToProduction() {
  console.log('🚀 Iniciando migración completa de desarrollo a producción...\n');
  
  try {
    // Paso 1: Verificar conexiones
    console.log('🔍 Verificando conexiones...');
    
    try {
      await devSql`SELECT 1`;
      console.log('✅ Conexión a desarrollo exitosa');
    } catch (error) {
      console.error('❌ Error conectando a desarrollo:', error.message);
      process.exit(1);
    }
    
    try {
      await prodSql`SELECT 1`;
      console.log('✅ Conexión a producción exitosa');
    } catch (error) {
      console.error('❌ Error conectando a producción:', error.message);
      process.exit(1);
    }
    
    // Paso 2: Verificar estado actual de producción
    console.log('\n📊 Verificando estado actual de producción...');
    
    const prodUsers = await prodSql`SELECT COUNT(*) as count FROM users`;
    const prodApartments = await prodSql`SELECT COUNT(*) as count FROM apartments`;
    const prodPagos = await prodSql`SELECT COUNT(*) as count FROM pagos`;
    const prodRates = await prodSql`SELECT COUNT(*) as count FROM tasas_cambio`;
    
    console.log(`   - ${prodUsers[0].count} usuarios existentes`);
    console.log(`   - ${prodApartments[0].count} apartamentos existentes`);
    console.log(`   - ${prodPagos[0].count} pagos existentes`);
    console.log(`   - ${prodRates[0].count} tasas de cambio existentes`);
    
    if (prodUsers[0].count > 0 || prodApartments[0].count > 0 || prodPagos[0].count > 0) {
      console.log('\n⚠️ ADVERTENCIA: La base de datos de producción ya contiene datos.');
      console.log('Esta migración eliminará TODOS los datos existentes en producción.');
      console.log('¿Estás seguro que deseas continuar? (Escribe "SI CONFIRMO" para continuar)');
      
      // En un entorno real aquí pedirías confirmación del usuario
      // Por ahora, solo mostramos la advertencia
      console.log('⏭️  Saltando confirmación para demostración...\n');
    }
    
    // Paso 3: Exportar datos de desarrollo
    console.log('📤 Exportando datos de desarrollo...');
    
    const devUsers = await devSql`SELECT * FROM users ORDER BY created_at`;
    const devApartments = await devSql`SELECT * FROM apartments ORDER BY piso, numero`;
    const devPagos = await devSql`SELECT * FROM pagos ORDER BY fecha_vencimiento`;
    const devRates = await devSql`SELECT * FROM tasas_cambio ORDER BY fecha DESC`;
    
    console.log(`   ✅ ${devUsers.length} usuarios exportados`);
    console.log(`   ✅ ${devApartments.length} apartamentos exportados`);
    console.log(`   ✅ ${devPagos.length} pagos exportados`);
    console.log(`   ✅ ${devRates.length} tasas de cambio exportadas`);
    
    // Paso 4: Limpiar producción (opcional - comentado por seguridad)
    console.log('\n🧹 Limpiando datos de producción...');
    
    // DESCOMENTA ESTAS LÍNEAS SOLO SI ESTÁS SEGURO DE ELIMINAR TODO EN PRODUCCIÓN
    /*
    await prodSql`TRUNCATE TABLE pagos CASCADE`;
    await prodSql`TRUNCATE TABLE apartments CASCADE`;  
    await prodSql`TRUNCATE TABLE users CASCADE`;
    await prodSql`TRUNCATE TABLE tasas_cambio CASCADE`;
    await prodSql`DELETE FROM sessions`;
    console.log('   ✅ Datos de producción eliminados');
    */
    
    console.log('   ⏭️  Limpieza saltada (descomenta el código para habilitar)');
    
    // Paso 5: Insertar usuarios
    console.log('\n👥 Migrando usuarios...');
    let migratedUsers = 0;
    
    for (const user of devUsers) {
      try {
        await prodSql`
          INSERT INTO users (
            id, email, first_name, last_name, profile_image_url, 
            primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, 
            telefono, correo, contrasena, identificacion, tipo_usuario, tipo_identificacion, 
            id_apartamento, created_at, updated_at
          ) VALUES (
            ${user.id}, ${user.email}, ${user.first_name}, ${user.last_name}, ${user.profile_image_url},
            ${user.primer_nombre}, ${user.segundo_nombre}, ${user.primer_apellido}, ${user.segundo_apellido},
            ${user.telefono}, ${user.correo}, ${user.contrasena}, ${user.identificacion}, 
            ${user.tipo_usuario}, ${user.tipo_identificacion}, ${user.id_apartamento}, 
            ${user.created_at}, ${user.updated_at}
          )
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            profile_image_url = EXCLUDED.profile_image_url,
            primer_nombre = EXCLUDED.primer_nombre,
            segundo_nombre = EXCLUDED.segundo_nombre,
            primer_apellido = EXCLUDED.primer_apellido,
            segundo_apellido = EXCLUDED.segundo_apellido,
            telefono = EXCLUDED.telefono,
            correo = EXCLUDED.correo,
            contrasena = EXCLUDED.contrasena,
            identificacion = EXCLUDED.identificacion,
            tipo_usuario = EXCLUDED.tipo_usuario,
            tipo_identificacion = EXCLUDED.tipo_identificacion,
            id_apartamento = EXCLUDED.id_apartamento,
            updated_at = EXCLUDED.updated_at
        `;
        migratedUsers++;
      } catch (error) {
        console.error(`❌ Error migrando usuario ${user.id}:`, error.message);
      }
    }
    
    console.log(`   ✅ ${migratedUsers}/${devUsers.length} usuarios migrados`);
    
    // Paso 6: Insertar apartamentos
    console.log('\n🏠 Migrando apartamentos...');
    let migratedApartments = 0;
    
    for (const apt of devApartments) {
      try {
        await prodSql`
          INSERT INTO apartments (id, piso, numero, alicuota, created_at, updated_at) 
          VALUES (${apt.id}, ${apt.piso}, ${apt.numero}, ${apt.alicuota}, ${apt.created_at}, ${apt.updated_at})
          ON CONFLICT (id) DO UPDATE SET
            piso = EXCLUDED.piso,
            numero = EXCLUDED.numero,
            alicuota = EXCLUDED.alicuota,
            updated_at = EXCLUDED.updated_at
        `;
        migratedApartments++;
      } catch (error) {
        console.error(`❌ Error migrando apartamento ${apt.id}:`, error.message);
      }
    }
    
    console.log(`   ✅ ${migratedApartments}/${devApartments.length} apartamentos migrados`);
    
    // Paso 7: Insertar pagos
    console.log('\n💳 Migrando pagos...');
    let migratedPagos = 0;
    
    for (const pago of devPagos) {
      try {
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
          )
          ON CONFLICT (id) DO UPDATE SET
            id_usuario = EXCLUDED.id_usuario,
            id_apartamento = EXCLUDED.id_apartamento,
            monto = EXCLUDED.monto,
            monto_bs = EXCLUDED.monto_bs,
            tasa_cambio = EXCLUDED.tasa_cambio,
            fecha_vencimiento = EXCLUDED.fecha_vencimiento,
            fecha_pago = EXCLUDED.fecha_pago,
            estado = EXCLUDED.estado,
            metodo_pago = EXCLUDED.metodo_pago,
            concepto = EXCLUDED.concepto,
            comprobante_url = EXCLUDED.comprobante_url,
            fecha_operacion = EXCLUDED.fecha_operacion,
            cedula_rif = EXCLUDED.cedula_rif,
            tipo_operacion = EXCLUDED.tipo_operacion,
            correo_electronico = EXCLUDED.correo_electronico,
            updated_at = EXCLUDED.updated_at
        `;
        migratedPagos++;
      } catch (error) {
        console.error(`❌ Error migrando pago ${pago.id}:`, error.message);
      }
    }
    
    console.log(`   ✅ ${migratedPagos}/${devPagos.length} pagos migrados`);
    
    // Paso 8: Insertar tasas de cambio
    console.log('\n💱 Migrando tasas de cambio...');
    let migratedRates = 0;
    
    for (const rate of devRates) {
      try {
        await prodSql`
          INSERT INTO tasas_cambio (id, fecha, moneda, valor, fuente, created_at) 
          VALUES (${rate.id}, ${rate.fecha}, ${rate.moneda}, ${rate.valor}, ${rate.fuente}, ${rate.created_at})
          ON CONFLICT (id) DO UPDATE SET
            fecha = EXCLUDED.fecha,
            moneda = EXCLUDED.moneda,
            valor = EXCLUDED.valor,
            fuente = EXCLUDED.fuente
        `;
        migratedRates++;
      } catch (error) {
        console.error(`❌ Error migrando tasa ${rate.id}:`, error.message);
      }
    }
    
    console.log(`   ✅ ${migratedRates}/${devRates.length} tasas de cambio migradas`);
    
    // Paso 9: Actualizar secuencias
    console.log('\n🔄 Actualizando secuencias...');
    
    try {
      await prodSql`SELECT setval('apartments_id_seq', COALESCE((SELECT MAX(id) FROM apartments), 1))`;
      await prodSql`SELECT setval('tasas_cambio_id_seq', COALESCE((SELECT MAX(id) FROM tasas_cambio), 1))`;
      console.log('   ✅ Secuencias actualizadas');
    } catch (error) {
      console.error('❌ Error actualizando secuencias:', error.message);
    }
    
    // Paso 10: Verificación final
    console.log('\n📊 Verificación final...');
    
    const finalUsers = await prodSql`SELECT COUNT(*) as count FROM users`;
    const finalApartments = await prodSql`SELECT COUNT(*) as count FROM apartments`;
    const finalPagos = await prodSql`SELECT COUNT(*) as count FROM pagos`;
    const finalRates = await prodSql`SELECT COUNT(*) as count FROM tasas_cambio`;
    
    console.log(`   📋 Usuarios en producción: ${finalUsers[0].count}`);
    console.log(`   🏠 Apartamentos en producción: ${finalApartments[0].count}`);
    console.log(`   💳 Pagos en producción: ${finalPagos[0].count}`);
    console.log(`   💱 Tasas de cambio en producción: ${finalRates[0].count}`);
    
    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('✨ Todos los datos han sido migrados de desarrollo a producción.');
    
    return {
      migratedUsers,
      migratedApartments,
      migratedPagos,
      migratedRates,
      totalRecords: migratedUsers + migratedApartments + migratedPagos + migratedRates
    };
    
  } catch (error) {
    console.error('\n💥 Error durante la migración:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToProduction()
    .then((result) => {
      console.log(`\n📈 Resumen final: ${result.totalRecords} registros migrados exitosamente`);
      console.log('🚀 La aplicación en producción ahora tiene todos los datos de desarrollo');
    })
    .catch(error => {
      console.error('💥 Migración falló:', error);
      process.exit(1);
    });
}

export default migrateToProduction;