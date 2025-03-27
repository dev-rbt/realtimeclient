import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2Icon, MoreHorizontalIcon, ServerIcon, DatabaseIcon, UserIcon } from 'lucide-react';
import { SqlConnection } from '@/components/dashboard/settings/types';

interface ConnectionTableProps {
  connections: SqlConnection[];
  onEdit: (connection: SqlConnection) => void;
  onDelete: (connection: SqlConnection) => void;
  onTest: (connection: SqlConnection) => void;
  isTestingConnection?: string;
}

export function ConnectionTable({ connections, onEdit, onDelete, onTest, isTestingConnection }: ConnectionTableProps) {
  // Mobile card view
  const renderMobileView = () => (
    <div className="space-y-3 sm:hidden">
      {connections.map((connection) => (
        <div key={connection.id} className="border rounded-md p-3 bg-card/30">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">{connection.name}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2 -mt-1 h-8 w-8">
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
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center">
              <ServerIcon className="h-3 w-3 mr-1.5" />
              <span>{connection.host}, {connection.port}</span>
            </div>
            <div className="flex items-center">
              <DatabaseIcon className="h-3 w-3 mr-1.5" />
              <span>{connection.dbName}</span>
            </div>
            <div className="flex items-center">
              <UserIcon className="h-3 w-3 mr-1.5" />
              <span>{connection.userName}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const renderDesktopView = () => (
    <div className="hidden sm:block rounded-md border">
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

  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-6 text-muted-foreground">
      Henüz hiç bağlantı eklenmemiş. Yeni bir bağlantı eklemek için "Yeni Bağlantı" butonuna tıklayın.
    </div>
  );

  return (
    <>
      {connections.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {renderMobileView()}
          {renderDesktopView()}
        </>
      )}
    </>
  );
}

export default ConnectionTable;
