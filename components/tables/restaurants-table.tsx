'use client';

import { Restaurant } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const columns: ColumnDef<Restaurant>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Şube Adı
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'location',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Konum
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              status === 'active'
                ? 'bg-green-500'
                : status === 'error'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}
          />
          {status === 'active'
            ? 'Aktif'
            : status === 'error'
            ? 'Hata'
            : 'Beklemede'}
        </div>
      );
    },
  },
  {
    accessorKey: 'lastSync',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Son Senkronizasyon
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('lastSync') as Date;
      return date.toLocaleString();
    },
  },
  {
    accessorKey: 'totalDocuments',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Döküman Sayısı
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return row.getValue('totalDocuments')?.toLocaleString();
    },
  },
  {
    accessorKey: 'dataTransferred',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Transfer Edilen
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return `${(row.getValue('dataTransferred') as number).toFixed(2)} MB`;
    },
  },
];

interface RestaurantsTableProps {
  data: Restaurant[];
}

export function RestaurantsTable({ data }: RestaurantsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="name"
      searchPlaceholder="Şube ara..."
    />
  );
}