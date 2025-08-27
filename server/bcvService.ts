interface TasaBCV {
  moneda: 'USD';
  valor: string;
  fecha: Date;
}

export class BCVService {
  private static readonly BCV_API_URL = 'https://bcv-api.rafnixg.dev/rates/';
  private static readonly BCV_BACKUP_URL = 'https://www.bcv.org.ve/estadisticas/tipo-cambio-de-referencia-smc';
  
  static async obtenerTasasCambio(): Promise<TasaBCV[]> {
    try {
      console.log('Obteniendo tasas de cambio del BCV...');
      
      // Intentar primero con la API externa más confiable
      const response = await fetch(this.BCV_API_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      const tasas: TasaBCV[] = [];
      const fechaActual = new Date();

      // Procesar la respuesta de la API - Solo USD
      if (data.dollar && typeof data.dollar === 'number') {
        tasas.push({
          moneda: 'USD',
          valor: data.dollar.toString(),
          fecha: fechaActual,
        });
      }

      console.log('Tasas obtenidas:', tasas);
      return tasas;
      
    } catch (error) {
      console.error('Error obteniendo tasas del BCV:', error);
      
      // Como fallback, devolver solo USD basado en la información más reciente del BCV
      return [
        {
          moneda: 'USD',
          valor: '144.37320000',
          fecha: new Date(),
        }
      ];
    }
  }

  static async obtenerTasaUSD(): Promise<number> {
    try {
      const tasas = await this.obtenerTasasCambio();
      const tasaUSD = tasas.find(t => t.moneda === 'USD');
      return tasaUSD ? parseFloat(tasaUSD.valor) : 143.03810000;
    } catch (error) {
      console.error('Error obteniendo tasa USD:', error);
      return 143.03810000; // Valor de fallback actualizado
    }
  }
}