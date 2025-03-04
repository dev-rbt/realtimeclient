import { Card } from '@/components/ui/card';
import { Server } from 'lucide-react';
import { SystemMetrics } from '@/lib/types';

interface SystemMetricsCardProps {
  metrics: SystemMetrics | null;
}

export function SystemMetricsCard({ metrics }: SystemMetricsCardProps) {
  if (!metrics) return null;

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Server className="w-5 h-5 mr-2 text-primary" />
        Sistem Performansı
      </h2>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">CPU Kullanımı</span>
            <span className="font-bold">{metrics.cpuUsage.toFixed(1)}%</span>
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
            <span className="text-sm text-muted-foreground">Bellek Kullanımı</span>
            <span className="font-bold">{metrics.memoryUsage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.memoryUsage}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Ağ Gecikmesi</span>
            <span className="font-bold">{metrics.networkLatency.toFixed(0)}ms</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(metrics.networkLatency) / 2}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}