'use client';

import { QueryTemplate, QueryGroup, SubQuery } from '@/lib/types/query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SqlEditor } from "@/components/sql-editor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

interface CollectionDetailsProps {
  selectedTemplate: QueryTemplate;
  onTemplateChange: (template: QueryTemplate) => void;
}

export function CollectionDetails({ selectedTemplate, onTemplateChange }: CollectionDetailsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const queriesPerPage = 10;

  const filteredQueries = useMemo(() => {
    if (!searchQuery) return selectedTemplate.queries;
    
    const searchLower = searchQuery.toLowerCase();
    return selectedTemplate.queries.filter(group => {
      // Check if group name matches
      const nameMatch = group.name.toLowerCase().includes(searchLower);
      
      // Check if any table name matches
      const tableMatch = group.queries.some(query => 
        query.tableName.toLowerCase().includes(searchLower)
      );
      
      return nameMatch || tableMatch;
    });
  }, [selectedTemplate.queries, searchQuery]);

  const indexOfLastQuery = currentPage * queriesPerPage;
  const indexOfFirstQuery = indexOfLastQuery - queriesPerPage;
  const currentQueries = filteredQueries.slice(indexOfFirstQuery, indexOfLastQuery);
  const totalPages = Math.ceil(filteredQueries.length / queriesPerPage);

  const handleQueryGroupChange = (displayIndex: number, updatedQueryGroup: QueryGroup) => {
    const actualIndex = indexOfFirstQuery + displayIndex;
    const updatedQueries = [...selectedTemplate.queries];
    updatedQueries[actualIndex] = updatedQueryGroup;
    onTemplateChange({ ...selectedTemplate, queries: updatedQueries });
  };

  const handleSubQueryChange = (groupIndex: number, queryIndex: number, updatedSubQuery: SubQuery) => {
    const updatedQueries = [...selectedTemplate.queries];
    updatedQueries[groupIndex].queries[queryIndex] = updatedSubQuery;
    onTemplateChange({ ...selectedTemplate, queries: updatedQueries });
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {selectedTemplate.templateName || 'Sorgu Şablonu'}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 -m-1 rounded-lg transition-all duration-200 group-hover:bg-primary/5" />
                <Input
                  value={selectedTemplate.tenantId}
                  onChange={(e) => onTemplateChange({ ...selectedTemplate, tenantId: e.target.value })}
                  placeholder="Firma kısa kodu giriniz"
                  className="h-9 bg-background/50 backdrop-blur-sm relative z-10"
                />
              </div>
              <div className="relative group">
                <div className="absolute inset-0 -m-1 rounded-lg transition-all duration-200 group-hover:bg-primary/5" />
                <Input
                  value={selectedTemplate.templateName}
                  onChange={(e) => onTemplateChange({ ...selectedTemplate, templateName: e.target.value })}
                  placeholder="Koleksiyon ismi giriniz"
                  className="h-9 bg-background/50 backdrop-blur-sm relative z-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Sorgu Grupları</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Grup veya tablo adı ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-6">
              {currentQueries.map((queryGroup: QueryGroup, groupIndex: number) => (
                <Card key={queryGroup.id} className="border shadow-sm">
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Grup İsmi</Label>
                        <Input
                          value={queryGroup.name}
                          onChange={(e) => handleQueryGroupChange(groupIndex, { ...queryGroup, name: e.target.value })}
                          placeholder="Grup ismi giriniz"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tip</Label>
                        <Input
                          value={queryGroup.type}
                          onChange={(e) => handleQueryGroupChange(groupIndex, { ...queryGroup, type: e.target.value })}
                          placeholder="Tip giriniz"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Primary Key</Label>
                        <Input
                          value={queryGroup.primaryKey}
                          onChange={(e) => handleQueryGroupChange(groupIndex, { ...queryGroup, primaryKey: e.target.value })}
                          placeholder="Primary Key giriniz"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        checked={queryGroup.includeBranchId}
                        onCheckedChange={(checked) => handleQueryGroupChange(groupIndex, { ...queryGroup, includeBranchId: checked })}
                      />
                      <Label>Branch ID Ekle</Label>
                    </div>

                    <div className="space-y-4 pt-4">
                      <Label>Sorgular</Label>
                      {queryGroup.queries.map((subQuery: SubQuery, queryIndex: number) => (
                        <Card key={subQuery.id} className="border shadow-sm p-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Tablo Adı</Label>
                              <Input
                                value={subQuery.tableName}
                                onChange={(e) => handleSubQueryChange(groupIndex, queryIndex, { ...subQuery, tableName: e.target.value })}
                                placeholder="Tablo adı giriniz"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>SQL Sorgusu</Label>
                              <SqlEditor
                                value={subQuery.query}
                                onChange={(value) => handleSubQueryChange(groupIndex, queryIndex, { ...subQuery, query: value })}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4 pb-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                <span className="text-sm">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
