'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SqlEditor } from "@/components/sql-editor";
import { useApi } from "@/hooks/use-api";
import { QueryTemplate } from "@/lib/types/query";
import { useQueryStore } from "@/stores/useQueryStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const querySchema = z.object({
  name: z.string().min(1, "Sorgu adı gereklidir"),
  key: z.string().min(1, "Sorgu anahtarı gereklidir"),
  query: z.string().min(1, "SQL sorgusu gereklidir"),
  intervalMs: z.number().min(1000, "Interval en az 1000ms olmalıdır"),
  isMomentary: z.boolean().default(false),
});

type QueryFormData = z.infer<typeof querySchema>;

interface QueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: QueryTemplate | null;
}

export function QueryModal({ isOpen, onClose, selectedTemplate }: QueryModalProps) {
  const api = useApi();
  const addQueryToTemplate = useQueryStore((state) => state.addQueryToTemplate);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<QueryFormData>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      intervalMs: 30000,
      isMomentary: false,
    },
  });

  const onSubmit = async (data: QueryFormData) => {
    if (!selectedTemplate) return;

    try {
      const payload = {
        ...data,
        tenantId: selectedTemplate.tenantId,
        templateId: selectedTemplate.id,
      };

      const response = await api.post("/system/queries", payload);
      
      if (response.status === 200) {
        addQueryToTemplate(selectedTemplate.id, response.data);
        toast.success("Sorgu başarıyla oluşturuldu");
        reset();
        onClose();
      }
    } catch (error) {
      console.error("Sorgu oluşturulurken hata:", error);
      toast.error("Sorgu oluşturulurken bir hata oluştu");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Yeni Sorgu Ekle
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/90">
                Sorgu Adı
              </Label>
              <div className="relative group">
                <div className="absolute inset-0 -m-1 rounded-lg transition-all duration-200 group-hover:bg-primary/5" />
                <Input
                  {...register("name")}
                  placeholder="Sorgu adı giriniz"
                  className="h-9 bg-background/50 backdrop-blur-sm relative z-10"
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/90">
                Sorgu Anahtarı
              </Label>
              <div className="relative group">
                <div className="absolute inset-0 -m-1 rounded-lg transition-all duration-200 group-hover:bg-primary/5" />
                <Input
                  {...register("key")}
                  placeholder="Sorgu anahtarı giriniz"
                  className="h-9 bg-background/50 backdrop-blur-sm relative z-10"
                />
              </div>
              {errors.key && (
                <p className="text-sm text-red-500">{errors.key.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/90">
              SQL Sorgusu
            </Label>
            <div className="relative group">
              <div className="absolute inset-0 -m-1 rounded-lg transition-all duration-200 group-hover:bg-primary/5" />
              <Controller
                name="query"
                control={control}
                render={({ field }) => (
                  <SqlEditor
                    value={field.value}
                    onChange={field.onChange}
                    className="relative z-10 bg-background/50 backdrop-blur-sm"
                  />
                )}
              />
            </div>
            {errors.query && (
              <p className="text-sm text-red-500">{errors.query.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch {...register("isMomentary")} />
              <Label>Anlık Sorgu</Label>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground/90">
                Interval (ms)
              </Label>
              <div className="relative group">
                <div className="absolute inset-0 -m-1 rounded-lg transition-all duration-200 group-hover:bg-primary/5" />
                <Input
                  type="number"
                  {...register("intervalMs", { valueAsNumber: true })}
                  className="w-32 h-9 bg-background/50 backdrop-blur-sm relative z-10"
                />
              </div>
              {errors.intervalMs && (
                <p className="text-sm text-red-500">{errors.intervalMs.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-background/50 backdrop-blur-sm"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground gap-2"
            >
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
