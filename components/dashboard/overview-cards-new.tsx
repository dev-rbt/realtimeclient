"use client";

import { Building2, Database, Server, Activity, HardDrive, Cpu, MemoryStick } from "lucide-react";
import { SystemMetrics } from "@/lib/types";
import { useConnections } from "@/hooks/useConnections";
import { MetricCard } from "@/components/ui/metric-card";

interface OverviewCardsProps {
  metrics: SystemMetrics | null;
  activeRestaurantCount: number;
  passiveRestaurantCount: number;
}

export function OverviewCardsNew({
  metrics,
  activeRestaurantCount,
  passiveRestaurantCount
}: OverviewCardsProps) {
  const { connections } = useConnections();
  const connectionsCount = connections.length;
  const isLoading = !metrics || connections.length === 0;

  // Format bytes to appropriate unit (KB, MB, GB)
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CPU Usage */}
      <MetricCard
        title="CPU Kullanımı"
        value={metrics ? `${metrics.cpuUsage.toFixed(1)}%` : "0%"}
        icon={<Cpu />}
        description={metrics ? `${metrics.cpuCores} çekirdek` : ""}
        loading={isLoading}
        variant="primary"
      />

      {/* Memory Usage */}
      <MetricCard
        title="Bellek Kullanımı"
        value={metrics ? `${metrics.usedMemory.toFixed(1)} GB` : "0 GB"}
        icon={<MemoryStick />}
        description={metrics ? `Toplam: ${metrics.totalMemory.toFixed(1)} GB` : ""}
        loading={isLoading}
        variant="success"
      />

      {/* Disk Usage */}
      <MetricCard
        title="Disk Kullanımı"
        value={metrics ? `${metrics.diskUsage.toFixed(1)}%` : "0%"}
        icon={<HardDrive />}
        description={metrics ? `${metrics.diskFree.toFixed(1)} GB boş alan` : ""}
        loading={isLoading}
        variant="warning"
      />

      {/* Network Traffic */}
      <MetricCard
        title="Ağ Trafiği"
        value={metrics ? `${metrics.networkReceived.toFixed(1)} MB/s` : "0 MB/s"}
        icon={<Activity />}
        description={metrics ? `↑ ${metrics.networkSent.toFixed(1)} MB/s` : ""}
        loading={isLoading}
        variant="destructive"
      />

      {/* Branches */}
      <MetricCard
        title="Toplam Şubeler"
        value={activeRestaurantCount + passiveRestaurantCount}
        icon={<Building2 />}
        description={`${activeRestaurantCount} aktif, ${passiveRestaurantCount} pasif`}
        loading={isLoading}
        className="md:col-span-2"
      />

      {/* Databases */}
      <MetricCard
        title="Veritabanları"
        value={connectionsCount}
        icon={<Database />}
        description="Bağlı veritabanları"
        loading={isLoading}
        className="md:col-span-2"
      />

      {/* System Uptime */}
      <MetricCard
        title="Sistem Çalışma Süresi"
        value={metrics ? `${metrics.uptime.days}g ${metrics.uptime.hours}s` : "0g 0s"}
        icon={<Server />}
        description={metrics ? `${metrics.uptime.minutes}d ${metrics.uptime.seconds}sn` : ""}
        loading={isLoading}
        className="md:col-span-4"
        variant="primary"
      />
    </div>
  );
}
