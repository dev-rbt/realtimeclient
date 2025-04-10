import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2Icon, MoreHorizontalIcon, ServerIcon, DatabaseIcon, UserIcon, BuildingIcon, CheckIcon, AlertCircleIcon, TrashIcon } from 'lucide-react';
import { SqlConnection } from '@/components/dashboard/settings/types';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConnectionTableProps {
  connections: SqlConnection[];
  onEdit: (connection: SqlConnection) => void;
  onDelete: (connection: SqlConnection) => void;
  onTest: (connection: SqlConnection) => void;
  isTestingConnection?: string;
}

export default function ConnectionTable({
  connections,
  onEdit,
  onDelete,
  onTest,
  isTestingConnection,
}: ConnectionTableProps) {
  // Mobile card view
  const renderMobileView = () => (
    <div className="space-y-2 sm:hidden">
      {connections.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-xs">
          <DatabaseIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
          <p>Henüz bağlantı bulunmuyor.</p>
        </div>
      ) : (
        connections.map((connection) => (
          <div 
            key={connection.id} 
            className="border rounded-lg p-3 bg-background/80 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm">{connection.name}</h4>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-red-100 text-red-600"
                  onClick={() => onDelete(connection)}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-full hover:bg-muted"
                    >
                      <MoreHorizontalIcon className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem 
                      onClick={() => onEdit(connection)}
                      className="cursor-pointer flex items-center gap-2 py-2 text-xs"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onTest(connection)}
                      disabled={isTestingConnection === connection.id}
                      className="cursor-pointer flex items-center gap-2 py-2 text-xs"
                    >
                      {isTestingConnection === connection.id ? (
                        <>
                          <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                          Test Ediliyor...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <path d="m9 11 3 3L22 4"/>
                          </svg>
                          Test Et
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center">
                <BuildingIcon className="h-3 w-3 mr-1.5 text-primary/70" />
                <span>{connection.tenantId || 'Firma belirtilmemiş'}</span>
              </div>
              <div className="flex items-center">
                <ServerIcon className="h-3 w-3 mr-1.5 text-primary/70" />
                <span>{connection.host}, {connection.port}</span>
              </div>
              <div className="flex items-center">
                <DatabaseIcon className="h-3 w-3 mr-1.5 text-primary/70" />
                <span>{connection.dbName}</span>
              </div>
              <div className="flex items-center">
                <UserIcon className="h-3 w-3 mr-1.5 text-primary/70" />
                <span>{connection.userName}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Desktop table view
  const renderDesktopView = () => (
    <div className="hidden sm:block rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/40 border-b">
            <th className="h-9 px-4 text-left align-middle font-medium text-muted-foreground text-xs">Bağlantı Adı</th>
            <th className="h-9 px-4 text-left align-middle font-medium text-muted-foreground text-xs">Firma</th>
            <th className="h-9 px-4 text-left align-middle font-medium text-muted-foreground text-xs">Sunucu, Port</th>
            <th className="h-9 px-4 text-left align-middle font-medium text-muted-foreground text-xs">Veritabanı</th>
            <th className="h-9 px-4 text-left align-middle font-medium text-muted-foreground text-xs">Kullanıcı Adı</th>
            <th className="h-9 px-4 text-right align-middle font-medium text-muted-foreground text-xs w-[100px]">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {connections.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-0">
                <div className="text-center py-10 text-muted-foreground text-xs">
                  <DatabaseIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>Henüz bağlantı bulunmuyor.</p>
                </div>
              </td>
            </tr>
          ) : (
            connections.map((connection) => (
              <tr 
                key={connection.id} 
                className="border-b hover:bg-muted/20 transition-colors duration-150"
              >
                <td className="p-3 font-medium text-sm">{connection.name}</td>
                <td className="p-3 text-sm">
                  {connection.tenantId ? (
                    <Badge variant="outline" className="font-normal bg-primary/5 hover:bg-primary/10 text-xs py-0.5">
                      {connection.tenantId}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </td>
                <td className="p-3 text-sm">{connection.host}, {connection.port}</td>
                <td className="p-3 text-sm">{connection.dbName}</td>
                <td className="p-3 text-sm">{connection.userName}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-primary/10"
                      onClick={() => onTest(connection)}
                      disabled={isTestingConnection === connection.id}
                    >
                      {isTestingConnection === connection.id ? (
                        <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckIcon className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-primary/10"
                      onClick={() => onEdit(connection)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-red-100 text-red-600"
                      onClick={() => onDelete(connection)}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-primary/10"
                        >
                          <MoreHorizontalIcon className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem 
                          onClick={() => onEdit(connection)}
                          className="cursor-pointer flex items-center gap-2 py-2 text-xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                          </svg>
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onTest(connection)}
                          disabled={isTestingConnection === connection.id}
                          className="cursor-pointer flex items-center gap-2 py-2 text-xs"
                        >
                          {isTestingConnection === connection.id ? (
                            <>
                              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                              Test Ediliyor...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <path d="m9 11 3 3L22 4"/>
                              </svg>
                              Test Et
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {renderMobileView()}
      {renderDesktopView()}
    </>
  );
}
