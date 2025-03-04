import { Card } from '@/components/ui/card';
import { History, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AuditLog } from '@/lib/types';

interface RecentActivitiesProps {
  logs: AuditLog[];
}

export function RecentActivities({ logs }: RecentActivitiesProps) {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <History className="w-5 h-5 mr-2 text-primary" />
        Son Aktiviteler
      </h2>
      <div className="space-y-4">
        {logs.slice(0, 5).map(log => (
          <div key={log.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-4">
              {log.status === 'success' && (
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              )}
              {log.status === 'error' && (
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
              {log.status === 'warning' && (
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
              )}
              <div>
                <p className="font-medium">{log.description}</p>
                <p className="text-sm text-muted-foreground">
                  {log.source} → {log.destination}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground bg-background/50 px-3 py-1 rounded-full">
              {log.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}