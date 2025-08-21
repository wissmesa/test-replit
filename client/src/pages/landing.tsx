import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Users, CreditCard, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-blue-600 p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">CondoManager</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestión de Condominios</p>
        </div>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Gestiona tu condominio de manera eficiente y profesional
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600">Gestión de Propietarios</p>
            </div>
            <div className="text-center p-3">
              <CreditCard className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm text-gray-600">Control de Pagos</p>
            </div>
            <div className="text-center p-3">
              <Building className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm text-gray-600">Administración</p>
            </div>
            <div className="text-center p-3">
              <BarChart3 className="w-8 h-8 text-error mx-auto mb-2" />
              <p className="text-sm text-gray-600">Reportes</p>
            </div>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </Button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Sistema seguro y confiable para tu condominio
          </p>
        </div>
      </div>
    </div>
  );
}
