'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateRestaurants, generateSyncData, generateDatabaseConnections, generateAuditLogs } from '@/lib/mock-data';
import { Restaurant, SyncData, DatabaseConnection, AuditLog, SystemMetrics, SystemLog } from '@/lib/types';
import { OverviewCards } from './dashboard/overview-cards';
import { RestaurantsTable } from './tables/restaurants-table';
import { DatabasesTab } from './dashboard/databases-tab';
import { SyncTab } from './dashboard/sync-tab';
import { AuditTab } from './dashboard/audit-tab';
import { SettingsTab } from './dashboard/settings-tab';
import { QueriesTab } from './dashboard/queries-tab';
import { CompanyCards } from "./dashboard/company-cards";
import { SystemLogs } from './dashboard/system-logs';
import { AnalyseTab } from './dashboard/analyse-tab';

export default function Dashboard({ metrics, error, logs, logsError }: { metrics: SystemMetrics | null, error: string | null, logs: SystemLog[] | null, logsError: string | null }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recentSyncs, setRecentSyncs] = useState<SyncData[]>([]);
  const [databases, setDatabases] = useState<DatabaseConnection[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // SignalR bağlantı durumunu kontrol edelim
  useEffect(() => {
    if (error) {
      console.error('SignalR connection error in Dashboard:', error);
    }
  }, [error]);

  // Metrics değişimini izleyelim
  useEffect(() => {
  }, [metrics]);

  useEffect(() => {
    setRestaurants(generateRestaurants(500));
    setDatabases(generateDatabaseConnections());
    setAuditLogs(generateAuditLogs(100));

    const interval = setInterval(() => {
      setDatabases(generateDatabaseConnections());
      setRestaurants(prev =>
        prev.map(rest => ({
          ...rest,
          lastSync: new Date(),
          status: Math.random() > 0.95 ? 'error' : 'active',
          totalDocuments: Math.floor(Math.random() * 50000),
          dataTransferred: Math.random() * 1024,
        }))
      );
      setRecentSyncs(prev => [
        generateSyncData(`rest_${Math.floor(Math.random() * 500) + 1}`),
        ...prev.slice(0, 49),
      ]);
      setAuditLogs(prev => [generateAuditLogs(1)[0], ...prev.slice(0, 99)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);



  return (
    <div className="h-screen overflow-hidden flex">
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted px-8">
        <div className="mx-auto h-full flex flex-col">
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  RobotPOS Real Time Client Center
                </h1>
                <p className="text-muted-foreground mt-2">Gerçek zamanlı sistem monitörü</p>
              </div>

            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-card/50 backdrop-blur-sm p-1 rounded-xl">
                <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                <TabsTrigger value="analyse">Veri Analizi</TabsTrigger>
                <TabsTrigger value="branches">Şubeler</TabsTrigger>
                {/*<TabsTrigger value="sync">Senkronizasyon</TabsTrigger>
                <TabsTrigger value="audit">İşlem Kayıtları</TabsTrigger> */}
                <TabsTrigger value="queries">Sorgular</TabsTrigger>
                <TabsTrigger value="settings">Ayarlar</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-auto mt-6">
                <TabsContent value="overview" className="h-full overflow-auto m-0">
                  <div className="space-y-6">
                    <OverviewCards
                      metrics={metrics}
                      lastSyncDate={recentSyncs[0]?.timestamp.toLocaleTimeString()}
                      totalRestaurantCount={restaurants.length}
                      activeRestaurantCount={restaurants.filter(r => r.status === 'active').length}
                      passiveRestaurantCount={restaurants.filter(r => r.status === 'idle').length}
                    />
                    <CompanyCards />
                  </div>
                </TabsContent>
                <TabsContent value="branches" className="h-full overflow-auto m-0">
                  {/* <RestaurantsTable /> */}
                </TabsContent>
                <TabsContent value="analyse" className="h-full overflow-auto m-0">
                  <AnalyseTab />
                </TabsContent>
                {/* <TabsContent value="sync" className="h-full overflow-auto m-0">
                  <SyncTab recentSyncs={recentSyncs} />
                </TabsContent>
                <TabsContent value="audit" className="h-full overflow-auto m-0">
                  <AuditTab logs={auditLogs} />
                </TabsContent> */}
                <TabsContent value="queries" className="h-full overflow-auto m-0">
                  <QueriesTab />
                </TabsContent>
                <TabsContent value="settings" className="h-full overflow-auto m-0">
                  <SettingsTab />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* System Logs - Right Side */}
      {/* <div className="w-[350px] bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden flex flex-col h-screen border-l">
        <SystemLogs logs={logs} logsError={logsError} />
      </div> */}
    </div>
  );
}