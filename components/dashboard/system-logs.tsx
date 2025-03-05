'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Define log types
type LogLevel = 'info' | 'warning' | 'error' | 'success';

interface SystemLog {
  id: string;
  message: string;
  timestamp: Date;
  level: LogLevel;
}

// Generate fake logs
const generateFakeLog = (): SystemLog => {
  const levels: LogLevel[] = ['info', 'warning', 'error', 'success'];
  const messages = [
    'Veritabanı bağlantısı başarılı',
    'Şube senkronizasyonu tamamlandı',
    'API isteği zaman aşımına uğradı',
    'Yeni belge alındı',
    'Belge işleme hatası',
    'Sistem yeniden başlatıldı',
    'Bağlantı koptu, yeniden deneniyor',
    'Bellek kullanımı yüksek',
    'Disk alanı azalıyor',
    'Yeni şube eklendi',
    'Şube verisi güncellendi',
    'Kullanıcı oturumu başladı',
    'Sistem güncellemesi mevcut',
    'Yedekleme tamamlandı',
  ];

  return {
    id: Math.random().toString(36).substring(2, 9),
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date(),
    level: levels[Math.floor(Math.random() * levels.length)],
  };
};

export function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    // Initial logs
    const initialLogs = Array(10)
      .fill(null)
      .map(() => generateFakeLog())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setLogs(initialLogs);

    // Add new logs periodically
    const interval = setInterval(() => {
      setLogs(prevLogs => {
        const newLog = generateFakeLog();
        return [newLog, ...prevLogs].slice(0, 100); // Keep only the latest 100 logs
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit' 
    });
  };

  // Get badge color based on log level
  const getBadgeVariant = (level: LogLevel) => {
    switch (level) {
      case 'info': return 'secondary';
      case 'warning': return 'warning';
      case 'error': return 'destructive';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Sistem Logları</h2>
        <Badge variant="outline" className="bg-background/50">
          {logs.length} log
        </Badge>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {logs.map(log => (
            <div 
              key={log.id} 
              className={`p-3 rounded-lg max-w-[90%] ${
                log.level === 'error' 
                  ? 'bg-destructive/10 border border-destructive/20' 
                  : log.level === 'warning'
                    ? 'bg-amber-500/10 border border-amber-500/20'
                    : log.level === 'success'
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-secondary/20 border border-secondary/20'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <Badge variant={getBadgeVariant(log.level)} className="text-xs">
                  {log.level.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTime(log.timestamp)}
                </span>
              </div>
              <p className="text-sm">{log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
