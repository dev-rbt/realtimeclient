'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemMetrics, SystemLog } from '@/lib/types';
import { OverviewCards } from './dashboard/overview-cards';
import { SettingsTab } from './dashboard/settings-tab';
import { QueriesTab } from './dashboard/queries-tab';
import { CompanyCards } from "./dashboard/company-cards";
import { AnalyseTab } from './dashboard/analyse-tab';
import { RestaurantsTable } from './tables/restaurants-table';
import { SystemLogs } from './dashboard/system-logs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Dashboard({ metrics, error, logs, logsError }: { metrics: SystemMetrics | null, error: string | null, logs: SystemLog[] | null, logsError: string | null }) {
  const [activeRestaurantCount, setActiveRestaurantCount] = useState(0);
  const [passiveRestaurantCount, setPassiveRestaurantCount] = useState(0);
  const [logsVisible, setLogsVisible] = useState(true);

  // SignalR bağlantı durumunu kontrol edelim
  useEffect(() => {
    if (error) {
      console.error('SignalR connection error in Dashboard:', error);
    }
  }, [error]);

  // Mobil cihazlarda başlangıçta logları gizle
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setLogsVisible(false);
      } else {
        setLogsVisible(true);
      }
    };

    // İlk yükleme kontrolü
    handleResize();

    // Ekran boyutu değişikliklerini dinle
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Metrics değişimini izleyelim
  useEffect(() => {
  }, [metrics]);

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row">
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted px-4 md:px-8 pb-16 md:pb-0">
        <div className="mx-auto h-full flex flex-col">
          <div className="bg-card/50 backdrop-blur-sm p-3 md:p-6 rounded-xl md:rounded-2xl shadow-lg mb-3 md:mb-6 mt-2 md:mt-0">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  RobotPOS Real Time Client
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">Gerçek zamanlı sistem monitörü</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="flex-1 overflow-auto">
                <TabsContent value="overview" className="h-full overflow-auto m-0">
                  <div className="space-y-6">
                    <OverviewCards
                      metrics={metrics}
                      activeRestaurantCount={activeRestaurantCount}
                      passiveRestaurantCount={passiveRestaurantCount}
                    />
                    <CompanyCards setActiveRestaurantCount={setActiveRestaurantCount} setPassiveRestaurantCount={setPassiveRestaurantCount} />
                  </div>
                </TabsContent>
                <TabsContent value="branches" className="h-full overflow-auto m-0">
                  <RestaurantsTable />
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
              
              {/* Bottom Mobile Menu */}
              <div className="fixed bottom-0 left-0 right-0 md:relative z-10 bg-background md:mt-6">
                <div className="overflow-x-auto md:overflow-visible pb-1 pt-2 md:py-0 px-2 md:px-0 border-t md:border-t-0 bg-card/80 backdrop-blur-md md:bg-transparent md:backdrop-filter-none">
                  <TabsList className="flex md:grid w-max md:w-full md:grid-cols-7 bg-card/50 backdrop-blur-sm p-1 rounded-xl min-w-full md:min-w-0">
                    <TabsTrigger value="overview" className="flex-shrink-0">Genel Bakış</TabsTrigger>
                    <TabsTrigger value="analyse" className="flex-shrink-0">Veri Analizi</TabsTrigger>
                    <TabsTrigger value="branches" className="flex-shrink-0">Şubeler</TabsTrigger>
                    {/*<TabsTrigger value="sync" className="flex-shrink-0">Senkronizasyon</TabsTrigger>
                    <TabsTrigger value="audit" className="flex-shrink-0">İşlem Kayıtları</TabsTrigger> */}
                    <TabsTrigger value="queries" className="flex-shrink-0">Sorgular</TabsTrigger>
                    <TabsTrigger value="settings" className="flex-shrink-0">Ayarlar</TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Logs Toggle Button - Visible on mobile */}
      <Button 
        variant="outline" 
        size="icon" 
        className="md:hidden fixed right-0 top-1/2 transform -translate-y-1/2 z-10 bg-card/80 backdrop-blur-sm shadow-md border-l-0 rounded-l-lg rounded-r-none h-12 w-8"
        onClick={() => setLogsVisible(!logsVisible)}
        aria-label={logsVisible ? "Logları Gizle" : "Logları Göster"}
      >
        {logsVisible ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* System Logs - Right Side */}
      <div 
        className={`${
          logsVisible ? 'translate-x-0' : 'translate-x-full'
        } md:translate-x-0 w-[350px] bg-card md:bg-card/50 md:backdrop-blur-sm shadow-lg overflow-hidden flex flex-col h-screen border-l transition-transform duration-300 ease-in-out fixed md:relative right-0 top-0 z-[5]`}
      >
        <SystemLogs logs={logs} logsError={logsError} />
      </div>
    </div>
  );
}