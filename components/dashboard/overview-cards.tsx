'use client';

import { Card } from '@/components/ui/card';
import { Building2, Database, Clock, Server } from 'lucide-react';
import { SystemMetrics } from '@/lib/types';
import { useMetricsStore } from '@/store/useMetricsStore';

interface OverviewCardsProps {
  metrics: SystemMetrics | null;
  activeRestaurantCount: number;
  passiveRestaurantCount: number;
  totalRestaurantCount: number;
  databaseCount: number;
  lastSyncDate: string;
}

export function OverviewCards({
  metrics,
  activeRestaurantCount,
  passiveRestaurantCount,
  totalRestaurantCount,
  databaseCount,
  lastSyncDate,
}: OverviewCardsProps) {
  const { metrics: documentMetrics } = useMetricsStore();
  
  // Calculate total branches from metrics store
  const totalBranches = documentMetrics ? Object.values(documentMetrics.tenants).reduce(
    (total, tenant) => total + tenant.activeBranches + tenant.passiveBranches, 0
  ) : 0;
  
  // Calculate active and passive branches
  const activeBranches = documentMetrics ? Object.values(documentMetrics.tenants).reduce(
    (total, tenant) => total + tenant.activeBranches, 0
  ) : 0;
  
  const passiveBranches = documentMetrics ? Object.values(documentMetrics.tenants).reduce(
    (total, tenant) => total + tenant.passiveBranches, 0
  ) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
      {metrics && <Card className="p-6 bg-card/50 backdrop-blur-sm col-span-3">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Server className="w-5 h-5 mr-2 text-primary" />
          Sistem Performansı
        </h2>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">CPU Kullanımı</span>
              <span className="font-bold">{metrics?.cpuUsage?.toFixed(1) ?? '0.0'}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${metrics?.cpuUsage ?? 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Bellek Kullanımı</span>
              <span className="font-bold">{metrics?.usedMemory?.toFixed(1) ?? '0.0'} GB / {metrics?.totalMemory?.toFixed(1) ?? '0.0'} GB</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${metrics ? (metrics.usedMemory / metrics.totalMemory) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Disk Kullanımı</span>
              <span className="font-bold">{metrics?.diskUsage?.toFixed(1) ?? '0.0'}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${metrics?.diskUsage ?? 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Ağ Trafiği</span>
              <span className="font-bold">↓{metrics?.networkReceived?.toFixed(1) ?? '0.0'} MB/s ↑{metrics?.networkSent?.toFixed(1) ?? '0.0'} MB/s</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${metrics ? ((metrics.networkReceived + metrics.networkSent) / 20) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>}
      <div className="col-span-3 grid grid-cols-2 gap-2">
        <Card className="p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-blue-500/10 rounded-2xl">
                <Building2 className="h-9 w-9 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Şubeler</p>
                <h3 className="text-3xl font-bold text-blue-500">{totalBranches}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center p-2 rounded-lg bg-green-50">
                <p className="text-sm font-medium text-green-600">Aktif</p>
                <p className="text-xl font-bold text-green-700">{activeBranches}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-red-50">
                <p className="text-sm font-medium text-red-600">Pasif</p>
                <p className="text-xl font-bold text-red-700">{passiveBranches}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-3.5 bg-green-500/10 rounded-2xl">
                <Database className="h-9 w-9 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Veritabanları</p>
                <h3 className="text-3xl font-bold text-green-500">{databaseCount}</h3>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Son Aktarım: {lastSyncDate}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <div className="h-full flex items-center justify-center text-muted-foreground">
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <div className="h-full flex items-center justify-center text-muted-foreground">
          </div>
        </Card>
      </div>
    </div>
  );
}