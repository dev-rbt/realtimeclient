import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { TestResult } from '@/components/dashboard/settings/types';
import { useEffect } from 'react';

interface ConnectionTestDialogProps {
  testResult: TestResult | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConnectionTestDialog({ testResult, isOpen, onOpenChange }: ConnectionTestDialogProps) {
  useEffect(() => {
    // Auto-close dialog after successful test
    if (testResult?.success) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [testResult, onOpenChange]);

  if (!testResult) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {testResult.success ? (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Bağlantı Testi Başarılı
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <XCircleIcon className="w-5 h-5 mr-2" />
                Bağlantı Testi Başarısız
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className={testResult.success ? "text-green-600" : "text-red-600"}>
            {testResult.message}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
