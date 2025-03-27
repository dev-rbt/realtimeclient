import { Card } from '@/components/ui/card';
import { SettingsIcon, ServerIcon, PlusIcon, CopyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import useApi from '@/hooks/use-api';
import ConnectionForm from '@/components/dashboard/settings/connection-form';
import ConnectionTable from '@/components/dashboard/settings/connection-table';
import ConnectionTestDialog from '@/components/dashboard/settings/connection-test-dialog';
import DeleteDialog from '@/components/dashboard/settings/delete-dialog';
import { TestResult, CreateConnectionModel, UpdateConnectionModel, SqlConnection } from '@/components/dashboard/settings/types';
import { useConnections } from '@/hooks/useConnections';
import { useConnectionsStore } from '@/store/useConnectionsStore';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

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
  tenantId: '',
  sameSourceAndTarget: true,
  targetModel: undefined
};

export function SettingsTab() {
  const { connections } = useConnections();
  const { fetchConnections } = useConnectionsStore();
  const [editingConnection, setEditingConnection] = useState<SqlConnection | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<SqlConnection | null>(null);
  const [connectionToTest, setConnectionToTest] = useState<SqlConnection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const api = useApi();

  const handleSaveConnection = async (connectionData: CreateConnectionModel | UpdateConnectionModel) => {
    try {
      if ('id' in connectionData && connectionData.id) {
        // Update existing connection
        await api.put('/connection', connectionData);
        toast({
          title: "Başarılı",
          description: "SQL Server bağlantısı güncellendi.",
        });
      } else {
        // Create new connection
        await api.post('/connection', connectionData);
        toast({
          title: "Başarılı",
          description: "SQL Server bağlantısı oluşturuldu.",
        });
      }
      
      // Refresh connections list
      await fetchConnections();
      
      // Close dialog
      setEditingConnection(null);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.response?.data?.message || "SQL Server bağlantısı kaydedilemedi.",
        variant: "destructive"
      });
    }
  };

  const handleTest = async (connection: SqlConnection) => {
    setConnectionToTest(connection);
    setTestDialogOpen(true);
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
        tenantId: connection.tenantId,
        sameSourceAndTarget: connection.sameSourceAndTarget
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
    }
  };

  const handleDelete = async () => {
    if (!connectionToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/connection/${connectionToDelete.id}`);
      setConnectionToDelete(null);
      
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

  // Function to copy an existing connection to the current editing connection
  const handleCopyConnection = (sourceConnection: SqlConnection) => {
    if (!editingConnection) return;
    
    // Create a deep copy of the source connection
    const connectionCopy: SqlConnection = {
      ...sourceConnection,
      id: editingConnection.id, // Keep the current ID (empty for new connections)
      name: editingConnection.id ? editingConnection.name : `${sourceConnection.name} (Kopya)` // Suggest a name for new connections
    };
    
    setEditingConnection(connectionCopy);
  };

  return (
    <Card className="p-3 md:p-6 bg-card/50 backdrop-blur-sm">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-6 flex items-center">
        <SettingsIcon className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 text-primary" />
        Sistem Ayarları
      </h2>
      <div className="space-y-4 md:space-y-8">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 md:mb-4">
            <h3 className="text-base md:text-lg font-medium flex items-center">
              <ServerIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 text-primary" />
              SQL Server Bağlantıları
            </h3>
            <Dialog open={!!editingConnection} onOpenChange={(open) => !open && setEditingConnection(null)}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto" onClick={() => setEditingConnection(emptyConnection)}>
                  <PlusIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                  Yeni Bağlantı
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex flex-row items-center justify-between">
                  <DialogTitle>
                    {editingConnection?.id ? 'Bağlantıyı Düzenle' : 'Yeni Bağlantı'}
                  </DialogTitle>
                  
                  {connections.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-2">
                          <CopyIcon className="h-4 w-4 mr-1.5" />
                          Bağlantı Kopyala
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Mevcut Bağlantılar</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {connections.map((conn) => (
                          <DropdownMenuItem 
                            key={conn.id}
                            onClick={() => handleCopyConnection(conn)}
                            className="cursor-pointer"
                          >
                            <ServerIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="truncate">{conn.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </DialogHeader>
                <div className="overflow-y-auto pr-1 -mr-1">
                  {editingConnection && (
                    <ConnectionForm
                      connection={editingConnection}
                      onSave={handleSaveConnection}
                      onCancel={() => setEditingConnection(null)}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <ConnectionTable
            connections={connections}
            onEdit={setEditingConnection}
            onDelete={setConnectionToDelete}
            onTest={handleTest}
            connectionToTest={connectionToTest}
          />
        </div>
      </div>

      <ConnectionTestDialog
        testResult={testResult}
        isOpen={testDialogOpen}
        onOpenChange={(open) => !open && setTestDialogOpen(false)}
      />

      <DeleteDialog
        isOpen={!!connectionToDelete}
        isDeleting={isDeleting}
        onOpenChange={(open) => !open && setConnectionToDelete(null)}
        onConfirm={handleDelete}
      />
    </Card>
  );
}