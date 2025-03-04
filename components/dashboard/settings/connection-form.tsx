import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { DatabaseIcon, Loader2Icon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';
import useApi from '@/hooks/use-api';
import { SqlConnection, TestResult } from '@/components/dashboard/settings/types';

interface ConnectionFormProps {
  connection: SqlConnection;
  onSave: (connection: SqlConnection) => Promise<void>;
  onCancel: () => void;
}

export default function ConnectionForm({ connection, onSave, onCancel }: ConnectionFormProps) {
  const [formData, setFormData] = useState<SqlConnection>(connection);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { toast } = useToast();
  const api = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const canTestConnection = formData.host && formData.port && formData.userName && formData.password;

  const handleTest = async () => {
    if (!canTestConnection) {
      toast({
        title: "Hata",
        description: "Bağlantı testi için sunucu, port, kullanıcı adı ve şifre alanları doldurulmalıdır.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      await api.post('/connection/test', formData);
      
      setTestResult({
        success: true,
        message: "Bağlantı başarılı! Veritabanına erişilebiliyor."
      });

      toast({
        title: "Başarılı",
        description: "Bağlantı testi başarılı! Veritabanına erişilebiliyor.",
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || "Bağlantı testi başarısız! Veritabanına erişilemiyor."
      });

      toast({
        title: "Hata",
        description: error.response?.data?.message || "Bağlantı testi başarısız! Veritabanına erişilemiyor.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

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
          <div className="flex items-center space-x-8">
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
          </div>
        </div>
      </div>
      <div className="flex justify-between space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleTest}
          disabled={isSaving || isTesting || !canTestConnection}
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
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving || isTesting}>
            İptal
          </Button>
          <Button type="submit" disabled={isSaving || isTesting}>
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
      {testResult && (
        <div className={`flex items-center p-4 rounded-lg border ${testResult.success
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          {testResult.success ? (
            <CheckCircleIcon className="w-5 h-5 mr-2" />
          ) : (
            <XCircleIcon className="w-5 h-5 mr-2" />
          )}
          {testResult.message}
        </div>
      )}
    </form>
  );
}
