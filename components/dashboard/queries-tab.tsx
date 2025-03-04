'use client';
import React, { useEffect, useState } from 'react';
import { useApi } from "@/hooks/use-api";
import { QueryTemplate } from '@/lib/types/query';
import { CollectionList } from './collection-list';
import { CollectionDetails } from './collection-details';

export function QueriesTab() {
  const api = useApi();
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
    isActive: false,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
  });

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
      const result = await api.get<QueryTemplate[]>("/queries");
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
        />
      </div>

      <div className="col-span-9 space-y-6">
        {selectedTemplate ? (
          <CollectionDetails
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
          />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-2rem)]">
            <span className="text-muted-foreground">Lütfen bir Şablon seçin</span>
          </div>
        )}
      </div>
    </div>
  );
}
