import { useState, useEffect } from "react";
import type { UserWithApartment, PagoWithRelations, PaymentFormData } from "@shared/schema";
import { paymentFormSchema } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Building, 
  CreditCard, 
  CheckCircle, 
  TriangleAlert,
  Home,
  LogOut,
  Download,
  AlertCircle,
  Eye,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";
import LoadingModal from "@/components/ui/loading-modal";

const profileFormSchema = z.object({
  primerNombre: z.string().min(1, "Primer nombre es requerido"),
  segundoNombre: z.string().optional(),
  primerApellido: z.string().min(1, "Primer apellido es requerido"),
  segundoApellido: z.string().optional(),
  telefono: z.string().min(1, "Teléfono es requerido"),
  correo: z.string().email("Correo inválido"),
  tipoIdentificacion: z.enum(["pasaporte", "cedula", "rif"]),
  identificacion: z.string().min(1, "Identificación es requerida"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function TenantDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("payments");
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<PagoWithRelations | null>(null);
  const [showPaymentDetailsDialog, setShowPaymentDetailsDialog] = useState(false);
  const [showPaymentFormDialog, setShowPaymentFormDialog] = useState(false);
  const [selectedPaymentForForm, setSelectedPaymentForForm] = useState<PagoWithRelations | null>(null);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const HISTORY_ITEMS_PER_PAGE = 5;

  // Redirect if not authenticated or not tenant
  useEffect(() => {
    if (!authLoading && (!user || user.tipoUsuario !== 'propietario')) {
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

  // Fetch user's payments
  const { data: pagos, isLoading: pagosLoading } = useQuery<PagoWithRelations[]>({
    queryKey: ["/api/pagos"],
    enabled: !!user && user.tipoUsuario === 'propietario',
  });

  // Fetch latest USD exchange rate
  const { data: usdRate } = useQuery({
    queryKey: ["/api/tasas-cambio/latest/USD"],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/tasas-cambio/latest/USD`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
      } catch (error) {
        return null;
      }
    },
    enabled: !!user,
  });

  // Profile form
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      primerNombre: user?.primerNombre || "",
      segundoNombre: user?.segundoNombre || "",
      primerApellido: user?.primerApellido || "",
      segundoApellido: user?.segundoApellido || "",
      telefono: user?.telefono || "",
      correo: user?.correo || "",
      tipoIdentificacion: user?.tipoIdentificacion || "cedula",
      identificacion: user?.identificacion || "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        primerNombre: user.primerNombre || "",
        segundoNombre: user.segundoNombre || "",
        primerApellido: user.primerApellido || "",
        segundoApellido: user.segundoApellido || "",
        telefono: user.telefono || "",
        correo: user.correo || "",
        tipoIdentificacion: user.tipoIdentificacion || "cedula",
        identificacion: user.identificacion || "",
      });
    }
  }, [user, form]);

  // Payment form configuration
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      fechaOperacion: new Date().toISOString().split('T')[0],
      cedulaRif: user?.identificacion || "",
      monto: "",
      tipoOperacion: "mismo_banco",
      correoElectronico: user?.correo || "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user) throw new Error("User not found");
      await apiRequest('PUT', `/api/users/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
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
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  // Submit payment form mutation
  const submitPaymentFormMutation = useMutation({
    mutationFn: async ({ pagoId, data }: { pagoId: string; data: PaymentFormData }) => {
      await apiRequest('PUT', `/api/pagos/${pagoId}/submit-payment`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pagos"] });
      setShowPaymentFormDialog(false);
      setSelectedPaymentForForm(null);
      paymentForm.reset();
      toast({
        title: "Éxito",
        description: "Pago enviado para revisión del administrador",
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
        description: "No se pudo procesar el pago",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      // Clear any cached data and redirect to login
      queryClient.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      // Force redirect even if logout fails
      window.location.href = "/";
    }
  };

  const handlePayNow = (pago: PagoWithRelations) => {
    setSelectedPaymentForForm(pago);
    // Clear the form first, then set default values
    paymentForm.reset({
      fechaOperacion: new Date().toISOString().split('T')[0],
      cedulaRif: user?.identificacion || "",
      monto: "",
      tipoOperacion: "mismo_banco",
      correoElectronico: user?.correo || "",
    });
    setShowPaymentFormDialog(true);
  };

  const onSubmitPaymentForm = (data: PaymentFormData) => {
    if (!selectedPaymentForForm) return;
    submitPaymentFormMutation.mutate({ 
      pagoId: selectedPaymentForForm.id, 
      data 
    });
  };

  const handleShowDetails = (pago: PagoWithRelations) => {
    setSelectedPaymentDetails(pago);
    setShowPaymentDetailsDialog(true);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return <Badge className="bg-green-100 text-green-800 font-medium">Pagado</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800 font-medium">Pendiente</Badge>;
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800 font-medium">Vencido</Badge>;
      case 'en_revision':
        return <Badge className="bg-blue-100 text-blue-800 font-medium">En Revisión</Badge>;
      default:
        return <Badge variant="outline" className="font-medium">{estado}</Badge>;
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return <CheckCircle className="w-6 h-6 text-secondary" />;
      case 'pendiente':
        return <TriangleAlert className="w-6 h-6 text-accent" />;
      case 'vencido':
        return <AlertCircle className="w-6 h-6 text-error" />;
      case 'en_revision':
        return <Eye className="w-6 h-6 text-blue-600" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-400" />;
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

  const calculateStats = () => {
    if (!pagos) return { currentBalance: 0, paidPayments: 0, monthlyFee: 0 };
    
    const pendingPayments = pagos.filter(p => p.estado === 'pendiente');
    const paidPayments = pagos.filter(p => p.estado === 'pagado');
    const currentBalance = pendingPayments.reduce((sum, p) => sum + parseFloat(p.monto), 0);
    const monthlyFee = pagos.length > 0 ? parseFloat(pagos[0].monto) : 0;
    
    return {
      currentBalance: -currentBalance, // Negative because it's a debt
      paidPayments: paidPayments.length,
      monthlyFee,
    };
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (authLoading || !user || user.tipoUsuario !== 'propietario') {
    return <LoadingModal isOpen={true} message="Cargando..." />;
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-surface shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">CondoManager</h1>
                <p className="text-xs text-gray-600">Portal del Propietario</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = "/tasas-cambio"}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:block">Tasas BCV</span>
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {user.primerNombre} {user.primerApellido}
                </p>
                <p className="text-xs text-gray-600">
                  {user.apartment ? `Apt. ${user.apartment.numero}` : 'Sin apartamento'}
                </p>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {getInitials(user.primerNombre, user.primerApellido)}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl text-white p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                ¡Bienvenido, {user.primerNombre}!
              </h1>
              <p className="text-blue-100">Gestiona tus pagos y mantén tu información actualizada</p>
            </div>
            {user.apartment && (
              <div className="hidden md:block">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm text-blue-100">Tu apartamento</p>
                  <p className="text-2xl font-bold">{user.apartment.numero}</p>
                  <p className="text-sm text-blue-100">Piso {user.apartment.piso}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Balance Actual</p>
                  <p className={`text-2xl font-bold ${stats.currentBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(stats.currentBalance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.currentBalance < 0 ? 'Deuda pendiente' : 'Al día'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stats.currentBalance < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                  {stats.currentBalance < 0 ? (
                    <AlertCircle className="text-red-600 w-6 h-6" />
                  ) : (
                    <CheckCircle className="text-green-600 w-6 h-6" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pagos Realizados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paidPayments}</p>
                  <p className="text-xs text-gray-500 mt-1">Este año</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="text-green-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alícuota Mensual</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {formatCurrency(stats.monthlyFee)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Según apartamento</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Home className="text-blue-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <TabsList className="w-full h-auto p-0 bg-transparent">
                <div className="flex space-x-2 px-6 py-2">
                  <TabsTrigger
                    value="payments"
                    className="flex items-center space-x-2 px-6 py-4 rounded-lg transition-all duration-200 
                      border-2 border-transparent font-medium text-gray-600 hover:text-primary hover:bg-white/50
                      data-[state=active]:border-primary data-[state=active]:text-primary 
                      data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Mis Pagos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="flex items-center space-x-2 px-6 py-4 rounded-lg transition-all duration-200 
                      border-2 border-transparent font-medium text-gray-600 hover:text-primary hover:bg-white/50
                      data-[state=active]:border-primary data-[state=active]:text-primary 
                      data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <User className="w-5 h-5" />
                    <span>Mi Perfil</span>
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>
            
            {/* Payments Tab */}
            <TabsContent value="payments" className="p-6">
              {pagosLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Cargando pagos...</p>
                </div>
              ) : !pagos || pagos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay pagos registrados</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Pagos Pendientes */}
                  {(() => {
                    const pagosPendientes = pagos.filter(p => p.estado === 'pendiente' || p.estado === 'vencido');
                    return pagosPendientes.length > 0 && (
                      <div>
                        <div className="flex items-center mb-4">
                          <div className="bg-orange-100 p-2 rounded-lg mr-3">
                            <Clock className="w-5 h-5 text-orange-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Pagos Pendientes 
                            <span className="ml-2 bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full">
                              {pagosPendientes.length}
                            </span>
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {pagosPendientes.map((pago) => (
                            <Card key={pago.id} className="border border-orange-200 hover:border-orange-300 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                        pago.estado === 'vencido' ? 'bg-red-100' : 'bg-orange-100'
                                      }`}>
                                        {getStatusIcon(pago.estado)}
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-gray-800">{pago.concepto}</h3>
                                        <p className="text-sm text-gray-600">
                                          Vencimiento: {new Date(pago.fechaVencimiento).toLocaleDateString('es-ES')}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-3 flex items-center space-x-6">
                                      <div>
                                        <p className="text-xs text-gray-500">Monto</p>
                                        <p className="font-semibold text-gray-800">
                                          {formatCurrency(pago.monto)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Estado</p>
                                        {getStatusBadge(pago.estado)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button 
                                      className="bg-primary text-white hover:bg-blue-700"
                                      onClick={() => handlePayNow(pago)}
                                      disabled={submitPaymentFormMutation.isPending}
                                    >
                                      {submitPaymentFormMutation.isPending ? "Procesando..." : "Pagar Ahora"}
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleShowDetails(pago)}
                                    >
                                      Detalles
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Pagos En Revisión */}
                  {(() => {
                    const pagosEnRevision = pagos.filter(p => p.estado === 'en_revision');
                    return pagosEnRevision.length > 0 && (
                      <div>
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Eye className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Pagos En Revisión
                            <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                              {pagosEnRevision.length}
                            </span>
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {pagosEnRevision.map((pago) => (
                            <Card key={pago.id} className="border border-blue-200 hover:border-blue-300 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                                        {getStatusIcon(pago.estado)}
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-gray-800">{pago.concepto}</h3>
                                        <p className="text-sm text-gray-600">
                                          {pago.fechaPago 
                                            ? `Enviado el: ${new Date(pago.fechaPago).toLocaleDateString('es-ES')}`
                                            : `Vencimiento: ${new Date(pago.fechaVencimiento).toLocaleDateString('es-ES')}`
                                          }
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-3 flex items-center space-x-6">
                                      <div>
                                        <p className="text-xs text-gray-500">Monto</p>
                                        <div className="space-y-1">
                                          <p className="font-semibold text-gray-800">
                                            {formatCurrency(pago.monto)}
                                          </p>
                                          {pago.montoBs && (
                                            <p className="text-sm text-gray-600">
                                              {new Intl.NumberFormat('es-VE', {
                                                style: 'currency',
                                                currency: 'VES',
                                                minimumFractionDigits: 2
                                              }).format(parseFloat(pago.montoBs))}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Estado</p>
                                        {getStatusBadge(pago.estado)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleShowDetails(pago)}
                                    >
                                      Detalles
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Historial de Pagos Completados */}
                  {(() => {
                    const pagosPagados = pagos.filter(p => p.estado === 'pagado');
                    if (pagosPagados.length === 0) return null;

                    // Calcular paginación
                    const totalPages = Math.ceil(pagosPagados.length / HISTORY_ITEMS_PER_PAGE);
                    const startIndex = (currentHistoryPage - 1) * HISTORY_ITEMS_PER_PAGE;
                    const endIndex = startIndex + HISTORY_ITEMS_PER_PAGE;
                    const currentPagePayments = pagosPagados.slice(startIndex, endIndex);

                    return (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              Historial de Pagos Completados
                              <span className="ml-2 bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                                {pagosPagados.length}
                              </span>
                            </h3>
                          </div>
                          {totalPages > 1 && (
                            <div className="text-sm text-gray-600">
                              Página {currentHistoryPage} de {totalPages}
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          {currentPagePayments.map((pago) => (
                            <Card key={pago.id} className="border border-green-200 hover:border-green-300 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                                        {getStatusIcon(pago.estado)}
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-gray-800">{pago.concepto}</h3>
                                        <p className="text-sm text-gray-600">
                                          Pagado el: {new Date(pago.fechaPago!).toLocaleDateString('es-ES')}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-3 flex items-center space-x-6">
                                      <div>
                                        <p className="text-xs text-gray-500">Monto</p>
                                        <div className="space-y-1">
                                          <p className="font-semibold text-gray-800">
                                            {formatCurrency(pago.monto)}
                                          </p>
                                          {pago.montoBs && (
                                            <p className="text-sm text-gray-600">
                                              {new Intl.NumberFormat('es-VE', {
                                                style: 'currency',
                                                currency: 'VES',
                                                minimumFractionDigits: 2
                                              }).format(parseFloat(pago.montoBs))}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Estado</p>
                                        {getStatusBadge(pago.estado)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    {pago.comprobanteUrl && (
                                      <Button 
                                        variant="outline"
                                        onClick={() => window.open(pago.comprobanteUrl!, '_blank')}
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Recibo
                                      </Button>
                                    )}
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleShowDetails(pago)}
                                    >
                                      Detalles
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        {/* Paginación */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-green-200">
                            <div className="text-sm text-gray-600">
                              Mostrando {startIndex + 1}-{Math.min(endIndex, pagosPagados.length)} de {pagosPagados.length} pagos
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentHistoryPage(prev => Math.max(1, prev - 1))}
                                disabled={currentHistoryPage === 1}
                                className="flex items-center space-x-1"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Anterior</span>
                              </Button>
                              
                              <div className="flex items-center space-x-1">
                                {[...Array(totalPages)].map((_, index) => {
                                  const pageNumber = index + 1;
                                  return (
                                    <Button
                                      key={pageNumber}
                                      variant={pageNumber === currentHistoryPage ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setCurrentHistoryPage(pageNumber)}
                                      className="w-8 h-8 p-0"
                                    >
                                      {pageNumber}
                                    </Button>
                                  );
                                })}
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentHistoryPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentHistoryPage === totalPages}
                                className="flex items-center space-x-1"
                              >
                                <span>Siguiente</span>
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </TabsContent>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="p-6">
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Información Personal</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="primerNombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primer Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="segundoNombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Segundo Nombre (Opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="primerApellido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primer Apellido</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="segundoApellido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Segundo Apellido</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="correo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="tipoIdentificacion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Identificación</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona el tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cedula">Cédula</SelectItem>
                                <SelectItem value="pasaporte">Pasaporte</SelectItem>
                                <SelectItem value="rif">RIF</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="identificacion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Identificación</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-primary text-white hover:bg-blue-700"
                      >
                        {updateProfileMutation.isPending ? "Actualizando..." : "Actualizar Información"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <LoadingModal 
        isOpen={updateProfileMutation.isPending} 
        message="Actualizando perfil..." 
      />

      {/* Payment Details Dialog */}
      {selectedPaymentDetails && (
        <Dialog open={showPaymentDetailsDialog} onOpenChange={setShowPaymentDetailsDialog}>
          <DialogContent className="max-w-md" aria-describedby="payment-details-description">
            <DialogHeader>
              <DialogTitle>Detalles del Pago</DialogTitle>
            </DialogHeader>
            <div className="space-y-4" id="payment-details-description">
              <div>
                <p className="text-sm font-medium text-gray-500">Concepto</p>
                <p className="text-lg font-semibold">{selectedPaymentDetails.concepto}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Monto</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedPaymentDetails.monto)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  {getStatusBadge(selectedPaymentDetails.estado)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Vencimiento</p>
                  <p className="text-sm">{new Date(selectedPaymentDetails.fechaVencimiento).toLocaleDateString('es-ES')}</p>
                </div>
                {selectedPaymentDetails.fechaPago && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Pago</p>
                    <p className="text-sm">{new Date(selectedPaymentDetails.fechaPago).toLocaleDateString('es-ES')}</p>
                  </div>
                )}
              </div>
              {selectedPaymentDetails.metodoPago && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Método de Pago</p>
                  <p className="text-sm">{selectedPaymentDetails.metodoPago}</p>
                </div>
              )}
              {selectedPaymentDetails.apartment && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Apartamento</p>
                  <p className="text-sm">Apt. {selectedPaymentDetails.apartment.numero} - Piso {selectedPaymentDetails.apartment.piso}</p>
                </div>
              )}
              {selectedPaymentDetails.comprobanteUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Comprobante</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(selectedPaymentDetails.comprobanteUrl!, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Ver Comprobante
                  </Button>
                </div>
              )}
              
              {/* Información declarada por el propietario */}
              {(selectedPaymentDetails.estado === 'en_revision' || selectedPaymentDetails.estado === 'pagado') && (
                selectedPaymentDetails.fechaOperacion || selectedPaymentDetails.cedulaRif || 
                selectedPaymentDetails.tipoOperacion || selectedPaymentDetails.correoElectronico
              ) && (
                <>
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Información Declarada</p>
                    <div className="space-y-3">
                      {selectedPaymentDetails.fechaOperacion && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Fecha de Operación</p>
                            <p className="text-sm">{new Date(selectedPaymentDetails.fechaOperacion).toLocaleDateString('es-ES')}</p>
                          </div>
                        </div>
                      )}
                      {selectedPaymentDetails.cedulaRif && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Cédula/RIF</p>
                          <p className="text-sm">{selectedPaymentDetails.cedulaRif}</p>
                        </div>
                      )}
                      {selectedPaymentDetails.tipoOperacion && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tipo de Operación</p>
                          <p className="text-sm">
                            {selectedPaymentDetails.tipoOperacion === 'mismo_banco' 
                              ? 'Transferencia mismo banco' 
                              : 'Transferencia desde otro banco'
                            }
                          </p>
                        </div>
                      )}
                      {selectedPaymentDetails.correoElectronico && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                          <p className="text-sm">{selectedPaymentDetails.correoElectronico}</p>
                        </div>
                      )}
                      {selectedPaymentDetails.montoBs && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Monto Declarado (Bs.)</p>
                          <p className="text-sm font-semibold text-green-600">
                            {new Intl.NumberFormat('es-VE', {
                              style: 'currency',
                              currency: 'VES',
                              minimumFractionDigits: 2
                            }).format(parseFloat(selectedPaymentDetails.montoBs))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowPaymentDetailsDialog(false)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Form Dialog */}
      {selectedPaymentForForm && (
        <Dialog open={showPaymentFormDialog} onOpenChange={setShowPaymentFormDialog}>
          <DialogContent className="max-w-md" aria-describedby="payment-form-description">
            <DialogHeader>
              <DialogTitle>Completar Pago</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mb-4" id="payment-form-description">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">Concepto: <span className="font-medium">{selectedPaymentForForm.concepto}</span></p>
                <p className="text-sm text-gray-600">Monto: <span className="font-medium text-green-600">{formatCurrency(selectedPaymentForForm.monto)}</span></p>
              </div>
            </div>
            
            <Form {...paymentForm}>
              <form onSubmit={paymentForm.handleSubmit(onSubmitPaymentForm)} className="space-y-4">
                <FormField
                  control={paymentForm.control}
                  name="fechaOperacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Operación</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-fecha-operacion" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="cedulaRif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula - RIF</FormLabel>
                      <FormControl>
                        <Input placeholder="V-12345678 o J-123456789" {...field} data-testid="input-cedula-rif" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="monto"
                  render={({ field }) => {
                    // Calculate Bs amount for placeholder
                    const getPlaceholderText = () => {
                      if (selectedPaymentForForm && usdRate?.valor) {
                        const usdAmount = parseFloat(selectedPaymentForForm.monto);
                        const bsAmount = (usdAmount * parseFloat(usdRate.valor)).toFixed(2);
                        return `${new Intl.NumberFormat('es-VE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(parseFloat(bsAmount))} Bs.`;
                      }
                      return "Monto pagado en Bs";
                    };

                    return (
                      <FormItem>
                        <FormLabel>Monto Pagado (Bs.)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder={getPlaceholderText()}
                            {...field} 
                            data-testid="input-monto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={paymentForm.control}
                  name="tipoOperacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Operación</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value} data-testid="select-tipo-operacion">
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mismo_banco">Transferencia mismo banco</SelectItem>
                            <SelectItem value="otro_banco">Transferencia desde otro banco</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentForm.control}
                  name="correoElectronico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="usuario@ejemplo.com" 
                          {...field} 
                          data-testid="input-correo-electronico"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPaymentFormDialog(false)}
                    data-testid="button-cancelar"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitPaymentFormMutation.isPending}
                    data-testid="button-enviar-pago"
                  >
                    {submitPaymentFormMutation.isPending ? "Procesando..." : "Enviar Pago"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
