'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Building2, CheckCircle2, XCircle, Clock, Database, ChevronLeft, ChevronRight, EyeOff, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useApi from '@/hooks/use-api';

interface TenantInfo {
  tenantId: string;
  activeBranches: number;
  passiveBranches: number;
}

interface MetricData {
  count: number;
  size: number;
}

interface MetricStatus {
  data: MetricData | null;
  loading: boolean;
}

interface CategoryMetrics {
  processing: MetricStatus;
  completed: MetricStatus;
  ignore: MetricStatus;
  error: MetricStatus;
  created: MetricStatus;
  total: MetricData;
}

interface TenantMetrics {
  sale: CategoryMetrics;
  other: CategoryMetrics;
}

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  loading: boolean;
  bgColor: string;
  textColor: string;
}

// Utility function to format numbers with thousands separators
const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return '0';
  return num.toLocaleString('tr-TR');
};

// Utility function to format file size to MB with thousands separators
const formatSizeToMB = (bytes: number | undefined): string => {
  if (bytes === undefined) return '0';
  const mb = bytes / 1024 / 1024;
  return mb.toLocaleString('tr-TR', { maximumFractionDigits: 1 });
};

function MetricItem({ icon, label, value, loading, bgColor, textColor }: MetricItemProps) {
  return (
    <div className={`flex items-center gap-2 ${bgColor} p-1.5 rounded-l-full hover:brightness-95 transition-colors`}>
      <div className="bg-white/80 p-1 rounded-full shadow-sm">
        {icon}
      </div>
      <div>
        <p className={`text-xs font-medium ${textColor}/80`}>{label}</p>
        {loading ? (
          <RefreshCw className={`h-4 w-4 ${textColor} animate-spin`} />
        ) : (
          <p className={`text-lg font-bold ${textColor}`}>{formatNumber(value)}</p>
        )}
      </div>
    </div>
  );
}

interface DetailMetricItemProps {
  icon: React.ReactNode;
  label: string;
  count: number | undefined;
  size: number | undefined;
  loading: boolean;
  bgColor: string;
  textColor: string;
}

function DetailMetricItem({ icon, label, count, size, loading, bgColor, textColor }: DetailMetricItemProps) {
  return (
    <div className={`flex justify-between items-center p-3 ${bgColor} rounded-lg`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-right">
        {loading ? (
          <RefreshCw className={`h-5 w-5 ${textColor} animate-spin`} />
        ) : (
          <>
            <p className="text-lg font-bold">{formatNumber(count)}</p>
            <p className="text-sm text-muted-foreground">{formatSizeToMB(size)}MB</p>
          </>
        )}
      </div>
    </div>
  );
}

interface MetricsSectionProps {
  title: string;
  metrics: CategoryMetrics;
}

function MetricsSection({ title, metrics }: MetricsSectionProps) {
  return (
    <div className="mt-2">
      <h4 className="text-sm font-semibold text-blue-700 mb-1">{title}</h4>
      <div className="grid grid-cols-2 gap-1.5 text-sm">
        <MetricItem 
          icon={<Clock className="h-3.5 w-3.5 text-orange-500" />}
          label="İşlenen"
          value={metrics.processing.data?.count}
          loading={metrics.processing.loading}
          bgColor="bg-gradient-to-r from-orange-50 to-transparent"
          textColor="text-orange-600"
        />
        <MetricItem 
          icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
          label="Başarılı"
          value={metrics.completed.data?.count}
          loading={metrics.completed.loading}
          bgColor="bg-gradient-to-r from-green-50 to-transparent"
          textColor="text-green-600"
        />
        <MetricItem 
          icon={<EyeOff className="h-3.5 w-3.5 text-blue-500" />}
          label="Yoksayılan"
          value={metrics.ignore.data?.count}
          loading={metrics.ignore.loading}
          bgColor="bg-gradient-to-r from-blue-50 to-transparent"
          textColor="text-blue-600"
        />
        <MetricItem 
          icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
          label="Hatalı"
          value={metrics.error.data?.count}
          loading={metrics.error.loading}
          bgColor="bg-gradient-to-r from-red-50 to-transparent"
          textColor="text-red-600"
        />
        <MetricItem 
          icon={<AlertCircle className="h-3.5 w-3.5 text-purple-500" />}
          label="Kuyrukta"
          value={metrics.created.data?.count}
          loading={metrics.created.loading}
          bgColor="bg-gradient-to-r from-purple-50 to-transparent"
          textColor="text-purple-600"
        />
        <MetricItem 
          icon={<Database className="h-3.5 w-3.5 text-gray-700" />}
          label="Toplam"
          value={metrics.total.count}
          loading={false}
          bgColor="bg-gradient-to-r from-gray-50 to-transparent"
          textColor="text-gray-700"
        />
      </div>
    </div>
  );
}

interface DetailMetricsSectionProps {
  title: string;
  metrics: CategoryMetrics;
}

function DetailMetricsSection({ title, metrics }: DetailMetricsSectionProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold text-blue-700 mb-3">{title}</h3>
      <div className="space-y-2">
        <DetailMetricItem 
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          label="İşlenen"
          count={metrics.processing.data?.count}
          size={metrics.processing.data?.size}
          loading={metrics.processing.loading}
          bgColor="bg-orange-50"
          textColor="text-orange-500"
        />
        <DetailMetricItem 
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          label="Başarılı"
          count={metrics.completed.data?.count}
          size={metrics.completed.data?.size}
          loading={metrics.completed.loading}
          bgColor="bg-green-50"
          textColor="text-green-500"
        />
        <DetailMetricItem 
          icon={<EyeOff className="h-5 w-5 text-blue-500" />}
          label="Yoksayılan"
          count={metrics.ignore.data?.count}
          size={metrics.ignore.data?.size}
          loading={metrics.ignore.loading}
          bgColor="bg-blue-50"
          textColor="text-blue-500"
        />
        <DetailMetricItem 
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          label="Hatalı"
          count={metrics.error.data?.count}
          size={metrics.error.data?.size}
          loading={metrics.error.loading}
          bgColor="bg-red-50"
          textColor="text-red-500"
        />
        <DetailMetricItem 
          icon={<AlertCircle className="h-5 w-5 text-purple-500" />}
          label="Kuyrukta Bekleyen"
          count={metrics.created.data?.count}
          size={metrics.created.data?.size}
          loading={metrics.created.loading}
          bgColor="bg-purple-50"
          textColor="text-purple-500"
        />
        <DetailMetricItem 
          icon={<Database className="h-5 w-5 text-gray-700" />}
          label="Toplam"
          count={metrics.total.count}
          size={metrics.total.size}
          loading={false}
          bgColor="bg-gray-100"
          textColor="text-gray-700"
        />
      </div>
    </Card>
  );
}

interface CompanyCardProps {
  tenant: TenantInfo;
  metrics: TenantMetrics;
  refreshMetrics: (tenantId: string) => void;
}

function CompanyCard({ tenant, metrics, refreshMetrics }: CompanyCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="relative overflow-hidden bg-white shadow hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-600/80">Firma Kodu</p>
                  <h3 className="text-lg font-bold text-blue-700">{tenant.tenantId}</h3>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <div className="bg-green-100 px-2 py-1 rounded">
                  <span className="font-medium text-green-700">{formatNumber(tenant.activeBranches)} Aktif</span>
                </div>
                <div className="bg-red-100 px-2 py-1 rounded">
                  <span className="font-medium text-red-700">{formatNumber(tenant.passiveBranches)} Pasif</span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-2">
              <MetricsSection title="Satış" metrics={metrics.sale} />
              <MetricsSection title="Diğer Veriler" metrics={metrics.other} />
            </div>
          </div>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{tenant.tenantId} Detaylı Bilgiler</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailMetricsSection title="Satış Metrikleri" metrics={metrics.sale} />
          <DetailMetricsSection title="Diğer Veri Metrikleri" metrics={metrics.other} />
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={() => refreshMetrics(tenant.tenantId)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TotalCardProps {
  tenantMetrics: Record<string, TenantMetrics>;
  loading: boolean;
  refreshMetrics: () => void;
}

function TotalCard({ tenantMetrics, loading, refreshMetrics }: TotalCardProps) {
  const totalMetrics = useMemo(() => {
    // Create separate empty category objects for sale and other
    const emptySaleCategory = {
      processing: { count: 0, size: 0 },
      completed: { count: 0, size: 0 },
      ignore: { count: 0, size: 0 },
      error: { count: 0, size: 0 },
      created: { count: 0, size: 0 },
      total: { count: 0, size: 0 }
    };
    
    const emptyOtherCategory = {
      processing: { count: 0, size: 0 },
      completed: { count: 0, size: 0 },
      ignore: { count: 0, size: 0 },
      error: { count: 0, size: 0 },
      created: { count: 0, size: 0 },
      total: { count: 0, size: 0 }
    };
    
    const totals = {
      sale: emptySaleCategory,
      other: emptyOtherCategory
    };
    
    Object.values(tenantMetrics).forEach(metric => {
      // Sum up sale metrics
      totals.sale.processing.count += metric.sale.processing.data?.count || 0;
      totals.sale.processing.size += metric.sale.processing.data?.size || 0;
      
      totals.sale.completed.count += metric.sale.completed.data?.count || 0;
      totals.sale.completed.size += metric.sale.completed.data?.size || 0;
      
      totals.sale.ignore.count += metric.sale.ignore.data?.count || 0;
      totals.sale.ignore.size += metric.sale.ignore.data?.size || 0;
      
      totals.sale.error.count += metric.sale.error.data?.count || 0;
      totals.sale.error.size += metric.sale.error.data?.size || 0;
      
      totals.sale.created.count += metric.sale.created.data?.count || 0;
      totals.sale.created.size += metric.sale.created.data?.size || 0;
      
      // Sum up other metrics
      totals.other.processing.count += metric.other.processing.data?.count || 0;
      totals.other.processing.size += metric.other.processing.data?.size || 0;
      
      totals.other.completed.count += metric.other.completed.data?.count || 0;
      totals.other.completed.size += metric.other.completed.data?.size || 0;
      
      totals.other.ignore.count += metric.other.ignore.data?.count || 0;
      totals.other.ignore.size += metric.other.ignore.data?.size || 0;
      
      totals.other.error.count += metric.other.error.data?.count || 0;
      totals.other.error.size += metric.other.error.data?.size || 0;
      
      totals.other.created.count += metric.other.created.data?.count || 0;
      totals.other.created.size += metric.other.created.data?.size || 0;
    });
    
    // Calculate total counts and sizes
    totals.sale.total.count = 
      totals.sale.processing.count + 
      totals.sale.completed.count + 
      totals.sale.ignore.count + 
      totals.sale.error.count + 
      totals.sale.created.count;
    
    totals.sale.total.size = 
      totals.sale.processing.size + 
      totals.sale.completed.size + 
      totals.sale.ignore.size + 
      totals.sale.error.size + 
      totals.sale.created.size;
    
    totals.other.total.count = 
      totals.other.processing.count + 
      totals.other.completed.count + 
      totals.other.ignore.count + 
      totals.other.error.count + 
      totals.other.created.count;
    
    totals.other.total.size = 
      totals.other.processing.size + 
      totals.other.completed.size + 
      totals.other.ignore.size + 
      totals.other.error.size + 
      totals.other.created.size;
    
    return totals;
  }, [tenantMetrics]);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="text-lg font-bold text-blue-800">Toplam Metrikler</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                refreshMetrics();
              }}
              title="Yenile"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-blue-700 mb-1">Satış Belgeleri</h4>
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                <MetricItem 
                  icon={<Clock className="h-3.5 w-3.5 text-orange-500" />}
                  label="İşlenen"
                  value={totalMetrics.sale.processing.count}
                  loading={loading}
                  bgColor="bg-gradient-to-r from-orange-50 to-transparent"
                  textColor="text-orange-600"
                />
                <MetricItem 
                  icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                  label="Başarılı"
                  value={totalMetrics.sale.completed.count}
                  loading={loading}
                  bgColor="bg-gradient-to-r from-green-50 to-transparent"
                  textColor="text-green-600"
                />
                <MetricItem 
                  icon={<EyeOff className="h-3.5 w-3.5 text-blue-500" />}
                  label="Yoksayılan"
                  value={totalMetrics.sale.ignore.count}
                  loading={loading}
                  bgColor="bg-gradient-to-r from-blue-50 to-transparent"
                  textColor="text-blue-600"
                />
                <MetricItem 
                  icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                  label="Hatalı"
                  value={totalMetrics.sale.error.count}
                  loading={loading}
                  bgColor="bg-gradient-to-r from-red-50 to-transparent"
                  textColor="text-red-600"
                />
                <MetricItem 
                  icon={<AlertCircle className="h-3.5 w-3.5 text-purple-500" />}
                  label="Kuyrukta"
                  value={totalMetrics.sale.created.count}
                  loading={loading}
                  bgColor="bg-gradient-to-r from-purple-50 to-transparent"
                  textColor="text-purple-600"
                />
                <MetricItem 
                  icon={<Database className="h-3.5 w-3.5 text-gray-700" />}
                  label="Toplam"
                  value={totalMetrics.sale.total.count}
                  loading={false}
                  bgColor="bg-gradient-to-r from-gray-50 to-transparent"
                  textColor="text-gray-700"
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-blue-700 mb-1">Diğer Belgeler</h4>
              <div className="grid grid-cols-2 gap-1.5 text-sm">
                <MetricItem 
                  icon={<Clock className="h-3.5 w-3.5 text-orange-500" />}
                  label="İşlenen"
                  value={totalMetrics.other.processing.count}
                  loading={loading}
                  bgColor="bg-gradient-to-r from-orange-50 to-transparent"
                  textColor="text-orange-600"
                />
                <MetricItem 
                  icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                  label="Başarılı"
                  value={totalMetrics.other.completed.count}
                  loading={loading}
                  bgColor="bg-gradient-to-r from-green-50 to-transparent"
                  textColor="text-green-600"
                />
                <MetricItem 
                  icon={<EyeOff className="h-3.5 w-3.5 text-blue-500" />}
                  label="Yoksayılan"
                  value={totalMetrics.other.ignore.count}
                  loading={loading}
                  bgColor="bg-gradient-to-r from-blue-50 to-transparent"
                  textColor="text-blue-600"
                />
                <MetricItem 
                  icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                  label="Hatalı"
                  value={totalMetrics.other.error.count}
                  loading={loading}
                  bgColor="bg-gradient-to-r from-red-50 to-transparent"
                  textColor="text-red-600"
                />
                <MetricItem 
                  icon={<AlertCircle className="h-3.5 w-3.5 text-purple-500" />}
                  label="Kuyrukta"
                  value={totalMetrics.other.created.count}
                  loading={loading}
                  bgColor="bg-gradient-to-r from-purple-50 to-transparent"
                  textColor="text-purple-600"
                />
                <MetricItem 
                  icon={<Database className="h-3.5 w-3.5 text-gray-700" />}
                  label="Toplam"
                  value={totalMetrics.other.total.count}
                  loading={false}
                  bgColor="bg-gradient-to-r from-gray-50 to-transparent"
                  textColor="text-gray-700"
                />
              </div>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-700" />
            Tüm Firmalar İçin Toplam Metrikler
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-bold text-blue-700 mb-3">Satış Belgeleri</h3>
            <div className="space-y-2">
              <DetailMetricItem 
                icon={<Clock className="h-5 w-5 text-orange-500" />}
                label="İşlenen"
                count={totalMetrics.sale.processing.count}
                size={totalMetrics.sale.processing.size}
                loading={loading}
                bgColor="bg-orange-50"
                textColor="text-orange-500"
              />
              <DetailMetricItem 
                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                label="Başarılı"
                count={totalMetrics.sale.completed.count}
                size={totalMetrics.sale.completed.size}
                loading={loading}
                bgColor="bg-green-50"
                textColor="text-green-500"
              />
              <DetailMetricItem 
                icon={<EyeOff className="h-5 w-5 text-blue-500" />}
                label="Yoksayılan"
                count={totalMetrics.sale.ignore.count}
                size={totalMetrics.sale.ignore.size}
                loading={loading}
                bgColor="bg-blue-50"
                textColor="text-blue-500"
              />
              <DetailMetricItem 
                icon={<XCircle className="h-5 w-5 text-red-500" />}
                label="Hatalı"
                count={totalMetrics.sale.error.count}
                size={totalMetrics.sale.error.size}
                loading={loading}
                bgColor="bg-red-50"
                textColor="text-red-500"
              />
              <DetailMetricItem 
                icon={<AlertCircle className="h-5 w-5 text-purple-500" />}
                label="Kuyrukta"
                count={totalMetrics.sale.created.count}
                size={totalMetrics.sale.created.size}
                loading={loading}
                bgColor="bg-purple-50"
                textColor="text-purple-500"
              />
              <DetailMetricItem 
                icon={<Database className="h-5 w-5 text-gray-700" />}
                label="Toplam"
                count={totalMetrics.sale.total.count}
                size={totalMetrics.sale.total.size}
                loading={false}
                bgColor="bg-gray-50"
                textColor="text-gray-700"
              />
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-lg font-bold text-blue-700 mb-3">Diğer Belgeler</h3>
            <div className="space-y-2">
              <DetailMetricItem 
                icon={<Clock className="h-5 w-5 text-orange-500" />}
                label="İşlenen"
                count={totalMetrics.other.processing.count}
                size={totalMetrics.other.processing.size}
                loading={loading}
                bgColor="bg-orange-50"
                textColor="text-orange-500"
              />
              <DetailMetricItem 
                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                label="Başarılı"
                count={totalMetrics.other.completed.count}
                size={totalMetrics.other.completed.size}
                loading={loading}
                bgColor="bg-green-50"
                textColor="text-green-500"
              />
              <DetailMetricItem 
                icon={<EyeOff className="h-5 w-5 text-blue-500" />}
                label="Yoksayılan"
                count={totalMetrics.other.ignore.count}
                size={totalMetrics.other.ignore.size}
                loading={loading}
                bgColor="bg-blue-50"
                textColor="text-blue-500"
              />
              <DetailMetricItem 
                icon={<XCircle className="h-5 w-5 text-red-500" />}
                label="Hatalı"
                count={totalMetrics.other.error.count}
                size={totalMetrics.other.error.size}
                loading={loading}
                bgColor="bg-red-50"
                textColor="text-red-500"
              />
              <DetailMetricItem 
                icon={<AlertCircle className="h-5 w-5 text-purple-500" />}
                label="Kuyrukta"
                count={totalMetrics.other.created.count}
                size={totalMetrics.other.created.size}
                loading={loading}
                bgColor="bg-purple-50"
                textColor="text-purple-500"
              />
              <DetailMetricItem 
                icon={<Database className="h-5 w-5 text-gray-700" />}
                label="Toplam"
                count={totalMetrics.other.total.count}
                size={totalMetrics.other.total.size}
                loading={false}
                bgColor="bg-gray-50"
                textColor="text-gray-700"
              />
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function useMetricsData() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [tenantMetrics, setTenantMetrics] = useState<Record<string, TenantMetrics>>({});
  const [loading, setLoading] = useState(true);
  const api = useApi();

  const fetchTenants = async () => {
    try {
      const response = await api.get<TenantInfo[]>('/system/tenants');
      setTenants(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }
  };

  const fetchMetricData = async (tenantId: string, endpoint: string): Promise<MetricData | null> => {
    try {
      const response = await api.get(endpoint);
      
      if (typeof response.data === 'number') {
        return {
          count: response.data,
          size: 0 
        };
      }
      
      if (response.data && typeof response.data === 'object' && 'count' in response.data) {
        return response.data as MetricData;
      }
      
      console.error(`Unexpected response format from ${endpoint}:`, response.data);
      return { count: 0, size: 0 };
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  };

  const initializeTenantMetrics = (tenantId: string) => {
    setTenantMetrics(prev => ({
      ...prev,
      [tenantId]: {
        sale: {
          processing: { data: null, loading: true },
          completed: { data: null, loading: true },
          ignore: { data: null, loading: true },
          error: { data: null, loading: true },
          created: { data: null, loading: true },
          total: { count: 0, size: 0 }
        },
        other: {
          processing: { data: null, loading: true },
          completed: { data: null, loading: true },
          ignore: { data: null, loading: true },
          error: { data: null, loading: true },
          created: { data: null, loading: true },
          total: { count: 0, size: 0 }
        }
      }
    }));
  };

  const updateTenantMetric = (tenantId: string, category: 'sale' | 'other', status: 'processing' | 'completed' | 'ignore' | 'error' | 'created', data: MetricData | null) => {
    setTenantMetrics(prev => {
      const tenant = prev[tenantId] || {
        sale: {
          processing: { data: null, loading: false },
          completed: { data: null, loading: false },
          ignore: { data: null, loading: false },
          error: { data: null, loading: false },
          created: { data: null, loading: false },
          total: { count: 0, size: 0 }
        },
        other: {
          processing: { data: null, loading: false },
          completed: { data: null, loading: false },
          ignore: { data: null, loading: false },
          error: { data: null, loading: false },
          created: { data: null, loading: false },
          total: { count: 0, size: 0 }
        }
      };

      const updatedTenant = {
        ...tenant,
        [category]: {
          ...tenant[category],
          [status]: { data, loading: false }
        }
      };

      const categoryData = updatedTenant[category];
      const total = {
        count: (categoryData.processing.data?.count || 0) + 
               (categoryData.completed.data?.count || 0) + 
               (categoryData.ignore.data?.count || 0) + 
               (categoryData.error.data?.count || 0) + 
               (categoryData.created.data?.count || 0),
        size: (categoryData.processing.data?.size || 0) + 
              (categoryData.completed.data?.size || 0) + 
              (categoryData.ignore.data?.size || 0) + 
              (categoryData.error.data?.size || 0) + 
              (categoryData.created.data?.size || 0)
      };

      updatedTenant[category].total = total;

      return {
        ...prev,
        [tenantId]: updatedTenant
      };
    });
  };

  const fetchTenantMetrics = async (tenantId: string) => {
    initializeTenantMetrics(tenantId);
    
    fetchMetricData(tenantId, `/system/tenant/metrics/onlySale/byStatus/${tenantId}/Processing`)
      .then(data => updateTenantMetric(tenantId, 'sale', 'processing', data));
    
    fetchMetricData(tenantId, `/system/tenant/metrics/onlySale/byStatus/${tenantId}/Completed`)
      .then(data => updateTenantMetric(tenantId, 'sale', 'completed', data));
    
    fetchMetricData(tenantId, `/system/tenant/metrics/onlySale/byStatus/${tenantId}/Ignore`)
      .then(data => updateTenantMetric(tenantId, 'sale', 'ignore', data));
    
    fetchMetricData(tenantId, `/system/tenant/metrics/onlySale/byStatus/${tenantId}/Error`)
      .then(data => updateTenantMetric(tenantId, 'sale', 'error', data));
    
    fetchMetricData(tenantId, `/system/tenant/metrics/onlySale/byStatus/${tenantId}/Created`)
      .then(data => updateTenantMetric(tenantId, 'sale', 'created', data));
    
    fetchMetricData(tenantId, `/system/tenant/metrics/others/byStatus/${tenantId}/Processing`)
      .then(data => updateTenantMetric(tenantId, 'other', 'processing', data));
    
    fetchMetricData(tenantId, `/system/tenant/metrics/others/byStatus/${tenantId}/Completed`)
      .then(data => updateTenantMetric(tenantId, 'other', 'completed', data));
    
    fetchMetricData(tenantId, `/system/tenant/metrics/others/byStatus/${tenantId}/Ignore`)
      .then(data => updateTenantMetric(tenantId, 'other', 'ignore', data));
    
    fetchMetricData(tenantId, `/system/tenant/metrics/others/byStatus/${tenantId}/Error`)
      .then(data => updateTenantMetric(tenantId, 'other', 'error', data));
    
    fetchMetricData(tenantId, `/system/tenant/metrics/others/byStatus/${tenantId}/Created`)
      .then(data => updateTenantMetric(tenantId, 'other', 'created', data));
  };

  const fetchAllMetrics = async () => {
    setLoading(true);
    const tenantList = await fetchTenants();
    
    for (const tenant of tenantList) {
      fetchTenantMetrics(tenant.tenantId);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchAllMetrics();
    
    const interval = setInterval(fetchAllMetrics, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredTenants = tenants.filter((tenant) =>
    tenant.tenantId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    searchQuery,
    setSearchQuery,
    tenants: filteredTenants,
    tenantMetrics,
    loading,
    fetchAllMetrics,
    fetchTenantMetrics
  };
}

export function CompanyCards() {
  const { 
    searchQuery, 
    setSearchQuery, 
    tenants, 
    tenantMetrics, 
    loading, 
    fetchAllMetrics, 
    fetchTenantMetrics 
  } = useMetricsData();

  return (
    <div className="space-y-4">
      <TotalCard 
        tenantMetrics={tenantMetrics}
        loading={loading}
        refreshMetrics={fetchAllMetrics}
      />
      
      <div className="flex items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Firma koduna göre ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-card/50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-2 rounded-lg"
          onClick={fetchAllMetrics}
          title="Yenile"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading && tenants.length === 0 ? (
        <div className="flex justify-center items-center h-48">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
            <p className="text-sm text-muted-foreground">Veriler yükleniyor...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <CompanyCard
              key={tenant.tenantId}
              tenant={tenant}
              metrics={tenantMetrics[tenant.tenantId] || {
                sale: {
                  processing: { data: null, loading: false },
                  completed: { data: null, loading: false },
                  ignore: { data: null, loading: false },
                  error: { data: null, loading: false },
                  created: { data: null, loading: false },
                  total: { count: 0, size: 0 }
                },
                other: {
                  processing: { data: null, loading: false },
                  completed: { data: null, loading: false },
                  ignore: { data: null, loading: false },
                  error: { data: null, loading: false },
                  created: { data: null, loading: false },
                  total: { count: 0, size: 0 }
                }
              }}
              refreshMetrics={fetchTenantMetrics}
            />
          ))}
        </div>
      )}
    </div>
  );
}
