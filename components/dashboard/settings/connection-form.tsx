import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { DatabaseIcon, Loader2Icon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import useApi from '@/hooks/use-api';
import { SqlConnection, TestResult, ConnectionTestResult, UpdateConnectionModel, CreateConnectionModel } from '@/components/dashboard/settings/types';
import { useConnections } from '@/hooks/useConnections';

interface ConnectionFormProps {
  connection: SqlConnection;
  onSave: (connection: UpdateConnectionModel | CreateConnectionModel) => Promise<void>;
  onCancel: () => void;
}

export default function ConnectionForm({ connection, onSave, onCancel }: ConnectionFormProps) {
  const [formData, setFormData] = useState<SqlConnection>(connection);
  const [targetFormData, setTargetFormData] = useState<Omit<SqlConnection, 'id' | 'sameSourceAndTarget'>>({
    name: connection.name ? `${connection.name} (Hedef)` : '',
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
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<ConnectionTestResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const api = useApi();
  const { connections } = useConnections();

  useEffect(() => {
    setFormData(connection);
    setTargetFormData({
      name: connection.name ? `${connection.name} (Hedef)` : '',
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
  }, [connection]);

  useEffect(() => {
    if (formData.tenantId) {
      setTargetFormData(prev => ({
        ...prev,
        tenantId: formData.tenantId
      }));
    }
  }, [formData.tenantId]);

  const validateSourceConnection = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.name || !formData.host || !formData.port || !formData.dbName || 
        !formData.userName || !formData.password || !formData.tenantId) {
      errors.push("Lütfen tüm kaynak veritabanı alanlarını doldurun.");
    }

    const isDuplicateTenantId = connections.some(conn => 
      conn.tenantId === formData.tenantId && conn.id !== formData.id
    );

    if (isDuplicateTenantId) {
      errors.push(`Tenant ID "${formData.tenantId}" başka bir bağlantıda kullanılıyor.`);
    }

    setValidationErrors(errors);
    
    if (errors.length > 0) {
      toast({
        title: "Doğrulama Hatası",
        description: errors[0],
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const validateTargetConnection = (): boolean => {
    const errors: string[] = [];
    
    if (!targetFormData.name || !targetFormData.host || !targetFormData.port || !targetFormData.dbName || 
        !targetFormData.userName || !targetFormData.password || !targetFormData.tenantId) {
      errors.push("Lütfen tüm hedef veritabanı alanlarını doldurun.");
    }

    if (formData.tenantId !== targetFormData.tenantId) {
      errors.push("Kaynak ve hedef Tenant ID'leri aynı olmalıdır.");
    }

    setValidationErrors(prev => [...prev, ...errors]);
    
    if (errors.length > 0) {
      toast({
        title: "Doğrulama Hatası",
        description: errors[0],
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const testConnection = async (): Promise<ConnectionTestResult | null> => {
    setIsTesting(true);
    try {
      let sourceResult: TestResult;
      try {
        await api.post('/connection/test', formData);
        sourceResult = {
          success: true,
          message: "Kaynak bağlantı başarılı! Veritabanına erişilebiliyor."
        };
      } catch (error: any) {
        sourceResult = {
          success: false,
          message: error.response?.data?.message || "Kaynak bağlantı testi başarısız! Veritabanına erişilemiyor."
        };
      }

      const results: ConnectionTestResult = {
        source: sourceResult
      };

      if (!formData.sameSourceAndTarget) {
        try {
          const targetTestData = {
            name: targetFormData.name,
            host: targetFormData.host,
            port: targetFormData.port,
            dbName: targetFormData.dbName,
            userName: targetFormData.userName,
            password: targetFormData.password,
            trustServerCertificate: targetFormData.trustServerCertificate,
            encrypt: targetFormData.encrypt,
            connectTimeout: targetFormData.connectTimeout,
            tenantId: targetFormData.tenantId
          };
          
          await api.post('/connection/test', targetTestData);
          results.target = {
            success: true,
            message: "Hedef bağlantı başarılı! Veritabanına erişilebiliyor."
          };
        } catch (error: any) {
          results.target = {
            success: false,
            message: error.response?.data?.message || "Hedef bağlantı testi başarısız! Veritabanına erişilemiyor."
          };
        }
      }

      return results;
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setValidationErrors([]);

    if (!validateSourceConnection()) {
      return;
    }

    if (!formData.sameSourceAndTarget && !validateTargetConnection()) {
      return;
    }

    setIsSaving(true);
    try {
      const results = await testConnection();
      
      if (!results) {
        toast({
          title: "Hata",
          description: "Bağlantı testi yapılamadı.",
          variant: "destructive"
        });
        return;
      }

      setTestResults(results);

      let allSuccess = results.source.success;
      
      if (!formData.sameSourceAndTarget) {
        allSuccess = allSuccess && (results.target?.success || false);
      }
      
      if (!allSuccess) {
        toast({
          title: "Bağlantı Hatası",
          description: "Bağlantı testi başarısız olduğu için kaydetme işlemi iptal edildi.",
          variant: "destructive"
        });
        return;
      }

      const targetModel = {
        name: targetFormData.name,
        host: targetFormData.host,
        port: targetFormData.port,
        dbName: targetFormData.dbName,
        userName: targetFormData.userName,
        password: targetFormData.password,
        trustServerCertificate: targetFormData.trustServerCertificate,
        encrypt: targetFormData.encrypt,
        connectTimeout: targetFormData.connectTimeout
      };

      if (formData.id) {
        const updateModel: UpdateConnectionModel = {
          id: formData.id,
          name: formData.name,
          host: formData.host,
          port: formData.port,
          dbName: formData.dbName,
          userName: formData.userName,
          password: formData.password,
          trustServerCertificate: formData.trustServerCertificate,
          sameSourceAndTarget: formData.sameSourceAndTarget,
          encrypt: formData.encrypt,
          connectTimeout: formData.connectTimeout,
          tenantId: formData.tenantId,
          targetModel: targetModel
        };
        
        await onSave(updateModel);
      } else {
        const createModel: CreateConnectionModel = {
          name: formData.name,
          host: formData.host,
          port: formData.port,
          dbName: formData.dbName,
          userName: formData.userName,
          password: formData.password,
          trustServerCertificate: formData.trustServerCertificate,
          encrypt: formData.encrypt,
          connectTimeout: formData.connectTimeout,
          tenantId: formData.tenantId,
          sameSourceAndTarget: formData.sameSourceAndTarget,
          targetModel: targetModel
        };
        
        await onSave(createModel);
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.response?.data?.message || "Bağlantı kaydedilirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!canTestSourceConnection) {
      toast({
        title: "Hata",
        description: "Kaynak bağlantı testi için sunucu, port, kullanıcı adı ve şifre alanları doldurulmalıdır.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.sameSourceAndTarget && !canTestTargetConnection) {
      toast({
        title: "Hata",
        description: "Hedef bağlantı testi için sunucu, port, kullanıcı adı ve şifre alanları doldurulmalıdır.",
        variant: "destructive"
      });
      return;
    }

    setTestResults(null);
    
    const results = await testConnection();
    if (results) {
      setTestResults(results);
      
      let allSuccess = results.source.success;
      
      if (!formData.sameSourceAndTarget) {
        allSuccess = allSuccess && (results.target?.success || false);
      }
      
      toast({
        title: allSuccess ? "Başarılı" : "Hata",
        description: allSuccess 
          ? "Bağlantı testi başarılı! Tüm veritabanlarına erişilebiliyor." 
          : "Bağlantı testi başarısız! Bir veya daha fazla veritabanına erişilemiyor.",
        variant: allSuccess ? "default" : "destructive"
      });
    }
  };

  const canTestSourceConnection = formData.host && formData.port && formData.userName && formData.password;
  const canTestTargetConnection = targetFormData.host && targetFormData.port && targetFormData.userName && targetFormData.password;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Bağlantı Adı</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Örn: Üretim DB"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="host">Sunucu</Label>
          <Input
            id="host"
            value={formData.host}
            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            placeholder="Örn: localhost"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            value={formData.port}
            onChange={(e) => setFormData({ ...formData, port: e.target.value })}
            placeholder="Örn: 1433"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dbName">Veritabanı</Label>
          <Input
            id="dbName"
            value={formData.dbName}
            onChange={(e) => setFormData({ ...formData, dbName: e.target.value })}
            placeholder="Veritabanı adı"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="userName">Kullanıcı Adı</Label>
          <Input
            id="userName"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            placeholder="Kullanıcı adı"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tenantId">Tenant ID</Label>
          <Input
            id="tenantId"
            value={formData.tenantId}
            onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
            placeholder="Tenant ID"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="connectTimeout">Bağlantı Zaman Aşımı (ms)</Label>
          <Input
            id="connectTimeout"
            type="number"
            value={formData.connectTimeout}
            onChange={(e) => setFormData({ ...formData, connectTimeout: parseInt(e.target.value) })}
            placeholder="30000"
          />
        </div>
        <div className="space-y-2 col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
            <div className="flex items-center space-x-2">
              <Switch
                id="trustServerCertificate"
                checked={formData.trustServerCertificate}
                onCheckedChange={(checked) => setFormData({ ...formData, trustServerCertificate: checked })}
              />
              <Label htmlFor="trustServerCertificate">Sunucu Sertifikasına Güven</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="encrypt"
                checked={formData.encrypt}
                onCheckedChange={(checked) => setFormData({ ...formData, encrypt: checked })}
              />
              <Label htmlFor="encrypt">Şifreleme</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sameSourceAndTarget"
                checked={formData.sameSourceAndTarget}
                onCheckedChange={(checked) => setFormData({ ...formData, sameSourceAndTarget: checked })}
              />
              <Label htmlFor="sameSourceAndTarget">Kaynak ve Hedef Veritabanı Aynı</Label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="text-base font-medium mb-3">Hedef Veritabanı Bilgileri</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="targetName" className="text-sm">Bağlantı Adı</Label>
            <Input
              id="targetName"
              value={targetFormData.name}
              onChange={(e) => setTargetFormData({ ...targetFormData, name: e.target.value })}
              placeholder="Örn: Hedef DB"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetHost" className="text-sm">Sunucu</Label>
            <Input
              id="targetHost"
              value={targetFormData.host}
              onChange={(e) => setTargetFormData({ ...targetFormData, host: e.target.value })}
              placeholder="Örn: localhost"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetPort" className="text-sm">Port</Label>
            <Input
              id="targetPort"
              value={targetFormData.port}
              onChange={(e) => setTargetFormData({ ...targetFormData, port: e.target.value })}
              placeholder="Örn: 1433"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetDbName" className="text-sm">Veritabanı</Label>
            <Input
              id="targetDbName"
              value={targetFormData.dbName}
              onChange={(e) => setTargetFormData({ ...targetFormData, dbName: e.target.value })}
              placeholder="Veritabanı adı"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetUserName" className="text-sm">Kullanıcı Adı</Label>
            <Input
              id="targetUserName"
              value={targetFormData.userName}
              onChange={(e) => setTargetFormData({ ...targetFormData, userName: e.target.value })}
              placeholder="Kullanıcı adı"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetPassword" className="text-sm">Şifre</Label>
            <Input
              id="targetPassword"
              type="password"
              value={targetFormData.password}
              onChange={(e) => setTargetFormData({ ...targetFormData, password: e.target.value })}
              placeholder="••••••••"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetTenantId" className="text-sm">Tenant ID</Label>
            <Input
              id="targetTenantId"
              value={targetFormData.tenantId}
              onChange={(e) => setTargetFormData({ ...targetFormData, tenantId: e.target.value })}
              placeholder="Tenant ID"
              className="h-8"
              disabled={true}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetConnectTimeout" className="text-sm">Bağlantı Zaman Aşımı (ms)</Label>
            <Input
              id="targetConnectTimeout"
              type="number"
              value={targetFormData.connectTimeout}
              onChange={(e) => setTargetFormData({ ...targetFormData, connectTimeout: parseInt(e.target.value) })}
              placeholder="30000"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="targetTrustServerCertificate"
                  checked={targetFormData.trustServerCertificate}
                  onCheckedChange={(checked) => setTargetFormData({ ...targetFormData, trustServerCertificate: checked })}
                />
                <Label htmlFor="targetTrustServerCertificate" className="text-sm">Sunucu Sertifikasına Güven</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="targetEncrypt"
                  checked={targetFormData.encrypt}
                  onCheckedChange={(checked) => setTargetFormData({ ...targetFormData, encrypt: checked })}
                />
                <Label htmlFor="targetEncrypt" className="text-sm">Şifreleme</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleTest}
          disabled={isSaving || isTesting || !canTestSourceConnection || (!formData.sameSourceAndTarget && !canTestTargetConnection)}
          className="w-full sm:w-auto"
        >
          {isTesting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Test Ediliyor...
            </>
          ) : (
            <>
              <DatabaseIcon className="mr-2 h-4 w-4" />
              Bağlantıyı Test Et
            </>
          )}
        </Button>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isSaving || isTesting}
            className="flex-1 sm:flex-none"
          >
            İptal
          </Button>
          <Button 
            type="submit" 
            disabled={isSaving || isTesting}
            className="flex-1 sm:flex-none"
          >
            {isSaving ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              'Kaydet'
            )}
          </Button>
        </div>
      </div>

      {testResults && (
        <div className="mt-4 space-y-3">
          <div className={`p-3 rounded-md ${testResults.source.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <div className="flex items-start">
              {testResults.source.success ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium text-sm mb-0.5">Kaynak Veritabanı</p>
                <p className={`text-sm ${testResults.source.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.source.message}
                </p>
              </div>
            </div>
          </div>

          {testResults.target && (
            <div className={`p-3 rounded-md ${testResults.target.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-start">
                {testResults.target.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-sm mb-0.5">Hedef Veritabanı</p>
                  <p className={`text-sm ${testResults.target.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.target.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-200">
          <div className="flex items-start">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm mb-1">Doğrulama Hataları</p>
              <ul className="list-disc pl-5 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
