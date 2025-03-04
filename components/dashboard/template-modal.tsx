'use client';

import { useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TemplateModal({ isOpen: defaultIsOpen, onClose, onSuccess }: TemplateModalProps) {
  const api = useApi();
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const [templateName, setTemplateName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!templateName || !tenantId) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/system/queries", {
        name: templateName,
        templateName: templateName, // API'ye hem name hem templateName gönder
        tenantId,
        isActive,
        queries: []
      });
      toast.success("Koleksiyon başarıyla oluşturuldu");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Koleksiyon oluşturulurken hata:", error);
      toast.error("Koleksiyon oluşturulurken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTemplateName("");
    setTenantId("");
    setIsActive(true);
    onClose();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 bg-background/50 backdrop-blur-sm"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Koleksiyon Oluştur</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Koleksiyon İsmi</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Koleksiyon ismi giriniz"
              />
            </div>

            <div className="space-y-2">
              <Label>Firma Kısa Kod</Label>
              <Input
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="Firma kısa kodu giriniz"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="active">Aktif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
