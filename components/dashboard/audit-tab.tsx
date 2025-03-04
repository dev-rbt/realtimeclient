import { Card } from '@/components/ui/card';
import { AuditLog } from '@/lib/types';
import { History, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Zaman',
    cell: ({ row }) => {
      const date = row.getValue('timestamp') as Date;
      return date.toLocaleString();
    },
  },
  {
    accessorKey: 'action',
    header: 'İşlem',
  },
  {
    accessorKey: 'description',
    header: 'Açıklama',
  },
  {
    accessorKey: 'source',
    header: 'Kaynak',
  },
  {
    accessorKey: 'destination',
    header: 'Hedef',
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <div className="flex items-center">
          {status === 'success' && (
            <div className="flex items-center text-green-500">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Başarılı
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center text-red-500">
              <XCircle className="w-4 h-4 mr-2" />
              Hata
            </div>
          )}
          {status === 'warning' && (
            <div className="flex items-center text-yellow-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              Uyarı
            </div>
          )}
        </div>
      );
    },
  },
];

interface AuditTabProps {
  logs: AuditLog[];
}

export function AuditTab({ logs }: AuditTabProps) {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <History className="w-5 h-5 mr-2 text-primary" />
        İşlem Kayıtları
      </h2>
      <DataTable
        columns={columns}
        data={logs}
        searchColumn="description"
        searchPlaceholder="İşlem kaydı ara..."
      />
    </Card>
  );
}