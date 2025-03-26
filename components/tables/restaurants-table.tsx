'use client';

import { BranchData } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import useApi from '@/hooks/use-api';
import { toast } from '@/components/ui/use-toast';

// Extended BranchData type to include tenant information
interface ExtendedBranchData extends BranchData {
  tenantId: string;
  sizeCompleted: string;
  sizeProcessing: string;
  sizeCreated: string;
  sizeError: string;
  sizeIgnore: string;
  totalCount?: number; // Total count of all documents for the branch
  totalSize?: string; // Total size of all documents for the branch
}

// API response type
interface BranchStats {
  TotalCompleted: number;
  TotalError: number;
  TotalProcessing: number;
  TotalIgnore: number;
  TotalCreated: number;
  LastOnline: boolean;
  SizeCompleted: string;
  SizeProcessing: string;
  SizeCreated: string;
  SizeError: string;
  SizeIgnore: string;
}

interface BranchApiResponse {
  data: {
    [tenantId: string]: {
      [branchId: string]: BranchStats;
    }
  };
  totalSizeByStatus: {
    Completed: string;
    Ignore: string;
  };
  totalSize: string;
}

const columns: ColumnDef<ExtendedBranchData>[] = [
  {
    accessorKey: 'tenantId',
    header: ({ column }) => {
      return (
        <div className="text-left w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="!justify-start p-0 w-full"
          >
            Firma Kısa Kod
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return row.getValue('tenantId');
    },
  },
  {
    accessorKey: 'branchId',
    header: ({ column }) => {
      return (
        <div className="text-left w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="!justify-start p-0 w-full"
          >
            Şube ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return String(row.getValue('branchId'));
    },
    filterFn: (row, id, filterValue) => {
      const value = String(row.getValue(id));
      return value.includes(String(filterValue));
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Durum',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'
              }`}
          />
          {isActive ? 'Aktif' : 'Pasif'}
        </div>
      );
    },
  },
  {
    accessorKey: 'totalPending',
    header: ({ column }) => {
      return (
        <div className="text-left w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="!justify-start p-0 w-full"
          >
            Kuyrukta
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const totalPending = row.getValue('totalPending') as { count: number; size: number };
      const sizeCreated = row.original.sizeCreated as string;
      return totalPending ? `${totalPending.count.toLocaleString()} (${sizeCreated || '0B'})` : '0 (0B)';
    },
  },
  {
    accessorKey: 'totalSuccess',
    header: ({ column }) => {
      return (
        <div className="text-left w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="!justify-start p-0 w-full"
          >
            Başarılı
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const totalSuccess = row.getValue('totalSuccess') as { count: number; size: number };
      const sizeCompleted = row.original.sizeCompleted as string;
      return totalSuccess ? `${totalSuccess.count.toLocaleString()} (${sizeCompleted || '0B'})` : '0 (0B)';
    },
  },
  {
    accessorKey: 'totalError',
    header: ({ column }) => {
      return (
        <div className="text-left w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="!justify-start p-0 w-full"
          >
            Hatalı
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const totalError = row.getValue('totalError') as { count: number; size: number };
      const sizeError = row.original.sizeError as string;
      return totalError ? `${totalError.count.toLocaleString()} (${sizeError || '0B'})` : '0 (0B)';
    },
  },
  {
    accessorKey: 'totalProcessing',
    header: ({ column }) => {
      return (
        <div className="text-left w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="!justify-start p-0 w-full"
          >
            İşleniyor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const totalProcessing = row.getValue('totalProcessing') as { count: number; size: number };
      const sizeProcessing = row.original.sizeProcessing as string;
      return totalProcessing ? `${totalProcessing.count.toLocaleString()} (${sizeProcessing || '0B'})` : '0 (0B)';
    },
  },
  {
    accessorKey: 'totalIgnore',
    header: ({ column }) => {
      return (
        <div className="text-left w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="!justify-start p-0 w-full"
          >
            Yoksayılan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const totalIgnore = row.getValue('totalIgnore') as { count: number; size: number };
      const sizeIgnore = row.original.sizeIgnore as string;
      return totalIgnore ? `${totalIgnore.count.toLocaleString()} (${sizeIgnore || '0B'})` : '0 (0B)';
    },
  },
  {
    accessorKey: 'totalCount',
    header: ({ column }) => {
      return (
        <div className="text-left w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="!justify-start p-0 w-full"
          >
            Toplam
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const totalCount = row.getValue('totalCount') as number;
      const totalSize = row.original.totalSize as string;
      return `${totalCount?.toLocaleString() || '0'} (${totalSize || '0B'})`;
    },
  },
];

export function RestaurantsTable() {
  const [branchData, setBranchData] = useState<ExtendedBranchData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterValue, setFilterValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const api = useApi();

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<BranchApiResponse>('/system/getDataGroupByBranch');
        
        // Transform the API response to match our table data structure
        const transformedData: ExtendedBranchData[] = [];
        
        Object.entries(response.data.data).forEach(([tenantId, branches]) => {
          Object.entries(branches).forEach(([branchId, branchStats]) => {
            // Calculate total count for this branch
            const totalCount = 
              branchStats.TotalCompleted + 
              branchStats.TotalError + 
              branchStats.TotalProcessing + 
              branchStats.TotalIgnore + 
              branchStats.TotalCreated;
            
            // For total size, we'll need to parse and add the sizes
            // Since the size strings are formatted like "2,39MB", we'll use a simple approach
            // that just shows the sum of counts and the largest size unit as an approximation
            const sizeValues = [
              branchStats.SizeCompleted,
              branchStats.SizeError,
              branchStats.SizeProcessing,
              branchStats.SizeIgnore,
              branchStats.SizeCreated
            ].filter(size => size && size !== '0' && size !== '0B');
            
            // Find the largest size unit as a simple approximation
            let totalSize = '0B';
            if (sizeValues.length > 0) {
              // Sort by size unit priority (MB > KB > B)
              const sortedSizes = [...sizeValues].sort((a, b) => {
                const unitA = a.includes('MB') ? 3 : a.includes('KB') ? 2 : 1;
                const unitB = b.includes('MB') ? 3 : b.includes('KB') ? 2 : 1;
                return unitB - unitA;
              });
              
              totalSize = sortedSizes[0]; // Use the largest size as an approximation
            }
            
            transformedData.push({
              tenantId,
              branchId: parseInt(branchId),
              isActive: branchStats.LastOnline,
              sizeCompleted: branchStats.SizeCompleted,
              sizeProcessing: branchStats.SizeProcessing,
              sizeCreated: branchStats.SizeCreated,
              sizeError: branchStats.SizeError,
              sizeIgnore: branchStats.SizeIgnore,
              totalCount: totalCount,
              totalSize: totalSize,
              totalSuccess: {
                count: branchStats.TotalCompleted,
                size: 0 // Size is now handled separately
              },
              totalError: {
                count: branchStats.TotalError,
                size: 0
              },
              totalProcessing: {
                count: branchStats.TotalProcessing,
                size: 0
              },
              totalIgnore: {
                count: branchStats.TotalIgnore,
                size: 0
              },
              totalPending: {
                count: branchStats.TotalCreated,
                size: 0
              },
              reports: [] // Not provided in the API response
            });
          });
        });
        
        setBranchData(transformedData);
      } catch (error) {
        console.error('Error fetching branch data:', error);
        toast({
          title: 'Hata',
          description: 'Şube verileri yüklenirken bir hata oluştu.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranchData();
  }, []);

  // Apply filters based on search input and active filter
  const filteredData = branchData.filter(branch => {
    // Apply search filter
    const searchMatch = 
      filterValue === '' || 
      branch.tenantId.toLowerCase().includes(filterValue.toLowerCase()) ||
      branch.branchId.toString().includes(filterValue);
    
    // Apply active/inactive filter
    const statusMatch = 
      activeFilter === 'all' || 
      (activeFilter === 'active' && branch.isActive) || 
      (activeFilter === 'inactive' && !branch.isActive);
    
    return searchMatch && statusMatch;
  });

  const table = useReactTable({
    columns,
    data: filteredData,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div className="flex gap-2 border rounded-md p-1 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            className={`${activeFilter === 'all' ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Tümü
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${activeFilter === 'active' ? 'bg-green-500 text-white' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Sadece Aktif Şubeler
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${activeFilter === 'inactive' ? 'bg-red-500 text-white' : ''}`}
            onClick={() => setActiveFilter('inactive')}
          >
            Sadece Pasif Şubeler
          </Button>
        </div>

        <div className="relative w-full sm:w-auto max-w-sm">
          <Input
            placeholder="Şube ID veya Tenant ara..."
            className="glass"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Veriler yükleniyor...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          table={table}
        />
      )}
    </div>
  );
}