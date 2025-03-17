'use client';

import { QueryTemplate, QueryGroup, QueryAttribute } from '@/lib/types/query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, FileText, ChevronLeft, ChevronRight, Star, Check, ChevronsUpDown, CheckCircle2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QueryGroupModal } from "./query-group-modal";
import { useConnections } from '@/hooks/useConnections';
import { cn } from "@/lib/utils";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

interface CollectionDetailsProps {
  template: QueryTemplate;
  onTemplateChange: (template: QueryTemplate) => void;
  onSave: () => void;
  isSaving: boolean;
  connections: any[];
}

export function CollectionDetails({ 
  template, 
  onTemplateChange, 
  onSave, 
  isSaving,
  connections
}: CollectionDetailsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<QueryGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [defaultWarningOpen, setDefaultWarningOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isDefaultTemplate = template.isDefault === true;

  // Parse the tenantId string into an array
  const selectedTenants = useMemo(() => {
    if (!template.tenantId) return [];
    return template.tenantId.split(',').filter(id => id.trim() !== '');
  }, [template.tenantId]);

  // Check if any other template is set as default
  const checkForExistingDefault = () => {
    // This will be checked on the server side
    setDefaultWarningOpen(true);
  };

  const handleTenantToggle = (tenantId: string) => {
    // Don't allow changes if this is a default template
    if (isDefaultTemplate) return;
    
    const currentTenants = [...selectedTenants];
    const tenantIndex = currentTenants.indexOf(tenantId);
    
    if (tenantIndex >= 0) {
      currentTenants.splice(tenantIndex, 1);
    } else {
      currentTenants.push(tenantId);
    }
    
    onTemplateChange({
      ...template,
      tenantId: currentTenants.join(',')
    });
    
    // Clear validation error if tenants are selected
    if (currentTenants.length > 0) {
      setValidationError(null);
    }
  };

  const handleDefaultToggle = (checked: boolean) => {
    if (checked) {
      // If toggling to default, check if there's already a default template
      checkForExistingDefault();
    } else {
      // If toggling from default, clear tenant selection but require selection
      onTemplateChange({
        ...template,
        isDefault: false
      });
    }
  };

  const confirmDefaultChange = () => {
    // User confirmed changing to default template
    onTemplateChange({
      ...template,
      isDefault: true,
      tenantId: ''
    });
    setDefaultWarningOpen(false);
  };

  const handleSave = () => {
    // Validate: if not default, must have at least one tenant selected
    if (!template.isDefault && selectedTenants.length === 0) {
      setValidationError("Varsayılan şablon değilse en az bir firma seçilmelidir.");
      return;
    }
    
    // Clear any validation errors
    setValidationError(null);
    
    // Proceed with save
    onSave();
  };

  const filteredQueries = useMemo(() => {
    if (!searchQuery) return template.queries;

    const searchLower = searchQuery.toLowerCase();
    return template.queries.filter(group => {
      // Check if group name matches
      const nameMatch = group.name.toLowerCase().includes(searchLower);

      // Check if any table name matches
      const tableMatch = group.queries.some(query =>
        query.tableName.toLowerCase().includes(searchLower)
      );

      // Check if type matches
      const typeMatch = group.type.toLowerCase().includes(searchLower);

      return nameMatch || tableMatch || typeMatch;
    });
  }, [template.queries, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQueries.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const addNewQueryGroup = () => {
    const now = new Date().toISOString();
    const newGroup: QueryGroup = {
      id: uuidv4(),
      queries: [{
        id: uuidv4(),
        tableName: "",
        query: "SELECT\n  *\nFROM\n  TableName\nWHERE\n  ColumnName = @Key"
      }],
      type: "SQL", // Default type
      name: "Yeni Sorgu Grubu",
      primaryKey: "Id", // Default primary key
      includeBranchId: false,
      createdAt: now,
      lastUpdatedAt: now
    };
    
    const updatedQueries = [...template.queries, newGroup];
    onTemplateChange({ ...template, queries: updatedQueries });
    toast.success("Yeni sorgu grubu eklendi");
    
    // Open the modal with the new group
    setSelectedGroup(newGroup);
    setIsModalOpen(true);
    
    // Navigate to the last page to show the new group
    setCurrentPage(Math.ceil((updatedQueries.length) / itemsPerPage));
  };

  const removeQueryGroup = (groupId: string) => {
    const updatedQueries = template.queries.filter(group => group.id !== groupId);
    onTemplateChange({ ...template, queries: updatedQueries });
    toast.success("Sorgu grubu silindi");
    
    // Adjust current page if necessary
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleOpenModal = (group: QueryGroup) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedGroup(null);
    setIsModalOpen(false);
  };

  const handleSaveGroup = (updatedGroup: QueryGroup) => {
    const updatedQueries = template.queries.map(group => 
      group.id === updatedGroup.id ? updatedGroup : group
    );
    onTemplateChange({ ...template, queries: updatedQueries });
    toast.success("Sorgu grubu güncellendi");
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="relative group w-64">
                <div className="absolute inset-0 -m-1 rounded-lg transition-all duration-200 group-hover:bg-primary/5" />
                <Input
                  value={template.templateName}
                  onChange={(e) => onTemplateChange({ ...template, templateName: e.target.value })}
                  placeholder="Şablon ismi giriniz"
                  className="h-9 bg-background/50 backdrop-blur-sm relative z-10 text-lg font-bold"
                />
                {isDefaultTemplate && (
                  <Badge variant="secondary" className="absolute right-2 top-1.5 bg-amber-100 text-amber-800">
                    Varsayılan
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="default-template"
                  checked={isDefaultTemplate}
                  onCheckedChange={handleDefaultToggle}
                />
                <Label htmlFor="default-template">Varsayılan Şablon</Label>
                <div className="ml-2 text-xs text-muted-foreground">
                  (Varsayılan şablon tüm firmalara uygulanır)
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative group w-64">
                      <Popover 
                        open={isDefaultTemplate ? false : tenantDropdownOpen} 
                        onOpenChange={isDefaultTemplate ? undefined : setTenantDropdownOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={tenantDropdownOpen}
                            className={cn(
                              "w-full justify-between h-9 bg-background/50 backdrop-blur-sm",
                              isDefaultTemplate && "opacity-70 cursor-not-allowed"
                            )}
                            disabled={isDefaultTemplate}
                          >
                            {isDefaultTemplate 
                              ? "Tüm firmalar (Varsayılan)" 
                              : selectedTenants.length > 0 
                                ? `${selectedTenants.length} firma seçildi` 
                                : "Firma seçiniz"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        {!isDefaultTemplate && (
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Firma ara..." />
                              <CommandEmpty>Firma bulunamadı.</CommandEmpty>
                              <CommandGroup>
                                <CommandList className="max-h-[200px] overflow-y-auto">
                                  {connections.map((connection) => (
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
                                  ))}
                                </CommandList>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        )}
                      </Popover>
                    </div>
                  </TooltipTrigger>
                  {isDefaultTemplate && (
                    <TooltipContent>
                      <p>Varsayılan şablon tüm firmalara uygulanır</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex flex-col gap-2">
                {validationError && (
                  <div className="text-sm text-destructive font-medium">
                    {validationError}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Sorgu Grupları</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Grup veya tablo adı ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addNewQueryGroup}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Yeni Grup
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Grup Adı</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Primary Key</TableHead>
                  <TableHead className="w-[100px]">Branch ID</TableHead>
                  <TableHead className="w-[100px]">Sorgu Sayısı</TableHead>
                  <TableHead className="text-right w-[120px]">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Sorgu grubu bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.type}</TableCell>
                      <TableCell>{group.primaryKey}</TableCell>
                      <TableCell>
                        {group.includeBranchId ? (
                          <Badge variant="default" className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
                            Evet
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Hayır
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{group.queries.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenModal(group)}
                            className="h-8 w-8"
                            title="Detayları Görüntüle"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeQueryGroup(group.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Sayfa {currentPage} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGroup && (
        <QueryGroupModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          group={selectedGroup}
          onSave={handleSaveGroup}
        />
      )}
      
      <AlertDialog open={defaultWarningOpen} onOpenChange={setDefaultWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Varsayılan Şablon Değişikliği</AlertDialogTitle>
            <AlertDialogDescription>
              Başka bir varsayılan şablon zaten mevcut. Bu şablonu varsayılan olarak ayarlamak, mevcut varsayılan şablonu değiştirecektir. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDefaultChange}>
              Evet, Değiştir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
