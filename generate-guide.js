import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import fs from 'fs';

const doc = new Document({
  sections: [{
    properties: {},
    children: [
      // Título principal
      new Paragraph({
        children: [
          new TextRun({
            text: "SISTEMA DE GESTIÓN DE CONDOMINIO",
            bold: true,
            size: 32,
            color: "2563EB"
          })
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "GUÍA DE USUARIO PASO A PASO",
            bold: true,
            size: 24,
            color: "1E40AF"
          })
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 }
      }),

      // SECCIÓN ADMINISTRADOR
      new Paragraph({
        children: [
          new TextRun({
            text: "GUÍA PARA ADMINISTRADORES",
            bold: true,
            size: 20,
            color: "DC2626"
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      // 1. Inicio de Sesión
      new Paragraph({
        children: [
          new TextRun({
            text: "1. INICIO DE SESIÓN",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 1: ",
            bold: true
          }),
          new TextRun({
            text: "Accede a la página principal del sistema"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 2: ",
            bold: true
          }),
          new TextRun({
            text: "Ingresa tu email y contraseña de administrador"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 3: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en 'Iniciar Sesión'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 4: ",
            bold: true
          }),
          new TextRun({
            text: "Serás redirigido automáticamente al Dashboard de Administrador"
          })
        ],
        spacing: { after: 300 }
      }),

      // 2. Navegación del Dashboard
      new Paragraph({
        children: [
          new TextRun({
            text: "2. NAVEGACIÓN DEL DASHBOARD",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "El menú lateral te permite acceder a 5 secciones principales:",
            italics: true
          })
        ],
        spacing: { after: 150 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Dashboard: ",
            bold: true
          }),
          new TextRun({
            text: "Estadísticas generales del condominio"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Pagos: ",
            bold: true
          }),
          new TextRun({
            text: "Gestión completa de pagos"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Apartamentos: ",
            bold: true
          }),
          new TextRun({
            text: "Administración de unidades"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Usuarios: ",
            bold: true
          }),
          new TextRun({
            text: "Gestión de propietarios y administradores"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Tasas de Cambio: ",
            bold: true
          }),
          new TextRun({
            text: "Consulta y sincronización de tasas USD"
          })
        ],
        spacing: { after: 300 }
      }),

      // 3. Crear Usuario
      new Paragraph({
        children: [
          new TextRun({
            text: "3. CREAR NUEVO USUARIO",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 1: ",
            bold: true
          }),
          new TextRun({
            text: "Ve a la sección 'Usuarios' en el menú lateral"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 2: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en el botón 'Nuevo Usuario'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 3: ",
            bold: true
          }),
          new TextRun({
            text: "Completa el formulario con los datos obligatorios:"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Primer Nombre y Primer Apellido (obligatorios)"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Teléfono y Email (obligatorios)"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Contraseña (mínimo 6 caracteres)"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Identificación y tipo (cédula, pasaporte o RIF)"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Tipo de usuario (propietario o administrador)"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 4: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en 'Crear Usuario'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 5: ",
            bold: true
          }),
          new TextRun({
            text: "Verifica que aparezca el mensaje de confirmación"
          })
        ],
        spacing: { after: 300 }
      }),

      // 4. Crear Apartamento
      new Paragraph({
        children: [
          new TextRun({
            text: "4. CREAR NUEVO APARTAMENTO",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 1: ",
            bold: true
          }),
          new TextRun({
            text: "Ve a la sección 'Apartamentos'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 2: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en 'Nuevo Apartamento'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 3: ",
            bold: true
          }),
          new TextRun({
            text: "Completa los datos:"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Número del apartamento (ej: 101, A-1, etc.)"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Piso (número entero)"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Alícuota en porcentaje (ej: 2.5)"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Propietario (opcional, se puede asignar después)"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 4: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en 'Crear Apartamento'"
          })
        ],
        spacing: { after: 300 }
      }),

      // 5. Generar Pagos Masivos
      new Paragraph({
        children: [
          new TextRun({
            text: "5. GENERAR PAGOS MASIVOS",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 1: ",
            bold: true
          }),
          new TextRun({
            text: "Ve a la sección 'Pagos'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 2: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en 'Generar Pagos Masivos'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 3: ",
            bold: true
          }),
          new TextRun({
            text: "Completa el formulario:"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Concepto (ej: 'Gastos Comunes Enero 2025')"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Monto total en USD (ej: 1000)"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Fecha de vencimiento"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 4: ",
            bold: true
          }),
          new TextRun({
            text: "El sistema calculará automáticamente el monto individual por apartamento según las alícuotas"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 5: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en 'Generar Pagos' para crear los pagos para todos los apartamentos"
          })
        ],
        spacing: { after: 300 }
      }),

      // 6. Aprobar Pagos
      new Paragraph({
        children: [
          new TextRun({
            text: "6. APROBAR PAGOS EN REVISIÓN",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 1: ",
            bold: true
          }),
          new TextRun({
            text: "En la sección 'Pagos', filtra por estado 'En Revisión'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 2: ",
            bold: true
          }),
          new TextRun({
            text: "Revisa los comprobantes de pago haciendo clic en 'Ver Documento'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 3: ",
            bold: true
          }),
          new TextRun({
            text: "Si el pago es correcto, haz clic en 'Marcar como Pagado'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 4: ",
            bold: true
          }),
          new TextRun({
            text: "Si hay un sobrepago, el sistema automáticamente:"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Detecta el exceso"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Acredita el saldo a favor del propietario"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - El propietario verá su balance positivo en el dashboard"
          })
        ],
        spacing: { after: 300 }
      }),

      // SEPARADOR
      new Paragraph({
        children: [
          new TextRun({
            text: "─".repeat(60),
            color: "6B7280"
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 400 }
      }),

      // SECCIÓN PROPIETARIO
      new Paragraph({
        children: [
          new TextRun({
            text: "GUÍA PARA PROPIETARIOS",
            bold: true,
            size: 20,
            color: "059669"
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      // 1. Inicio de Sesión Propietario
      new Paragraph({
        children: [
          new TextRun({
            text: "1. INICIO DE SESIÓN",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 1: ",
            bold: true
          }),
          new TextRun({
            text: "Accede al sistema con el email y contraseña proporcionados por el administrador"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 2: ",
            bold: true
          }),
          new TextRun({
            text: "Serás redirigido automáticamente a tu Dashboard Personal"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 3: ",
            bold: true
          }),
          new TextRun({
            text: "Revisa tu balance actual en la primera tarjeta:"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Verde: Tienes saldo a favor (pagaste de más)"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Rojo: Tienes deuda pendiente"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Cero: Estás al día"
          })
        ],
        spacing: { after: 300 }
      }),

      // 2. Realizar Pago
      new Paragraph({
        children: [
          new TextRun({
            text: "2. REALIZAR UN PAGO",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 1: ",
            bold: true
          }),
          new TextRun({
            text: "En la pestaña 'Mis Pagos', busca los pagos pendientes"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 2: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en 'Pagar Ahora' del pago que quieres realizar"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 3: ",
            bold: true
          }),
          new TextRun({
            text: "Se abrirá un formulario donde debes completar:"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Fecha de la operación bancaria"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Tu cédula o RIF"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Monto pagado en Bolívares"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Tipo de operación (mismo banco u otro banco)"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Email de confirmación"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 4: ",
            bold: true
          }),
          new TextRun({
            text: "Opcional: Sube una foto del comprobante bancario"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 5: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en 'Enviar Pago'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 6: ",
            bold: true
          }),
          new TextRun({
            text: "El pago pasará a estado 'En Revisión' y aparecerá en esa sección"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 7: ",
            bold: true
          }),
          new TextRun({
            text: "Espera la aprobación del administrador"
          })
        ],
        spacing: { after: 300 }
      }),

      // 3. Pagos Parciales
      new Paragraph({
        children: [
          new TextRun({
            text: "3. PAGOS PARCIALES",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Si pagas menos del monto total:",
            italics: true
          })
        ],
        spacing: { after: 150 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 1: ",
            bold: true
          }),
          new TextRun({
            text: "Realiza el proceso normal de pago con el monto que puedas pagar"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 2: ",
            bold: true
          }),
          new TextRun({
            text: "El sistema automáticamente:"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Detecta que es un pago parcial"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - Crea un nuevo pago pendiente por la diferencia"
          })
        ],
        spacing: { after: 50 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "  - El pago parcial queda 'En Revisión'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 3: ",
            bold: true
          }),
          new TextRun({
            text: "Una vez aprobado, verás el nuevo pago pendiente por el saldo restante"
          })
        ],
        spacing: { after: 300 }
      }),

      // 4. Actualizar Perfil
      new Paragraph({
        children: [
          new TextRun({
            text: "4. ACTUALIZAR INFORMACIÓN PERSONAL",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 1: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en la pestaña 'Mi Perfil'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 2: ",
            bold: true
          }),
          new TextRun({
            text: "Modifica los campos que necesites actualizar"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 3: ",
            bold: true
          }),
          new TextRun({
            text: "Haz clic en 'Actualizar Información'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Nota: ",
            bold: true,
            color: "DC2626"
          }),
          new TextRun({
            text: "No puedes cambiar tu contraseña desde aquí. Contacta al administrador si necesitas cambiarla."
          })
        ],
        spacing: { after: 300 }
      }),

      // 5. Consultar Tasas
      new Paragraph({
        children: [
          new TextRun({
            text: "5. CONSULTAR TASAS DE CAMBIO",
            bold: true,
            size: 16,
            color: "1F2937"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 1: ",
            bold: true
          }),
          new TextRun({
            text: "En la parte superior derecha, haz clic en 'Tasas de Cambio'"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 2: ",
            bold: true
          }),
          new TextRun({
            text: "Verás la tasa actual USD/Bs del BCV"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 3: ",
            bold: true
          }),
          new TextRun({
            text: "Puedes consultar el historial de tasas para ver la evolución"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Paso 4: ",
            bold: true
          }),
          new TextRun({
            text: "Usa esta información para calcular cuánto pagar en Bolívares"
          })
        ],
        spacing: { after: 400 }
      }),

      // CONSEJOS IMPORTANTES
      new Paragraph({
        children: [
          new TextRun({
            text: "CONSEJOS IMPORTANTES",
            bold: true,
            size: 18,
            color: "7C2D12"
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Para Administradores:",
            bold: true,
            color: "DC2626"
          })
        ],
        spacing: { after: 150 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Siempre verifica los comprobantes antes de aprobar pagos"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• El sistema maneja automáticamente los sobrepagos, no necesitas cálculos manuales"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Usa los filtros para encontrar rápidamente pagos específicos"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Asigna alícuotas correctamente, afectan el cálculo de pagos masivos"
          })
        ],
        spacing: { after: 300 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Para Propietarios:",
            bold: true,
            color: "059669"
          })
        ],
        spacing: { after: 150 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Siempre sube el comprobante de pago para agilizar la aprobación"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Puedes pagar de más, el exceso quedará como saldo a favor automáticamente"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Si tu balance está en verde, significa que tienes crédito por pagos anteriores"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Consulta las tasas de cambio para pagar el monto correcto en Bolívares"
          })
        ],
        spacing: { after: 100 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "• Mantén actualizada tu información de contacto"
          })
        ],
        spacing: { after: 400 }
      }),

      // PIE DE PÁGINA
      new Paragraph({
        children: [
          new TextRun({
            text: "Sistema de Gestión de Condominio v1.0",
            italics: true,
            color: "6B7280"
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 }
      }),

      new Paragraph({
        children: [
          new TextRun({
            text: "Documento generado automáticamente - Septiembre 2025",
            italics: true,
            color: "6B7280",
            size: 18
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    ]
  }]
});

// Generar el archivo
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Guia_Usuario_Sistema_Condominio.docx", buffer);
  console.log("Documento Word generado exitosamente: Guia_Usuario_Sistema_Condominio.docx");
}).catch((error) => {
  console.error("Error generando el documento:", error);
});