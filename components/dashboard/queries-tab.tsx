'use client';
import React, { useEffect, useState } from 'react';
import { useApi } from "@/hooks/use-api";
import { 
  QueryTemplate, 
  CreateTemplateRequest, 
  UpdateTemplateRequest, 
  QueryGroup, 
  CreateQueryGroupRequest,
  UpdateQueryGroupRequest
} from '@/lib/types/query';
import { CollectionList } from './collection-list';
import { CollectionDetails } from './collection-details';
import { toast } from "sonner";
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
import { useConnections } from '@/hooks/useConnections';

export function QueriesTab() {
  const api = useApi();
  const { connections } = useConnections();
  const [templates, setTemplates] = useState<QueryTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<QueryTemplate | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<QueryTemplate>({
    id: "",
    templateName: "",
    queries: [],
    tenantId: "",
    isDefault: false,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<QueryTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleTemplateSelect = (template: QueryTemplate) => {
    setSelectedTemplate(template);
    setEditedTemplate(template);
  };

  const handleTemplateEdit = (template: QueryTemplate) => {
    setEditedTemplate(template);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const result = await api.get<QueryTemplate[]>("/system/queryTemplate");
      const response = result.data;
      if (Array.isArray(response)) {
        setTemplates(response);
        if (response.length > 0) {
          setSelectedTemplate(response[0]);
          setEditedTemplate(response[0]);
        }
        setError(null);
      } else {
        console.error("API response is not an array:", response);
        setError("API yanıtı beklenmeyen formatta");
      }
    } catch (error) {
      console.error("Şablonlar yüklenirken hata:", error);
      setError("Şablonlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = (template: QueryTemplate, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Check if the template is a default template
    if (template.isDefault) {
      // Use a more prominent toast with longer duration
      toast.error("Varsayılan şablon silinemez", {
        duration: 3000,
        position: "top-center",
        important: true,
        style: {
          backgroundColor: "#f44336",
          color: "white",
          border: "none"
        }
      });
      return;
    }
    
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    // Double-check that we're not deleting a default template
    if (templateToDelete.isDefault) {
      // Use a more prominent toast with longer duration
      toast.error("Varsayılan şablon silinemez", {
        duration: 3000,
        position: "top-center",
        important: true,
        style: {
          backgroundColor: "#f44336",
          color: "white",
          border: "none"
        }
      });
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      return;
    }

    try {
      await api.delete(`/system/queryTemplate/${templateToDelete.id}`);
      toast.success("Şablon başarıyla silindi");

      // If the deleted template was selected, clear the selection
      if (selectedTemplate?.id === templateToDelete.id) {
        setSelectedTemplate(null);
      }

      // Refresh the template list
      fetchTemplates();
    } catch (error) {
      console.error("Şablon silinirken hata:", error);
      toast.error("Şablon silinirken bir hata oluştu", {
        duration: 3000
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSetDefaultTemplate = async (template: QueryTemplate, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    // If already default, do nothing
    if (template.isDefault) {
      toast.info("Bu şablon zaten varsayılan olarak ayarlanmış");
      return;
    }

    try {
      await api.put(`/system/queryTemplate/${template.id}/default`);
      toast.success(`${template.templateName} varsayılan şablon olarak ayarlandı`);
      fetchTemplates();
    } catch (error) {
      console.error("Varsayılan şablon ayarlanırken hata:", error);
      toast.error("Varsayılan şablon ayarlanırken bir hata oluştu", {
        duration: 3000
      });
    }
  };

  const saveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setIsSaving(true);
      
      // Extract tenant IDs from the comma-separated string
      const tenantIds = selectedTemplate.tenantId ? 
        selectedTemplate.tenantId.split(',').filter(id => id.trim() !== '') : 
        [];
      
      const updateData: UpdateTemplateRequest = {
        templateName: selectedTemplate.templateName,
        isDefault: selectedTemplate.isDefault,
        tenants: tenantIds
      };
      
      await api.put(`/system/queryTemplate/${selectedTemplate.id}`, updateData);
      
      // Save each query group that has been modified
      // const originalTemplate = templates.find(t => t.id === selectedTemplate.id);
      // if (originalTemplate) {
      //   // Process query groups: create new ones, update existing ones, delete removed ones
      //   const originalGroups = originalTemplate.queries || [];
      //   const currentGroups = selectedTemplate.queries || [];
        
      //   // Find groups to create (not in original)
      //   const groupsToCreate = currentGroups.filter(
      //     current => !originalGroups.some(original => original.id === current.id)
      //   );
        
      //   // Find groups to update (in both, but potentially modified)
      //   const groupsToUpdate = currentGroups.filter(
      //     current => originalGroups.some(original => original.id === current.id)
      //   );
        
      //   // Find groups to delete (in original but not in current)
      //   const groupsToDelete = originalGroups.filter(
      //     original => !currentGroups.some(current => current.id === original.id)
      //   );
        
      //   // Process creations
      //   for (const group of groupsToCreate) {
      //     await createQueryGroup(selectedTemplate.id, group);
      //   }
        
      //   // Process updates
      //   for (const group of groupsToUpdate) {
      //     await updateQueryGroup(selectedTemplate.id, group);
      //   }
        
      //   // Process deletions
      //   for (const group of groupsToDelete) {
      //     await deleteQueryGroup(selectedTemplate.id, group.id);
      //   }
      // }
      
      toast.success("Şablon ve sorgu grupları başarıyla kaydedildi");
      fetchTemplates();
    } catch (error) {
      console.error("Şablon kaydedilirken hata:", error);
      toast.error("Şablon kaydedilirken bir hata oluştu", {
        duration: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Create a new query group
  const createQueryGroup = async (templateId: string, group: QueryGroup) => {
    try {
      const createData: CreateQueryGroupRequest = {
        templateId: templateId,
        name: group.name,
        type: group.type,
        primaryKey: group.primaryKey,
        includeBranchId: group.includeBranchId,
        queries: group.queries
      };
      
      await api.post(`/system/queryTemplate/${templateId}/queryGroup`, createData);
      toast.success(`"${group.name}" sorgu grubu oluşturuldu`);
    } catch (error) {
      console.error(`Sorgu grubu oluşturulurken hata (${group.name}):`, error);
      toast.error(`"${group.name}" sorgu grubu oluşturulurken hata oluştu`);
      throw error; // Re-throw to handle in the parent function
    }
  };
  
  // Update an existing query group
  const updateQueryGroup = async (templateId: string, group: QueryGroup) => {
    try {
      const updateData: UpdateQueryGroupRequest = {
        templateId: templateId,
        name: group.name,
        type: group.type,
        primaryKey: group.primaryKey,
        includeBranchId: group.includeBranchId,
        queries: group.queries
      };
      
      await api.put(`/system/queryTemplate/${templateId}/queryGroup/${group.id}`, updateData);
      toast.success(`"${group.name}" sorgu grubu güncellendi`);
    } catch (error) {
      console.error(`Sorgu grubu güncellenirken hata (${group.name}):`, error);
      toast.error(`"${group.name}" sorgu grubu güncellenirken hata oluştu`);
      throw error; // Re-throw to handle in the parent function
    }
  };
  
  // Delete a query group
  const deleteQueryGroup = async (templateId: string, groupId: string) => {
    try {
      await api.delete(`/system/queryTemplate/${templateId}/queryGroup/${groupId}`);
      toast.success("Sorgu grubu silindi");
    } catch (error) {
      console.error(`Sorgu grubu silinirken hata (ID: ${groupId}):`, error);
      toast.error("Sorgu grubu silinirken hata oluştu");
      throw error; // Re-throw to handle in the parent function
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-4">
        <CollectionList
          templates={templates}
          selectedTemplate={selectedTemplate}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onTemplateSelect={handleTemplateSelect}
          onTemplateEdit={handleTemplateEdit}
          onRefresh={fetchTemplates}
          onDeleteTemplate={handleDeleteTemplate}
          onSetDefaultTemplate={handleSetDefaultTemplate}
        />
      </div>
      <div className="col-span-9 space-y-4">
        {selectedTemplate ? (
          <CollectionDetails
            template={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            onSave={saveTemplate}
            isSaving={isSaving}
            connections={connections}
          />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-card rounded-lg border shadow-sm">
            <div className="text-center">
              <h3 className="text-lg font-medium">Şablon seçilmedi</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Lütfen düzenlemek için bir şablon seçin veya yeni bir şablon oluşturun
              </p>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Şablonu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium">{templateToDelete?.templateName}</span> şablonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
