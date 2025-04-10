'use client';

import { Search, RefreshCw, Building2, TrendingUp, Database, ArrowRight, Store, Eye, Clock, CheckCircle2, EyeOff, XCircle, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TotalCard from './company-cards/total-card';
import CompanyCard from './company-cards/company-card';
import useMetricsData from '@/hooks/use-metrics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatNumber } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useMemo, useEffect } from 'react';
import DetailMetricItem from './company-cards/detail-metric-item';

// Define sort types for columns
type SortColumn = 'tenantName' | 'branches' | 'created' | 'processing' | 'completed' | 'ignore' | 'error' | 'total';
type SortDirection = 'asc' | 'desc';

export function CompanyCards({ setActiveRestaurantCount, setPassiveRestaurantCount }: { setActiveRestaurantCount: (count: number) => void, setPassiveRestaurantCount: (count: number) => void }) {
  const {
    searchQuery,
    setSearchQuery,
    tenants,
    tenantMetrics,
    loading,
    fetchAllMetrics,
    fetchTenantMetrics
  } = useMetricsData();

  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [documentType, setDocumentType] = useState<'sale' | 'other'>('sale');
  const [showBothTypes, setShowBothTypes] = useState<boolean>(true);

  setActiveRestaurantCount(tenants.reduce((accumulator, currentValue) => accumulator + currentValue.activeBranches, 0));
  setPassiveRestaurantCount(tenants.reduce((accumulator, currentValue) => accumulator + currentValue.passiveBranches, 0));
  
  // Calculate total for each category
  const calculateTotal = (metrics: any) => {
    let total = 0;
    if (metrics?.processing?.data?.count) total += metrics.processing.data.count;
    if (metrics?.completed?.data?.count) total += metrics.completed.data.count;
    if (metrics?.error?.data?.count) total += metrics.error.data.count;
    if (metrics?.created?.data?.count) total += metrics.created.data.count;
    if (metrics?.ignore?.data?.count) total += metrics.ignore.data.count;
    return total;
  };
  
  // Calculate percentages for progress bars
  const getPercentage = (metrics: any, status: string) => {
    const total = calculateTotal(metrics);
    if (total === 0) return 0;
    const count = metrics[status]?.data?.count || 0;
    return (count / total) * 100;
  };
  
  // Check if a specific metric is loading
  const isMetricLoading = (metrics: any, status: string) => {
    if (!metrics || !metrics[status]) return false;
    return metrics[status].loading;
  };

  // Check if any metrics are loading
  const isMetricsLoading = (metrics: any) => {
    if (!metrics) return false;
    return metrics.processing?.loading || 
           metrics.completed?.loading || 
           metrics.error?.loading || 
           metrics.created?.loading ||
           metrics.ignore?.loading;
  };

  // Calculate total count for a tenant's metrics
  const calculateTotalCount = (metrics: any) => {
    if (!metrics) return 0;
    const created = metrics.created?.data?.count || 0;
    const processing = metrics.processing?.data?.count || 0;
    const completed = metrics.completed?.data?.count || 0;
    const ignore = metrics.ignore?.data?.count || 0;
    const error = metrics.error?.data?.count || 0;
    return created + processing + completed + ignore + error;
  };

  // Calculate total for all metrics of a tenant
  const getTenantTotalCount = (tenantId: string) => {
    const saleMetrics = tenantMetrics[tenantId]?.sale || null;
    const otherMetrics = tenantMetrics[tenantId]?.other || null;
    
    const saleTotal = calculateTotalCount(saleMetrics);
    const otherTotal = calculateTotalCount(otherMetrics);
    
    return saleTotal + otherTotal;
  };

  // Handle sort column click
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  // Sorted tenants based on selected column and direction
  const sortedTenants = useMemo(() => {
    return [...tenants].sort((a, b) => {
      const aMetrics = tenantMetrics[a.tenantId]?.sale || {
        processing: { data: null },
        completed: { data: null },
        error: { data: null },
        created: { data: null },
        ignore: { data: null },
        total: { count: 0, size: 0 }
      };
      
      const bMetrics = tenantMetrics[b.tenantId]?.sale || {
        processing: { data: null },
        completed: { data: null },
        error: { data: null },
        created: { data: null },
        ignore: { data: null },
        total: { count: 0, size: 0 }
      };
      
      let aValue = 0;
      let bValue = 0;
      
      switch (sortColumn) {
        case 'tenantName':
          return sortDirection === 'asc' 
            ? a.tenantName.localeCompare(b.tenantName) 
            : b.tenantName.localeCompare(a.tenantName);
        case 'branches':
          aValue = a.activeBranches + a.passiveBranches;
          bValue = b.activeBranches + b.passiveBranches;
          break;
        case 'created':
          aValue = aMetrics.created.data?.count || 0;
          bValue = bMetrics.created.data?.count || 0;
          break;
        case 'processing':
          aValue = aMetrics.processing.data?.count || 0;
          bValue = bMetrics.processing.data?.count || 0;
          break;
        case 'completed':
          aValue = aMetrics.completed.data?.count || 0;
          bValue = bMetrics.completed.data?.count || 0;
          break;
        case 'ignore':
          aValue = aMetrics.ignore.data?.count || 0;
          bValue = bMetrics.ignore.data?.count || 0;
          break;
        case 'error':
          aValue = aMetrics.error.data?.count || 0;
          bValue = bMetrics.error.data?.count || 0;
          break;
        case 'total':
          aValue = getTenantTotalCount(a.tenantId);
          bValue = getTenantTotalCount(b.tenantId);
          break;
        default:
          aValue = getTenantTotalCount(a.tenantId);
          bValue = getTenantTotalCount(b.tenantId);
      }
      
      // Sort based on direction
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [tenants, tenantMetrics, sortColumn, sortDirection, documentType]);

  // Render sort indicator for column headers
  const renderSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />;
  };

  // Toggle between sale and other document types
  const toggleDocumentType = () => {
    setDocumentType(documentType === 'sale' ? 'other' : 'sale');
  };

  // Toggle between showing both types or just the selected type
  const toggleShowBothTypes = () => {
    setShowBothTypes(!showBothTypes);
  };

  return (
    <div className="space-y-4">
      <TotalCard
        tenantMetrics={tenantMetrics}
        loading={loading}
        refreshMetrics={fetchAllMetrics}
      />

      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0 sm:justify-between">
        <div className="relative w-full sm:flex-1">
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
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant={showBothTypes ? 'default' : 'outline'}
            size="sm"
            className="w-full sm:w-auto rounded-lg"
            onClick={toggleShowBothTypes}
          >
            <Database className="h-4 w-4 mr-1" />
            Tümünü Göster
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto sm:ml-2 rounded-lg"
            onClick={fetchAllMetrics}
            title="Yenile"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} mr-1`} />
            <span className="sm:hidden">Yenile</span>
            <span className="hidden sm:inline">Yenile</span>
          </Button>
        </div>
      </div>

      {loading && tenants.length === 0 ? (
        <div className="flex justify-center items-center h-48">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
            <p className="text-sm text-muted-foreground">Veriler yükleniyor...</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[150px] cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('tenantName')}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center">
                      Firma Bilgisi
                      {renderSortIndicator('tenantName')}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="w-[100px] cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('branches')}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center">
                      Şubeler
                      {renderSortIndicator('branches')}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="w-[80px]"
                >
                  <div className="text-center">
                    Tür
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('created')}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center">
                      Kuyruk
                      {renderSortIndicator('created')}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('processing')}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center">
                      İşleniyor
                      {renderSortIndicator('processing')}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('completed')}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center">
                      Tamamlandı
                      {renderSortIndicator('completed')}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('ignore')}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center">
                      Göz Ardı
                      {renderSortIndicator('ignore')}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('error')}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center">
                      Hata
                      {renderSortIndicator('error')}
                    </div>
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('total')}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center">
                      Toplam
                      {renderSortIndicator('total')}
                    </div>
                  </div>
                </TableHead>
                <TableHead className="w-[80px]">
                  <div className="text-center">
                    İşlemler
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <p className="text-sm text-muted-foreground">Firma bulunamadı.</p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedTenants
                  .filter(tenant => 
                    tenant.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tenant.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .flatMap(tenant => {
                    // Create two rows for each tenant - one for sale and one for other
                    const rows = [];
                    
                    // Sale row
                    const saleMetrics = tenantMetrics[tenant.tenantId]?.sale || {
                      processing: { data: null, loading: false },
                      completed: { data: null, loading: false },
                      ignore: { data: null, loading: false },
                      error: { data: null, loading: false },
                      created: { data: null, loading: false },
                      total: { count: 0, size: 0 }
                    };
                    
                    // Other row
                    const otherMetrics = tenantMetrics[tenant.tenantId]?.other || {
                      processing: { data: null, loading: false },
                      completed: { data: null, loading: false },
                      ignore: { data: null, loading: false },
                      error: { data: null, loading: false },
                      created: { data: null, loading: false },
                      total: { count: 0, size: 0 }
                    };
                    
                    // Add the sale row
                    rows.push(
                      <TableRow key={`${tenant.tenantId}-sale`} className="border-b-0">
                        {/* Firma Bilgisi - Only in first row with rowspan if showing both types */}
                        {rows.length === 0 && (
                          <TableCell rowSpan={showBothTypes ? 2 : 1} className="align-middle">
                            <div className="flex flex-col">
                              <div className="font-medium flex items-center gap-1.5">
                                <Building2 className="h-4 w-4 text-primary" />
                                {tenant.tenantName}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {tenant.tenantId}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        
                        {/* Şubeler - Only in first row with rowspan if showing both types */}
                        {rows.length === 0 && (
                          <TableCell rowSpan={showBothTypes ? 2 : 1} className="text-center align-middle">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-medium text-green-600">{tenant.activeBranches}</span>
                                  <span className="text-xs text-muted-foreground">Aktif</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-sm font-medium text-red-600">{tenant.passiveBranches}</span>
                                  <span className="text-xs text-muted-foreground">Pasif</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        
                        {/* Document Type Indicator */}
                        <TableCell className="py-1 px-2 w-[80px]">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-full flex justify-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Satış
                          </Badge>
                        </TableCell>
                        
                        {/* Kuyruk */}
                        <TableCell className="text-center py-2">
                          {isMetricLoading(saleMetrics, 'created') ? (
                            <div className="flex justify-center">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium text-purple-600">
                                {formatNumber(saleMetrics.created.data?.count || 0)}
                              </span>
                              <div className="w-full max-w-[50px] mt-1">
                                <Progress 
                                  value={getPercentage(saleMetrics, 'created')} 
                                  className="h-1.5 bg-gray-100" 
                                  indicatorClassName="bg-purple-500" 
                                />
                              </div>
                            </div>
                          )}
                        </TableCell>
                        
                        {/* İşleniyor */}
                        <TableCell className="text-center py-2">
                          {isMetricLoading(saleMetrics, 'processing') ? (
                            <div className="flex justify-center">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium text-blue-600">
                                {formatNumber(saleMetrics.processing.data?.count || 0)}
                              </span>
                              <div className="w-full max-w-[50px] mt-1">
                                <Progress 
                                  value={getPercentage(saleMetrics, 'processing')} 
                                  className="h-1.5 bg-gray-100" 
                                  indicatorClassName="bg-blue-500" 
                                />
                              </div>
                            </div>
                          )}
                        </TableCell>
                        
                        {/* Tamamlandı */}
                        <TableCell className="text-center py-2">
                          {isMetricLoading(saleMetrics, 'completed') ? (
                            <div className="flex justify-center">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium text-green-600">
                                {formatNumber(saleMetrics.completed.data?.count || 0)}
                              </span>
                              <div className="w-full max-w-[50px] mt-1">
                                <Progress 
                                  value={getPercentage(saleMetrics, 'completed')} 
                                  className="h-1.5 bg-gray-100" 
                                  indicatorClassName="bg-green-500" 
                                />
                              </div>
                            </div>
                          )}
                        </TableCell>
                        
                        {/* Göz Ardı */}
                        <TableCell className="text-center py-2">
                          {isMetricLoading(saleMetrics, 'ignore') ? (
                            <div className="flex justify-center">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium text-gray-600">
                                {formatNumber(saleMetrics.ignore.data?.count || 0)}
                              </span>
                              <div className="w-full max-w-[50px] mt-1">
                                <Progress 
                                  value={getPercentage(saleMetrics, 'ignore')} 
                                  className="h-1.5 bg-gray-100" 
                                  indicatorClassName="bg-gray-400" 
                                />
                              </div>
                            </div>
                          )}
                        </TableCell>
                        
                        {/* Hata */}
                        <TableCell className="text-center py-2">
                          {isMetricLoading(saleMetrics, 'error') ? (
                            <div className="flex justify-center">
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium text-red-600">
                                {formatNumber(saleMetrics.error.data?.count || 0)}
                              </span>
                              <div className="w-full max-w-[50px] mt-1">
                                <Progress 
                                  value={getPercentage(saleMetrics, 'error')} 
                                  className="h-1.5 bg-gray-100" 
                                  indicatorClassName="bg-red-500" 
                                />
                              </div>
                            </div>
                          )}
                        </TableCell>
                        
                        {/* Toplam */}
                        <TableCell className="text-center py-2">
                          <span className="text-sm font-medium text-blue-600">
                            {formatNumber(calculateTotalCount(saleMetrics))}
                          </span>
                        </TableCell>
                        
                        {/* İşlemler - Only in first row with rowspan if showing both types */}
                        {rows.length === 0 && (
                          <TableCell rowSpan={showBothTypes ? 2 : 1} className="text-center align-middle">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => fetchTenantMetrics(tenant.tenantId)}
                                disabled={isMetricLoading(saleMetrics, 'created') || isMetricLoading(saleMetrics, 'processing') || isMetricLoading(saleMetrics, 'completed') || isMetricLoading(saleMetrics, 'ignore') || isMetricLoading(saleMetrics, 'error')}
                              >
                                <RefreshCw className={`h-3.5 w-3.5 ${isMetricLoading(saleMetrics, 'created') || isMetricLoading(saleMetrics, 'processing') || isMetricLoading(saleMetrics, 'completed') || isMetricLoading(saleMetrics, 'ignore') || isMetricLoading(saleMetrics, 'error') ? 'animate-spin' : ''}`} />
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => setSelectedTenant(tenant.tenantId)}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Building2 className="h-5 w-5 text-primary" />
                                      {tenant.tenantName} - Detaylı Metrikler
                                    </DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="py-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-2">
                                        <Store className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Şubeler</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                          {tenant.activeBranches} Aktif
                                        </Badge>
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                          {tenant.passiveBranches} Pasif
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-4">
                                        <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                                          <TrendingUp className="h-4 w-4 text-green-600" />
                                          Satış Belgeleri
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                          <DetailMetricItem 
                                            title="Kuyruk" 
                                            icon={<AlertCircle className="h-4 w-4 text-purple-500" />}
                                            count={tenantMetrics[tenant.tenantId]?.sale.created.data?.count}
                                            size={tenantMetrics[tenant.tenantId]?.sale.created.data?.size}
                                            loading={tenantMetrics[tenant.tenantId]?.sale.created.loading}
                                          />
                                          <DetailMetricItem 
                                            title="İşleniyor" 
                                            icon={<Clock className="h-4 w-4 text-blue-500" />}
                                            count={tenantMetrics[tenant.tenantId]?.sale.processing.data?.count}
                                            size={tenantMetrics[tenant.tenantId]?.sale.processing.data?.size}
                                            loading={tenantMetrics[tenant.tenantId]?.sale.processing.loading}
                                          />
                                          <DetailMetricItem 
                                            title="Tamamlandı" 
                                            icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                                            count={tenantMetrics[tenant.tenantId]?.sale.completed.data?.count}
                                            size={tenantMetrics[tenant.tenantId]?.sale.completed.data?.size}
                                            loading={tenantMetrics[tenant.tenantId]?.sale.completed.loading}
                                          />
                                          <DetailMetricItem 
                                            title="Göz Ardı" 
                                            icon={<EyeOff className="h-4 w-4 text-gray-500" />}
                                            count={tenantMetrics[tenant.tenantId]?.sale.ignore.data?.count}
                                            size={tenantMetrics[tenant.tenantId]?.sale.ignore.data?.size}
                                            loading={tenantMetrics[tenant.tenantId]?.sale.ignore.loading}
                                          />
                                          <DetailMetricItem 
                                            title="Hata" 
                                            icon={<XCircle className="h-4 w-4 text-red-500" />}
                                            count={tenantMetrics[tenant.tenantId]?.sale.error.data?.count}
                                            size={tenantMetrics[tenant.tenantId]?.sale.error.data?.size}
                                            loading={tenantMetrics[tenant.tenantId]?.sale.error.loading}
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-4">
                                        <h3 className="text-sm font-medium border-b pb-2 flex items-center gap-2">
                                          <Database className="h-4 w-4 text-blue-600" />
                                          Diğer Belgeler
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                          <DetailMetricItem 
                                            title="Kuyruk" 
                                            icon={<AlertCircle className="h-4 w-4 text-purple-500" />}
                                            count={tenantMetrics[tenant.tenantId]?.other.created.data?.count}
                                            size={tenantMetrics[tenant.tenantId]?.other.created.data?.size}
                                            loading={tenantMetrics[tenant.tenantId]?.other.created.loading}
                                          />
                                          <DetailMetricItem 
                                            title="İşleniyor" 
                                            icon={<Clock className="h-4 w-4 text-blue-500" />}
                                            count={tenantMetrics[tenant.tenantId]?.other.processing.data?.count}
                                            size={tenantMetrics[tenant.tenantId]?.other.processing.data?.size}
                                            loading={tenantMetrics[tenant.tenantId]?.other.processing.loading}
                                          />
                                          <DetailMetricItem 
                                            title="Tamamlandı" 
                                            icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                                            count={tenantMetrics[tenant.tenantId]?.other.completed.data?.count}
                                            size={tenantMetrics[tenant.tenantId]?.other.completed.data?.size}
                                            loading={tenantMetrics[tenant.tenantId]?.other.completed.loading}
                                          />
                                          <DetailMetricItem 
                                            title="Göz Ardı" 
                                            icon={<EyeOff className="h-4 w-4 text-gray-500" />}
                                            count={tenantMetrics[tenant.tenantId]?.other.ignore.data?.count}
                                            size={tenantMetrics[tenant.tenantId]?.other.ignore.data?.size}
                                            loading={tenantMetrics[tenant.tenantId]?.other.ignore.loading}
                                          />
                                          <DetailMetricItem 
                                            title="Hata" 
                                            icon={<XCircle className="h-4 w-4 text-red-500" />}
                                            count={tenantMetrics[tenant.tenantId]?.other.error.data?.count}
                                            size={tenantMetrics[tenant.tenantId]?.other.error.data?.size}
                                            loading={tenantMetrics[tenant.tenantId]?.other.error.loading}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => fetchTenantMetrics(tenant.tenantId)}
                                      disabled={isMetricLoading(saleMetrics, 'created') || isMetricLoading(saleMetrics, 'processing') || isMetricLoading(saleMetrics, 'completed') || isMetricLoading(saleMetrics, 'ignore') || isMetricLoading(saleMetrics, 'error') || isMetricLoading(otherMetrics, 'created') || isMetricLoading(otherMetrics, 'processing') || isMetricLoading(otherMetrics, 'completed') || isMetricLoading(otherMetrics, 'ignore') || isMetricLoading(otherMetrics, 'error')}
                                    >
                                      <RefreshCw className={`h-4 w-4 mr-1.5 ${isMetricLoading(saleMetrics, 'created') || isMetricLoading(saleMetrics, 'processing') || isMetricLoading(saleMetrics, 'completed') || isMetricLoading(saleMetrics, 'ignore') || isMetricLoading(saleMetrics, 'error') || isMetricLoading(otherMetrics, 'created') || isMetricLoading(otherMetrics, 'processing') || isMetricLoading(otherMetrics, 'completed') || isMetricLoading(otherMetrics, 'ignore') || isMetricLoading(otherMetrics, 'error') ? 'animate-spin' : ''}`} />
                                      Yenile
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                    
                    // Add the other row if showing both types
                    if (showBothTypes) {
                      rows.push(
                        <TableRow key={`${tenant.tenantId}-other`} className="border-t-0">
                          {/* Document Type Indicator */}
                          <TableCell className="py-1 px-2 w-[80px]">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-full flex justify-center">
                              <Database className="h-3 w-3 mr-1" />
                              Diğer
                            </Badge>
                          </TableCell>
                          
                          {/* Kuyruk */}
                          <TableCell className="text-center py-2">
                            {isMetricLoading(otherMetrics, 'created') ? (
                              <div className="flex justify-center">
                                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-purple-600">
                                  {formatNumber(otherMetrics.created.data?.count || 0)}
                                </span>
                                <div className="w-full max-w-[50px] mt-1">
                                  <Progress 
                                    value={getPercentage(otherMetrics, 'created')} 
                                    className="h-1.5 bg-gray-100" 
                                    indicatorClassName="bg-purple-500" 
                                  />
                                </div>
                              </div>
                            )}
                          </TableCell>
                          
                          {/* İşleniyor */}
                          <TableCell className="text-center py-2">
                            {isMetricLoading(otherMetrics, 'processing') ? (
                              <div className="flex justify-center">
                                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {formatNumber(otherMetrics.processing.data?.count || 0)}
                                </span>
                                <div className="w-full max-w-[50px] mt-1">
                                  <Progress 
                                    value={getPercentage(otherMetrics, 'processing')} 
                                    className="h-1.5 bg-gray-100" 
                                    indicatorClassName="bg-blue-500" 
                                  />
                                </div>
                              </div>
                            )}
                          </TableCell>
                          
                          {/* Tamamlandı */}
                          <TableCell className="text-center py-2">
                            {isMetricLoading(otherMetrics, 'completed') ? (
                              <div className="flex justify-center">
                                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-green-600">
                                  {formatNumber(otherMetrics.completed.data?.count || 0)}
                                </span>
                                <div className="w-full max-w-[50px] mt-1">
                                  <Progress 
                                    value={getPercentage(otherMetrics, 'completed')} 
                                    className="h-1.5 bg-gray-100" 
                                    indicatorClassName="bg-green-500" 
                                  />
                                </div>
                              </div>
                            )}
                          </TableCell>
                          
                          {/* Göz Ardı */}
                          <TableCell className="text-center py-2">
                            {isMetricLoading(otherMetrics, 'ignore') ? (
                              <div className="flex justify-center">
                                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {formatNumber(otherMetrics.ignore.data?.count || 0)}
                                </span>
                                <div className="w-full max-w-[50px] mt-1">
                                  <Progress 
                                    value={getPercentage(otherMetrics, 'ignore')} 
                                    className="h-1.5 bg-gray-100" 
                                    indicatorClassName="bg-gray-400" 
                                  />
                                </div>
                              </div>
                            )}
                          </TableCell>
                          
                          {/* Hata */}
                          <TableCell className="text-center py-2">
                            {isMetricLoading(otherMetrics, 'error') ? (
                              <div className="flex justify-center">
                                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-red-600">
                                  {formatNumber(otherMetrics.error.data?.count || 0)}
                                </span>
                                <div className="w-full max-w-[50px] mt-1">
                                  <Progress 
                                    value={getPercentage(otherMetrics, 'error')} 
                                    className="h-1.5 bg-gray-100" 
                                    indicatorClassName="bg-red-500" 
                                  />
                                </div>
                              </div>
                            )}
                          </TableCell>
                          
                          {/* Toplam */}
                          <TableCell className="text-center py-2">
                            <span className="text-sm font-medium text-blue-600">
                              {formatNumber(calculateTotalCount(otherMetrics))}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    
                    return rows;
                  })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
