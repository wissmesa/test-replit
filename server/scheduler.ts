import cron from 'node-cron';
import { BCVService } from './bcvService';
import { storage } from './storage';

export class TaskScheduler {
  private static instance: TaskScheduler;

  private constructor() {}

  public static getInstance(): TaskScheduler {
    if (!TaskScheduler.instance) {
      TaskScheduler.instance = new TaskScheduler();
    }
    return TaskScheduler.instance;
  }

  public start(): void {
    console.log('🚀 Task Scheduler iniciado');

    // Ejecutar cada día a las 9:00 AM hora de Venezuela (incluye fines de semana)
    cron.schedule('0 9 * * *', async () => {
      console.log('⏰ Iniciando sincronización automática de tasas BCV...');
      await this.syncBcvRates();
    }, {
      timezone: "America/Caracas"
    });

    // Ejecutar una sincronización inicial al arrancar (para testing y actualización inmediata)
    setTimeout(async () => {
      console.log('🔄 Ejecutando sincronización inicial...');
      await this.syncBcvRates();
    }, 2000); // Esperar 2 segundos para que el sistema se estabilice

    console.log('📅 Tareas programadas:');
    console.log('  - Sincronización BCV: 9:00 AM diario (GMT-4)');
    console.log('  - Sincronización inicial: al arrancar el servidor');
  }

  private async syncBcvRates(): Promise<void> {
    try {
      console.log('🏦 Obteniendo tasas del BCV...');
      
      const tasas = await BCVService.obtenerTasasCambio();
      let syncedCount = 0;

      if (tasas && tasas.length > 0) {
        console.log(`📊 Procesando ${tasas.length} tasas obtenidas:`, tasas.map(t => `${t.moneda}: ${t.valor}`));
        
        for (const tasa of tasas) {
          try {
            // Siempre crear una nueva entrada para mantener el historial
            // Solo evitar duplicados si ya existe la misma tasa exacta para hoy
            const existingRate = await storage.getLatestTasaCambio(tasa.moneda);
            const today = new Date();
            const isToday = existingRate && 
              existingRate.fecha.toDateString() === today.toDateString();
            const isSameValue = existingRate && 
              parseFloat(existingRate.valor) === parseFloat(tasa.valor);

            // Crear nueva entrada si no existe para hoy o si el valor ha cambiado
            if (!isToday || !isSameValue) {
              await storage.createTasaCambio({
                fecha: new Date(),
                moneda: tasa.moneda as any,
                valor: tasa.valor,
                fuente: 'BCV'
              });
              syncedCount++;
              console.log(`💰 Nueva tasa guardada: ${tasa.moneda} = ${tasa.valor}`);
            } else {
              console.log(`⏭️ Tasa ${tasa.moneda} ya actualizada hoy con el mismo valor: ${tasa.valor}`);
            }
          } catch (error) {
            console.error(`❌ Error guardando tasa ${tasa.moneda}:`, error);
          }
        }
        
        console.log(`✅ Sincronizadas ${syncedCount} tasas de cambio del BCV`);
        
        if (syncedCount === 0) {
          console.log('ℹ️ No se sincronizaron nuevas tasas (ya estaban actualizadas)');
        }
      } else {
        console.log('⚠️ No se pudieron obtener tasas del BCV');
      }
    } catch (error) {
      console.error('❌ Error en sincronización automática:', error);
    }
  }

  // Método para ejecutar sincronización manual (útil para testing)
  public async runManualSync(): Promise<number> {
    console.log('🔄 Sincronización manual iniciada...');
    const initialCount = (await storage.getTasasCambio()).length;
    await this.syncBcvRates();
    const finalCount = (await storage.getTasasCambio()).length;
    return finalCount - initialCount;
  }
}