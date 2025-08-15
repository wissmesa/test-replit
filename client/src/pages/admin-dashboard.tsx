import { useState, useEffect } from "react";
import type { UserWithApartment, Apartment, PagoWithRelations } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Home,
  LogOut
} from "lucide-react";
import LoadingModal from "@/components/ui/loading-modal";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [filters, setFilters] = useState({
    search: "",
    apartment: "",
    status: "",
    month: ""
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || user.tipoUsuario !== 'admin')) {
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
  }, [user, authLoading, toast]);

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/stats"],
    enabled: !!user && user.tipoUsuario === 'admin',
  });

  // Fetch payments
  const { data: pagos, isLoading: pagosLoading } = useQuery<PagoWithRelations[]>({
    queryKey: ["/api/pagos"],
    enabled: !!user && user.tipoUsuario === 'admin',
  });

  // Fetch apartments
  const { data: apartments } = useQuery<Apartment[]>({
    queryKey: ["/api/apartments"],
    enabled: !!user && user.tipoUsuario === 'admin',
  });

  // Mark payment as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async (pagoId: string) => {
      await apiRequest('PUT', `/api/pagos/${pagoId}`, {
        estado: 'pagado',
        fechaPago: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pagos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Éxito",
        description: "Pago marcado como pagado",
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
        description: "No se pudo actualizar el pago",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return <Badge className="bg-secondary bg-opacity-10 text-secondary">Pagado</Badge>;
      case 'pendiente':
        return <Badge className="bg-accent bg-opacity-10 text-accent">Pendiente</Badge>;
      case 'vencido':
        return <Badge className="bg-error bg-opacity-10 text-error">Vencido</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const filteredPagos = pagos?.filter(pago => {
    if (filters.search && !pago.user.primerNombre.toLowerCase().includes(filters.search.toLowerCase()) &&
        !pago.user.primerApellido.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.apartment && pago.apartment.numero !== filters.apartment) {
      return false;
    }
    if (filters.status && pago.estado !== filters.status) {
      return false;
    }
    return true;
  }) || [];

  if (authLoading || !user || user.tipoUsuario !== 'admin') {
    return <LoadingModal isOpen={true} message="Cargando..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-surface shadow-lg z-50">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-white w-10 h-10 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">CondoManager</h2>
              <p className="text-sm text-gray-600">Panel Admin</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveNav("dashboard")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeNav === "dashboard" 
                    ? "bg-primary text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveNav("payments")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeNav === "payments" 
                    ? "bg-primary text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Gestión de Pagos</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveNav("apartments")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeNav === "apartments" 
                    ? "bg-primary text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Apartamentos</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveNav("users")}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeNav === "users" 
                    ? "bg-primary text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Usuarios</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {getInitials(user.primerNombre, user.primerApellido)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user.primerNombre} {user.primerApellido}
                </p>
                <p className="text-xs text-gray-600">Administrador</p>
              </div>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full mt-3 text-left text-sm text-gray-600 hover:text-error transition-colors justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Principal</h1>
                <p className="text-gray-600 mt-1">Resumen general del condominio</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Último acceso</p>
                <p className="font-semibold text-gray-800">
                  {new Date().toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        {activeNav === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Apartamentos</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {statsLoading ? "..." : stats?.totalApartments || 0}
                      </p>
                    </div>
                    <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                      <Home className="text-primary w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Inquilinos Activos</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {statsLoading ? "..." : stats?.activeUsers || 0}
                      </p>
                    </div>
                    <div className="bg-secondary bg-opacity-10 p-3 rounded-lg">
                      <Users className="text-secondary w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pagos Pendientes</p>
                      <p className="text-2xl font-bold text-accent">
                        {statsLoading ? "..." : stats?.pendingPayments || 0}
                      </p>
                    </div>
                    <div className="bg-accent bg-opacity-10 p-3 rounded-lg">
                      <TrendingUp className="text-accent w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ingresos del Mes</p>
                      <p className="text-2xl font-bold text-secondary">
                        {statsLoading ? "..." : formatCurrency(stats?.monthlyIncome || 0)}
                      </p>
                    </div>
                    <div className="bg-secondary bg-opacity-10 p-3 rounded-lg">
                      <DollarSign className="text-secondary w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        
        {/* Payments Management Section */}
        {(activeNav === "dashboard" || activeNav === "payments") && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Gestión de Pagos
                </CardTitle>
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Pago
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Input
                    placeholder="Buscar por inquilino..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>
                <Select
                  value={filters.apartment}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, apartment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los apartamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los apartamentos</SelectItem>
                    {apartments?.map(apt => (
                      <SelectItem key={apt.id} value={apt.numero}>
                        Apt. {apt.numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado del pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="month"
                  value={filters.month}
                  onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                />
              </div>
              
              {/* Payments Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Inquilino</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Apartamento</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Monto</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Fecha Venc.</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          Cargando pagos...
                        </td>
                      </tr>
                    ) : filteredPagos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No hay pagos para mostrar
                        </td>
                      </tr>
                    ) : (
                      filteredPagos.map((pago) => (
                        <tr key={pago.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary text-white text-sm">
                                  {getInitials(pago.user.primerNombre, pago.user.primerApellido)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {pago.user.primerNombre} {pago.user.primerApellido}
                                </p>
                                <p className="text-sm text-gray-600">{pago.user.correo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-800">Apt. {pago.apartment.numero}</span>
                            <p className="text-sm text-gray-600">Piso {pago.apartment.piso}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-gray-800">
                              {formatCurrency(pago.monto)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-800">
                              {new Date(pago.fechaVencimiento).toLocaleDateString('es-ES')}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(pago.estado)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              {pago.estado === 'pendiente' && (
                                <Button
                                  size="sm"
                                  className="bg-secondary text-white hover:bg-green-600"
                                  onClick={() => markAsPaidMutation.mutate(pago.id)}
                                  disabled={markAsPaidMutation.isPending}
                                >
                                  Marcar Pagado
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                {pago.estado === 'pagado' ? 'Ver Detalles' : 'Editar'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredPagos.length} de {pagos?.length || 0} registros
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <LoadingModal 
        isOpen={markAsPaidMutation.isPending} 
        message="Actualizando pago..." 
      />
    </div>
  );
}
