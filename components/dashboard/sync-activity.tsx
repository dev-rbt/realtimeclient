import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface SyncActivityProps {
  data: Array<{
    time: number;
    documents: number;
  }>;
}

export function SyncActivity({ data }: SyncActivityProps) {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-primary" />
        Senkronizasyon Aktivitesi
      </h2>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.slice(-20)}>
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
  );
}