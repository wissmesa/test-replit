#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DEV_DATABASE_URL = process.env.DATABASE_URL;

if (!DEV_DATABASE_URL) {
  console.error('❌ DATABASE_URL no está configurada');
  process.exit(1);
}

const devSql = neon(DEV_DATABASE_URL);

async function exportData() {
  console.log('🔄 Exportando datos de la base de datos de desarrollo...');
  
  try {
    // Exportar usuarios
    console.log('📥 Exportando usuarios...');
    const users = await devSql`SELECT * FROM users ORDER BY created_at`;
    
    // Exportar apartamentos  
    console.log('🏠 Exportando apartamentos...');
    const apartments = await devSql`SELECT * FROM apartments ORDER BY piso, numero`;
    
    // Exportar pagos
    console.log('💳 Exportando pagos...');
    const pagos = await devSql`SELECT * FROM pagos ORDER BY fecha_vencimiento`;
    
    // Exportar tasas de cambio
    console.log('💱 Exportando tasas de cambio...');
    const exchangeRates = await devSql`SELECT * FROM tasas_cambio ORDER BY fecha DESC`;
    
    // Exportar sesiones (opcional, normalmente no se migran)
    console.log('🔐 Exportando sesiones...');
    const sessions = await devSql`SELECT * FROM sessions ORDER BY expire`;
    
    const exportData = {
      users: users,
      apartments: apartments,
      pagos: pagos,
      exchangeRates: exchangeRates,
      sessions: sessions,
      exportDate: new Date().toISOString(),
      totalRecords: {
        users: users.length,
        apartments: apartments.length,
        pagos: pagos.length,
        exchangeRates: exchangeRates.length,
        sessions: sessions.length
      }
    };
    
    // Guardar datos exportados
    const exportPath = 'data-export.json';
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log('✅ Datos exportados exitosamente:');
    console.log(`   - ${users.length} usuarios`);
    console.log(`   - ${apartments.length} apartamentos`);
    console.log(`   - ${pagos.length} pagos`);
    console.log(`   - ${exchangeRates.length} tasas de cambio`);
    console.log(`   - ${sessions.length} sesiones`);
    console.log(`   📁 Archivo: ${exportPath}`);
    
    // Generar script SQL para producción
    await generateProductionScript(exportData);
    
    return exportData;
    
  } catch (error) {
    console.error('❌ Error exportando datos:', error);
    throw error;
  }
}

async function generateProductionScript(data) {
  console.log('📝 Generando script SQL para producción...');
  
  let sqlScript = `-- Script de migración de desarrollo a producción
-- Generado el: ${new Date().toISOString()}
-- Total de registros: ${data.totalRecords.users + data.totalRecords.apartments + data.totalRecords.pagos + data.totalRecords.exchangeRates}

-- Limpiar datos existentes (CUIDADO: esto eliminará todos los datos actuales)
-- Descomenta las siguientes líneas solo si estás seguro
-- TRUNCATE TABLE pagos CASCADE;
-- TRUNCATE TABLE apartments CASCADE;  
-- TRUNCATE TABLE users CASCADE;
-- TRUNCATE TABLE tasas_cambio CASCADE;
-- DELETE FROM session;

-- ================================================
-- INSERTAR USUARIOS
-- ================================================
`;

  // Generar inserts para usuarios
  if (data.users.length > 0) {
    sqlScript += `
INSERT INTO users (
  id, email, first_name, last_name, profile_image_url, 
  primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, 
  telefono, correo, contrasena, identificacion, tipo_usuario, tipo_identificacion, 
  id_apartamento, created_at, updated_at
) VALUES\n`;
    
    const userInserts = data.users.map(user => {
      const values = [
        `'${user.id}'`,
        user.email ? `'${user.email.replace(/'/g, "''")}'` : 'NULL',
        user.first_name ? `'${user.first_name.replace(/'/g, "''")}'` : 'NULL',
        user.last_name ? `'${user.last_name.replace(/'/g, "''")}'` : 'NULL',
        user.profile_image_url ? `'${user.profile_image_url.replace(/'/g, "''")}'` : 'NULL',
        user.primer_nombre ? `'${user.primer_nombre.replace(/'/g, "''")}'` : 'NULL',
        user.segundo_nombre ? `'${user.segundo_nombre.replace(/'/g, "''")}'` : 'NULL',
        user.primer_apellido ? `'${user.primer_apellido.replace(/'/g, "''")}'` : 'NULL',
        user.segundo_apellido ? `'${user.segundo_apellido.replace(/'/g, "''")}'` : 'NULL',
        user.telefono ? `'${user.telefono}'` : 'NULL',
        user.correo ? `'${user.correo.replace(/'/g, "''")}'` : 'NULL',
        user.contrasena ? `'${user.contrasena.replace(/'/g, "''")}'` : 'NULL',
        user.identificacion ? `'${user.identificacion}'` : 'NULL',
        user.tipo_usuario ? `'${user.tipo_usuario}'` : 'NULL',
        user.tipo_identificacion ? `'${user.tipo_identificacion}'` : 'NULL',
        user.id_apartamento || 'NULL',
        user.created_at ? `'${user.created_at}'` : 'NOW()',
        user.updated_at ? `'${user.updated_at}'` : 'NOW()'
      ];
      return `  (${values.join(', ')})`;
    });
    
    sqlScript += userInserts.join(',\n') + ';\n\n';
  }

  // Generar inserts para apartamentos
  if (data.apartments.length > 0) {
    sqlScript += `-- ================================================
-- INSERTAR APARTAMENTOS
-- ================================================

INSERT INTO apartments (id, piso, numero, alicuota, created_at, updated_at) VALUES\n`;
    
    const apartmentInserts = data.apartments.map(apt => {
      const values = [
        apt.id,
        apt.piso,
        `'${apt.numero}'`,
        `'${apt.alicuota}'`,
        apt.created_at ? `'${apt.created_at}'` : 'NOW()',
        apt.updated_at ? `'${apt.updated_at}'` : 'NOW()'
      ];
      return `  (${values.join(', ')})`;
    });
    
    sqlScript += apartmentInserts.join(',\n') + ';\n\n';
  }

  // Generar inserts para pagos
  if (data.pagos.length > 0) {
    sqlScript += `-- ================================================
-- INSERTAR PAGOS
-- ================================================

INSERT INTO pagos (
  id, id_usuario, id_apartamento, monto, monto_bs, tasa_cambio, 
  fecha_vencimiento, fecha_pago, estado, metodo_pago, concepto, 
  comprobante_url, fecha_operacion, cedula_rif, tipo_operacion, 
  correo_electronico, created_at, updated_at
) VALUES\n`;
    
    const pagoInserts = data.pagos.map(pago => {
      const values = [
        `'${pago.id}'`,
        pago.id_usuario ? `'${pago.id_usuario}'` : 'NULL',
        pago.id_apartamento || 'NULL',
        pago.monto ? `'${pago.monto}'` : 'NULL',
        pago.monto_bs ? `'${pago.monto_bs}'` : 'NULL',
        pago.tasa_cambio ? `'${pago.tasa_cambio}'` : 'NULL',
        pago.fecha_vencimiento ? `'${pago.fecha_vencimiento}'` : 'NULL',
        pago.fecha_pago ? `'${pago.fecha_pago}'` : 'NULL',
        pago.estado ? `'${pago.estado}'` : 'NULL',
        pago.metodo_pago ? `'${pago.metodo_pago}'` : 'NULL',
        pago.concepto ? `'${pago.concepto.replace(/'/g, "''")}'` : 'NULL',
        pago.comprobante_url ? `'${pago.comprobante_url.replace(/'/g, "''")}'` : 'NULL',
        pago.fecha_operacion ? `'${pago.fecha_operacion}'` : 'NULL',
        pago.cedula_rif ? `'${pago.cedula_rif}'` : 'NULL',
        pago.tipo_operacion ? `'${pago.tipo_operacion}'` : 'NULL',
        pago.correo_electronico ? `'${pago.correo_electronico.replace(/'/g, "''")}'` : 'NULL',
        pago.created_at ? `'${pago.created_at}'` : 'NOW()',
        pago.updated_at ? `'${pago.updated_at}'` : 'NOW()'
      ];
      return `  (${values.join(', ')})`;
    });
    
    sqlScript += pagoInserts.join(',\n') + ';\n\n';
  }

  // Generar inserts para tasas de cambio
  if (data.exchangeRates.length > 0) {
    sqlScript += `-- ================================================
-- INSERTAR TASAS DE CAMBIO
-- ================================================

INSERT INTO tasas_cambio (id, fecha, moneda, valor, fuente, "createdAt") VALUES\n`;
    
    const rateInserts = data.exchangeRates.map(rate => {
      const values = [
        rate.id,
        `'${rate.fecha}'`,
        `'${rate.moneda}'`,
        `'${rate.valor}'`,
        `'${rate.fuente}'`,
        rate.createdAt ? `'${rate.createdAt}'` : 'NOW()'
      ];
      return `  (${values.join(', ')})`;
    });
    
    sqlScript += rateInserts.join(',\n') + ';\n\n';
  }

  // Actualizar secuencias
  sqlScript += `-- ================================================
-- ACTUALIZAR SECUENCIAS
-- ================================================

-- Actualizar secuencia de apartamentos
SELECT setval('apartments_id_seq', COALESCE((SELECT MAX(id) FROM apartments), 1));

-- Actualizar secuencia de tasas de cambio
SELECT setval('tasas_cambio_id_seq', COALESCE((SELECT MAX(id) FROM tasas_cambio), 1));

-- Verificar datos insertados
SELECT 'Usuarios insertados: ' || COUNT(*) FROM users;
SELECT 'Apartamentos insertados: ' || COUNT(*) FROM apartments;  
SELECT 'Pagos insertados: ' || COUNT(*) FROM pagos;
SELECT 'Tasas de cambio insertadas: ' || COUNT(*) FROM tasas_cambio;
`;

  // Guardar script
  const scriptPath = 'production-migration.sql';
  fs.writeFileSync(scriptPath, sqlScript);
  
  console.log(`✅ Script SQL generado: ${scriptPath}`);
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  exportData()
    .then((data) => {
      console.log('🎉 Migración preparada exitosamente');
      console.log('📋 Próximos pasos:');
      console.log('   1. Configura la variable PRODUCTION_DATABASE_URL');
      console.log('   2. Ejecuta el script production-migration.sql en producción');
      console.log('   3. Verifica que todos los datos se hayan migrado correctamente');
    })
    .catch(error => {
      console.error('💥 Error en la migración:', error);
      process.exit(1);
    });
}

export default exportData;