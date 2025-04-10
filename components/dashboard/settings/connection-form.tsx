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
import { useConnectionsStore } from '@/store/useConnectionsStore';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ConnectionFormProps {
  connection: SqlConnection;
  onSave: (connection: UpdateConnectionModel | CreateConnectionModel) => Promise<void>;
  onCancel: () => void;
}

export default function ConnectionForm({ connection, onSave, onCancel }: ConnectionFormProps) {
  const [formData, setFormData] = useState<SqlConnection>(connection);
  const [targetFormData, setTargetFormData] = useState<Omit<SqlConnection, 'id' | 'sameSourceAndTarget'>>({
    name: connection.targetConnection?.name || (connection.name ? `${connection.name} (Hedef)` : ''),
    host: connection.targetConnection?.host || connection.host,
    port: connection.targetConnection?.port || connection.port,
    dbName: connection.targetConnection?.dbName || connection.dbName,
    userName: connection.targetConnection?.userName || connection.userName,
    password: connection.targetConnection?.password || connection.password,
    trustServerCertificate: connection.targetConnection?.trustServerCertificate || connection.trustServerCertificate,
    encrypt: connection.targetConnection?.encrypt || connection.encrypt,
    connectTimeout: connection.targetConnection?.connectTimeout || connection.connectTimeout,
    tenantId: connection.tenantId
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<ConnectionTestResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const api = useApi();
  const { connections } = useConnections();
  const { fetchConnections } = useConnectionsStore();

  useEffect(() => {
    setFormData(connection);
    setTargetFormData({
      name: connection.targetConnection?.name || (connection.name ? `${connection.name} (Hedef)` : ''),
      host: connection.targetConnection?.host || connection.host,
      port: connection.targetConnection?.port || connection.port,
      dbName: connection.targetConnection?.dbName || connection.dbName,
      userName: connection.targetConnection?.userName || connection.userName,
      password: connection.targetConnection?.password || connection.password,
      trustServerCertificate: connection.targetConnection?.trustServerCertificate || connection.trustServerCertificate,
      encrypt: connection.targetConnection?.encrypt || connection.encrypt,
      connectTimeout: connection.targetConnection?.connectTimeout || connection.connectTimeout,
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

      // Always test target connection regardless of sameSourceAndTarget setting
      try {
        const targetTestData = {
          name: targetFormData.name,
          host: targetFormData.host,
          port: targetFormData.port,
          dbName: targetFormData.dbName,
          userName: targetFormData.userName,
          password: targetFormData.password,
          trustServerCertificate: targetFormData.trustServerCertificate,
          sameSourceAndTarget: false,
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
        setIsSaving(false);
        return;
      }
      
      // Check if source connection test was successful
      if (!results.source.success) {
        setTestResults(results);
        setIsSaving(false);
        toast({
          title: "Bağlantı Hatası",
          description: "Kaynak bağlantı testi başarısız oldu. Lütfen bağlantı bilgilerini kontrol edin.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if target connection test was successful (if not using same source and target)
      if (!formData.sameSourceAndTarget && results.target && !results.target.success) {
        setTestResults(results);
        setIsSaving(false);
        toast({
          title: "Bağlantı Hatası",
          description: "Hedef bağlantı testi başarısız oldu. Lütfen bağlantı bilgilerini kontrol edin.",
          variant: "destructive"
        });
        return;
      }
      
      setTestResults(results);
      
      // Prepare the data for saving
      const saveData: UpdateConnectionModel | CreateConnectionModel = {
        ...formData,
        targetConnection: formData.sameSourceAndTarget ? undefined : {
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
        }
      };
      
      await onSave(saveData);
      await fetchConnections();
      
      toast({
        title: "Başarılı",
        description: "Bağlantı başarıyla kaydedildi.",
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isTarget: boolean = false) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    if (isTarget) {
      setTargetFormData(prev => ({
        ...prev,
        [name]: inputValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: inputValue
      }));
    }
  };

  const handleSwitchChange = (checked: boolean, name: string, isTarget: boolean = false) => {
    if (isTarget) {
      setTargetFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const renderTestResult = (result: TestResult | undefined) => {
    if (!result) return null;
    
    return (
      <div className={cn(
        "text-xs rounded-md p-2 mt-1 flex items-center gap-1.5",
        result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      )}>
        {result.success ? (
          <CheckCircleIcon className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
        ) : (
          <XCircleIcon className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
        )}
        <span className="text-xs">{result.message}</span>
      </div>
    );
  };

  const renderFormField = (
    label: string, 
    name: string, 
    value: string | number | boolean, 
    type: string = 'text', 
    isTarget: boolean = false,
    placeholder: string = ''
  ) => {
    return (
      <div className="mb-3">
        <Label 
          htmlFor={`${isTarget ? 'target-' : ''}${name}`}
          className="text-xs font-medium mb-1.5 block"
        >
          {label}
        </Label>
        <Input
          id={`${isTarget ? 'target-' : ''}${name}`}
          name={name}
          type={type}
          value={value as string}
          onChange={(e) => handleInputChange(e, isTarget)}
          className="h-8 text-sm"
          placeholder={placeholder}
        />
      </div>
    );
  };

  const renderSwitchField = (
    label: string, 
    name: string, 
    checked: boolean, 
    isTarget: boolean = false
  ) => {
    return (
      <div className="flex items-center justify-between mb-3">
        <Label 
          htmlFor={`${isTarget ? 'target-' : ''}${name}`}
          className="text-xs font-medium cursor-pointer"
        >
          {label}
        </Label>
        <Switch
          id={`${isTarget ? 'target-' : ''}${name}`}
          name={name}
          checked={checked}
          onCheckedChange={(checked) => handleSwitchChange(checked, name, isTarget)}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kaynak Bağlantı */}
        <div>
          <div className="flex items-center mb-3">
            <DatabaseIcon className="h-4 w-4 mr-1.5 text-primary" />
            <h3 className="text-sm font-medium">Kaynak Veritabanı</h3>
          </div>
          <div className="space-y-1">
            {renderFormField('Bağlantı Adı', 'name', formData.name || '', 'text', false, 'Örn: Üretim Veritabanı')}
            {renderFormField('Firma ID', 'tenantId', formData.tenantId || '', 'text', false, 'Örn: firma1')}
            
            <div className="grid grid-cols-2 gap-3">
              {renderFormField('Sunucu', 'host', formData.host || '', 'text', false, 'Örn: localhost')}
              {renderFormField('Port', 'port', formData.port || '', 'number', false, 'Örn: 1433')}
            </div>
            
            {renderFormField('Veritabanı', 'dbName', formData.dbName || '', 'text', false, 'Örn: master')}
            {renderFormField('Kullanıcı Adı', 'userName', formData.userName || '', 'text', false, 'Örn: sa')}
            {renderFormField('Şifre', 'password', formData.password || '', 'password', false, '••••••••')}
            
            <div className="bg-muted/30 p-2 rounded-md">
              <div className="text-xs font-medium mb-1.5">Gelişmiş Ayarlar</div>
              <div className="space-y-2">
                {renderSwitchField('Sertifikayı Doğrula', 'trustServerCertificate', formData.trustServerCertificate || false)}
                {renderSwitchField('Şifrele', 'encrypt', formData.encrypt || false)}
                {renderFormField('Bağlantı Zaman Aşımı (ms)', 'connectTimeout', formData.connectTimeout || 15000, 'number')}
              </div>
            </div>
            
            {testResults && renderTestResult(testResults.source)}
          </div>
        </div>

        {/* Hedef Bağlantı */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <DatabaseIcon className="h-4 w-4 mr-1.5 text-primary" />
              <h3 className="text-sm font-medium">Hedef Veritabanı</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sameSourceAndTarget"
                name="sameSourceAndTarget"
                checked={formData.sameSourceAndTarget || false}
                onCheckedChange={(checked) => handleSwitchChange(checked, 'sameSourceAndTarget')}
                className="data-[state=checked]:bg-primary"
              />
              <Label 
                htmlFor="sameSourceAndTarget"
                className="text-xs cursor-pointer"
              >
                Kaynak ile aynı
              </Label>
            </div>
          </div>

          {!formData.sameSourceAndTarget ? (
            <div className="space-y-1">
              {renderFormField('Bağlantı Adı', 'name', targetFormData.name || '', 'text', true, 'Örn: Test Veritabanı')}
              {renderFormField('Firma ID', 'tenantId', targetFormData.tenantId || '', 'text', true, 'Örn: firma1')}
              
              <div className="grid grid-cols-2 gap-3">
                {renderFormField('Sunucu', 'host', targetFormData.host || '', 'text', true, 'Örn: localhost')}
                {renderFormField('Port', 'port', targetFormData.port || '', 'number', true, 'Örn: 1433')}
              </div>
              
              {renderFormField('Veritabanı', 'dbName', targetFormData.dbName || '', 'text', true, 'Örn: master')}
              {renderFormField('Kullanıcı Adı', 'userName', targetFormData.userName || '', 'text', true, 'Örn: sa')}
              {renderFormField('Şifre', 'password', targetFormData.password || '', 'password', true, '••••••••')}
              
              <div className="bg-muted/30 p-2 rounded-md">
                <div className="text-xs font-medium mb-1.5">Gelişmiş Ayarlar</div>
                <div className="space-y-2">
                  {renderSwitchField('Sertifikayı Doğrula', 'trustServerCertificate', targetFormData.trustServerCertificate || false, true)}
                  {renderSwitchField('Şifrele', 'encrypt', targetFormData.encrypt || false, true)}
                  {renderFormField('Bağlantı Zaman Aşımı (ms)', 'connectTimeout', targetFormData.connectTimeout || 15000, 'number', true)}
                </div>
              </div>
              
              {testResults && testResults.target && renderTestResult(testResults.target)}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full border border-dashed rounded-md p-4 bg-muted/20">
              <p className="text-xs text-muted-foreground">Kaynak veritabanı aynı zamanda hedef olarak kullanılacak.</p>
            </div>
          )}
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2">
          <ul className="text-xs text-red-700 list-disc pl-5">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="h-8 text-xs px-3"
        >
          İptal
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={testConnection}
          disabled={isTesting}
          className="h-8 text-xs px-3"
        >
          {isTesting ? (
            <>
              <Loader2Icon className="h-3 w-3 mr-1.5 animate-spin" />
              Test Ediliyor
            </>
          ) : (
            'Bağlantıları Test Et'
          )}
        </Button>
        <Button 
          type="submit" 
          disabled={isSaving}
          className="h-8 text-xs px-3"
        >
          {isSaving ? (
            <>
              <Loader2Icon className="h-3 w-3 mr-1.5 animate-spin" />
              Kaydediliyor
            </>
          ) : (
            'Kaydet'
          )}
        </Button>
      </div>
    </form>
  );
}
