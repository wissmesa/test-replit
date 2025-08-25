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

    // Ejecutar todos los días a las 6:00 AM
    cron.schedule('0 6 * * *', async () => {
      console.log('⏰ Iniciando sincronización automática de tasas BCV...');
      await this.syncBcvRates();
    }, {
      timezone: "America/Caracas"
    });

    // Ejecutar también a las 12:00 PM como respaldo
    cron.schedule('0 12 * * *', async () => {
      console.log('⏰ Sincronización de respaldo de tasas BCV...');
      await this.syncBcvRates();
    }, {
      timezone: "America/Caracas"
    });

    console.log('📅 Tareas programadas:');
    console.log('  - Sincronización BCV: 6:00 AM y 12:00 PM (GMT-4)');
  }

  private async syncBcvRates(): Promise<void> {
    try {
      console.log('🏦 Obteniendo tasas del BCV...');
      
      const tasas = await BCVService.obtenerTasasCambio();
      let syncedCount = 0;

      if (tasas && tasas.length > 0) {
        const today = new Date();
        
        for (const tasa of tasas) {
          try {
            // Verificar si ya existe una tasa para esta moneda en el día actual
            const existingRate = await storage.getLatestTasaCambio(tasa.moneda);
            const isToday = existingRate && 
              existingRate.fecha.toDateString() === today.toDateString();

            if (!isToday) {
              await storage.createTasaCambio({
                fecha: today,
                moneda: tasa.moneda as any,
                valor: tasa.valor,
                fuente: tasa.fuente || 'BCV'
              });
              syncedCount++;
            }
          } catch (error) {
            console.error(`Error guardando tasa ${tasa.moneda}:`, error);
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