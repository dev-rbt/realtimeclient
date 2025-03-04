'use client';

import { useState } from 'react';
import { Search, Building2, CheckCircle2, XCircle, Clock, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DocumentMetricsResponse } from '@/lib/types';
import { useMetricsStore } from '@/store/useMetricsStore';
import { Button } from '@/components/ui/button';

interface CompanyCardProps {
  companyCode: string;
  data: DocumentMetricsResponse['tenants'][string];
}

function CompanyCard({ companyCode, data }: CompanyCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Get unique report names across all branches
  const allReportNames = Array.from(
    new Set(
      data.branches.flatMap(branch => 
        branch.reports.map(report => report.reportName)
      )
    )
  );

  // Calculate metrics for each report across all branches
  const reportMetrics = allReportNames.reduce((acc, reportName) => {
    const metrics = {
      success: { count: 0, size: 0 },
      error: { count: 0, size: 0 },
      processing: { count: 0, size: 0 },
      ignore: { count: 0, size: 0 }
    };
    
    data.branches.forEach(branch => {
      const report = branch.reports.find(r => r.reportName === reportName);
      if (report) {
        metrics.success.count += report.totalSuccess.count;
        metrics.success.size += report.totalSuccess.size;
        metrics.error.count += report.totalError.count;
        metrics.error.size += report.totalError.size;
        metrics.processing.count += report.totalProcessing.count;
        metrics.processing.size += report.totalProcessing.size;
        metrics.ignore.count += report.totalIgnore.count;
        metrics.ignore.size += report.totalIgnore.size;
      }
    });
    
    acc[reportName] = metrics;
    return acc;
  }, {} as Record<string, { 
    success: { count: number, size: number },
    error: { count: number, size: number },
    processing: { count: number, size: number },
    ignore: { count: number, size: number }
  }>);

  // Prepare branch data for table
  const branchData = data.branches.map(branch => {
    // If a report is selected, filter to only include branches with that report
    if (selectedReport) {
      const reportData = branch.reports.find(r => r.reportName === selectedReport);
      if (!reportData) return null;
    }
    
    return {
      branchId: branch.branchId,
      branchActive: branch.isActive,
      success: branch.totalSuccess,
      error: branch.totalError,
      processing: branch.totalProcessing,
      ignore: branch.totalIgnore
    };
  }).filter(Boolean) as Array<{
    branchId: number;
    branchActive: boolean;
    success: { count: number, size: number };
    error: { count: number, size: number };
    processing: { count: number, size: number };
    ignore: { count: number, size: number };
  }>;

  // Pagination
  const totalPages = Math.ceil(branchData.length / itemsPerPage);
  const paginatedData = branchData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatSizeToMB = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full translate-y-12 -translate-x-12" />
          
          <div className="relative p-6">
            <div className="flex justify-between gap-8">
              {/* Left side - Company and Branch Info */}
              <div className="space-y-6 flex-1">
                {/* Company Code */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl shadow-inner">
                    <Building2 className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600/80">Firma Kodu</p>
                    <h3 className="text-2xl font-bold text-blue-700">{companyCode}</h3>
                  </div>
                </div>

                {/* Branch Stats */}
                <div className="flex gap-6 items-center">
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 px-4 py-3 rounded-xl">
                    <p className="text-sm font-medium text-green-600/80 mb-1">Aktif Şube</p>
                    <p className="text-2xl font-bold text-green-700">{data.activeBranches}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100/50 px-4 py-3 rounded-xl">
                    <p className="text-sm font-medium text-red-600/80 mb-1">Pasif Şube</p>
                    <p className="text-2xl font-bold text-red-700">{data.passiveBranches}</p>
                  </div>
                </div>

                {/* Database Connection Status */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                  data.databaseConnection 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  <Database className={`h-4 w-4 ${data.databaseConnection ? "animate-pulse" : ""}`} />
                  <span className="text-sm font-medium">
                    {data.databaseConnection ? "Veritabanı Bağlı" : "Bağlantı Yok"}
                  </span>
                </div>
              </div>

              {/* Right side - Transaction Stats */}
              <div className="flex flex-col justify-between py-1 min-w-[140px] space-y-2">
                <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-transparent p-2 rounded-l-full hover:from-green-100 transition-colors">
                  <div className="bg-white/80 p-1.5 rounded-full shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600/80">Başarılı</p>
                    <p className="text-lg font-bold text-green-700">{data.totalSuccess.count}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-transparent p-2 rounded-l-full hover:from-red-100 transition-colors">
                  <div className="bg-white/80 p-1.5 rounded-full shadow-sm">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-600/80">Başarısız</p>
                    <p className="text-lg font-bold text-red-700">{data.totalError.count}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-transparent p-2 rounded-l-full hover:from-orange-100 transition-colors">
                  <div className="bg-white/80 p-1.5 rounded-full shadow-sm">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-600/80">İşlenen</p>
                    <p className="text-lg font-bold text-orange-700">{data.totalProcessing.count}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{companyCode} Detaylı Bilgiler</DialogTitle>
        </DialogHeader>
        
        {/* Report Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          <Card 
            className={`p-4 cursor-pointer transition-all ${selectedReport === null ? 'ring-2 ring-blue-500 shadow-md' : ''}`}
            onClick={() => setSelectedReport(null)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-700">Tüm Raporlar</h3>
                <p className="text-2xl font-bold">
                  {data.totalSuccess.count + data.totalError.count + data.totalProcessing.count + data.totalIgnore.count}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({formatSizeToMB(data.totalSuccess.size + data.totalError.size + data.totalProcessing.size + data.totalIgnore.size)}MB)
                  </span>
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-full">
                <Database className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </Card>
          
          {allReportNames.map((reportName) => {
            const metrics = reportMetrics[reportName];
            const totalCount = metrics.success.count + metrics.error.count + metrics.processing.count + metrics.ignore.count;
            const totalSize = metrics.success.size + metrics.error.size + metrics.processing.size + metrics.ignore.size;
            
            return (
              <Card 
                key={reportName}
                className={`p-4 cursor-pointer transition-all ${selectedReport === reportName ? 'ring-2 ring-blue-500 shadow-md' : ''}`}
                onClick={() => setSelectedReport(reportName)}
              >
                <div className="flex flex-col justify-between h-full">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2 line-clamp-1" title={reportName}>
                    {reportName}
                  </h3>
                  <div className="flex justify-between items-end">
                    <p className="text-xl font-bold">
                      {totalCount}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({formatSizeToMB(totalSize)}MB)
                      </span>
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        {/* Data Table */}
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Şube</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Başarılı</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Başarısız</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">İşleniyor</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Yoksayılan</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Şube #{item.branchId}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.branchActive 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {item.branchActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-green-600">{item.success.count}</span>
                      <span className="text-xs text-muted-foreground ml-1">({formatSizeToMB(item.success.size)}MB)</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-red-600">{item.error.count}</span>
                      <span className="text-xs text-muted-foreground ml-1">({formatSizeToMB(item.error.size)}MB)</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-orange-600">{item.processing.count}</span>
                      <span className="text-xs text-muted-foreground ml-1">({formatSizeToMB(item.processing.size)}MB)</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-blue-600">{item.ignore.count}</span>
                      <span className="text-xs text-muted-foreground ml-1">({formatSizeToMB(item.ignore.size)}MB)</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Bu rapor için şube verisi bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Toplam {branchData.length} şube, Sayfa {currentPage}/{totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CompanyCards() {
  const [searchQuery, setSearchQuery] = useState("");
  const { metrics } = useMetricsStore();

  const companies = Object.entries(metrics?.tenants ?? {}).map(([code, data]) => ({
    companyCode: code,
    data,
  }));

  const filteredCompanies = companies.filter((company) =>
    company.companyCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Firma koduna göre ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border bg-card/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <CompanyCard
            key={company.companyCode}
            companyCode={company.companyCode}
            data={company.data}
          />
        ))}
      </div>
    </div>
  );
}
