'use client';

import { useState, useEffect, useRef } from "react";
import { QueryGroup, QueryAttribute } from '@/lib/types/query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SqlEditor } from "@/components/sql-editor";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QueryGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: QueryGroup | null;
  onSave: (updatedGroup: QueryGroup) => void;
}

export function QueryGroupModal({ isOpen, onClose, group, onSave }: QueryGroupModalProps) {
  const [editedGroup, setEditedGroup] = useState<QueryGroup | null>(group);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Reset edited group when the modal opens with a new group
  useEffect(() => {
    setEditedGroup(group);
  }, [group]);

  if (!editedGroup) return null;

  const handleSubQueryChange = (queryIndex: number, updatedSubQuery: QueryAttribute) => {
    const updatedQueries = [...editedGroup.queries];
    updatedQueries[queryIndex] = updatedSubQuery;
    setEditedGroup({ ...editedGroup, queries: updatedQueries });
  };

  const addNewSubQuery = () => {
    const newSubQuery: QueryAttribute = {
      id: uuidv4(),
      tableName: "",
      query: "SELECT\n  *\nFROM\n  TableName\nWHERE\n  ColumnName = @Key"
    };
    
    // Add new query to the beginning of the array
    const updatedQueries = [newSubQuery, ...editedGroup.queries];
    setEditedGroup({ ...editedGroup, queries: updatedQueries });
    toast.success("Yeni sorgu eklendi");
    
    // Scroll to the top after adding a new query
    if (scrollAreaRef.current) {
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const removeSubQuery = (queryIndex: number) => {
    if (editedGroup.queries.length <= 1) {
      toast.error("Her sorgu grubunda en az bir sorgu olmalıdır");
      return;
    }
    
    const updatedQueries = [...editedGroup.queries];
    updatedQueries.splice(queryIndex, 1);
    setEditedGroup({ ...editedGroup, queries: updatedQueries });
    toast.success("Sorgu silindi");
  };

  const handleSave = () => {
    // Validate required fields
    if (!editedGroup.name || !editedGroup.type || !editedGroup.primaryKey) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    // Validate that all queries have a table name
    const invalidQueries = editedGroup.queries.filter(query => !query.tableName.trim());
    if (invalidQueries.length > 0) {
      toast.error("Tüm sorgular için tablo adı girilmelidir");
      return;
    }

    // Validate that all queries have a SQL query
    const emptyQueries = editedGroup.queries.filter(query => !query.query.trim());
    if (emptyQueries.length > 0) {
      toast.error("Tüm sorgular için SQL sorgusu girilmelidir");
      return;
    }

    onSave(editedGroup);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Sorgu Grubu: {editedGroup.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="flex-1 h-full px-6">
            <div className="py-4">
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="space-y-2">
                  <Label>Grup İsmi</Label>
                  <Input
                    value={editedGroup.name}
                    onChange={(e) => setEditedGroup({ ...editedGroup, name: e.target.value })}
                    placeholder="Grup ismi giriniz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tip</Label>
                  <Input
                    value={editedGroup.type}
                    onChange={(e) => setEditedGroup({ ...editedGroup, type: e.target.value })}
                    placeholder="Tip giriniz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Key</Label>
                  <Input
                    value={editedGroup.primaryKey}
                    onChange={(e) => setEditedGroup({ ...editedGroup, primaryKey: e.target.value })}
                    placeholder="Primary Key giriniz"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 py-2">
                <Switch
                  checked={editedGroup.includeBranchId}
                  onCheckedChange={(checked) => setEditedGroup({ ...editedGroup, includeBranchId: checked })}
                />
                <Label>Branch ID Ekle</Label>
              </div>

              <div className="flex items-center justify-between py-2">
                <Label className="text-lg font-medium">Sorgular</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addNewSubQuery}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Yeni Sorgu
                </Button>
              </div>

              <div className="space-y-4 pb-4">
                {editedGroup.queries.map((subQuery: QueryAttribute, queryIndex: number) => (
                  <Card key={subQuery.id} className="border shadow-sm p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1 mr-4">
                          <Label>Tablo Adı</Label>
                          <Input
                            value={subQuery.tableName}
                            onChange={(e) => handleSubQueryChange(queryIndex, { ...subQuery, tableName: e.target.value })}
                            placeholder="Tablo adı giriniz"
                          />
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeSubQuery(queryIndex)}
                          className="h-8 mt-6"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>SQL Sorgusu</Label>
                        <SqlEditor
                          value={subQuery.query}
                          onChange={(value) => handleSubQueryChange(queryIndex, { ...subQuery, query: value })}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button onClick={handleSave}>
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
