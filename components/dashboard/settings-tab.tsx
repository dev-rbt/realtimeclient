import { Card } from '@/components/ui/card';
import { SettingsIcon, ServerIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import useApi from '@/hooks/use-api';
import ConnectionForm from '@/components/dashboard/settings/connection-form';
import ConnectionTable from '@/components/dashboard/settings/connection-table';
import ConnectionTestDialog from '@/components/dashboard/settings/connection-test-dialog';
import DeleteDialog from '@/components/dashboard/settings/delete-dialog';
import { TestResult } from '@/components/dashboard/settings/types';
import { SqlConnection } from '@/store/useConnectionsStore';
import { useConnections } from '@/hooks/useConnections';
import { useConnectionsStore } from '@/store/useConnectionsStore';

const emptyConnection: SqlConnection = {
  id: '',
  name: '',
  host: '',
  port: '',
  dbName: '',
  userName: '',
  password: '',
  trustServerCertificate: true,
  encrypt: true,
  connectTimeout: 30000,
  tenantId: ''
};

export function SettingsTab() {
  const { connections } = useConnections();
  const { fetchConnections } = useConnectionsStore();
  const [editingConnection, setEditingConnection] = useState<SqlConnection | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);
  const [deletingConnection, setDeletingConnection] = useState<SqlConnection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  const handleSave = async (connection: SqlConnection) => {
    try {
      let response;
      if (connection.id) {
        response = await api.put('/connection', connection);
      } else {
        response = await api.post('/connection', connection);
      }

      setEditingConnection(null);
      // Refresh connections from the store after saving
      await fetchConnections();
      
      toast({
        title: "Başarılı",
        description: "SQL Server bağlantısı kaydedildi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.response?.data?.message || "SQL Server bağlantısı kaydedilemedi.",
        variant: "destructive"
      });
    }
  };

  const handleTest = async (connection: SqlConnection) => {
    setIsTestingConnection(connection.id);
    try {
      await api.post('/connection/test', {
        name: connection.name,
        host: connection.host,
        port: connection.port,
        dbName: connection.dbName,
        userName: connection.userName,
        password: connection.password,
        trustServerCertificate: connection.trustServerCertificate,
        encrypt: connection.encrypt,
        connectTimeout: connection.connectTimeout,
        tenantId: connection.tenantId
      });

      setTestResult({
        success: true,
        message: "Bağlantı başarılı! Veritabanına erişilebiliyor."
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || "Bağlantı testi başarısız! Veritabanına erişilemiyor."
      });
    } finally {
      setIsTestingConnection(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingConnection) return;

    setIsDeleting(true);
    try {
      await api.delete(`/connection/${deletingConnection.id}`);
      setDeletingConnection(null);
      
      // Refresh connections from the store after deleting
      await fetchConnections();
      
      toast({
        title: "Başarılı",
        description: "SQL Server bağlantısı silindi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.response?.data?.message || "SQL Server bağlantısı silinemedi.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <SettingsIcon className="w-5 h-5 mr-2 text-primary" />
        Sistem Ayarları
      </h2>
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <ServerIcon className="w-4 h-4 mr-2 text-primary" />
              SQL Server Bağlantıları
            </h3>
            <Dialog open={!!editingConnection} onOpenChange={(open) => !open && setEditingConnection(null)}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingConnection(emptyConnection)}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Yeni Bağlantı
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingConnection?.id ? 'Bağlantıyı Düzenle' : 'Yeni Bağlantı'}
                  </DialogTitle>
                </DialogHeader>
                {editingConnection && (
                  <ConnectionForm
                    connection={editingConnection}
                    onSave={handleSave}
                    onCancel={() => setEditingConnection(null)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>

          <ConnectionTable
            connections={connections}
            onEdit={setEditingConnection}
            onDelete={setDeletingConnection}
            onTest={handleTest}
            isTestingConnection={isTestingConnection || undefined}
          />
        </div>
      </div>

      <ConnectionTestDialog
        testResult={testResult}
        onOpenChange={(open) => !open && setTestResult(null)}
      />

      <DeleteDialog
        isOpen={!!deletingConnection}
        isDeleting={isDeleting}
        onOpenChange={(open) => !open && setDeletingConnection(null)}
        onConfirm={handleDelete}
      />
    </Card>
  );
}