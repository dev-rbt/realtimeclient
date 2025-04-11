'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Eye, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowDown, ArrowUp, Clock, User, Users, FileText, CreditCard, ChevronDown, Banknote } from 'lucide-react';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

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
      // Tarih string'ini parse et
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      // Tarih string'ini direkt olarak parse edip, saat dilimi dönüşümü yapmadan formatlıyoruz
      // Bu şekilde API'den gelen tarih değeri olduğu gibi korunacak
      const isoDate = dateString.replace('Z', ''); // Z varsa kaldır (UTC işareti)
      const [datePart, timePart] = isoDate.split('T');
      
      if (datePart && timePart) {
        const [year, month, day] = datePart.split('-');
        const [hour, minute, secondWithMs] = timePart.split(':');
        const second = secondWithMs ? secondWithMs.split('.')[0] : '00';
        
        return `${day}.${month}.${year} ${hour}:${minute}:${second}`;
      }
      
      // Eğer ISO formatında değilse, date-fns kullanarak formatla
      return format(date, 'dd.MM.yyyy HH:mm:ss');
    } catch (error) {
      console.error('Date formatting error:', error, dateString);
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
      // API çağrısını düzeltiyorum, hash parametresini ekliyorum
      const response = await api.get(`/system/oldsalesanalyze/details`, {
        params: {
          tenantId: item.tenantId,
          branchId: item.branchId,
          documentId: item.documentId,
          documentName: item.documentName,
          hash: item.hash, // Hash parametresini ekliyorum
          primaryKeyName: item.primaryKeyName,
          primaryKeyField: item.primaryKeyField
        }
      });
      
      // Gelen veriyi doğru şekilde işliyorum
      // TypeScript hatalarını önlemek için any tipini kullanıyoruz
      const responseData: any = response.data;
      
      // data alanı içindeki verileri kullanıyoruz
      if (responseData && responseData.data) {
        setDetailsData(responseData.data);
      } else {
        setDetailsData(responseData);
      }
      
      console.log("Detay verisi:", responseData);
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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary font-semibold">
              {selectedItem?.primaryKeyField && `Sipariş #${selectedItem.primaryKeyField}`}
              {selectedItem?.tableNumber && (
                <Badge variant="outline" className="ml-2">
                  Masa {selectedItem.tableNumber}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Sipariş detaylarını görüntülüyorsunuz.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-2">
            {loadingDetails ? (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-muted-foreground">Veri yükleniyor...</p>
              </div>
            ) : detailsError ? (
              <div className="p-4 text-center">
                <p className="text-destructive">Hata: {detailsError}</p>
              </div>
            ) : detailsData ? (
              <div className="space-y-6">
                {/* Order Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Order Date Card */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <h3 className="text-sm font-medium text-muted-foreground">Sipariş Tarihi</h3>
                    </div>
                    <p className="text-base font-medium">
                      {detailsData?.OrderHeaders?.[0]?.OrderDateTime 
                        ? format(new Date(detailsData.OrderHeaders[0].OrderDateTime), 'dd.MM.yyyy')
                        : format(new Date(selectedItem.orderDateTime), 'dd.MM.yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {detailsData?.OrderHeaders?.[0]?.OrderDateTime 
                        ? format(new Date(detailsData.OrderHeaders[0].OrderDateTime), 'HH:mm:ss')
                        : format(new Date(selectedItem.orderDateTime), 'HH:mm:ss')}
                    </p>
                  </div>

                  {/* Data Arrival Date Card */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="text-sm font-medium text-muted-foreground">Veri Gelme Tarihi</h3>
                    </div>
                    <p className="text-base font-medium">
                      {format(new Date(selectedItem.createdAt), 'dd.MM.yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedItem.createdAt), 'HH:mm:ss')}
                    </p>
                  </div>

                  {/* Personnel Card */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-sm font-medium text-muted-foreground">Personel</h3>
                    </div>
                    <p className="text-base font-medium">
                      {detailsData?.OrderHeaders?.[0]?.EmployeeName || 'Bilinmiyor'}
                    </p>
                  </div>
                </div>

                {/* Customer Count Card */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-medium text-muted-foreground">Kişi Sayısı</h3>
                  </div>
                  <p className="text-base font-medium">
                    {detailsData?.OrderHeaders?.[0]?.GuestNumber || '1'} Kişi
                  </p>
                </div>

                {/* Products Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Ürünler</h3>
                  </div>
                  
                  <div className="max-h-[300px] overflow-auto border rounded-md bg-muted/30">
                    {detailsData?.OrderTransactions?.length > 0 ? (
                      <div className="divide-y">
                        {detailsData.OrderTransactions
                          .filter((item: any) => item.MenuItemText && item.ExtendedPrice > 0) // Sadece gerçek ürünleri göster
                          .map((item: any, index: number) => (
                          <div key={index} className="p-4 hover:bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{item.MenuItemText}</div>
                                {item.Notes && (
                                  <div className="text-sm text-muted-foreground mt-1">{item.Notes}</div>
                                )}
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(item.TransactionDateTime).toLocaleTimeString('tr-TR')}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-primary">₺{item.ExtendedPrice.toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.Quantity} x ₺{item.MenuItemUnitPrice.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        Ürün bilgisi bulunamadı
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Section */}
                {detailsData?.OrderHeaders?.[0] && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-muted/50 p-2 rounded-full">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium">Ödemeler</h3>
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-6">
                      {detailsData?.OrderPayments?.length > 0 ? (
                        detailsData.OrderPayments.map((payment: any, index: number) => (
                          <div key={index} className="mb-6 last:mb-0">
                            <div className="flex items-center">
                              <div className="bg-green-100 p-2 rounded-full mr-3">
                                <Banknote className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium text-base">NAKİT</div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(payment.PaymentDateTime), 'dd/MM/yyyy HH:mm:ss')}
                                  {detailsData?.OrderHeaders?.[0]?.OrderDateTime && payment.PaymentDateTime && (
                                    (() => {
                                      const orderDate = new Date(detailsData.OrderHeaders[0].OrderDateTime);
                                      const paymentDate = new Date(payment.PaymentDateTime);
                                      const diffTime = Math.abs(paymentDate.getTime() - orderDate.getTime());
                                      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                      
                                      if (diffDays > 0 || diffHours > 0) {
                                        if (paymentDate > orderDate) {
                                          return diffDays > 0 
                                            ? ` (Ödeme Sipariş tarihinden ${diffDays} gün sonra alınmış)` 
                                            : diffHours > 0 
                                              ? ` (Ödeme Sipariş tarihinden ${diffHours} saat sonra alınmış)` 
                                              : '';
                                        } else {
                                          return diffDays > 0 
                                            ? ` (Ödeme Sipariş tarihinden ${diffDays} gün önce alınmış)` 
                                            : diffHours > 0 
                                              ? ` (Ödeme Sipariş tarihinden ${diffHours} saat önce alınmış)` 
                                              : '';
                                        }
                                      }
                                      return '';
                                    })()
                                  )}
                                </div>
                              </div>
                              <div className="ml-auto">
                                <div className="font-medium text-primary">₺{payment.AmountPaid.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          Ödeme yok
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Raw JSON Data (Hidden by Default) */}
                <Collapsible className="border-t pt-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center justify-between">
                      <span>JSON Verisi</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 max-h-[400px] overflow-auto border rounded-md relative group">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => {
                          if (detailsData) {
                            navigator.clipboard.writeText(JSON.stringify(detailsData, null, 2));
                            toast({
                              title: "Kopyalandı",
                              description: "JSON verisi panoya kopyalandı.",
                            });
                          }
                        }}
                      >
                        Kopyala
                      </Button>
                      <pre className="bg-muted p-4 text-xs whitespace-pre-wrap overflow-x-auto w-full">
                        {detailsData && JSON.stringify(detailsData, null, 2)}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-muted-foreground">Detaylı veri bulunamadı.</p>
              </div>
            )}
          </div>
          
          {/* Fixed Action Buttons */}
          <div className="border-t mt-4 pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Kapat
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                toast({
                  title: "İşlem Başarılı",
                  description: "Veri içeri alınmadı.",
                });
              }}
            >
              Veriyi İçeri Alma
            </Button>
            <Button 
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                // İçeri alma işlemi burada yapılacak
                toast({
                  title: "İşlem Başarılı",
                  description: "Veri içeri alındı.",
                });
              }}
            >
              Veriyi İçeri Al
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
