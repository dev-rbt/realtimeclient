import { Card } from '@/components/ui/card';
import { SyncData } from '@/lib/types';
import { Activity, FileStack } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

interface SyncTabProps {
  recentSyncs: SyncData[];
}

export function SyncTab({ recentSyncs }: SyncTabProps) {
  const syncTypeData = recentSyncs.reduce((acc, sync) => {
    acc[sync.syncType] = (acc[sync.syncType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(syncTypeData).map(([name, value]) => ({ name, value }));

  const formattedSyncData = recentSyncs.map(sync => ({
    time: new Date(sync.timestamp).getTime(),
    documents: sync.documentsProcessed
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-primary" />
            Senkronizasyon Performansı
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedSyncData.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis 
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                  formatter={(value: number) => [`${value} döküman`, 'İşlenen']}
                />
                <Area
                  type="monotone"
                  dataKey="documents"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <FileStack className="w-5 h-5 mr-2 text-primary" />
            Senkronizasyon Türü Dağılımı
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-primary" />
          Son Senkronizasyonlar
        </h2>
        <div className="space-y-4">
          {recentSyncs.slice(0, 5).map((sync, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
              <div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    sync.status === 'success' ? 'bg-green-500' :
                    sync.status === 'error' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  <p className="font-medium">Senkronizasyon #{sync.restaurantId}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sync.source} → {sync.destination}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-8 text-sm">
                <div className="bg-background/50 px-4 py-2 rounded-lg">
                  <p className="text-muted-foreground">İşlenen</p>
                  <p className="font-medium">{sync.documentsProcessed} döküman</p>
                </div>
                <div className="bg-background/50 px-4 py-2 rounded-lg">
                  <p className="text-muted-foreground">Süre</p>
                  <p className="font-medium">{(sync.syncDuration / 1000).toFixed(2)}s</p>
                </div>
                <div className="bg-background/50 px-4 py-2 rounded-lg">
                  <p className="text-muted-foreground">Tür</p>
                  <p className="font-medium">{sync.syncType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}