'use client';

import { BranchData } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMetricsStore } from '@/store/useMetricsStore';
import { useMemo, useState } from 'react';

// Helper function to convert bytes to MB
const formatBytes = (bytes: number) => {
  const mbValue = bytes / (1024 * 1024);
  return `${mbValue.toFixed(2)} MB`;
};

const columns: ColumnDef<BranchData>[] = [
  {
    accessorKey: 'branchId',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Şube ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Başarılı
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Hatalı
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          İşleniyor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Yoksayılan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
  const { metrics } = useMetricsStore();
  const [activeFilter, setActiveFilter] = useState<BranchFilter>('all');
  const [searchValue, setSearchValue] = useState('');
  
  // Flatten all branches from all tenants into a single array
  const branches = useMemo(() => {
    if (!metrics) return [];
    
    const allBranches: BranchData[] = [];
    
    Object.values(metrics.tenants).forEach(tenant => {
      tenant.branches.forEach(branch => {
        allBranches.push(branch);
      });
    });
    
    return allBranches;
  }, [metrics]);

  // Apply filter based on active/passive status
  const filteredBranches = useMemo(() => {
    if (activeFilter === 'all') return branches;
    return branches.filter(branch => 
      activeFilter === 'active' ? branch.isActive : !branch.isActive
    );
  }, [branches, activeFilter]);

  // Apply search filter
  const searchFilteredBranches = useMemo(() => {
    if (!searchValue) return filteredBranches;
    return filteredBranches.filter(branch => 
      String(branch.branchId).includes(searchValue)
    );
  }, [filteredBranches, searchValue]);

  const table = useReactTable({
    columns,
    data: searchFilteredBranches,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant={activeFilter === 'all' ? 'default' : 'outline'} 
            onClick={() => setActiveFilter('all')}
            size="sm"
          >
            Tümü
          </Button>
          <Button 
            variant={activeFilter === 'active' ? 'default' : 'outline'} 
            onClick={() => setActiveFilter('active')}
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Sadece Aktif Şubeler
          </Button>
          <Button 
            variant={activeFilter === 'passive' ? 'default' : 'outline'} 
            onClick={() => setActiveFilter('passive')}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Sadece Pasif Şubeler
          </Button>
        </div>
        
        <div className="relative w-full sm:w-auto max-w-sm">
          <Input
            placeholder="Şube ID ara..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="glass"
          />
        </div>
      </div>
      
      <DataTable
        columns={columns}
        data={searchFilteredBranches}
        table={table}
      />
    </div>
  );
}