import { create } from 'zustand';
import { QueryTemplate } from '@/lib/types/query';

interface QueryStore {
  templates: QueryTemplate[];
  unsavedTemplates: QueryTemplate[];
  setTemplates: (templates: QueryTemplate[]) => void;
  addTemplate: (template: QueryTemplate) => void;
  updateTemplate: (templateId: string, updatedTemplate: QueryTemplate) => void;
  addUnsavedTemplate: (template: QueryTemplate) => void;
  clearUnsavedTemplates: () => void;
  addQueryToTemplate: (templateId: string, query: any) => void;
}

export const useQueryStore = create<QueryStore>((set) => ({
  templates: [],
  unsavedTemplates: [],
  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) =>
    set((state) => ({ templates: [...state.templates, template] })),
  updateTemplate: (templateId, updatedTemplate) =>
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === templateId ? updatedTemplate : template
      ),
    })),
  addUnsavedTemplate: (template) =>
    set((state) => ({ unsavedTemplates: [...state.unsavedTemplates, template] })),
  clearUnsavedTemplates: () => set({ unsavedTemplates: [] }),
  addQueryToTemplate: (templateId, query) =>
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === templateId
          ? { ...template, queries: [...template.queries, query] }
          : template
      ),
    })),
}));
