'use client';

import { QueryTemplate } from '@/lib/types/query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Edit, Trash2, Star } from 'lucide-react';
import { TemplateModal } from "./template-modal";
import { cn } from "@/lib/utils";

interface CollectionListProps {
  templates: QueryTemplate[];
  selectedTemplate: QueryTemplate | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTemplateSelect: (template: QueryTemplate) => void;
  onTemplateEdit: (template: QueryTemplate) => void;
  onRefresh: () => void;
  onDeleteTemplate: (template: QueryTemplate, event?: React.MouseEvent) => void;
  onSetDefaultTemplate: (template: QueryTemplate, event?: React.MouseEvent) => void;
}

export function CollectionList({
  templates,
  selectedTemplate,
  loading,
  error,
  searchQuery,
  onSearchChange,
  onTemplateSelect,
  onTemplateEdit,
  onRefresh,
  onDeleteTemplate,
  onSetDefaultTemplate
}: CollectionListProps) {
  const filteredTemplates = templates.filter((template) => {
    const searchLower = searchQuery.toLowerCase();
    const name = (template.templateName || '').toLowerCase();
    const tenantIdMatch = (template.tenantId || '').toLowerCase().includes(searchLower);
    return name.includes(searchLower) || tenantIdMatch;
  });

  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Şablonlar</CardTitle>
          <TemplateModal
            isOpen={false}
            onClose={() => { }}
            onSuccess={onRefresh}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Şablon ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="px-3 py-2 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <span className="text-sm text-muted-foreground">Yükleniyor...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-4">
                <span className="text-sm text-red-500">{error}</span>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <span className="text-sm text-muted-foreground">Şablon bulunamadı</span>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "group relative overflow-hidden border-none shadow-md transition-all duration-300 cursor-pointer",
                    selectedTemplate?.id === template.id
                      ? "bg-gradient-to-br from-primary/10 to-primary/5"
                      : "bg-gradient-to-br from-card to-muted/80 hover:from-muted/50 hover:to-muted/30"
                  )}
                  onClick={() => onTemplateSelect(template)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm">{template.templateName || ''}</span>
                        {template.isDefault && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground/80">
                        {template.isDefault 
                          ? 'Tüm firmalar (Varsayılan)' 
                          : template.tenantId 
                            ? `${template.tenantId.split(',').length} firma seçili` 
                            : 'Firma seçilmemiş'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {template.queries.length} sorgu
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!template.isDefault && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={(e) => onSetDefaultTemplate(template, e)}
                            title="Varsayılan Yap"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:text-destructive" 
                          onClick={(e) => onDeleteTemplate(template, e)}
                          title="Sil"
                          disabled={template.isDefault}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
