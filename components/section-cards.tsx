import { TrendingDownIcon, TrendingUpIcon, Cpu, HardDrive, MemoryStick, Building2, Network, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { SystemMetrics } from "@/lib/types"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SectionCardsProps {
  metrics: SystemMetrics | null;
  activeRestaurantCount: number;
  passiveRestaurantCount: number;
}

export function SectionCards({ metrics, activeRestaurantCount, passiveRestaurantCount }: SectionCardsProps) {
  const isLoading = !metrics;
  const totalRestaurants = activeRestaurantCount + passiveRestaurantCount;
  const activePercentage = totalRestaurants > 0 
    ? Math.round((activeRestaurantCount / totalRestaurants) * 100) 
    : 0;
  
  // Add animated counters for metrics
  const [animatedCpuUsage, setAnimatedCpuUsage] = useState("0");
  const [animatedMemoryUsed, setAnimatedMemoryUsed] = useState("0");
  const [animatedDiskUsage, setAnimatedDiskUsage] = useState("0");
  const [animatedNetworkReceived, setAnimatedNetworkReceived] = useState("0");
  
  // Animate values when metrics change
  useEffect(() => {
    if (isLoading) return;
    
    const cpuTarget = Number(getCpuUsage());
    const memoryTarget = Number(getUsedMemory());
    const diskTarget = Number(getDiskUsage());
    const networkTarget = Number(getNetworkReceived());
    
    let startTime: number | null = null;
    const duration = 1000; // 1 second animation
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setAnimatedCpuUsage((cpuTarget * progress).toFixed(1));
      setAnimatedMemoryUsed((memoryTarget * progress).toFixed(1));
      setAnimatedDiskUsage((diskTarget * progress).toFixed(1));
      setAnimatedNetworkReceived((networkTarget * progress).toFixed(1));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [metrics]);

  // Format uptime string safely
  const getUptimeString = () => {
    if (!metrics || !metrics.uptime) return "";
    const { days = 0, hours = 0 } = metrics.uptime;
    return `${days} gün ${hours} saat çalışıyor`;
  };

  // Safe access to metrics properties with default values
  const getCpuUsage = () => metrics?.cpuUsage?.toFixed(1) ?? "0";
  const getCpuCores = () => metrics?.cpuCores ?? 0;
  const getUsedMemory = () => metrics?.usedMemory?.toFixed(1) ?? "0";
  const getTotalMemory = () => metrics?.totalMemory?.toFixed(1) ?? "0";
  const getFreeMemory = () => metrics?.freeMemory?.toFixed(1) ?? "0";
  const getDiskUsage = () => metrics?.diskUsage?.toFixed(1) ?? "0";
  const getDiskFree = () => metrics?.diskFree?.toFixed(1) ?? "0";
  const getNetworkReceived = () => metrics?.networkReceived?.toFixed(1) ?? "0";
  const getNetworkSent = () => metrics?.networkSent?.toFixed(1) ?? "0";

  // Get color based on usage percentage
  const getProgressColor = (percentage: number, thresholds = { warning: 70, critical: 90 }) => {
    const value = Number(percentage);
    if (value >= thresholds.critical) return "bg-destructive";
    if (value >= thresholds.warning) return "bg-warning";
    return "bg-primary";
  };
  
  // Get status icon based on usage
  const getStatusIcon = (percentage: number, thresholds = { warning: 70, critical: 90 }) => {
    const value = Number(percentage);
    if (value >= thresholds.critical) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (value >= thresholds.warning) {
      return <AlertCircle className="h-4 w-4 text-warning" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 lg:px-6">
        {/* CPU Card */}
        <Card className="group overflow-hidden border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="flex items-center text-sm font-medium">
                <Cpu className="mr-2 h-4 w-4 text-primary group-hover:animate-pulse" />
                CPU Kullanımı
              </CardDescription>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {isLoading ? "-" : `${getCpuCores()} Çekirdek`}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold mt-2 flex items-center">
              {isLoading ? "Yükleniyor..." : (
                <>
                  <span className="tabular-nums">{animatedCpuUsage}%</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-2">
                        {getStatusIcon(Number(getCpuUsage()))}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {Number(getCpuUsage()) > 90 
                          ? "Kritik CPU kullanımı" 
                          : Number(getCpuUsage()) > 70
                            ? "Yüksek CPU kullanımı"
                            : "Normal CPU kullanımı"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="mt-2 space-y-2">
              <Progress 
                value={Number(getCpuUsage())} 
                max={100} 
                className={`h-2 ${getProgressColor(Number(getCpuUsage()))}`} 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {isLoading ? "Yükleniyor..." : getUptimeString()}
            </div>
          </CardFooter>
        </Card>

        {/* Memory Card */}
        <Card className="group overflow-hidden border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="flex items-center text-sm font-medium">
                <MemoryStick className="mr-2 h-4 w-4 text-indigo-500 group-hover:animate-pulse" />
                Bellek Kullanımı
              </CardDescription>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500">
                {isLoading ? "-" : `${getTotalMemory()} GB`}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold mt-2 flex items-center">
              {isLoading ? "Yükleniyor..." : (
                <>
                  <span className="tabular-nums">{animatedMemoryUsed} GB</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-2">
                        {getStatusIcon(
                          (Number(getUsedMemory()) / Number(getTotalMemory())) * 100, 
                          { warning: 70, critical: 85 }
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {Number(getUsedMemory()) / Number(getTotalMemory()) > 0.85 
                          ? "Kritik bellek kullanımı" 
                          : Number(getUsedMemory()) / Number(getTotalMemory()) > 0.7
                            ? "Yüksek bellek kullanımı"
                            : "Normal bellek kullanımı"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="mt-2 space-y-2">
              <Progress 
                value={Number(getUsedMemory())} 
                max={Number(getTotalMemory())} 
                className={`h-2 ${getProgressColor(
                  (Number(getUsedMemory()) / Number(getTotalMemory())) * 100,
                  { warning: 70, critical: 85 }
                )}`} 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Kullanılan: {getUsedMemory()} GB</span>
                <span>Boş: {getFreeMemory()} GB</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="flex items-center">
                {Number(getUsedMemory()) / Number(getTotalMemory()) > 0.8 ? (
                  <TrendingUpIcon className="mr-1 h-3 w-3 text-destructive" />
                ) : (
                  <TrendingDownIcon className="mr-1 h-3 w-3 text-green-500" />
                )}
                {isLoading ? "Yükleniyor..." : 
                  Number(getUsedMemory()) / Number(getTotalMemory()) > 0.8 ? 
                    "Yüksek bellek kullanımı" : 
                    "Normal bellek kullanımı"}
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Disk Card */}
        <Card className="group overflow-hidden border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="flex items-center text-sm font-medium">
                <HardDrive className="mr-2 h-4 w-4 text-amber-500 group-hover:animate-pulse" />
                Disk Kullanımı
              </CardDescription>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                {isLoading ? "-" : `${getDiskFree()} GB Boş`}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold mt-2 flex items-center">
              {isLoading ? "Yükleniyor..." : (
                <>
                  <span className="tabular-nums">{animatedDiskUsage}%</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-2">
                        {getStatusIcon(Number(getDiskUsage()), { warning: 75, critical: 90 })}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {Number(getDiskUsage()) > 90 
                          ? "Kritik disk kullanımı" 
                          : Number(getDiskUsage()) > 75
                            ? "Yüksek disk kullanımı"
                            : "Normal disk kullanımı"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="mt-2 space-y-2">
              <Progress 
                value={Number(getDiskUsage())} 
                max={100} 
                className={`h-2 ${getProgressColor(Number(getDiskUsage()), { warning: 75, critical: 90 })}`} 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex items-center text-xs text-muted-foreground">
              {isLoading ? "Yükleniyor..." : Number(getDiskUsage()) > 90 
                ? <span className="text-destructive flex items-center"><AlertCircle className="mr-1 h-3 w-3" /> Disk alanı temizlenmeli</span> 
                : <span className="text-green-500 flex items-center"><CheckCircle2 className="mr-1 h-3 w-3" /> Yeterli disk alanı mevcut</span>}
            </div>
          </CardFooter>
        </Card>

        {/* Network Card */}
        <Card className="group overflow-hidden border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="flex items-center text-sm font-medium">
                <Network className="mr-2 h-4 w-4 text-cyan-500 group-hover:animate-pulse" />
                Ağ Trafiği
              </CardDescription>
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500">
                Gerçek Zamanlı
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold mt-2 flex items-center">
              {isLoading ? "Yükleniyor..." : (
                <span className="tabular-nums">{animatedNetworkReceived} MB/s</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-cyan-500">Gelen</span>
                <span className="text-purple-500">Giden</span>
              </div>
              <div className="flex gap-2 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1">
                      <Progress 
                        value={Number(getNetworkReceived())} 
                        max={Math.max(Number(getNetworkReceived()) * 1.5, 1)} 
                        className="h-2 bg-cyan-500" 
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gelen: {getNetworkReceived()} MB/s</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1">
                      <Progress 
                        value={Number(getNetworkSent())} 
                        max={Math.max(Number(getNetworkSent()) * 1.5, 1)} 
                        className="h-2 bg-purple-500" 
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Giden: {getNetworkSent()} MB/s</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>↓ {getNetworkReceived()} MB/s</span>
                <span>↑ {getNetworkSent()} MB/s</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUpIcon className="mr-1 h-3 w-3" />
              Aktif veri transferi
            </div>
          </CardFooter>
        </Card>

        {/* Branches Card - Spans 2 columns */}
        <Card className="group md:col-span-2 overflow-hidden border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="flex items-center text-sm font-medium">
                <Building2 className="mr-2 h-4 w-4 text-green-500 group-hover:animate-pulse" />
                Şube Durumu
              </CardDescription>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                {totalRestaurants} Toplam Şube
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold mt-2 flex items-center">
              <span className="tabular-nums">{activeRestaurantCount}</span>
              <span className="text-sm font-normal text-muted-foreground ml-2">Aktif Şube</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-2">
                    {activePercentage > 80 
                      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                      : <AlertCircle className="h-4 w-4 text-amber-500" />}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {activePercentage > 80 
                      ? "Çoğu şube aktif durumda" 
                      : "Bazı şubeler pasif durumda"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-500">Aktif ({activePercentage}%)</span>
                <span className="text-destructive">Pasif ({100 - activePercentage}%)</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 transition-all duration-500" 
                  style={{ width: `${activePercentage}%` }}
                />
                <div 
                  className="bg-destructive transition-all duration-500" 
                  style={{ width: `${100 - activePercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {passiveRestaurantCount} pasif şube bulunuyor
                </p>
                <Badge variant="outline" className="text-xs">
                  {activePercentage}% aktif oran
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex items-center text-xs text-muted-foreground">
              {activePercentage > 80 ? (
                <>
                  <TrendingUpIcon className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">Çoğu şube aktif durumda</span>
                </>
              ) : (
                <>
                  <TrendingDownIcon className="mr-1 h-3 w-3 text-amber-500" />
                  <span className="text-amber-500">Bazı şubeler pasif durumda</span>
                </>
              )}
            </div>
          </CardFooter>
        </Card>

        {/* System Uptime Card - Spans 2 columns */}
        <Card className="group md:col-span-2 overflow-hidden border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardDescription className="flex items-center text-sm font-medium">
                <Clock className="mr-2 h-4 w-4 text-blue-500 group-hover:animate-pulse" />
                Sistem Çalışma Süresi
              </CardDescription>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                Kesintisiz
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold mt-2">
              {isLoading ? "Yükleniyor..." : getUptimeString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {!isLoading && metrics?.uptime && (
                  <>
                    <div className="bg-blue-500/10 rounded-lg p-2 text-center group-hover:bg-blue-500/20 transition-all duration-300">
                      <p className="text-xl font-bold text-blue-500 tabular-nums">{metrics.uptime.days}</p>
                      <p className="text-xs text-muted-foreground">Gün</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-2 text-center group-hover:bg-blue-500/20 transition-all duration-300">
                      <p className="text-xl font-bold text-blue-500 tabular-nums">{metrics.uptime.hours}</p>
                      <p className="text-xs text-muted-foreground">Saat</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-2 text-center group-hover:bg-blue-500/20 transition-all duration-300">
                      <p className="text-xl font-bold text-blue-500 tabular-nums">{metrics.uptime.minutes}</p>
                      <p className="text-xs text-muted-foreground">Dakika</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-2 text-center group-hover:bg-blue-500/20 transition-all duration-300">
                      <p className="text-xl font-bold text-blue-500 tabular-nums">{metrics.uptime.seconds}</p>
                      <p className="text-xs text-muted-foreground">Saniye</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center text-xs text-muted-foreground">
                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                Sistem kararlı çalışıyor
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                %99.9 Uptime
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  )
}
