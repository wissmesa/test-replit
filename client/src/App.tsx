import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import TenantDashboard from "@/pages/tenant-dashboard";
import ExchangeRatesPage from "@/pages/exchange-rates";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={LoginPage} />
          <Route component={() => <LoginPage />} />
        </>
      ) : (
        <>
          <Route path="/" component={() => {
            if (user?.tipoUsuario === 'admin') {
              return <AdminDashboard />;
            } else if (user?.tipoUsuario === 'propietario') {
              return <TenantDashboard />;
            } else {
              return <LoginPage />;
            }
          }} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/tenant" component={TenantDashboard} />
          <Route path="/tasas-cambio" component={ExchangeRatesPage} />
        {/* <Route component={NotFound} /> */}
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
