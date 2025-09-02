# SISTEMA DE GESTIÓN DE CONDOMINIO
## Manual de Funcionalidades por Perfil de Usuario

---

## **PERFIL ADMINISTRADOR**

### **1. PANEL DE CONTROL PRINCIPAL**
- **Dashboard Estadístico**: Visualización de métricas clave del condominio
  - Total de apartamentos registrados
  - Número de propietarios activos
  - Cantidad de pagos pendientes
  - Ingresos del mes actual
- **Navegación Lateral**: Acceso rápido a todas las secciones administrativas
- **Información de Sesión**: Datos del administrador logueado

### **2. GESTIÓN DE USUARIOS**
#### **Registro de Nuevos Usuarios**
- Formulario completo de registro con validación
- Campos obligatorios: primer nombre, apellido, teléfono, email, contraseña, identificación
- Campos opcionales: segundo nombre, segundo apellido
- Selección de tipo de identificación (cédula, pasaporte, RIF)
- Asignación de tipo de usuario (propietario o administrador)

#### **Administración de Usuarios Existentes**
- **Lista Paginada**: Visualización de todos los usuarios con paginación (5, 10, 25, 50, 100 filas por página)
- **Filtros Avanzados**: Búsqueda por nombre, email, identificación y tipo de usuario
- **Edición de Datos**: Modificación de información personal sin cambio de contraseña
- **Eliminación**: Borrado de usuarios (con verificación de dependencias)
- **Información Detallada**: Apartamento asignado, datos de contacto, estado

### **3. GESTIÓN DE APARTAMENTOS**
#### **Registro de Apartamentos**
- Creación de nuevos apartamentos con número único
- Asignación de piso y alícuota
- Vinculación opcional con propietario

#### **Administración de Apartamentos**
- **Lista Paginada**: Visualización de todos los apartamentos con paginación
- **Filtros**: Búsqueda por número de apartamento y selección de filas por página
- **Edición**: Modificación de datos y reasignación de propietarios
- **Eliminación**: Borrado de apartamentos (verificando pagos asociados)
- **Historial de Pagos**: Acceso al historial completo de pagos por apartamento

### **4. GESTIÓN DE PAGOS**
#### **Creación de Pagos**
- **Pagos Individuales**: Creación manual de pagos específicos
- **Pagos Masivos**: Generación automática de pagos para todos los apartamentos
  - Distribución proporcional basada en alícuotas
  - Cálculo automático de montos individuales

#### **Administración de Pagos**
- **Lista Paginada**: Visualización completa con paginación (5, 10, 20, 50 filas por página)
- **Filtros Avanzados**: 
  - Búsqueda por nombre del propietario
  - Filtro por apartamento específico
  - Filtro por estado (pendiente, pagado, vencido, en revisión)
  - Filtro por mes de vencimiento
- **Estados de Pago**:
  - **Pendiente**: Pago creado, esperando acción del propietario
  - **En Revisión**: Propietario envió comprobante, esperando aprobación
  - **Pagado**: Pago aprobado y procesado
  - **Vencido**: Pago no realizado después de fecha límite

#### **Procesamiento de Pagos**
- **Aprobación de Pagos**: Marcar pagos en revisión como pagados
- **Gestión de Pagos en Exceso**: Sistema automático de balance
  - Detección automática de sobrepagos
  - Acreditación del exceso al balance del usuario
  - Aplicación automática en futuros pagos
- **Edición de Pagos**: Modificación de montos, fechas y conceptos
- **Eliminación**: Borrado de registros de pago
- **Visualización de Comprobantes**: Acceso a documentos subidos por propietarios

### **5. GESTIÓN DE TASAS DE CAMBIO**
- **Sincronización Automática**: Integración con BCV para tasas USD
- **Sincronización Manual**: Actualización forzada de tasas
- **Historial de Tasas**: Visualización de evolución histórica
- **Solo USD**: Sistema optimizado únicamente para dólar estadounidense

---

## **PERFIL PROPIETARIO/TENANTE**

### **1. DASHBOARD PERSONAL**
#### **Estadísticas Rápidas**
- **Balance Actual**: Muestra el estado financiero del propietario
  - Balance negativo (rojo): Deuda pendiente
  - Balance positivo (verde): Saldo a favor por pagos en exceso
  - Balance cero: Al día con los pagos
- **Pagos Realizados**: Contador de pagos completados en el año
- **Alícuota Mensual**: Porcentaje de participación en gastos comunes

#### **Navegación Superior**
- Información del sistema y usuario
- Botón de cierre de sesión
- Acceso directo a tasas de cambio

### **2. GESTIÓN DE PAGOS PERSONALES**
#### **Visualización de Pagos**
- **Pagos Pendientes**: Lista de obligaciones por cumplir
  - Monto en USD y equivalente en Bs (según tasa actual)
  - Fecha de vencimiento
  - Estado visual (pendiente/vencido)
  - Botón "Pagar Ahora" directo

- **Pagos en Revisión**: Pagos enviados esperando aprobación
  - Estado "En Revisión" claramente identificado
  - Información del comprobante enviado

- **Historial de Pagos**: Registro completo paginado
  - Pagos completados con fechas
  - Métodos de pago utilizados
  - Estados finales

#### **Proceso de Pago**
- **Formulario de Pago Completo**:
  - Fecha de operación bancaria
  - Cédula/RIF del operador
  - Monto pagado en Bolívares
  - Tipo de operación (mismo banco/otro banco)
  - Email de confirmación
  - Subida de comprobante (opcional)

- **Manejo de Pagos Parciales**: 
  - Detección automática de pagos incompletos
  - Creación automática de nueva obligación por saldo pendiente

#### **Detalles de Pagos**
- **Información Completa**: Acceso a todos los datos del pago
- **Descarga de Comprobantes**: Visualización de documentos subidos
- **Estado en Tiempo Real**: Actualización automática de estados

### **3. GESTIÓN DE PERFIL PERSONAL**
#### **Información Personal**
- **Edición de Datos**: Modificación de información personal
  - Nombres y apellidos
  - Datos de contacto (teléfono, email)
  - Información de identificación
- **Validación en Tiempo Real**: Verificación de formatos y requisitos
- **Actualización Segura**: Cambios sin afectar credenciales de acceso

### **4. CONSULTA DE TASAS DE CAMBIO**
- **Tasa Actual USD/Bs**: Información actualizada del BCV
- **Historial de Tasas**: Evolución temporal de las tasas
- **Calculadora Automática**: Conversión en tiempo real para pagos

---

## **CARACTERÍSTICAS TÉCNICAS GENERALES**

### **SEGURIDAD**
- **Autenticación Segura**: Login con email y contraseña
- **Sesiones Seguras**: Manejo de sesiones con cookies HTTP-only
- **Autorización por Roles**: Separación clara de permisos admin/propietario
- **Validación de Datos**: Verificación en frontend y backend

### **INTERFAZ DE USUARIO**
- **Diseño Responsivo**: Adaptable a móviles, tablets y escritorio
- **Componentes Modernos**: Interfaz construida con shadcn/ui
- **Navegación Intuitiva**: Menús claros y organizados
- **Feedback Visual**: Notificaciones toast para todas las acciones

### **RENDIMIENTO**
- **Paginación Inteligente**: Carga eficiente de datos grandes
- **Filtros Dinámicos**: Búsqueda y filtrado en tiempo real
- **Actualizaciones Automáticas**: Sincronización de datos sin recargar página
- **Optimización de Imágenes**: Manejo eficiente de comprobantes de pago

### **INTEGRACIÓN EXTERNA**
- **BCV (Banco Central de Venezuela)**: Sincronización automática de tasas USD
- **Replit Auth**: Sistema de autenticación integrado
- **Almacenamiento en la Nube**: Gestión de archivos y comprobantes

### **BASE DE DATOS**
- **PostgreSQL**: Base de datos robusta y escalable
- **Respaldos Automáticos**: Sistema de checkpoints para rollback
- **Integridad Referencial**: Relaciones consistentes entre entidades
- **Migraciones Seguras**: Actualización de esquema sin pérdida de datos

---

*Documento generado automáticamente - Sistema de Gestión de Condominio v1.0*
*Fecha: Septiembre 2025*