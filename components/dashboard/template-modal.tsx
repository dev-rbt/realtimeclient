'use client';

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useConnections } from "@/hooks/useConnections";
import { cn } from "@/lib/utils";
import { CreateTemplateRequest } from "@/lib/types/query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TemplateModal({ isOpen: defaultIsOpen, onClose, onSuccess }: TemplateModalProps) {
  const api = useApi();
  const { connections, isLoading: connectionsLoading } = useConnections();
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const [templateName, setTemplateName] = useState("");
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [defaultWarningOpen, setDefaultWarningOpen] = useState(false);
  const [pendingDefaultChange, setPendingDefaultChange] = useState(false);

  // Reset tenant selection when isDefault changes
  useEffect(() => {
    if (isDefault) {
      setSelectedTenants([]);
    }
  }, [isDefault]);

  const handleTenantToggle = (tenantId: string) => {
    setSelectedTenants(current => {
      const tenantIndex = current.indexOf(tenantId);
      
      if (tenantIndex >= 0) {
        return current.filter(id => id !== tenantId);
      } else {
        return [...current, tenantId];
      }
    });
  };

  const handleDefaultToggle = (checked: boolean) => {
    if (checked) {
      // If toggling to default, check if there's already a default template
      setPendingDefaultChange(true);
      setDefaultWarningOpen(true);
    } else {
      setIsDefault(false);
    }
  };

  const confirmDefaultChange = () => {
    // User confirmed changing to default template
    setIsDefault(true);
    setDefaultWarningOpen(false);
    setPendingDefaultChange(false);
  };

  const cancelDefaultChange = () => {
    // User canceled changing to default template
    setDefaultWarningOpen(false);
    setPendingDefaultChange(false);
  };

  const handleSubmit = async () => {
    if (!templateName) {
      toast.error("Lütfen şablon ismini girin");
      return;
    }

    if (!isDefault && selectedTenants.length === 0) {
      toast.error("Lütfen en az bir firma seçin veya varsayılan şablon olarak işaretleyin");
      return;
    }

    try {
      setIsLoading(true);
      
      const createData: CreateTemplateRequest = {
        templateName: templateName,
        tenants: isDefault ? [] : selectedTenants,
        isDefault
      };
      
      await api.post("/system/queryTemplate", createData);
      toast.success("Şablon başarıyla oluşturuldu");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Şablon oluşturulurken hata:", error);
      toast.error("Şablon oluşturulurken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTemplateName("");
    setSelectedTenants([]);
    setIsDefault(false);
    setTenantDropdownOpen(false);
    setPendingDefaultChange(false);
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
            <DialogTitle>Yeni Şablon Oluştur</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Şablon İsmi</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Şablon ismi giriniz"
              />
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="default"
                checked={isDefault}
                onCheckedChange={handleDefaultToggle}
              />
              <Label htmlFor="default">Varsayılan Şablon</Label>
              <div className="ml-2 text-xs text-muted-foreground">
                (Varsayılan şablon tüm firmalara uygulanır)
              </div>
            </div>

            {!isDefault && (
              <div className="space-y-2">
                <Label>Firmalar</Label>
                <Popover 
                  open={tenantDropdownOpen} 
                  onOpenChange={setTenantDropdownOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tenantDropdownOpen}
                      className="w-full justify-between"
                    >
                      {selectedTenants.length > 0 
                        ? `${selectedTenants.length} firma seçildi` 
                        : "Firma seçiniz"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Firma ara..." />
                      <CommandEmpty>Firma bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        <CommandList className="max-h-[200px] overflow-y-auto">
                          {connectionsLoading ? (
                            <CommandItem disabled>Yükleniyor...</CommandItem>
                          ) : (
                            connections.map((connection) => (
                              <CommandItem
                                key={connection.tenantId}
                                value={connection.tenantId}
                                onSelect={() => handleTenantToggle(connection.tenantId)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedTenants.includes(connection.tenantId) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {connection.name} ({connection.tenantId})
                              </CommandItem>
                            ))
                          )}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
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

      <AlertDialog open={defaultWarningOpen} onOpenChange={setDefaultWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Varsayılan Şablon Değişikliği</AlertDialogTitle>
            <AlertDialogDescription>
              Başka bir varsayılan şablon zaten mevcut olabilir. Bu şablonu varsayılan olarak ayarlamak, mevcut varsayılan şablonu değiştirecektir. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDefaultChange}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDefaultChange}>
              Evet, Değiştir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
