import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2Icon, MoreHorizontalIcon } from 'lucide-react';
import { SqlConnection } from '@/components/dashboard/settings/types';

interface ConnectionTableProps {
  connections: SqlConnection[];
  onEdit: (connection: SqlConnection) => void;
  onDelete: (connection: SqlConnection) => void;
  onTest: (connection: SqlConnection) => void;
  isTestingConnection?: string;
}

export function ConnectionTable({ connections, onEdit, onDelete, onTest, isTestingConnection }: ConnectionTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-10 px-4 text-left align-middle font-medium">Bağlantı Adı</th>
            <th className="h-10 px-4 text-left align-middle font-medium">Sunucu, Port</th>
            <th className="h-10 px-4 text-left align-middle font-medium">Veritabanı</th>
            <th className="h-10 px-4 text-left align-middle font-medium">Kullanıcı Adı</th>
            <th className="h-10 px-4 text-right align-middle font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {connections.map((connection) => (
            <tr key={connection.id} className="border-b">
              <td className="p-4">{connection.name}</td>
              <td className="p-4">{connection.host}, {connection.port}</td>
              <td className="p-4">{connection.dbName}</td>
              <td className="p-4">{connection.userName}</td>
              <td className="p-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(connection)}>
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTest(connection)}>
                      {isTestingConnection === connection.id ? (
                        <>
                          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                          Test Ediliyor...
                        </>
                      ) : (
                        'Bağlantıyı Test Et'
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(connection)}
                    >
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ConnectionTable;
