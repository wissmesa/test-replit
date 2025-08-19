import { useState, useEffect } from "react";
import type { UserWithApartment, Apartment, PagoWithRelations } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  LogOut,
  UserPlus,
  Edit,
  Trash2
} from "lucide-react";
import LoadingModal from "@/components/ui/loading-modal";
import { ObjectUploader } from "@/components/ObjectUploader";

const registerSchema = z.object({
  primerNombre: z.string().min(1, "Primer nombre requerido"),
  segundoNombre: z.string().optional(),
  primerApellido: z.string().min(1, "Primer apellido requerido"),
  segundoApellido: z.string().optional(),
  telefono: z.string().min(1, "Teléfono requerido"),
  correo: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
  identificacion: z.string().min(1, "Identificación requerida"),
  tipoIdentificacion: z.enum(["pasaporte", "cedula", "rif"]),
  tipoUsuario: z.enum(["admin", "inquilino"]),
});

const apartmentSchema = z.object({
  numero: z.string().min(1, "Número de apartamento requerido"),
  piso: z.number().min(1, "Piso debe ser mayor a 0"),
  alicuota: z.string().min(1, "Alícuota requerida"),
  idUsuario: z.string().optional()
});

const assignUserSchema = z.object({
  idUsuario: z.string().min(1, "Debe seleccionar un usuario")
});

const pagoSchema = z.object({
  idUsuario: z.string().min(1, "Debe seleccionar un usuario"),
  idApartamento: z.number().min(1, "Debe seleccionar un apartamento"),
  monto: z.string().min(1, "Monto requerido"),
  fechaVencimiento: z.string().min(1, "Fecha de vencimiento requerida"),
  concepto: z.string().min(1, "Concepto requerido"),
  metodoPago: z.string().optional(),
  comprobanteUrl: z.string().optional()
});

type RegisterFormData = z.infer<typeof registerSchema>;
type ApartmentFormData = z.infer<typeof apartmentSchema>;
type AssignUserFormData = z.infer<typeof assignUserSchema>;
type PagoFormData = z.infer<typeof pagoSchema>;

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showApartmentDialog, setShowApartmentDialog] = useState(false);
  const [showAssignUserDialog, setShowAssignUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showEditApartmentDialog, setShowEditApartmentDialog] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithApartment | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithApartment | null>(null);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    apartment: "all",
    status: "all",
    month: ""
  });
  const [showPagoDialog, setShowPagoDialog] = useState(false);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string>("");

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      telefono: "",
      correo: "",
      password: "",
      identificacion: "",
      tipoIdentificacion: "cedula",
      tipoUsuario: "inquilino",
    },
  });

  const apartmentForm = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      numero: "",
      piso: 1,
      alicuota: "",
      idUsuario: undefined
    },
  });

  const assignUserForm = useForm<AssignUserFormData>({
    resolver: zodResolver(assignUserSchema),
    defaultValues: {
      idUsuario: ""
    },
  });

  const editUserForm = useForm<Omit<RegisterFormData, 'password'>>({
    resolver: zodResolver(registerSchema.omit({ password: true })),
    defaultValues: {
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      telefono: "",
      correo: "",
      identificacion: "",
      tipoIdentificacion: "cedula",
      tipoUsuario: "inquilino"
    }
  });

  const editApartmentForm = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      numero: "",
      piso: 1,
      alicuota: "",
      idUsuario: undefined
    }
  });

  const pagoForm = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      idUsuario: "",
      idApartamento: 0,
      monto: "",
      fechaVencimiento: "",
      concepto: "",
      metodoPago: "",
      comprobanteUrl: ""
    }
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

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<UserWithApartment[]>({
    queryKey: ["/api/users"],
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

  // Register user mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido registrado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowRegisterDialog(false);
      registerForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear usuario",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
    },
  });

  // Create apartment mutation
  const createApartmentMutation = useMutation({
    mutationFn: async (data: ApartmentFormData) => {
      const response = await apiRequest("POST", "/api/apartments", {
        ...data,
        piso: Number(data.piso),
        alicuota: data.alicuota
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Apartamento creado",
        description: "El apartamento ha sido registrado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/apartments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowApartmentDialog(false);
      apartmentForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear apartamento",
        description: error.message || "No se pudo crear el apartamento",
        variant: "destructive",
      });
    },
  });

  // Assign user to apartment mutation
  const assignUserMutation = useMutation({
    mutationFn: async ({ apartmentId, userId }: { apartmentId: number; userId: string }) => {
      await apiRequest("POST", `/api/apartments/${apartmentId}/assign-user`, {
        userId: userId
      });
    },
    onSuccess: () => {
      toast({
        title: "Usuario asignado",
        description: "El usuario ha sido asignado al apartamento exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/apartments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowAssignUserDialog(false);
      setSelectedApartment(null);
      assignUserForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al asignar usuario",
        description: error.message || "No se pudo asignar el usuario",
        variant: "destructive",
      });
    },
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: async (data: Omit<RegisterFormData, 'password'>) => {
      if (!editingUser) throw new Error("No user selected for editing");
      await apiRequest("PUT", `/api/users/${editingUser.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowEditUserDialog(false);
      setEditingUser(null);
      editUserForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar usuario",
        description: error.message || "No se pudieron actualizar los datos del usuario",
        variant: "destructive",
      });
    },
  });

  // Edit apartment mutation
  const editApartmentMutation = useMutation({
    mutationFn: async (data: ApartmentFormData) => {
      if (!editingApartment) throw new Error("No apartment selected for editing");
      await apiRequest("PUT", `/api/apartments/${editingApartment.id}`, {
        ...data,
        piso: Number(data.piso),
        alicuota: data.alicuota
      });
    },
    onSuccess: () => {
      toast({
        title: "Apartamento actualizado",
        description: "Los datos del apartamento han sido actualizados exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/apartments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowEditApartmentDialog(false);
      setEditingApartment(null);
      editApartmentForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar apartamento",
        description: error.message || "No se pudieron actualizar los datos del apartamento",
        variant: "destructive",
      });
    },
  });

  // Create pago mutation
  const createPagoMutation = useMutation({
    mutationFn: async (data: PagoFormData) => {
      const response = await apiRequest("POST", "/api/pagos", {
        ...data,
        idApartamento: Number(data.idApartamento),
        monto: data.monto
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pago creado",
        description: "El pago ha sido registrado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pagos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowPagoDialog(false);
      setUploadedReceiptUrl("");
      pagoForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear pago",
        description: error.message || "No se pudo crear el pago",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      queryClient.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      window.location.href = "/";
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  const onCreateApartment = async (data: ApartmentFormData) => {
    createApartmentMutation.mutate(data);
  };

  const onAssignUser = async (data: AssignUserFormData) => {
    if (selectedApartment) {
      assignUserMutation.mutate({
        apartmentId: selectedApartment.id,
        userId: data.idUsuario
      });
    }
  };

  const handleAssignUser = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setShowAssignUserDialog(true);
    assignUserForm.reset();
  };

  const handleEditUser = (user: UserWithApartment) => {
    setEditingUser(user);
    editUserForm.reset({
      primerNombre: user.primerNombre,
      segundoNombre: user.segundoNombre || "",
      primerApellido: user.primerApellido,
      segundoApellido: user.segundoApellido || "",
      telefono: user.telefono,
      correo: user.correo,
      identificacion: user.identificacion,
      tipoIdentificacion: user.tipoIdentificacion,
      tipoUsuario: user.tipoUsuario
    });
    setShowEditUserDialog(true);
  };

  const handleEditApartment = (apartment: Apartment) => {
    setEditingApartment(apartment);
    editApartmentForm.reset({
      numero: apartment.numero,
      piso: apartment.piso,
      alicuota: apartment.alicuota,
      idUsuario: apartment.idUsuario || ""
    });
    setShowEditApartmentDialog(true);
  };

  const onEditUser = async (data: Omit<RegisterFormData, 'password'>) => {
    editUserMutation.mutate(data);
  };

  const onEditApartment = async (data: ApartmentFormData) => {
    editApartmentMutation.mutate(data);
  };

  const onCreatePago = async (data: PagoFormData) => {
    createPagoMutation.mutate({
      ...data,
      monto: data.monto, // Keep as string for decimal field
      fechaVencimiento: data.fechaVencimiento, // Send as string, schema will transform to Date
      comprobanteUrl: uploadedReceiptUrl
    });
  };

  // Upload handler for payment receipts
  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/pagos/upload-url", {});
    const result = await response.json();
    return {
      method: "PUT" as const,
      url: result.uploadURL,
    };
  };

  const handleUploadComplete = async (result: any) => {
    if (result.successful && result.successful[0]) {
      const uploadUrl = result.successful[0].uploadURL;
      
      try {
        // Set ACL policy for the uploaded file
        const response = await apiRequest("PUT", "/api/pagos/set-receipt-acl", {
          receiptUrl: uploadUrl
        });
        const aclResult = await response.json();
        
        setUploadedReceiptUrl(aclResult.objectPath);
        toast({
          title: "Comprobante subido",
          description: "El archivo se ha subido correctamente",
        });
      } catch (error) {
        console.error("Error setting ACL:", error);
        // Still set the URL even if ACL fails
        setUploadedReceiptUrl(uploadUrl);
        toast({
          title: "Comprobante subido",
          description: "El archivo se ha subido, pero puede haber problemas de permisos",
          variant: "destructive",
        });
      }
    }
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
    if (filters.apartment && filters.apartment !== "all" && pago.apartment.numero !== filters.apartment) {
      return false;
    }
    if (filters.status && filters.status !== "all" && pago.estado !== filters.status) {
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
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Home className="text-blue-600 w-6 h-6" />
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
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Users className="text-green-600 w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pagos Pendientes</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {statsLoading ? "..." : stats?.pendingPayments || 0}
                      </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <CreditCard className="text-orange-600 w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ingresos del Mes</p>
                      <p className="text-2xl font-bold text-green-600">
                        {statsLoading ? "..." : formatCurrency(stats?.monthlyIncome || 0)}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <DollarSign className="text-green-600 w-6 h-6" />
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
                  <Dialog open={showPagoDialog} onOpenChange={setShowPagoDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Pago
                      </Button>
                    </DialogTrigger>
                  </Dialog>
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
                    <SelectItem value="all">Todos los apartamentos</SelectItem>
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
                    <SelectItem value="all">Todos los estados</SelectItem>
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Comprobante</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          Cargando pagos...
                        </td>
                      </tr>
                    ) : filteredPagos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">
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
                            {(pago as any).comprobanteUrl ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open((pago as any).comprobanteUrl, '_blank')}
                              >
                                Ver Comprobante
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">Sin comprobante</span>
                            )}
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

        {/* Users Management Section */}
        {activeNav === "users" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Gestión de Usuarios
                </CardTitle>
                <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Nuevo Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
                      <DialogDescription>
                        Complete la información para crear una nueva cuenta de usuario.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
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
                            control={registerForm.control}
                            name="segundoNombre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Segundo Nombre</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
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
                            control={registerForm.control}
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
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="correo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="usuario@ejemplo.com" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contraseña</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Mínimo 6 caracteres" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="telefono"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="tipoIdentificacion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo ID</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
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
                            control={registerForm.control}
                            name="identificacion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Identificación</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="tipoUsuario"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Usuario</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="inquilino">Inquilino</SelectItem>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-3 pt-4">
                          <Button 
                            type="submit" 
                            className="flex-1" 
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? "Registrando..." : "Registrar Usuario"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowRegisterDialog(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Usuario</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Teléfono</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Identificación</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          Cargando usuarios...
                        </td>
                      </tr>
                    ) : !users || users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No hay usuarios para mostrar
                        </td>
                      </tr>
                    ) : (
                      users.map((userItem) => (
                        <tr key={userItem.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary text-white text-sm">
                                  {getInitials(userItem.primerNombre, userItem.primerApellido)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {userItem.primerNombre} {userItem.segundoNombre} {userItem.primerApellido} {userItem.segundoApellido}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-800">{userItem.correo}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-800">{userItem.telefono}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <span className="text-gray-800">{userItem.identificacion}</span>
                              <p className="text-sm text-gray-600 capitalize">{userItem.tipoIdentificacion}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={
                              userItem.tipoUsuario === 'admin' 
                                ? "font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm" 
                                : "font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm"
                            }>
                              {userItem.tipoUsuario === 'admin' ? 'Admin' : 'Inquilino'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditUser(userItem)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Apartments Management Section */}
        {activeNav === "apartments" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Gestión de Apartamentos
                </CardTitle>
                <Dialog open={showApartmentDialog} onOpenChange={setShowApartmentDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Apartamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Crear Apartamento</DialogTitle>
                      <DialogDescription>
                        Registra un nuevo apartamento en el sistema
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...apartmentForm}>
                      <form onSubmit={apartmentForm.handleSubmit(onCreateApartment)} className="space-y-4">
                        <FormField
                          control={apartmentForm.control}
                          name="numero"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número del Apartamento</FormLabel>
                              <FormControl>
                                <Input placeholder="Ej: 101, A-1, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apartmentForm.control}
                          name="piso"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Piso</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  {...field} 
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={apartmentForm.control}
                          name="alicuota"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alícuota (USD)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="0.00" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-3 pt-4">
                          <Button 
                            type="submit" 
                            className="flex-1" 
                            disabled={createApartmentMutation.isPending}
                          >
                            {createApartmentMutation.isPending ? "Creando..." : "Crear Apartamento"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowApartmentDialog(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Apartamento</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Piso</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Alícuota</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Inquilino Asignado</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!apartments || apartments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No hay apartamentos registrados
                        </td>
                      </tr>
                    ) : (
                      apartments.map((apartment) => {
                        const assignedUser = users?.find(u => u.id === apartment.idUsuario);
                        return (
                          <tr key={apartment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                                  <Home className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Apt. {apartment.numero}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-800">Piso {apartment.piso}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-medium text-gray-800">
                                {formatCurrency(apartment.alicuota)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {assignedUser ? (
                                <div className="flex items-center space-x-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-secondary text-white text-xs">
                                      {getInitials(assignedUser.primerNombre, assignedUser.primerApellido)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-gray-800 text-sm">
                                    {assignedUser.primerNombre} {assignedUser.primerApellido}
                                  </span>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-gray-500">
                                  Sin asignar
                                </Badge>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAssignUser(apartment)}
                                >
                                  <UserPlus className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditApartment(apartment)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assign User Dialog */}
      <Dialog open={showAssignUserDialog} onOpenChange={setShowAssignUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Usuario a Apartamento</DialogTitle>
            <DialogDescription>
              {selectedApartment && `Selecciona un usuario para asignar al apartamento ${selectedApartment.numero}`}
            </DialogDescription>
          </DialogHeader>
          <Form {...assignUserForm}>
            <form onSubmit={assignUserForm.handleSubmit(onAssignUser)} className="space-y-4">
              <FormField
                control={assignUserForm.control}
                name="idUsuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seleccionar Usuario</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un usuario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.filter(u => u.tipoUsuario === 'inquilino' && !u.idApartamento).map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.primerNombre} {user.primerApellido} - {user.correo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={assignUserMutation.isPending}
                >
                  {assignUserMutation.isPending ? "Asignando..." : "Asignar Usuario"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAssignUserDialog(false);
                    setSelectedApartment(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Actualiza la información del usuario
            </DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(onEditUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editUserForm.control}
                  name="primerNombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primer nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Primer nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editUserForm.control}
                  name="segundoNombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Segundo nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editUserForm.control}
                  name="primerApellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primer apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Primer apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editUserForm.control}
                  name="segundoApellido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Segundo apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editUserForm.control}
                name="correo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editUserForm.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de teléfono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editUserForm.control}
                  name="identificacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identificación</FormLabel>
                      <FormControl>
                        <Input placeholder="Número de identificación" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editUserForm.control}
                  name="tipoIdentificacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de identificación</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tipo" />
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
              </div>

              <FormField
                control={editUserForm.control}
                name="tipoUsuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de usuario</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="inquilino">Inquilino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={editUserMutation.isPending}
                >
                  {editUserMutation.isPending ? "Actualizando..." : "Actualizar Usuario"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditUserDialog(false);
                    setEditingUser(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Apartment Dialog */}
      <Dialog open={showEditApartmentDialog} onOpenChange={setShowEditApartmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Apartamento</DialogTitle>
            <DialogDescription>
              Actualiza la información del apartamento
            </DialogDescription>
          </DialogHeader>
          <Form {...editApartmentForm}>
            <form onSubmit={editApartmentForm.handleSubmit(onEditApartment)} className="space-y-4">
              <FormField
                control={editApartmentForm.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de apartamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 101-A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editApartmentForm.control}
                name="piso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Piso</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Número de piso" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editApartmentForm.control}
                name="alicuota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alícuota mensual</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 150000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={editApartmentMutation.isPending}
                >
                  {editApartmentMutation.isPending ? "Actualizando..." : "Actualizar Apartamento"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditApartmentDialog(false);
                    setEditingApartment(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Pago Dialog */}
      <Dialog open={showPagoDialog} onOpenChange={setShowPagoDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Pago</DialogTitle>
            <DialogDescription>
              Registra un nuevo pago con comprobante opcional
            </DialogDescription>
          </DialogHeader>
          <Form {...pagoForm}>
            <form onSubmit={pagoForm.handleSubmit(onCreatePago)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={pagoForm.control}
                  name="idUsuario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona usuario" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users?.filter(u => u.tipoUsuario === 'inquilino').map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.primerNombre} {user.primerApellido}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={pagoForm.control}
                  name="idApartamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apartamento</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona apartamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {apartments?.map(apt => (
                            <SelectItem key={apt.id} value={apt.id.toString()}>
                              Apt. {apt.numero}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={pagoForm.control}
                  name="monto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={pagoForm.control}
                  name="fechaVencimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Vencimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={pagoForm.control}
                name="concepto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concepto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mantenimiento de condominio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={pagoForm.control}
                name="metodoPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Transferencia bancaria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload Section */}
              <div className="space-y-2">
                <FormLabel>Comprobante de Pago (Opcional)</FormLabel>
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5 * 1024 * 1024} // 5MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="w-full"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {uploadedReceiptUrl ? "Cambiar Comprobante" : "Subir Comprobante"}
                  </div>
                </ObjectUploader>
                {uploadedReceiptUrl && (
                  <div className="text-sm text-green-600">
                    ✓ Comprobante subido exitosamente
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={createPagoMutation.isPending}
                >
                  {createPagoMutation.isPending ? "Creando..." : "Crear Pago"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowPagoDialog(false);
                    setUploadedReceiptUrl("");
                    pagoForm.reset();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <LoadingModal 
        isOpen={markAsPaidMutation.isPending || registerMutation.isPending || createApartmentMutation.isPending || assignUserMutation.isPending || editUserMutation.isPending || editApartmentMutation.isPending || createPagoMutation.isPending} 
        message={
          markAsPaidMutation.isPending ? "Actualizando pago..." : 
          registerMutation.isPending ? "Registrando usuario..." :
          createApartmentMutation.isPending ? "Creando apartamento..." :
          assignUserMutation.isPending ? "Asignando usuario..." :
          editUserMutation.isPending ? "Actualizando usuario..." :
          editApartmentMutation.isPending ? "Actualizando apartamento..." :
          createPagoMutation.isPending ? "Creando pago..." : "Procesando..."
        } 
      />
    </div>
  );
}
