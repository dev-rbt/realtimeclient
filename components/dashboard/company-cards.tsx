'use client';

import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TotalCard from './company-cards/total-card';
import CompanyCard from './company-cards/company-card';
import useMetricsData from '@/hooks/use-metrics';


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
