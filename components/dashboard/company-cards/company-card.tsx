import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatNumber } from "@/lib/utils";
import { Building2, RefreshCw, TrendingUp, Database } from "lucide-react";
import MetricsSection from "./metrics-section";
import DetailMetricsSection from "./detail-metrics-section";
import { TenantInfo, TenantMetrics } from "@/lib/types";

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

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="relative overflow-hidden bg-white shadow hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-blue-600/80">Firma Kodu</p>
                                    <h3 className="text-lg font-bold text-blue-700">{tenant.tenantId}</h3>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <div className="bg-green-100 px-3 py-1 rounded">
                                    <span className="font-medium text-green-700">{formatNumber(tenant.activeBranches)} Aktif</span>
                                </div>
                                <div className="bg-red-100 px-3 py-1 rounded">
                                    <span className="font-medium text-red-700">{formatNumber(tenant.passiveBranches)} Pasif</span>
                                </div>
                            </div>
                            <div className="flex justify-end w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={(e) => { e.stopPropagation(); refreshMetrics(tenant.tenantId); }}
                                    className="flex items-center gap-2 w-full sm:w-auto"
                                    size="sm"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Yenile
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2 border-b border-blue-100 pb-2">
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-medium text-blue-700">Satış</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Kuyrukta</p>
                                        <p className="text-lg font-bold text-purple-600">
                                            {metrics.sale.created.loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(metrics.sale.created.data?.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">İşlenen</p>
                                        <p className="text-lg font-bold text-blue-700">
                                            {metrics.sale.processing.loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(metrics.sale.processing.data?.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Başarılı</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {metrics.sale.completed.loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(metrics.sale.completed.data?.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Hatalı</p>
                                        <p className="text-lg font-bold text-red-600">
                                            {metrics.sale.error.loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(metrics.sale.error.data?.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Yoksayılan</p>
                                        <p className="text-lg font-bold text-gray-600">
                                            {metrics.sale.ignore.loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(metrics.sale.ignore.data?.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Toplam</p>
                                        <p className="text-lg font-bold text-indigo-600">
                                            {isSaleLoading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(saleTotal)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2 border-b border-purple-100 pb-2">
                                    <Database className="h-4 w-4 text-purple-600" />
                                    <h4 className="font-medium text-purple-700">Diğer Veriler</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Kuyrukta</p>
                                        <p className="text-lg font-bold text-purple-600">
                                            {metrics.other.created.loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(metrics.other.created.data?.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">İşlenen</p>
                                        <p className="text-lg font-bold text-blue-700">
                                            {metrics.other.processing.loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(metrics.other.processing.data?.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Başarılı</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {metrics.other.completed.loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(metrics.other.completed.data?.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Hatalı</p>
                                        <p className="text-lg font-bold text-red-600">
                                            {metrics.other.error.loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(metrics.other.error.data?.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Yoksayılan</p>
                                        <p className="text-lg font-bold text-gray-600">
                                            {metrics.other.ignore.loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(metrics.other.ignore.data?.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Toplam</p>
                                        <p className="text-lg font-bold text-indigo-600">
                                            {isOtherLoading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(otherTotal)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{tenant.tenantId} Detaylı Bilgiler</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailMetricsSection title="Satış Metrikleri" metrics={metrics.sale} />
                    <DetailMetricsSection title="Diğer Veri Metrikleri" metrics={metrics.other} />
                </div>

                <div className="flex justify-end mt-4">
                    <Button
                        variant="outline"
                        onClick={() => refreshMetrics(tenant.tenantId)}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Yenile
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}


export default CompanyCard;