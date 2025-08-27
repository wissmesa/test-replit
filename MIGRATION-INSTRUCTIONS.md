# 🚀 Guía de Migración: Desarrollo → Producción

Esta guía te ayudará a migrar todos los datos de tu base de datos de desarrollo a producción de forma segura.

## 📊 Datos a Migrar

Actualmente tienes en desarrollo:
- ✅ **12 usuarios** (incluyendo administradores y propietarios)
- ✅ **48 apartamentos** (distribuidos en 9 pisos)
- ✅ **48 pagos** (con diferentes estados y métodos de pago)
- ✅ **15 tasas de cambio** (historial de BCV)

## 🔧 Opciones de Migración

### Opción 1: Migración Automática (Recomendada)

1. **Configura la variable de producción:**
   ```bash
   export PRODUCTION_DATABASE_URL="tu_url_de_produccion_aqui"
   ```

2. **Ejecuta la migración automática:**
   ```bash
   node migrate-to-production-complete.js
   ```

### Opción 2: Migración Manual con SQL

1. **Revisa el script generado:**
   ```bash
   cat production-migration.sql
   ```

2. **Ejecuta el script en tu base de datos de producción**

## ⚠️ Consideraciones Importantes

### Antes de Migrar

- [ ] **Backup de producción**: Siempre haz respaldo de tu base de datos de producción
- [ ] **Verificar conexiones**: Asegúrate de tener acceso a ambas bases de datos  
- [ ] **Revisar datos**: Confirma que los datos en desarrollo son los correctos
- [ ] **Horario de migración**: Ejecuta durante horarios de bajo tráfico

### Durante la Migración

- [ ] **Datos existentes**: La migración sobrescribirá datos existentes en producción
- [ ] **Contraseñas**: Se migrarán las contraseñas encriptadas actuales
- [ ] **Sesiones**: Las sesiones NO se migrarán (por seguridad)
- [ ] **IDs únicos**: Se preservarán todos los IDs existentes

## 🔐 Seguridad

### Datos Sensibles Incluidos
- ✅ **Contraseñas encriptadas** de usuarios (seguras con bcrypt)
- ✅ **Información personal** (nombres, cédulas, teléfonos)  
- ✅ **Datos financieros** (montos, tasas de cambio)

### Datos NO Incluidos
- ❌ **Sesiones activas** (se ignorarán por seguridad)
- ❌ **Tokens temporales** (no están en el schema)

## 📋 Verificación Post-Migración

Después de la migración, verifica:

1. **Conteos de registros:**
   - Usuarios: debe haber 12
   - Apartamentos: debe haber 48  
   - Pagos: debe haber 48
   - Tasas de cambio: debe haber 15

2. **Funcionalidad crítica:**
   - [ ] Login de administrador funciona
   - [ ] Dashboard carga correctamente
   - [ ] Relaciones entre tablas están intactas
   - [ ] Tasas de cambio se muestran correctamente

3. **Scheduler BCV:**
   - [ ] La sincronización diaria funciona a las 9:00 AM
   - [ ] No hay errores en los logs

## 🆘 Resolución de Problemas

### Error: "relation does not exist"
- Ejecuta primero las migraciones de schema con `npm run db:push`

### Error: "duplicate key value"  
- Datos duplicados en producción. Usa el script automático que maneja conflictos

### Error de conexión
- Verifica las variables de entorno DATABASE_URL y PRODUCTION_DATABASE_URL

## 🎯 Comandos Rápidos

```bash
# Ver estado actual de desarrollo
npm run db:studio

# Ejecutar migración completa
node migrate-to-production-complete.js

# Solo exportar datos (sin migrar)  
node migrate-to-production.js

# Verificar el script SQL generado
head -50 production-migration.sql
```

## ✨ Resultado Final

Una vez completada la migración, tendrás:

- 🎯 **Base de datos de producción** con todos los datos actuales
- 📈 **Sistema completo** funcionando en producción  
- 🔄 **Sincronización BCV** configurada y activa
- 👥 **Usuarios migrados** con credenciales funcionales
- 🏢 **Estructura completa** del condominio lista para uso

---

## 📞 Soporte

Si encuentras algún problema durante la migración, revisa:
1. Los logs de la consola durante la migración
2. El archivo `data-export.json` para verificar los datos exportados
3. La conectividad a ambas bases de datos

¡Tu sistema de gestión condominial estará completamente operativo en producción! 🏢✨