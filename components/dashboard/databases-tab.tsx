import { Card } from '@/components/ui/card';
import { DatabaseConnection } from '@/lib/types';
import { Database, Cpu, MemoryStick as Memory, HardDrive } from 'lucide-react';

interface DatabasesTabProps {
  databases: DatabaseConnection[];
}

export function DatabasesTab({ databases }: DatabasesTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {databases.map(db => (
        <Card key={db.id} className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold flex items-center">
                <Database className="w-5 h-5 mr-2 text-primary" />
                {db.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{db.host}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm ${
              db.status === 'active' ? 'bg-green-500/10 text-green-500' :
              db.status === 'error' ? 'bg-red-500/10 text-red-500' :
              'bg-yellow-500/10 text-yellow-500'
            }`}>
              {db.status === 'active' ? 'Aktif' :
               db.status === 'error' ? 'Hata' :
               'Bakımda'}
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">Bağlantılar</p>
                <p className="text-lg font-bold">{db.performance.connections}</p>
              </div>
              <div className="bg-background/50 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">Aktif Sorgular</p>
                <p className="text-lg font-bold">{db.performance.activeQueries}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">CPU Kullanımı</span>
                  <span className="font-medium">{db.performance.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${db.performance.cpuUsage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Bellek Kullanımı</span>
                  <span className="font-medium">{db.performance.memoryUsage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${db.performance.memoryUsage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Disk Kullanımı</span>
                  <span className="font-medium">{db.performance.diskUsage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${db.performance.diskUsage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}