import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function LoadingModal({ isOpen, message = "Cargando..." }: LoadingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-sm">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Procesando...</h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
