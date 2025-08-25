import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  DollarSign,
  LogOut,
  Calendar,
  Building,
  ArrowLeft
} from "lucide-react";
import type { TasaCambio } from "@shared/schema";
import { useLocation } from "wouter";

const MONEDAS = [
  { codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$', icono: DollarSign },
  { codigo: 'EUR', nombre: 'Euro', simbolo: '€', icono: TrendingUp },
  { codigo: 'CNY', nombre: 'Yuan Chino', simbolo: '¥', icono: TrendingUp },
  { codigo: 'TRY', nombre: 'Lira Turca', simbolo: '₺', icono: TrendingUp },
  { codigo: 'RUB', nombre: 'Rublo Ruso', simbolo: '₽', icono: TrendingUp },
];

export default function ExchangeRatesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedMoneda, setSelectedMoneda] = useState<string>('USD');
  const [limite, setLimite] = useState<number>(30);
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  // Get exchange rates
  const { data: tasas, isLoading: tasasLoading } = useQuery({
    queryKey: ["/api/tasas-cambio", selectedMoneda, limite],
    queryFn: async () => {
      console.log('Fetching tasas with:', { selectedMoneda, limite });
      const response = await fetch(`/api/tasas-cambio?moneda=${selectedMoneda}&limite=${limite}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      console.log('Tasas result:', result);
      return result;
    },
    enabled: !!user,
  });

  // Get latest rates for all currencies
  const { data: latestRates } = useQuery({
    queryKey: ["/api/tasas-cambio", "latest"],
    queryFn: async () => {
      const rates = await Promise.all(
        MONEDAS.map(async (moneda) => {
          try {
            const response = await fetch(`/api/tasas-cambio/latest/${moneda.codigo}`, {
              credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            return { ...data, moneda: moneda.codigo, nombre: moneda.nombre, simbolo: moneda.simbolo };
          } catch (error) {
            return null;
          }
        })
      );
      return rates.filter((rate): rate is NonNullable<typeof rate> => rate !== null);
    },
    enabled: !!user,
  });

  // Sync exchange rates mutation (admin only)
  const syncRatesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tasas-cambio/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error('Failed to sync');
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasas-cambio"] });
      toast({
        title: "Éxito",
        description: data.message || "Tasas de cambio sincronizadas",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Redirigiendo al login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudieron sincronizar las tasas",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      queryClient.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      window.location.href = "/";
    }
  };

  const handleGoBack = () => {
    if (user?.tipoUsuario === 'admin') {
      setLocation('/admin');
    } else {
      setLocation('/tenant');
    }
  };

  const formatCurrency = (valor: string, simbolo: string = 'Bs.') => {
    const num = parseFloat(valor);
    return `${simbolo} ${num.toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 8 
    })}`;
  };

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrend = (tasas: TasaCambio[]) => {
    if (!tasas || tasas.length < 2 || !tasas[0] || !tasas[1]) return null;
    
    const current = parseFloat(tasas[0].valor);
    const previous = parseFloat(tasas[1].valor);
    
    if (isNaN(current) || isNaN(previous)) return null;
    
    if (current > previous) {
      return { direction: 'up', percentage: ((current - previous) / previous * 100).toFixed(2) };
    } else if (current < previous) {
      return { direction: 'down', percentage: ((previous - current) / previous * 100).toFixed(2) };
    } else {
      return { direction: 'stable', percentage: '0.00' };
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const trend = getTrend(tasas as TasaCambio[]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </Button>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Historial de Tasas de Cambio BCV
                  </h1>
                  <p className="text-sm text-gray-600">
                    Tasas oficiales del Banco Central de Venezuela
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.primerNombre} {user.primerApellido}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.tipoUsuario}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Latest Rates Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {MONEDAS.map((moneda) => {
            const rate = latestRates?.find(r => r.moneda === moneda.codigo);
            const IconComponent = moneda.icono;
            
            return (
              <Card key={moneda.codigo} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{moneda.codigo}</p>
                        <p className="text-xs text-gray-500">{moneda.nombre}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    {rate ? (
                      <>
                        <p className="text-2xl font-bold text-gray-900">
                          {rate.valor ? formatCurrency(rate.valor, 'Bs.') : 'Sin datos'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {rate.fecha ? formatDate(rate.fecha.toString()) : 'Sin fecha'}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Sin datos</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Historial Detallado</CardTitle>
              {user.tipoUsuario === 'admin' && (
                <Button
                  onClick={() => syncRatesMutation.mutate()}
                  disabled={syncRatesMutation.isPending}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncRatesMutation.isPending ? 'animate-spin' : ''}`} />
                  {syncRatesMutation.isPending ? 'Sincronizando...' : 'Sincronizar del BCV'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="moneda">Moneda</Label>
                <Select value={selectedMoneda} onValueChange={setSelectedMoneda}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONEDAS.map((moneda) => (
                      <SelectItem key={moneda.codigo} value={moneda.codigo}>
                        {moneda.codigo} - {moneda.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="limite">Cantidad de registros</Label>
                <Select value={limite.toString()} onValueChange={(value) => setLimite(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 registros</SelectItem>
                    <SelectItem value="30">30 registros</SelectItem>
                    <SelectItem value="60">60 registros</SelectItem>
                    <SelectItem value="90">90 registros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="grid grid-cols-1 gap-2 w-full">
                  {trend && (
                    <div className="flex items-center space-x-2">
                      {trend.direction === 'up' ? (
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +{trend.percentage}%
                        </Badge>
                      ) : trend.direction === 'down' ? (
                        <Badge className="bg-red-100 text-red-800">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          -{trend.percentage}%
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          Sin cambios
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historical Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Historial de {MONEDAS.find(m => m.codigo === selectedMoneda)?.nombre || selectedMoneda}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasasLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Cargando historial...</span>
              </div>
            ) : tasas && Array.isArray(tasas) && tasas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Moneda</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-800">Valor (Bs.)</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">Fuente</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">Cambio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tasas as TasaCambio[]).map((tasa: TasaCambio, index: number) => {
                      const prevTasa = (tasas as TasaCambio[])[index + 1];
                      let change = null;
                      
                      if (prevTasa && tasa && prevTasa.valor && tasa.valor) {
                        const current = parseFloat(tasa.valor);
                        const previous = parseFloat(prevTasa.valor);
                        if (!isNaN(current) && !isNaN(previous) && previous !== 0) {
                          const diff = current - previous;
                          const percentage = (diff / previous * 100);
                          change = { diff, percentage };
                        }
                      }
                      
                      return (
                        <tr key={tasa.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-800">
                                {tasa.fecha ? formatDate(tasa.fecha.toString()) : 'Sin fecha'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="font-medium">
                              {tasa.moneda}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-lg font-semibold text-gray-900">
                              {tasa.valor ? formatCurrency(tasa.valor, 'Bs.') : 'Sin datos'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge className="bg-blue-100 text-blue-800 font-medium">
                              {tasa.fuente}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {change ? (
                              <div className="flex items-center justify-center space-x-1">
                                {change.diff > 0 ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +{change.percentage.toFixed(2)}%
                                  </Badge>
                                ) : change.diff < 0 ? (
                                  <Badge className="bg-red-100 text-red-800">
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                    {change.percentage.toFixed(2)}%
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800">
                                    Sin cambio
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay datos de tasas de cambio disponibles</p>
                {user.tipoUsuario === 'admin' && (
                  <Button
                    onClick={() => syncRatesMutation.mutate()}
                    disabled={syncRatesMutation.isPending}
                    className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncRatesMutation.isPending ? 'animate-spin' : ''}`} />
                    Sincronizar datos del BCV
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}