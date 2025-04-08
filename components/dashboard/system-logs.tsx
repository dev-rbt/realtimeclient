'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { SystemLog } from '@/lib/types';

export function SystemLogs({ logs, logsError }: { logs: SystemLog[] | null, logsError: string | null }) {
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get badge color based on log level
  const getBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
      case 'information':
        return 'secondary';
      case 'warn':
      case 'warning':
        return 'warning';
      case 'error':
      case 'fatal':
        return 'destructive';
      case 'debug':
        return 'outline';
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };


  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Sistem Logları</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-background/50">
            {logs?.length || 0} log
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearLogs}
            title="Logları Yenile"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {logsError && (
        <div className="p-2 bg-destructive/10 text-destructive text-sm text-center">
          {logsError}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {!logs || logs.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              Henüz log kaydı bulunmuyor. Uygulama işlemleri gerçekleştikçe loglar burada görüntülenecektir.
            </div>
          ) : (
            logs.map(log => (
              <div
                key={log.id}
                className={`p-3 rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity ${log.level === 'error' || log.level === 'fatal'
                    ? 'bg-destructive/10 border border-destructive/20'
                    : log.level === 'warning' || log.level === 'warn'
                      ? 'bg-amber-500/10 border border-amber-500/20'
                      : log.level === 'success'
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-secondary/20 border border-secondary/20'
                  }`}
                onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getBadgeVariant(log.level)} className="text-xs">
                      {log.level.toUpperCase()}
                    </Badge>

                  </div>
                  <span className="text-xs text-muted-foreground">
                    {log.timestamp instanceof Date ? formatTime(log.timestamp) : 'Belirsiz Zaman'}
                  </span>
                </div>
                <p className="text-sm mb-1">{log.message}</p>




                {selectedLog?.id === log.id && log.message && (
                  <div className="mt-2 pt-2 border-t text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(log.message)
                        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                        .map(([key, value]) => (
                          <div key={key} className="overflow-hidden">
                            <span className="font-medium">{key}: </span>
                            <span className="text-muted-foreground truncate">
                              {typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
