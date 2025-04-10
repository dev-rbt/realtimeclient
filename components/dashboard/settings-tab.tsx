import { 
  ServerIcon, 
  PlusIcon, 
  CopyIcon, 
  X, 
  CheckCircle2Icon, 
  AlertCircleIcon,
  ChevronRightIcon,
  SearchIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import useApi from '@/hooks/use-api';
import ConnectionForm from '@/components/dashboard/settings/connection-form';
import ConnectionTable from '@/components/dashboard/settings/connection-table';
import ConnectionTestDialog from '@/components/dashboard/settings/connection-test-dialog';
import DeleteDialog from '@/components/dashboard/settings/delete-dialog';
import { TestResult, CreateConnectionModel, UpdateConnectionModel, SqlConnection } from '@/components/dashboard/settings/types';
import { useConnections } from '@/hooks/useConnections';
import { useConnectionsStore } from '@/store/useConnectionsStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
  targetConnection: undefined,
  useNewComboMenu: true,
  useCouponService: true,
  workerIsEnabled: true,
  cpmNotAllowGetData: false
};

export function SettingsTab() {
  const { connections } = useConnections();
  const { fetchConnections } = useConnectionsStore();
  const [editingConnection, setEditingConnection] = useState<SqlConnection | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<SqlConnection | null>(null);
  const [connectionToTest, setConnectionToTest] = useState<SqlConnection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const api = useApi();

  // Filtered connections based on search
  const filteredConnections = connections.filter(conn => 
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    conn.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conn.tenantId && conn.tenantId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveConnection = async (connectionData: CreateConnectionModel | UpdateConnectionModel) => {
    try {
      if ('id' in connectionData && connectionData.id) {
        // Update existing connection
        // Önce bağlantıyı güncelle
        await api.put('/connection', {
          id: connectionData.id,
          name: connectionData.name,
          host: connectionData.host,
          port: connectionData.port,
          dbName: connectionData.dbName,
          userName: connectionData.userName,
          password: connectionData.password,
          trustServerCertificate: connectionData.trustServerCertificate,
          encrypt: connectionData.encrypt,
          connectTimeout: connectionData.connectTimeout,
          tenantId: connectionData.tenantId,
          sameSourceAndTarget: connectionData.sameSourceAndTarget,
          targetConnection: connectionData.targetConnection
        });
        
        // Sonra tenant ayarlarını güncelle
        await api.put('/tenantSettings', {
          tenantId: connectionData.tenantId,
          useNewComboMenu: connectionData.useNewComboMenu,
          useCouponService: connectionData.useCouponService,
          workerIsEnabled: connectionData.workerIsEnabled,
          cpmNotAllowGetData: connectionData.cpmNotAllowGetData
        });
        
        toast({
          title: "Başarılı",
          description: "SQL Server bağlantısı ve firma ayarları güncellendi.",
        });
      } else {
        // Create new connection
        // Önce bağlantıyı oluştur
        await api.post('/connection', {
          name: connectionData.name,
          host: connectionData.host,
          port: connectionData.port,
          dbName: connectionData.dbName,
          userName: connectionData.userName,
          password: connectionData.password,
          trustServerCertificate: connectionData.trustServerCertificate,
          encrypt: connectionData.encrypt,
          connectTimeout: connectionData.connectTimeout,
          tenantId: connectionData.tenantId,
          sameSourceAndTarget: connectionData.sameSourceAndTarget,
          targetConnection: connectionData.targetConnection
        });
        
        // Sonra tenant ayarlarını oluştur
        await api.post('/tenantSettings', {
          tenantId: connectionData.tenantId,
          useNewComboMenu: connectionData.useNewComboMenu,
          useCouponService: connectionData.useCouponService,
          workerIsEnabled: connectionData.workerIsEnabled,
          cpmNotAllowGetData: connectionData.cpmNotAllowGetData
        });
        
        toast({
          title: "Başarılı",
          description: "SQL Server bağlantısı ve firma ayarları oluşturuldu.",
        });
      }
      
      // Refresh connections list
      await fetchConnections();
      
      // Close dialog
      closeEditDialog();
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

      // If sameSourceAndTarget is false, also test the target connection
      if (!connection.sameSourceAndTarget && connection.targetConnection) {
        await api.post('/connection/test', {
          name: connection.targetConnection.name,
          host: connection.targetConnection.host,
          port: connection.targetConnection.port,
          dbName: connection.targetConnection.dbName,
          userName: connection.targetConnection.userName,
          password: connection.targetConnection.password,
          trustServerCertificate: connection.targetConnection.trustServerCertificate,
          sameSourceAndTarget: false,
          encrypt: connection.targetConnection.encrypt,
          connectTimeout: connection.targetConnection.connectTimeout,
          tenantId: connection.tenantId
        });
      }

      setTestResult({
        success: true,
        message: "Bağlantı başarılı! Veritabanına erişilebiliyor."
      });
      
      // Close the test dialog after successful test
      setTimeout(() => {
        setTestDialogOpen(false);
        setConnectionToTest(null);
        setTestResult(null);
      }, 1500);
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

  // Function to open the edit dialog with a connection
  const openEditDialog = (connection: SqlConnection) => {
    setEditingConnection({
      ...connection,
      // Eğer bu alanlar tanımlı değilse, varsayılan değerleri ata
      useNewComboMenu: connection.useNewComboMenu ?? true,
      useCouponService: connection.useCouponService ?? true,
      workerIsEnabled: connection.workerIsEnabled ?? true,
      cpmNotAllowGetData: connection.cpmNotAllowGetData ?? false
    });
    setEditDialogOpen(true);
    // Sayfanın scroll edilmesini engelle
    document.body.style.overflow = 'hidden';
  };

  // Function to handle dialog close
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    // Scroll'u geri etkinleştir
    document.body.style.overflow = 'auto';
    // Temizlemeyi geciktir
    setTimeout(() => {
      setEditingConnection(null);
    }, 300);
  };

  // Function to handle form cancel
  const handleFormCancel = () => {
    closeEditDialog();
  };

  // ESC tuşu ile modalı kapatma
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editDialogOpen) {
        closeEditDialog();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [editDialogOpen]);

  // Function to handle connection settings change
  const handleConnectionSettingChange = (field: string, value: any) => {
    if (editingConnection) {
      setEditingConnection({
        ...editingConnection,
        [field]: value
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-medium flex items-center text-foreground">
            <ServerIcon className="w-3.5 h-3.5 mr-2 text-primary" />
            SQL Server Bağlantıları
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Bağlantı ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full bg-background/60 text-sm h-9"
              />
            </div>
            <Button 
              onClick={() => openEditDialog(emptyConnection)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-sm text-sm h-9"
            >
              <PlusIcon className="w-3.5 h-3.5 mr-2" />
              Yeni Bağlantı
            </Button>
          </div>
        </div>
        
        {/* Connection Table */}
        <div className="bg-background/60 rounded-lg border border-border/50 shadow-sm overflow-hidden">
          <ConnectionTable
            connections={filteredConnections}
            onEdit={openEditDialog}
            onDelete={setConnectionToDelete}
            onTest={handleTest}
            isTestingConnection={connectionToTest?.id}
          />
          
          {filteredConnections.length === 0 && searchQuery && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <SearchIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p>"{searchQuery}" ile eşleşen bağlantı bulunamadı.</p>
              <p className="text-xs">Farklı bir arama terimi deneyin.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Connection Dialog - Custom Modal */}
      {editDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop / Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
            onClick={closeEditDialog}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 w-[95vw] sm:w-[600px] max-h-[90vh] bg-background rounded-xl shadow-lg flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-base font-medium flex items-center">
                <ServerIcon className="w-4 h-4 mr-2 text-primary" />
                {editingConnection?.id ? 'Bağlantıyı Düzenle' : 'Yeni Bağlantı'}
              </h3>
              
              <div className="flex items-center gap-2">
                {connections.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 transition-all duration-200 text-xs h-8">
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Bağlantı Kopyala</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-xs">Mevcut Bağlantılar</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-[300px] overflow-auto">
                        {connections.map((conn) => (
                          <DropdownMenuItem 
                            key={conn.id}
                            onClick={() => handleCopyConnection(conn)}
                            className="cursor-pointer flex items-center gap-2 py-2 text-xs"
                          >
                            <ServerIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium truncate">{conn.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate">{conn.host}, {conn.dbName}</span>
                            </div>
                            <ChevronRightIcon className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-muted transition-colors duration-200" 
                  onClick={closeEditDialog}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto p-4">
              {editingConnection && (
                <>
                  {/* Yeni ayarlar bölümü */}
                  <div className="mb-4 bg-muted/30 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Firma Ayarları</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-medium mb-2">Yeni Kombo Menü</h5>
                        <RadioGroup 
                          value={editingConnection.useNewComboMenu ? "true" : "false"}
                          onValueChange={(value) => handleConnectionSettingChange('useNewComboMenu', value === "true")}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="combo-true" />
                            <Label htmlFor="combo-true" className="text-xs cursor-pointer">Kullanılsın</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="combo-false" />
                            <Label htmlFor="combo-false" className="text-xs cursor-pointer">Kullanılmasın</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium mb-2">Kupon Servisi</h5>
                        <RadioGroup 
                          value={editingConnection.useCouponService ? "true" : "false"}
                          onValueChange={(value) => handleConnectionSettingChange('useCouponService', value === "true")}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="coupon-true" />
                            <Label htmlFor="coupon-true" className="text-xs cursor-pointer">Kullanılsın</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="coupon-false" />
                            <Label htmlFor="coupon-false" className="text-xs cursor-pointer">Kullanılmasın</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium mb-2">Worker</h5>
                        <RadioGroup 
                          value={editingConnection.workerIsEnabled ? "true" : "false"}
                          onValueChange={(value) => handleConnectionSettingChange('workerIsEnabled', value === "true")}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="worker-true" />
                            <Label htmlFor="worker-true" className="text-xs cursor-pointer">Aktif</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="worker-false" />
                            <Label htmlFor="worker-false" className="text-xs cursor-pointer">Pasif</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium mb-2">Veri Çekme</h5>
                        <RadioGroup 
                          value={editingConnection.cpmNotAllowGetData ? "true" : "false"}
                          onValueChange={(value) => handleConnectionSettingChange('cpmNotAllowGetData', value === "true")}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="fetch-false" />
                            <Label htmlFor="fetch-false" className="text-xs cursor-pointer">Çekilebilsin</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="fetch-true" />
                            <Label htmlFor="fetch-true" className="text-xs cursor-pointer">Çekilemesin</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <ConnectionForm
                    connection={editingConnection}
                    onSave={handleSaveConnection}
                    onCancel={handleFormCancel}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Connection Test Dialog */}
      {testDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTestDialogOpen(false)} />
          <div className="relative z-10 w-[95vw] sm:w-[400px] bg-background rounded-xl shadow-lg p-5 animate-in zoom-in-90 duration-200">
            <div className="text-center">
              <h3 className="text-base font-medium mb-3">Bağlantı Testi</h3>
              
              {!testResult ? (
                <div className="py-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-sm">Bağlantı test ediliyor...</p>
                </div>
              ) : testResult.success ? (
                <div className="py-4">
                  <CheckCircle2Icon className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-green-600 font-medium">{testResult.message}</p>
                </div>
              ) : (
                <div className="py-4">
                  <AlertCircleIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
                  <p className="text-sm text-red-600 font-medium">Bağlantı Hatası</p>
                  <p className="text-xs text-muted-foreground mt-2">{testResult.message}</p>
                </div>
              )}
              
              <Button 
                onClick={() => {
                  setTestDialogOpen(false);
                  setConnectionToTest(null);
                  setTestResult(null);
                }}
                className="mt-3 text-xs h-8"
                variant={testResult?.success ? "outline" : "default"}
              >
                Kapat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Dialog */}
      {connectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setConnectionToDelete(null)} />
          <div className="relative z-10 w-[95vw] sm:w-[400px] bg-background rounded-xl shadow-lg p-5 animate-in zoom-in-90 duration-200">
            <div className="text-center">
              <AlertCircleIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-base font-medium mb-2">Bağlantıyı Sil</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>{connectionToDelete.name}</strong> bağlantısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              
              <div className="flex justify-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setConnectionToDelete(null)}
                  disabled={isDeleting}
                  className="text-xs h-8"
                >
                  İptal
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-xs h-8"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
                      Siliniyor...
                    </>
                  ) : (
                    'Sil'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}