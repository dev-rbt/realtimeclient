'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Loader2,
  Search,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  Document,
  DocumentFilter,
  DocumentStatus,
  DataTypeOption,
  StatusOption,
  DateRangeOption,
  DateRangeOptionType,
  WorkFlow
} from '@/lib/document-types';
import {
  getDocuments,
  getDataTypeOptions,
  getStatusOptions,
  getDateRangeOptions
} from '@/lib/document-service';
import { useConnectionsStore } from '@/store/useConnectionsStore';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// JSON Viewer component with copy button
const JsonViewer = ({ data }: { data: any }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString)
      .then(() => {
        // Show a more visible notification
        toast({
          title: "Kopyalandı!",
          description: "Veri içeriği panoya kopyalandı.",
          duration: 3000,
        });

        // Also update the button text temporarily
        const copyButton = document.getElementById('json-copy-button');
        if (copyButton) {
          const originalText = copyButton.innerHTML;
          copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Kopyalandı!</span>';

          setTimeout(() => {
            copyButton.innerHTML = originalText;
          }, 2000);
        }
      })
      .catch((error) => {
        console.error('Kopyalama hatası:', error);
        toast({
          title: "Hata",
          description: "Veri kopyalanamadı.",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  return (
    <div className="relative w-full h-full">
      <div className="flex justify-end mb-2">
        <Button
          id="json-copy-button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-1"
        >
          <Copy className="h-4 w-4" />
          <span>Kopyala</span>
        </Button>
      </div>
      <div className="relative w-full h-full">
        <pre className="bg-slate-50 p-4 rounded-md overflow-auto max-h-[calc(70vh-200px)] text-sm w-full">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Safe date formatting function
const formatDate = (date: any): string => {
  try {
    if (!date) return '-';
    return format(new Date(date), "dd MMM yyyy HH:mm:ss.SSS", { locale: tr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

// Simpler date format for table display
const formatDateSimple = (date: any): string => {
  try {
    if (!date) return '-';
    return format(new Date(date), "dd MMM yyyy HH:mm", { locale: tr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

// Calculate remaining time until expiration
const getRemainingTime = (expiresAt: Date): string => {
  try {
    const now = new Date();
    const expirationDate = new Date(expiresAt);

    // Check if date is valid
    if (isNaN(expirationDate.getTime())) {
      return 'Geçersiz tarih';
    }

    const diffInMs = expirationDate.getTime() - now.getTime();

    if (diffInMs <= 0) {
      return 'Süresi doldu';
    }

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${diffInDays} gün ${diffInHours} saat`;
  } catch (error) {
    return 'Geçersiz tarih';
  }
};

// Workflow Visualization component
const WorkflowVisualization = ({ workflow = [] }: { workflow?: WorkFlow[] }) => {
  // Status descriptions
  const statusDescriptions: Record<string, string> = {
    'Created': 'Döküman Kaydedildi',
    'Processing': 'İşleme Alındı',
    'Completed': 'İşlendi',
    'Error': 'Hatalı',
    'Ignore': 'Yeni Versiyon Eklendi'
  };

  // Status colors
  const statusColors: Record<string, string> = {
    'Created': 'bg-yellow-100 border-yellow-300 text-yellow-800',
    'Processing': 'bg-blue-100 border-blue-300 text-blue-800',
    'Completed': 'bg-green-100 border-green-300 text-green-800',
    'Error': 'bg-red-100 border-red-300 text-red-800',
    'Ignore': 'bg-gray-100 border-gray-300 text-gray-800'
  };

  // Group workflow items into rows of 5
  const rows: WorkFlow[][] = [];
  for (let i = 0; i < workflow.length; i += 5) {
    rows.push(workflow.slice(i, i + 5));
  }

  return (
    <div className="p-4 space-y-8">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={`flex ${rowIndex % 2 === 0 ? '' : 'flex-row-reverse'} justify-between items-center`}>
          {row.map((item, itemIndex) => {
            const status = item.status || item.documentStatus || 'Unknown';
            const timestamp = item.timestamp || item.createdAt;
            const message = item.message || item.description || '';

            return (
              <div key={itemIndex} className="flex flex-col items-center">
                <div className={`p-3 rounded-md border ${statusColors[status] || 'bg-gray-100 border-gray-300'} min-w-[180px]`}>
                  <div className="font-medium">{statusDescriptions[status] || status}</div>
                  <div className="text-xs mt-1">{formatDate(timestamp)}</div>
                  {message && <div className="text-xs mt-1 italic">{message}</div>}
                </div>

                {/* Arrows between items */}
                {itemIndex < row.length - 1 && (
                  <div className="flex-1 px-2">
                    {rowIndex % 2 === 0 ? (
                      <ArrowRight className="text-gray-400" />
                    ) : (
                      <ArrowLeft className="text-gray-400" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Vertical arrows between rows */}
      {rows.length > 1 && rows.map((_, rowIndex) => (
        rowIndex < rows.length - 1 && (
          <div key={`arrow-${rowIndex}`} className="flex justify-center">
            <ArrowDown className="text-gray-400" />
          </div>
        )
      ))}
    </div>
  );
};

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        Sayfa {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Copy text to clipboard helper function with visual feedback
const copyToClipboard = (text: string, toast: any, event?: React.MouseEvent<HTMLButtonElement>) => {
  if (event && event.currentTarget) {
    // Store original content
    const button = event.currentTarget;
    const originalContent = button.innerHTML;

    // Change to checkmark
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    // Copy the text
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show toast
        toast({
          title: "Kopyalandı!",
          description: "Değer panoya kopyalandı.",
          duration: 3000,
        });

        // Reset button after delay
        setTimeout(() => {
          button.innerHTML = originalContent;
        }, 2000);
      })
      .catch((error) => {
        console.error('Kopyalama hatası:', error);
        toast({
          title: "Hata",
          description: "Değer kopyalanamadı.",
          variant: "destructive",
          duration: 3000,
        });

        // Reset button immediately on error
        button.innerHTML = originalContent;
      });
  } else {
    // Fallback if no event/button
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Kopyalandı!",
          description: "Değer panoya kopyalandı.",
          duration: 3000,
        });
      })
      .catch((error) => {
        console.error('Kopyalama hatası:', error);
        toast({
          title: "Hata",
          description: "Değer kopyalanamadı.",
          variant: "destructive",
          duration: 3000,
        });
      });
  }
};

// Get primary key value from document data
const getPrimaryKeyValue = (document: Document, primaryKey?: string): string => {
  if (!primaryKey || !document.data) return '-';

  try {
    // First check if the value exists directly in the Data object
    if (document.data[primaryKey]) {
      return document.data[primaryKey]?.toString() || '-';
    }

    // If not, check if it's in Data.Clause.{primaryKey}
    if (document.data.Clause && document.data.Clause[primaryKey]) {
      return document.data.Clause[primaryKey]?.toString() || '-';
    }

    // If still not found, try to access using the path notation
    const path = primaryKey.split('.');
    let value: any = document.data;

    for (const key of path) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return '-';
      }
    }

    return value?.toString() || '-';
  } catch (error) {
    return '-';
  }
};

export function AnalyseTab() {
  const { toast } = useToast();
  const { connections, isLoading: isLoadingConnections, error: connectionsError, fetchConnections } = useConnectionsStore();

  // State for filter options
  const [dataTypeOptions, setDataTypeOptions] = useState<DataTypeOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [dateRangeOptions, setDateRangeOptions] = useState<DateRangeOptionType[]>([]);

  // State for selected filter values
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedDataType, setSelectedDataType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>(DocumentStatus.Error);
  const [selectedDateRange, setSelectedDateRange] = useState<string>(DateRangeOption.Today);
  const [primaryKeyValue, setPrimaryKeyValue] = useState<string>('');
  const [selectedDataTypeObject, setSelectedDataTypeObject] = useState<DataTypeOption | null>(null);

  // State for dropdown popovers
  const [tenantOpen, setTenantOpen] = useState(false);
  const [dataTypeOpen, setDataTypeOpen] = useState(false);

  // State for documents and loading
  const [allDocuments, setAllDocuments] = useState<Record<string, Document[]>>({});
  const [documents, setDocuments] = useState<Record<string, Document[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);
  const [loadingDataTypes, setLoadingDataTypes] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState<boolean>(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // State for search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredDocuments, setFilteredDocuments] = useState<Record<string, Document[]>>({});

  // State for sorting
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // State for JSON viewer modal
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  // Load filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoadingOptions(true);
      try {
        // Fetch connections using the store
        await fetchConnections();

        // Fetch other filter options (except data types which depend on tenant)
        const [statuses, dateRanges] = await Promise.all([
          getStatusOptions(),
          getDateRangeOptions()
        ]);

        setStatusOptions(statuses as StatusOption[]);
        setDateRangeOptions(dateRanges as DateRangeOptionType[]);
        setError(null);
      } catch (error) {
        console.error('Error loading filter options:', error);
        setError('Filtre seçenekleri yüklenirken bir hata oluştu.');
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Filtre seçenekleri yüklenirken bir hata oluştu.",
        });
      } finally {
        setLoadingOptions(false);
      }
    };

    loadFilterOptions();
  }, [toast, fetchConnections]);

  // Load data types when tenant changes
  useEffect(() => {
    const loadDataTypes = async () => {
      if (!selectedTenant) {
        setDataTypeOptions([]);
        setSelectedDataType('');
        setSelectedDataTypeObject(null);
        setPrimaryKeyValue('');
        return;
      }

      setLoadingDataTypes(true);
      try {
        const dataTypes = await getDataTypeOptions(selectedTenant);
        setDataTypeOptions(dataTypes);

        // Reset selected data type if it's not in the new options
        if (selectedDataType && !dataTypes.some((dt: DataTypeOption) => dt.value === selectedDataType)) {
          setSelectedDataType('');
          setSelectedDataTypeObject(null);
          setPrimaryKeyValue('');
        }
      } catch (error) {
        console.error('Error loading data types:', error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Veri türleri yüklenirken bir hata oluştu.",
        });
      } finally {
        setLoadingDataTypes(false);
      }
    };

    loadDataTypes();
  }, [selectedTenant, selectedDataType, toast]);

  // Update documents when page changes or all documents change
  useEffect(() => {
    if (Object.values(allDocuments).length === 0) {
      setDocuments({});
      setTotalPages(1);
      return;
    }

    // Filter documents based on search term
    const filtered = searchTerm
      ? Object.fromEntries(
        Object.entries(allDocuments).map(([key, docs]) => {
          // Her anahtardaki dokümanları filtrele
          const filteredDocs = docs.filter((d: Document) => {
            const searchLower = searchTerm.toLowerCase();
            return (
              (d.referenceCode?.toLowerCase() || '').includes(searchLower) ||
              (d.lastDocumentStatus?.toLowerCase() || '').includes(searchLower) ||
              (d.branchId?.toString() || '').toLowerCase().includes(searchLower) ||
              (selectedDataTypeObject?.primaryKey &&
                (getPrimaryKeyValue(d, selectedDataTypeObject.primaryKey).toString().toLowerCase() || '').includes(searchLower))
            );
          });

          // Anahtar ve filtrelenmiş dokümanları döndür
          return [key, filteredDocs];
        })
      )
      : allDocuments;

    setFilteredDocuments(filtered);

    // Calculate total pages
    const totalDocumentCount = Object.values(filtered).reduce(
      (total, docs) => total + docs.length,
      0
    );

    const calculatedTotalPages = Math.ceil(totalDocumentCount / itemsPerPage);
    setTotalPages(calculatedTotalPages);

    // Ensure current page is valid
    const validCurrentPage = Math.min(currentPage, calculatedTotalPages);
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
    }

    // Calculate start and end indices
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Tüm belgeleri düz bir diziye dönüştür ve indeksleri izle
    let flatDocuments: { key: string; docIndex: number; document: Document }[] = [];

    Object.entries(filtered).forEach(([key, docs]) => {
      docs.forEach((doc, docIndex) => {
        flatDocuments.push({ key, docIndex, document: doc });
      });
    });

    // Sayfalama yap
    const paginatedFlatDocuments = flatDocuments.slice(startIndex, endIndex);

    // Sayfalanmış belgeleri orijinal yapıya geri dönüştür
    const paginatedDocuments: Record<string, Document[]> = {};

    paginatedFlatDocuments.forEach(({ key, document }) => {
      if (!paginatedDocuments[key]) {
        paginatedDocuments[key] = [];
      }
      paginatedDocuments[key].push(document);
    });

    // Belgeleri ayarla
    setDocuments(paginatedDocuments);
  }, [allDocuments, currentPage, itemsPerPage, searchTerm]);

  // Function to handle tenant change
  const handleTenantChange = (value: string) => {
    setSelectedTenant(value);
    setSelectedDataType(''); // Reset data type when tenant changes
    setSelectedDataTypeObject(null);
    setPrimaryKeyValue(''); // Reset primary key value
    setShowTable(false); // Hide table when tenant changes
    setTenantOpen(false); // Close the popover
  };

  // Function to handle data type change
  const handleDataTypeChange = (value: string) => {
    setSelectedDataType(value);

    // Find the selected data type object to get the primaryKey
    const selectedOption = dataTypeOptions.find(option => option.value === value) || null;
    setSelectedDataTypeObject(selectedOption);

    // Reset primary key value when data type changes
    setPrimaryKeyValue('');

    setDataTypeOpen(false); // Close the popover
  };

  // Function to handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Function to handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Function to load documents based on filters
  const loadDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const filter: DocumentFilter = {
        tenantId: selectedTenant || undefined,
        dataType: selectedDataType || undefined,
        status: selectedStatus && selectedStatus !== 'all' ? selectedStatus as DocumentStatus : undefined,
        dateRange: selectedDateRange as DateRangeOption,
        primaryKey: selectedDataTypeObject?.primaryKey || undefined,
        primaryKeyValue: primaryKeyValue || undefined
      };

      const data = await getDocuments(filter);
      setAllDocuments(data);
      setCurrentPage(1); // Reset to first page when loading new data
      setShowTable(true);

      if (Object.entries(data).length === 0) {
        toast({
          title: "Bilgi",
          description: "Seçilen kriterlere uygun veri bulunamadı.",
        });
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Veriler yüklenirken bir hata oluştu.');
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to view document data
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setOpenDialog(true);
  };

  // Function to handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Filter documents based on search term
    const filtered = Object.fromEntries(
      Object.entries(allDocuments).map(([key, docs]) => {
        // Her anahtardaki dokümanları filtrele
        const filteredDocs = docs.filter((d: Document) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            (d.referenceCode?.toLowerCase() || '').includes(searchLower) ||
            (d.lastDocumentStatus?.toLowerCase() || '').includes(searchLower) ||
            (d.branchId?.toString() || '').toLowerCase().includes(searchLower) ||
            (selectedDataTypeObject?.primaryKey &&
              (getPrimaryKeyValue(d, selectedDataTypeObject.primaryKey).toString().toLowerCase() || '').includes(searchLower))
          );
        });

        // Anahtar ve filtrelenmiş dokümanları döndür
        return [key, filteredDocs];
      })
    );

    setFilteredDocuments(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Function to handle sorting
  const handleSort = (field: string) => {
    // If clicking the same field, toggle direction
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it as sort field with default asc direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Apply sorting to filtered documents
  useEffect(() => {
    if (!sortField) {
      return;
    }

    let flatDocuments: { key: string; document: Document }[] = [];

    Object.entries(filteredDocuments).forEach(([key, docs]) => {
      docs.forEach((doc) => {
        flatDocuments.push({ key, document: doc });
      });
    });

    // Belgeleri sırala
    const sortedFlatDocuments = [...flatDocuments].sort((a, b) => {
      let valueA, valueB;
      const docA = a.document;
      const docB = b.document;

      // Get the appropriate values based on the sort field
      switch (sortField) {
        case 'branchId':
          valueA = docA.branchId || '';
          valueB = docB.branchId || '';
          break;
        case 'status':
          valueA = docA.lastDocumentStatus || '';
          valueB = docB.lastDocumentStatus || '';
          break;
        case 'referenceCode':
          valueA = docA.referenceCode || '';
          valueB = docB.referenceCode || '';
          break;
        case 'createdAt':
          valueA = new Date(docA.createdAt || 0).getTime();
          valueB = new Date(docB.createdAt || 0).getTime();
          break;
        case 'expiresAt':
          valueA = new Date(docA.expiresAt || 0).getTime();
          valueB = new Date(docB.expiresAt || 0).getTime();
          break;
        case 'primaryKey':
          if (selectedDataTypeObject?.primaryKey) {
            valueA = getPrimaryKeyValue(docA, selectedDataTypeObject.primaryKey);
            valueB = getPrimaryKeyValue(docB, selectedDataTypeObject.primaryKey);
          } else {
            valueA = '';
            valueB = '';
          }
          break;
        default:
          valueA = '';
          valueB = '';
      }

      // Determine the sort order
      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Sıralanmış belgeleri orijinal yapıya geri dönüştür
    const sortedDocuments: Record<string, Document[]> = {};

    sortedFlatDocuments.forEach(({ key, document }) => {
      if (!sortedDocuments[key]) {
        sortedDocuments[key] = [];
      }
      sortedDocuments[key].push(document);
    });

    setFilteredDocuments(sortedDocuments);
  }, [sortField, sortDirection, allDocuments, selectedDataTypeObject]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Veri Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOptions || isLoadingConnections ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Filtre seçenekleri yükleniyor...</span>
            </div>
          ) : error || connectionsError ? (
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error || connectionsError}</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tenant Filter with Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Firma Kısa Kod Seçiniz</label>
                  <Popover open={tenantOpen} onOpenChange={setTenantOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={tenantOpen}
                        className="w-full justify-between"
                      >
                        {selectedTenant ?
                          connections.find((connection) => connection.tenantId === selectedTenant)?.name +
                          ` (${selectedTenant})` :
                          "Firma seçiniz"}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Firma ara..." className="h-9" />
                        <CommandEmpty>Firma bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {connections.length === 0 ? (
                              <CommandItem disabled>
                                Firma bulunamadı
                              </CommandItem>
                            ) : (
                              connections.map((option) => (
                                <CommandItem
                                  key={option.tenantId}
                                  value={option.name}
                                  onSelect={(currentValue) => {
                                    // Find the option with matching label and use its value
                                    const selectedOption = connections.find(opt => opt.name === currentValue);
                                    if (selectedOption) {
                                      handleTenantChange(selectedOption.tenantId);
                                    }
                                  }}
                                >
                                  {option.name}
                                  {selectedTenant === option.tenantId && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </CommandItem>
                              ))
                            )}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Data Type Filter with Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Veri Türü Seçiniz</label>
                  <Popover open={dataTypeOpen} onOpenChange={setDataTypeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={dataTypeOpen}
                        className="w-full justify-between"
                        disabled={!selectedTenant || loadingDataTypes}
                      >
                        {loadingDataTypes ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Yükleniyor...</span>
                          </div>
                        ) : selectedDataType ?
                          dataTypeOptions.find((option) => option.value === selectedDataType)?.label :
                          "Veri türü seçiniz"}
                        {!loadingDataTypes && <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Veri türü ara..." className="h-9" />
                        <CommandEmpty>Veri türü bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {dataTypeOptions.length === 0 ? (
                              <CommandItem disabled>
                                {selectedTenant ? 'Veri türü bulunamadı' : 'Önce firma seçiniz'}
                              </CommandItem>
                            ) : (
                              dataTypeOptions.map((option) => (
                                <CommandItem
                                  key={option.value}
                                  value={option.label}
                                  onSelect={(currentValue) => {
                                    // Find the option with matching label and use its value
                                    const selectedOption = dataTypeOptions.find(opt => opt.label === currentValue);
                                    if (selectedOption) {
                                      handleDataTypeChange(selectedOption.value);
                                    }
                                  }}
                                >
                                  {option.label}
                                  {selectedDataType === option.value && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </CommandItem>
                              ))
                            )}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>


                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Durum Seçiniz</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tarih Aralığı Seçiniz</label>
                  <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tarih aralığı seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRangeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Primary Key Input - Only show if selectedDataTypeObject has a primaryKey */}
                {selectedDataTypeObject && selectedDataTypeObject.primaryKey && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{selectedDataTypeObject.primaryKey}(Opsiyonel)</label>
                    <Input
                      placeholder={`${selectedDataTypeObject.primaryKey} değeri giriniz (Opsiyonel)`}
                      value={primaryKeyValue}
                      onChange={(e) => setPrimaryKeyValue(e.target.value)}
                    />
                  </div>
                )}

              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={loadDocuments}
                  disabled={loading || !selectedTenant}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    "Yükle"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showTable && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Veri Listesi</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sayfa başına:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex items-center justify-center py-8 text-destructive">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            ) : (
              <>
                {/* Search input */}
                <div className="flex items-center mb-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tabloda ara..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-8"
                    />
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    Toplam {Object.values(filteredDocuments).flat().length} kayıt,
                    {Object.values(documents).flat().length > 0
                      ? (currentPage - 1) * itemsPerPage + 1
                      : 0} -
                    {Math.min(
                      currentPage * itemsPerPage,
                      Object.values(filteredDocuments).flat().length
                    )} arası gösteriliyor
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => handleSort('branchId')}
                        >
                          <div className="flex items-center">
                            Şube ID
                            {sortField === 'branchId' && (
                              sortDirection === 'asc'
                                ? <ArrowUp className="ml-1 h-4 w-4" />
                                : <ArrowDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => handleSort('key')}
                        >
                          <div className="flex items-center">
                            Veri Türü
                            {sortField === 'key' && (
                              sortDirection === 'asc'
                                ? <ArrowUp className="ml-1 h-4 w-4" />
                                : <ArrowDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        {selectedDataTypeObject?.primaryKey && (
                          <TableHead
                            className="cursor-pointer hover:bg-slate-50"
                            onClick={() => handleSort('primaryKey')}
                          >
                            <div className="flex items-center">
                              {selectedDataTypeObject.primaryKey}
                              {sortField === 'primaryKey' && (
                                sortDirection === 'asc'
                                  ? <ArrowUp className="ml-1 h-4 w-4" />
                                  : <ArrowDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                        )}

                        <TableHead
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Son Durum
                            {sortField === 'status' && (
                              sortDirection === 'asc'
                                ? <ArrowUp className="ml-1 h-4 w-4" />
                                : <ArrowDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => handleSort('referenceCode')}
                        >
                          <div className="flex items-center">
                            Referans Kodu
                            {sortField === 'referenceCode' && (
                              sortDirection === 'asc'
                                ? <ArrowUp className="ml-1 h-4 w-4" />
                                : <ArrowDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center">
                            Verinin Oluştuğu Tarih
                            {sortField === 'createdAt' && (
                              sortDirection === 'asc'
                                ? <ArrowUp className="ml-1 h-4 w-4" />
                                : <ArrowDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => handleSort('expiresAt')}
                        >
                          <div className="flex items-center">
                            Silinme Süresine Kalan
                            {sortField === 'expiresAt' && (
                              sortDirection === 'asc'
                                ? <ArrowUp className="ml-1 h-4 w-4" />
                                : <ArrowDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(documents).flat().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={selectedDataTypeObject?.primaryKey ? 7 : 6} className="text-center py-4">
                            Veri bulunamadı
                          </TableCell>
                        </TableRow>
                      ) : (
                        Object.entries(documents).flatMap(([key, docArray]) =>
                          docArray.map((document) => (
                            <TableRow key={document.id}>
                              <TableCell>{document.branchId}</TableCell>
                              <TableCell>{key}</TableCell>
                              {selectedDataTypeObject?.primaryKey && (
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <span>{getPrimaryKeyValue(document, selectedDataTypeObject.primaryKey)}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 hover:bg-green-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(getPrimaryKeyValue(document, selectedDataTypeObject.primaryKey), toast, e);
                                      }}
                                      title="Kopyala"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                              <TableCell>
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  document.lastDocumentStatus === 'Completed' && "bg-green-100 text-green-800",
                                  document.lastDocumentStatus === 'Error' && "bg-red-100 text-red-800",
                                  document.lastDocumentStatus === 'Processing' && "bg-blue-100 text-blue-800",
                                  document.lastDocumentStatus === 'Created' && "bg-yellow-100 text-yellow-800",
                                  document.lastDocumentStatus === 'Ignore' && "bg-gray-100 text-gray-800"
                                )}>
                                  {document.lastDocumentStatus}
                                </span>
                              </TableCell>
                              <TableCell>{document.referenceCode}</TableCell>
                              <TableCell>{formatDateSimple(document.createdAt)}</TableCell>
                              <TableCell>{getRemainingTime(document.expiresAt)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDocument(document)} 
                                >
                                  Detaylar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Toplam {Object.values(filteredDocuments).flat().length} kayıt
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* JSON Viewer Modal */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <span className="font-bold">Döküman Detayı</span>
                {selectedDocument && (
                  <span className="ml-2 text-sm font-normal">
                    ({selectedDocument.lastDocumentStatus} - {formatDateSimple(selectedDocument.createdAt)})
                  </span>
                )}
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>
              Döküman detaylarını inceleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <Tabs defaultValue="workflow" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="workflow">İş Akışı</TabsTrigger>
                <TabsTrigger value="data">Veri</TabsTrigger>
              </TabsList>
              <TabsContent value="workflow" className="flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto h-full">
                  <WorkflowVisualization workflow={selectedDocument.workFlow || []} />
                </div>
              </TabsContent>
              <TabsContent value="data" className="flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto h-full">
                  <JsonViewer data={selectedDocument.data} />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
