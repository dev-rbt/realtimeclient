'use client';

import React, { useEffect, useState } from 'react';
import { SystemMetrics, SystemLog } from '@/lib/types';
import { OverviewCards } from './dashboard/overview-cards';
import { SettingsTab } from './dashboard/settings-tab';
import { QueriesTab } from './dashboard/queries-tab';
import { CompanyCards } from "./dashboard/company-cards";
import { AnalyseTab } from './dashboard/analyse-tab';
import { RestaurantsTable } from './tables/restaurants-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Settings, 
  Building2, 
  BarChart3, 
  Database, 
  Menu, 
  X,
  ChevronRight,
  ChevronLeft,
  Bell,
  Search,
  UserCircle2,
  Home,
  Activity,
  PanelLeft,
  Layers,
  FileText,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

export default function Dashboard({ metrics, error, logs, logsError }: { metrics: SystemMetrics | null, error: string | null, logs: SystemLog[] | null, logsError: string | null }) {
  const [activeRestaurantCount, setActiveRestaurantCount] = useState(0);
  const [passiveRestaurantCount, setPassiveRestaurantCount] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // SignalR connection check
  useEffect(() => {
    if (error) {
      console.error('SignalR connection error in Dashboard:', error);
    }
  }, [error]);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate refresh action
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      toast({
        title: 'Çıkış Başarılı',
        description: 'Başarıyla çıkış yapıldı.',
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Çıkış Yapılamadı',
        description: 'Çıkış yapılırken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <div className="border-b bg-muted/50 px-4 py-3">
                    <h3 className="font-medium">Sistem Performansı</h3>
                  </div>
                  <div className="p-4">
                    {metrics ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">CPU Kullanımı</span>
                            <span className="font-medium">{metrics.cpuUsage.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                metrics.cpuUsage > 80 ? 'bg-red-500' : metrics.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${metrics.cpuUsage}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Bellek Kullanımı</span>
                            <span className="font-medium">{metrics.usedMemory.toFixed(1)} GB / {metrics.totalMemory.toFixed(1)} GB</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                (metrics.usedMemory / metrics.totalMemory) * 100 > 80 ? 'bg-red-500' : 
                                (metrics.usedMemory / metrics.totalMemory) * 100 > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(metrics.usedMemory / metrics.totalMemory) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Disk Kullanımı</span>
                            <span className="font-medium">{metrics.diskUsage.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                metrics.diskUsage > 80 ? 'bg-red-500' : metrics.diskUsage > 60 ? 'bg-yellow-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${metrics.diskUsage}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Ağ Trafiği</span>
                            <span className="font-medium">↓{metrics.networkReceived.toFixed(1)} MB/s ↑{metrics.networkSent.toFixed(1)} MB/s</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${((metrics.networkReceived + metrics.networkSent) / 20) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
                          <p className="text-sm text-muted-foreground">Sistem metrikleri yükleniyor...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <div className="border-b bg-muted/50 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-medium">Şube Durumu</h3>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                      {activeRestaurantCount + passiveRestaurantCount} Toplam Şube
                    </Badge>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-green-50 p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Aktif Şubeler</p>
                          <p className="text-2xl font-bold text-green-700">{activeRestaurantCount}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <Activity className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="rounded-lg bg-red-50 p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-600">Pasif Şubeler</p>
                          <p className="text-2xl font-bold text-red-700">{passiveRestaurantCount}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                          <Building2 className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="border-b bg-muted/50 px-4 py-3 flex justify-between items-center">
                  <h3 className="font-medium">Son Sistem Aktiviteleri</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Yenile
                  </Button>
                </div>
                <ScrollArea >
                  <div className="p-4 space-y-3">
                    {logs && logs.length > 0 ? (
                      logs.map((log, index) => (
                        <div key={index} className="border-b border-border pb-3 last:border-0 last:pb-0">
                          <div className="flex items-start gap-2">
                            <div className={`p-1.5 rounded-full mt-0.5 ${
                              log.level === 'Error' ? 'bg-red-100 text-red-600' : 
                              log.level === 'Warning' ? 'bg-yellow-100 text-yellow-600' : 
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{log.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-normal py-0 h-5">
                                  {log.level}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : logsError ? (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-red-500">Log yüklenirken hata: {logsError}</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-sm text-muted-foreground">Henüz log kaydı bulunmuyor</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
             
            <CompanyCards setActiveRestaurantCount={setActiveRestaurantCount} setPassiveRestaurantCount={setPassiveRestaurantCount} />
          </div>
        );
      case "branches":
        return <RestaurantsTable />;
      case "analyse":
        return <AnalyseTab />;
      case "queries":
        return <QueriesTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return null;
    }
  };

  const menuItems = [
    { id: "overview", label: "Genel Bakış", icon: <Home className="h-5 w-5" /> },
    { id: "analyse", label: "Veri Analizi", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "branches", label: "Şubeler", icon: <Building2 className="h-5 w-5" /> },
    { id: "queries", label: "Sorgular", icon: <Database className="h-5 w-5" /> },
    { id: "settings", label: "Ayarlar", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background/95">
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar / Left Menu */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-16 md:w-64 flex-col border-r bg-card/95 backdrop-blur-sm transition-all duration-300 md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center md:justify-start border-b px-0 md:px-6">
          <div className="flex items-center">
            <div className="rounded-md bg-primary/10 p-1 md:mr-2">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <h1 className="hidden md:block text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              RobotPOS
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            <TooltipProvider>
              {menuItems.map((item) => (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start h-11 w-full",
                        activeTab === item.id 
                          ? "bg-secondary text-secondary-foreground" 
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                        "md:px-3 md:py-2 md:justify-start",
                        "flex flex-col md:flex-row items-center"
                      )}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <div className="flex h-9 w-9 items-center justify-center md:h-5 md:w-5 md:mr-3">
                        {item.icon}
                      </div>
                      <span className="hidden md:block">{item.label}</span>
                      {item.id === "analyse" && (
                        <Badge className="hidden md:flex ml-auto bg-primary/20 text-primary hover:bg-primary/30">Yeni</Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="md:hidden">
                    {item.label}
                    {item.id === "analyse" && (
                      <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30">Yeni</Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </div>

        {/* System Status & User */}
        <div className="border-t p-2 md:p-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center justify-center md:justify-start gap-3 p-2 rounded-lg",
                  error ? "bg-red-50" : "bg-green-50"
                )}>
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    error ? "bg-red-500" : "bg-green-500"
                  )} />
                  <span className="hidden md:block text-sm font-medium">
                    {error ? "Bağlantı hatası" : "Sistem çevrimiçi"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden">
                {error ? "Bağlantı hatası" : "Sistem çevrimiçi"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator className="my-2 md:my-4" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center md:justify-start gap-3 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">AD</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">Admin</p>
                    <p className="truncate text-xs text-muted-foreground">admin@robotpos.com</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hidden md:flex ml-auto text-muted-foreground hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="md:hidden">
                <div>
                  <p className="font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">admin@robotpos.com</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Logout Button for Mobile */}
          <div className="md:hidden mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full flex items-center justify-center text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-sm">Çıkış Yap</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">
                {menuItems.find(item => item.id === activeTab)?.label || "Genel Bakış"}
              </h2>
              <Badge variant="outline" className="ml-3 bg-blue-50 text-blue-600 hidden md:flex">
                v1.0.0
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}