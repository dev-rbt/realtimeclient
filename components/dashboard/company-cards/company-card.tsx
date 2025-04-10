import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatNumber } from "@/lib/utils";
import { Building2, RefreshCw, TrendingUp, Database, ArrowRight, Store } from "lucide-react";
import MetricsSection from "./metrics-section";
import DetailMetricsSection from "./detail-metrics-section";
import { TenantInfo, TenantMetrics } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface CompanyCardProps {
    tenant: TenantInfo;
    metrics: TenantMetrics;
    refreshMetrics: (tenantId: string) => void;
}

function CompanyCard({ tenant, metrics, refreshMetrics }: CompanyCardProps) {
    // Calculate total for each category
    const calculateTotal = (metrics: any) => {
        let total = 0;
        if (metrics.processing.data?.count) total += metrics.processing.data.count;
        if (metrics.completed.data?.count) total += metrics.completed.data.count;
        if (metrics.error.data?.count) total += metrics.error.data.count;
        if (metrics.created.data?.count) total += metrics.created.data.count;
        if (metrics.ignore.data?.count) total += metrics.ignore.data.count;
        return total;
    };

    const saleTotal = calculateTotal(metrics.sale);
    const otherTotal = calculateTotal(metrics.other);

    // Check if any metrics are loading
    const isSaleLoading = metrics.sale.processing.loading || 
                         metrics.sale.completed.loading || 
                         metrics.sale.error.loading || 
                         metrics.sale.created.loading ||
                         metrics.sale.ignore.loading;
                         
    const isOtherLoading = metrics.other.processing.loading || 
                          metrics.other.completed.loading || 
                          metrics.other.error.loading || 
                          metrics.other.created.loading ||
                          metrics.other.ignore.loading;

    // Calculate percentages for progress bars
    const getSalePercentage = (status: string) => {
        if (saleTotal === 0) return 0;
        const count = metrics.sale[status as keyof typeof metrics.sale]?.data?.count || 0;
        return (count / saleTotal) * 100;
    };

    const getOtherPercentage = (status: string) => {
        if (otherTotal === 0) return 0;
        const count = metrics.other[status as keyof typeof metrics.other]?.data?.count || 0;
        return (count / otherTotal) * 100;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="border-b bg-muted/30 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Firma Kodu</p>
                                <h3 className="font-semibold text-foreground">{tenant.tenantId}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="bg-green-50 text-green-700 font-medium flex items-center gap-1">
                                    <Store className="h-3 w-3" />
                                    <span>{formatNumber(tenant.activeBranches)} Aktif</span>
                                </Badge>
                                <Badge variant="outline" className="bg-red-50 text-red-700 font-medium flex items-center gap-1">
                                    <Store className="h-3 w-3" />
                                    <span>{formatNumber(tenant.passiveBranches)} Pasif</span>
                                </Badge>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    refreshMetrics(tenant.tenantId); 
                                }}
                                disabled={isSaleLoading || isOtherLoading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-1.5 ${(isSaleLoading || isOtherLoading) ? 'animate-spin' : ''}`} />
                                Yenile
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sales Metrics */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-medium text-sm text-foreground">Satış Belgeleri</h4>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 font-medium">
                                    {isSaleLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : formatNumber(saleTotal)} Belge
                                </Badge>
                            </div>
                            
                            <div className="space-y-3">
                                {/* Completed */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                            <span className="text-muted-foreground">Başarılı</span>
                                        </div>
                                        <span className="font-medium">
                                            {metrics.sale.completed.loading ? 
                                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                                formatNumber(metrics.sale.completed.data?.count)}
                                        </span>
                                    </div>
                                    <Progress value={getSalePercentage('completed')} className="h-1.5 bg-muted" indicatorClassName="bg-green-500" />
                                </div>
                                
                                {/* Processing */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                            <span className="text-muted-foreground">İşlenen</span>
                                        </div>
                                        <span className="font-medium">
                                            {metrics.sale.processing.loading ? 
                                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                                formatNumber(metrics.sale.processing.data?.count)}
                                        </span>
                                    </div>
                                    <Progress value={getSalePercentage('processing')} className="h-1.5 bg-muted" indicatorClassName="bg-blue-500" />
                                </div>
                                
                                {/* Created */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                            <span className="text-muted-foreground">Kuyrukta</span>
                                        </div>
                                        <span className="font-medium">
                                            {metrics.sale.created.loading ? 
                                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                                formatNumber(metrics.sale.created.data?.count)}
                                        </span>
                                    </div>
                                    <Progress value={getSalePercentage('created')} className="h-1.5 bg-muted" indicatorClassName="bg-purple-500" />
                                </div>
                                
                                {/* Error */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                            <span className="text-muted-foreground">Hatalı</span>
                                        </div>
                                        <span className="font-medium">
                                            {metrics.sale.error.loading ? 
                                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                                formatNumber(metrics.sale.error.data?.count)}
                                        </span>
                                    </div>
                                    <Progress value={getSalePercentage('error')} className="h-1.5 bg-muted" indicatorClassName="bg-red-500" />
                                </div>
                                
                                {/* Ignored */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                                            <span className="text-muted-foreground">Yoksayılan</span>
                                        </div>
                                        <span className="font-medium">
                                            {metrics.sale.ignore.loading ? 
                                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                                formatNumber(metrics.sale.ignore.data?.count)}
                                        </span>
                                    </div>
                                    <Progress value={getSalePercentage('ignore')} className="h-1.5 bg-muted" indicatorClassName="bg-gray-400" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Other Metrics */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-purple-600" />
                                    <h4 className="font-medium text-sm text-foreground">Diğer Belgeler</h4>
                                </div>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 font-medium">
                                    {isOtherLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : formatNumber(otherTotal)} Belge
                                </Badge>
                            </div>
                            
                            <div className="space-y-3">
                                {/* Completed */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                            <span className="text-muted-foreground">Başarılı</span>
                                        </div>
                                        <span className="font-medium">
                                            {metrics.other.completed.loading ? 
                                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                                formatNumber(metrics.other.completed.data?.count)}
                                        </span>
                                    </div>
                                    <Progress value={getOtherPercentage('completed')} className="h-1.5 bg-muted" indicatorClassName="bg-green-500" />
                                </div>
                                
                                {/* Processing */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                            <span className="text-muted-foreground">İşlenen</span>
                                        </div>
                                        <span className="font-medium">
                                            {metrics.other.processing.loading ? 
                                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                                formatNumber(metrics.other.processing.data?.count)}
                                        </span>
                                    </div>
                                    <Progress value={getOtherPercentage('processing')} className="h-1.5 bg-muted" indicatorClassName="bg-blue-500" />
                                </div>
                                
                                {/* Created */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                            <span className="text-muted-foreground">Kuyrukta</span>
                                        </div>
                                        <span className="font-medium">
                                            {metrics.other.created.loading ? 
                                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                                formatNumber(metrics.other.created.data?.count)}
                                        </span>
                                    </div>
                                    <Progress value={getOtherPercentage('created')} className="h-1.5 bg-muted" indicatorClassName="bg-purple-500" />
                                </div>
                                
                                {/* Error */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                            <span className="text-muted-foreground">Hatalı</span>
                                        </div>
                                        <span className="font-medium">
                                            {metrics.other.error.loading ? 
                                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                                formatNumber(metrics.other.error.data?.count)}
                                        </span>
                                    </div>
                                    <Progress value={getOtherPercentage('error')} className="h-1.5 bg-muted" indicatorClassName="bg-red-500" />
                                </div>
                                
                                {/* Ignored */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                                            <span className="text-muted-foreground">Yoksayılan</span>
                                        </div>
                                        <span className="font-medium">
                                            {metrics.other.ignore.loading ? 
                                                <RefreshCw className="h-3 w-3 animate-spin" /> : 
                                                formatNumber(metrics.other.ignore.data?.count)}
                                        </span>
                                    </div>
                                    <Progress value={getOtherPercentage('ignore')} className="h-1.5 bg-muted" indicatorClassName="bg-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-muted/20 px-4 py-2 border-t flex items-center justify-center">
                        <span className="text-sm text-muted-foreground mr-1">Detaylı bilgi için tıklayın</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{tenant.tenantId} Detaylı Bilgiler</DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Firma Kodu</p>
                                <h3 className="text-lg font-semibold">{tenant.tenantId}</h3>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 font-medium flex items-center gap-1 px-3 py-1.5">
                                <Store className="h-3.5 w-3.5" />
                                <span>{formatNumber(tenant.activeBranches)} Aktif Şube</span>
                            </Badge>
                            <Badge variant="outline" className="bg-red-50 text-red-700 font-medium flex items-center gap-1 px-3 py-1.5">
                                <Store className="h-3.5 w-3.5" />
                                <span>{formatNumber(tenant.passiveBranches)} Pasif Şube</span>
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                Satış Belgeleri
                            </h3>
                            <MetricsSection 
                                metrics={metrics.sale} 
                                loading={isSaleLoading} 
                            />
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Database className="h-5 w-5 text-purple-600" />
                                Diğer Belgeler
                            </h3>
                            <MetricsSection 
                                metrics={metrics.other} 
                                loading={isOtherLoading} 
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={() => refreshMetrics(tenant.tenantId)}
                            className="flex items-center gap-2"
                            disabled={isSaleLoading || isOtherLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${(isSaleLoading || isOtherLoading) ? 'animate-spin' : ''}`} />
                            Metrikleri Yenile
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CompanyCard;