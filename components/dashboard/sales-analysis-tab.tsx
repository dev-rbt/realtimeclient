'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { format, isWithinInterval, parseISO, isAfter, isBefore, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Eye, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SalesData {
  id: string;
  tenantId: string;
  branchId: number;
  orderDateTime: string;
  createdAt: string;
  documentId: string;
  referenceCode: string;
  hash: string;
  documentName: string;
  primaryKeyName: string;
  primaryKeyField: string;
  orderKey: string;
  details?: any;
}

// Sort types
type SortField = 'orderDateTime' | 'createdAt' | null;
type SortDirection = 'asc' | 'desc';

export function SalesAnalysisTab() {
  const [searchStartDate, setSearchStartDate] = useState<Date | undefined>(new Date());
  const [searchEndDate, setSearchEndDate] = useState<Date | undefined>(new Date());
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [filteredData, setFilteredData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SalesData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedData, setPaginatedData] = useState<SalesData[]>([]);
  
  const { toast } = useToast();
  const api = useApi();

  const fetchSalesData = async () => {
    if (!searchStartDate || !searchEndDate) {
      toast({
        title: "Tarih seçimi gerekli",
        description: "Başlangıç ve bitiş tarihlerini seçiniz.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Set start date to beginning of day (00:00:00)
      const startDateWithTime = new Date(searchStartDate);
      startDateWithTime.setHours(0, 0, 0, 0);
      
      // Set end date to end of day (23:59:59)
      const endDateWithTime = new Date(searchEndDate);
      endDateWithTime.setHours(23, 59, 59, 999);
      
      const formattedStartDate = format(startDateWithTime, 'yyyy-MM-dd\'T\'HH:mm:ss');
      const formattedEndDate = format(endDateWithTime, 'yyyy-MM-dd\'T\'HH:mm:ss');
      
      const response = await api.get<SalesData[]>(
        `/system/oldsalesanalyze?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      
      setSalesData(response.data);
      setFilteredData(sortData(response.data, 'createdAt', 'desc'));
      setCurrentPage(1); // Reset to first page when new data is loaded
      
      // Set default sorting
      setSortField('createdAt');
      setSortDirection('desc');
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Satış verileri yüklenirken bir hata oluştu.');
      toast({
        title: "Veri yükleme hatası",
        description: "Satış verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date safely
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleString('tr-TR');
    } catch (error) {
      return 'N/A';
    }
  };

  // Sort function
  const sortData = (data: SalesData[], field: SortField, direction: SortDirection): SalesData[] => {
    if (!field) return data;
    
    return [...data].sort((a, b) => {
      if (field === 'orderDateTime' || field === 'createdAt') {
        const dateA = a[field] ? new Date(a[field] as string).getTime() : 0;
        const dateB = b[field] ? new Date(b[field] as string).getTime() : 0;
        
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      return 0;
    });
  };

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to desc
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Date search filter
  const filterByDateRange = (data: SalesData[]): SalesData[] => {
    if (!searchStartDate && !searchEndDate) return data;
    
    return data.filter(item => {
      const itemDate = item.createdAt ? parseISO(item.createdAt as string) : null;
      
      if (!itemDate) return false;
      
      // If only start date is provided
      if (searchStartDate && !searchEndDate) {
        const startDateWithTime = new Date(searchStartDate);
        startDateWithTime.setHours(0, 0, 0, 0);
        return itemDate >= startDateWithTime;
      }
      
      // If only end date is provided
      if (!searchStartDate && searchEndDate) {
        const endDateWithTime = new Date(searchEndDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        return itemDate <= endDateWithTime;
      }
      
      // If both dates are provided
      if (searchStartDate && searchEndDate) {
        const startDateWithTime = new Date(searchStartDate);
        startDateWithTime.setHours(0, 0, 0, 0);
        
        const endDateWithTime = new Date(searchEndDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        
        return isWithinInterval(itemDate, {
          start: startDateWithTime,
          end: endDateWithTime
        });
      }
      
      return true;
    });
  };

  // Filter by tenant ID
  const filterByTenantId = (data: SalesData[]) => {
    if (!selectedTenantId || selectedTenantId === 'all') return data;
    
    return data.filter(item => item.tenantId === selectedTenantId);
  };

  // Get unique tenant IDs
  const getUniqueTenantIds = (data: SalesData[]) => {
    const tenantIds = data.map(item => item.tenantId);
    return Array.from(new Set(tenantIds));
  };

  // Apply date search
  const handleApplyDateSearch = () => {
    setCurrentPage(1); // Reset to first page when filter changes
    fetchSalesData(); // Fetch data based on the selected dates
  };

  // Clear date search
  const handleClearDateSearch = () => {
    // Reset to default settings
    setSearchStartDate(new Date());
    setSearchEndDate(new Date());
    setCurrentPage(1);
    
    // Apply the default filters
    fetchSalesData();
  };

  // Handle search
  useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();
    
    // First filter by text search
    let filtered = salesData;
    if (trimmedSearchTerm !== '') {
      filtered = salesData.filter(item => 
        (item.tenantId?.toLowerCase().includes(trimmedSearchTerm) ||
        item.branchId?.toString().toLowerCase().includes(trimmedSearchTerm) ||
        item.primaryKeyField?.toLowerCase().includes(trimmedSearchTerm) ||
        item.referenceCode?.toLowerCase().includes(trimmedSearchTerm))
      );
    }
    
    // Then filter by tenant ID
    filtered = filterByTenantId(filtered);
    
    // Then filter by date range
    filtered = filterByDateRange(filtered);
    
    // Then sort the data
    filtered = sortData(filtered, sortField, sortDirection);
    
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, salesData, sortField, sortDirection, searchStartDate, searchEndDate, selectedTenantId]);

  // Handle pagination
  useEffect(() => {
    if (filteredData.length === 0) {
      setPaginatedData([]);
      setTotalPages(1);
      return;
    }
    
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    setTotalPages(totalPages);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage, itemsPerPage]);

  // Initial data fetch
  useEffect(() => {
    fetchSalesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sorted = sortData(salesData, sortField, sortDirection);
    setFilteredData(sorted);
  }, [salesData]);

  const handleViewDetails = async (item: SalesData) => {
    setSelectedItem(item);
    setDetailsOpen(true);
    setLoadingDetails(true);
    setDetailsData(null);
    setDetailsError(null);
    
    try {
      const response = await api.get(`/system/oldsalesanalyze/details`, {
        params: {
          tenantId: item.tenantId,
          branchId: item.branchId,
          documentId: item.documentId,
          documentName: item.documentName
        }
      });
      
      setDetailsData(response.data);
    } catch (err) {
      console.error('Error fetching details:', err);
      setDetailsError('Detaylı veri yüklenirken bir hata oluştu.');
      toast({
        title: "Veri yükleme hatası",
        description: "Detaylı veri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Pagination controls
  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4" /> 
      : <ArrowDown className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Eski Satış Veri Analizi</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !searchStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchStartDate ? format(searchStartDate, 'PPP', { locale: tr }) : "Başlangıç Tarihi"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={searchStartDate}
                  onSelect={setSearchStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !searchEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchEndDate ? format(searchEndDate, 'PPP', { locale: tr }) : "Bitiş Tarihi"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={searchEndDate}
                  onSelect={setSearchEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleApplyDateSearch}>Filtrele</Button>
          <Button 
            variant="outline" 
            onClick={handleClearDateSearch}
          >
            Temizle
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b bg-muted/50 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <h3 className="font-medium">Satış Verileri</h3>
            
            {salesData.length > 0 && (
              <Select
                value={selectedTenantId}
                onValueChange={(value) => setSelectedTenantId(value)}
              >
                <SelectTrigger className="h-9 w-full sm:w-[200px]">
                  <SelectValue placeholder="Firma Kısa Kodu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Firmalar</SelectItem>
                  {getUniqueTenantIds(salesData).map((tenantId) => (
                    <SelectItem key={tenantId} value={tenantId}>
                      {tenantId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ara..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Seçilen tarih aralığında veri bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Firma Kodu</TableHead>
                    <TableHead>Şube ID</TableHead>
                    <TableHead>Sipariş Numarası</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('orderDateTime')}
                    >
                      <div className="flex items-center">
                        Sipariş Tarihi
                        {renderSortIcon('orderDateTime')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Veri Gelme Tarihi
                        {renderSortIcon('createdAt')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.tenantId}</TableCell>
                      <TableCell>{item.branchId}</TableCell>
                      <TableCell>{item.primaryKeyField}</TableCell>
                      <TableCell>{formatDate(item.orderDateTime)}</TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDetails(item)}
                          className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detay Görüntüle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Gösterilen: {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredData.length)} / {filteredData.length}
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm mx-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Satış Detayları</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Firma Kodu</p>
                  <p className="text-base">{selectedItem.tenantId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Şube ID</p>
                  <p className="text-base">{selectedItem.branchId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sipariş Numarası</p>
                  <p className="text-base">{selectedItem.primaryKeyField}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Referans Kodu</p>
                  <p className="text-base">{selectedItem.referenceCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sipariş Tarihi</p>
                  <p className="text-base">{formatDate(selectedItem.orderDateTime)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Veri Gelme Tarihi</p>
                  <p className="text-base">{formatDate(selectedItem.createdAt)}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Detaylı Veri</p>
                {loadingDetails ? (
                  <div className="flex flex-col items-center justify-center p-4 h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                    <p className="text-sm text-muted-foreground">Veri yükleniyor...</p>
                  </div>
                ) : detailsError ? (
                  <div className="p-4 text-center">
                    <p className="text-red-500">{detailsError}</p>
                  </div>
                ) : detailsData ? (
                  <div className="max-h-[400px] overflow-auto border rounded-md">
                    <pre className="bg-muted p-4 text-xs whitespace-pre-wrap">
                      {JSON.stringify(detailsData, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground">Detaylı veri bulunamadı.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
