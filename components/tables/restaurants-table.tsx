'use client';

import { BranchData } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';

// Helper function to convert bytes to MB
const formatBytes = (bytes: number) => {
  const mbValue = bytes / (1024 * 1024);
  return `${mbValue.toFixed(2)} MB`;
};

// Extended BranchData type to include tenant information
interface ExtendedBranchData extends BranchData {
  tenantId: string;
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
            className={`w-2 h-2 rounded-full mr-2 ${
              isActive ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          {isActive ? 'Aktif' : 'Pasif'}
        </div>
      );
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
      return totalSuccess ? `${totalSuccess.count.toLocaleString()} (${formatBytes(totalSuccess.size)})` : '0';
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
      return totalError ? `${totalError.count.toLocaleString()} (${formatBytes(totalError.size)})` : '0';
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
      return totalProcessing ? `${totalProcessing.count.toLocaleString()} (${formatBytes(totalProcessing.size)})` : '0';
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
      return totalIgnore ? `${totalIgnore.count.toLocaleString()} (${formatBytes(totalIgnore.size)})` : '0';
    },
  },
];

type BranchFilter = 'all' | 'active' | 'passive';

export function RestaurantsTable() {
  const [activeFilter, setActiveFilter] = useState<BranchFilter>('all');
  const [searchValue, setSearchValue] = useState('');
  
  // Flatten all branches from all tenants into a single array
  // const branches = useMemo(() => {
  //   if (!metrics) return [];
    
  //   const allBranches: ExtendedBranchData[] = [];
    
  //   Object.entries(metrics.tenants).forEach(([tenantId, tenant]) => {
  //     tenant.branches.forEach(branch => {
  //       allBranches.push({
  //         ...branch,
  //         tenantId
  //       });
  //     });
  //   });
    
  //   return allBranches;
  // }, [metrics]);

  // Apply filter based on active/passive status
  // const filteredBranches = useMemo(() => {
  //   if (activeFilter === 'all') return branches;
  //   return branches.filter(branch => 
  //     activeFilter === 'active' ? branch.isActive : !branch.isActive
  //   );
  // }, [branches, activeFilter]);

  // // Apply search filter
  // const searchFilteredBranches = useMemo(() => {
  //   if (!searchValue) return filteredBranches;
  //   return filteredBranches.filter(branch => 
  //     String(branch.branchId).includes(searchValue) || 
  //     branch.tenantId.toLowerCase().includes(searchValue.toLowerCase())
  //   );
  // }, [filteredBranches, searchValue]);

//   const table = useReactTable({
//     columns,
//     data: searchFilteredBranches,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//   });

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
//         <div className="flex gap-2 border rounded-md p-1 bg-muted/20">
//           <Button 
//             variant="ghost"
//             onClick={() => setActiveFilter('all')}
//             size="sm"
//             className={`${activeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
//           >
//             Tümü
//           </Button>
//           <Button 
//             variant="ghost"
//             onClick={() => setActiveFilter('active')}
//             size="sm"
//             className={`${activeFilter === 'active' ? 'bg-green-500 text-white' : 'hover:bg-muted'}`}
//           >
//             Sadece Aktif Şubeler
//           </Button>
//           <Button 
//             variant="ghost"
//             onClick={() => setActiveFilter('passive')}
//             size="sm"
//             className={`${activeFilter === 'passive' ? 'bg-red-500 text-white' : 'hover:bg-muted'}`}
//           >
//             Sadece Pasif Şubeler
//           </Button>
//         </div>
        
//         <div className="relative w-full sm:w-auto max-w-sm">
//           <Input
//             placeholder="Şube ID veya Tenant ara..."
//             value={searchValue}
//             onChange={(e) => setSearchValue(e.target.value)}
//             className="glass"
//           />
//         </div>
//       </div>
      
//       <DataTable
//         columns={columns}
//         data={searchFilteredBranches}
//         table={table}
//       />
//     </div>
//   );
 }