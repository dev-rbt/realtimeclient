'use client';

import { Card } from '@/components/ui/card';
import { Building2, Database, Clock, Server } from 'lucide-react';
import { SystemMetrics } from '@/lib/types';
import { useConnections } from '@/hooks/useConnections';
import { Skeleton } from '@/components/ui/skeleton';

interface OverviewCardsProps {
  metrics: SystemMetrics | null;
  activeRestaurantCount: number;
  passiveRestaurantCount: number;
}

export function OverviewCards({
  metrics,
  activeRestaurantCount,
  passiveRestaurantCount
}: OverviewCardsProps) {
  const { connections } = useConnections();
  

  // Get database count from connections store
  const connectionsCount = connections.length;

  // Metrics card skeleton loader
  const MetricsCardSkeleton = () => (
    <Card className="p-4 md:p-6 bg-card/50 backdrop-blur-sm col-span-3">
      <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
        <Server className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
        Sistem Performansı
      </h2>
      <div className="space-y-4 md:space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </div>
    </Card>
  );

  // Branches card skeleton loader
  const BranchesCardSkeleton = () => (
    <Card className="p-3 md:p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <div className="space-y-3 md:space-y-6">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="p-2 md:p-3.5 bg-blue-500/10 rounded-xl md:rounded-2xl">
            <Building2 className="h-6 w-6 md:h-9 md:w-9 text-blue-500" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">Şubeler</p>
            <Skeleton className="h-6 md:h-8 w-12 md:w-16 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:gap-4 pt-2 border-t">
          <div className="text-center p-1 md:p-2 rounded-lg bg-green-50/30">
            <p className="text-xs md:text-sm font-medium text-green-600/50">Aktif</p>
            <Skeleton className="h-5 md:h-6 w-10 md:w-12 mx-auto mt-1" />
          </div>
          <div className="text-center p-1 md:p-2 rounded-lg bg-red-50/30">
            <p className="text-xs md:text-sm font-medium text-red-600/50">Pasif</p>
            <Skeleton className="h-5 md:h-6 w-10 md:w-12 mx-auto mt-1" />
          </div>
        </div>
      </div>
    </Card>
  );

  // Databases card skeleton loader
  const DatabasesCardSkeleton = () => (
    <Card className="p-3 md:p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <div className="space-y-2 md:space-y-4">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="p-2 md:p-3.5 bg-green-500/10 rounded-xl md:rounded-2xl">
            <Database className="h-6 w-6 md:h-9 md:w-9 text-green-500" />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">Veritabanları</p>
            <Skeleton className="h-6 md:h-8 w-12 md:w-16 mt-1" />
          </div>
        </div>
      </div>
    </Card>
  );

  const isLoading = connections.length === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
      {metrics ? (
        <Card className="p-4 md:p-6 bg-card/50 backdrop-blur-sm col-span-3">
          <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 flex items-center">
            <Server className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
            Sistem Performansı
          </h2>
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs md:text-sm text-muted-foreground">CPU Kullanımı</span>
                <span className="text-sm md:text-base font-bold">{metrics.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.cpuUsage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs md:text-sm text-muted-foreground">Bellek Kullanımı</span>
                <span className="text-sm md:text-base font-bold">{metrics.usedMemory.toFixed(1)} GB / {metrics.totalMemory.toFixed(1)} GB</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.usedMemory / metrics.totalMemory) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs md:text-sm text-muted-foreground">Disk Kullanımı</span>
                <span className="text-sm md:text-base font-bold">{metrics.diskUsage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.diskUsage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs md:text-sm text-muted-foreground">Ağ Trafiği</span>
                <span className="text-sm md:text-base font-bold">↓{metrics.networkReceived.toFixed(1)} MB/s ↑{metrics.networkSent.toFixed(1)} MB/s</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${((metrics.networkReceived + metrics.networkSent) / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <MetricsCardSkeleton />
      )}
      <div className="col-span-3 grid grid-cols-2 gap-2">
        {!isLoading ? (
          <Card className="p-3 md:p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
            <div className="space-y-3 md:space-y-6">
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="p-2 md:p-3.5 bg-blue-500/10 rounded-xl md:rounded-2xl">
                  <Building2 className="h-6 w-6 md:h-9 md:w-9 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Şubeler</p>
                  <h3 className="text-xl md:text-3xl font-bold text-blue-500">{activeRestaurantCount + passiveRestaurantCount}</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-4 pt-2 border-t">
                <div className="text-center p-1 md:p-2 rounded-lg bg-green-50">
                  <p className="text-xs md:text-sm font-medium text-green-600">Aktif</p>
                  <p className="text-lg md:text-xl font-bold text-green-700">{activeRestaurantCount}</p>
                </div>
                <div className="text-center p-1 md:p-2 rounded-lg bg-red-50">
                  <p className="text-xs md:text-sm font-medium text-red-600">Pasif</p>
                  <p className="text-lg md:text-xl font-bold text-red-700">{passiveRestaurantCount}</p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <BranchesCardSkeleton />
        )}

        {!isLoading ? (
          <Card className="p-3 md:p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="p-2 md:p-3.5 bg-green-500/10 rounded-xl md:rounded-2xl">
                  <Database className="h-6 w-6 md:h-9 md:w-9 text-green-500" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Veritabanları</p>
                  <h3 className="text-xl md:text-3xl font-bold text-green-500">{connectionsCount}</h3>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <DatabasesCardSkeleton />
        )}

        <Card className="p-3 md:p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <div className="h-full flex items-center justify-center text-muted-foreground">
          </div>
        </Card>

        <Card className="p-3 md:p-6 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <div className="h-full flex items-center justify-center text-muted-foreground">
          </div>
        </Card>
      </div>
    </div>
  );
}