import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, RefreshCw, Clock, CheckCircle2, EyeOff, XCircle, AlertCircle, Database, TrendingUp, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import DetailMetricItem from "./detail-metric-item";
import { Button } from "@/components/ui/button";
import { TenantMetrics } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TotalCardProps {
    tenantMetrics: Record<string, TenantMetrics>;
    loading: boolean;
    refreshMetrics: () => void;
}

export default function TotalCard({ tenantMetrics, loading, refreshMetrics }: TotalCardProps) {
    const metrics = useMemo(() => {
        if (!tenantMetrics || Object.keys(tenantMetrics).length === 0) {
            return {
                sale: {
                    processing: 0,
                    completed: 0,
                    ignore: 0,
                    error: 0,
                    created: 0,
                    total: 0
                },
                other: {
                    processing: 0,
                    completed: 0,
                    ignore: 0,
                    error: 0,
                    created: 0,
                    total: 0
                }
            };
        }

        return Object.values(tenantMetrics).reduce(
            (acc, tenantMetric) => {
                // Sale metrics
                acc.sale.processing += tenantMetric.sale.processing.data?.count || 0;
                acc.sale.completed += tenantMetric.sale.completed.data?.count || 0;
                acc.sale.ignore += tenantMetric.sale.ignore.data?.count || 0;
                acc.sale.error += tenantMetric.sale.error.data?.count || 0;
                acc.sale.created += tenantMetric.sale.created.data?.count || 0;
                acc.sale.total += tenantMetric.sale.total.count || 0;

                // Other metrics
                acc.other.processing += tenantMetric.other.processing.data?.count || 0;
                acc.other.completed += tenantMetric.other.completed.data?.count || 0;
                acc.other.ignore += tenantMetric.other.ignore.data?.count || 0;
                acc.other.error += tenantMetric.other.error.data?.count || 0;
                acc.other.created += tenantMetric.other.created.data?.count || 0;
                acc.other.total += tenantMetric.other.total.count || 0;

                return acc;
            },
            {
                sale: {
                    processing: 0,
                    completed: 0,
                    ignore: 0,
                    error: 0,
                    created: 0,
                    total: 0
                },
                other: {
                    processing: 0,
                    completed: 0,
                    ignore: 0,
                    error: 0,
                    created: 0,
                    total: 0
                }
            }
        );
    }, [tenantMetrics]);

    // Calculate percentages for progress bars
    const salePercentages = useMemo(() => {
        const total = metrics.sale.total || 1; // Avoid division by zero
        return {
            processing: (metrics.sale.processing / total) * 100,
            completed: (metrics.sale.completed / total) * 100,
            ignore: (metrics.sale.ignore / total) * 100,
            error: (metrics.sale.error / total) * 100,
            created: (metrics.sale.created / total) * 100,
        };
    }, [metrics]);

    const otherPercentages = useMemo(() => {
        const total = metrics.other.total || 1; // Avoid division by zero
        return {
            processing: (metrics.other.processing / total) * 100,
            completed: (metrics.other.completed / total) * 100,
            ignore: (metrics.other.ignore / total) * 100,
            error: (metrics.other.error / total) * 100,
            created: (metrics.other.created / total) * 100,
        };
    }, [metrics]);

    return (
        <div className="bg-card rounded-lg border shadow-sm">
            <div className="flex justify-between items-center p-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Toplam Metrikler
                </h2>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={refreshMetrics} 
                    disabled={loading}
                    className="h-8 px-2"
                >
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Yenile
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pt-0">
                {/* Sales Metrics Summary */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                            Satış Belgeleri
                        </h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {loading ? '...' : formatNumber(metrics.sale.total)}
                        </Badge>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex gap-1">
                            <div className="h-2 rounded-full bg-blue-500" style={{ width: `${salePercentages.processing}%` }}></div>
                            <div className="h-2 rounded-full bg-green-500" style={{ width: `${salePercentages.completed}%` }}></div>
                            <div className="h-2 rounded-full bg-gray-300" style={{ width: `${salePercentages.ignore}%` }}></div>
                            <div className="h-2 rounded-full bg-red-500" style={{ width: `${salePercentages.error}%` }}></div>
                            <div className="h-2 rounded-full bg-purple-500" style={{ width: `${salePercentages.created}%` }}></div>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-1 text-xs">
                            <div className="flex flex-col items-center">
                                <span className="text-blue-500 font-medium">{formatNumber(metrics.sale.processing)}</span>
                                <span className="text-muted-foreground text-[10px]">İşleniyor</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-green-500 font-medium">{formatNumber(metrics.sale.completed)}</span>
                                <span className="text-muted-foreground text-[10px]">Tamamlandı</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-gray-500 font-medium">{formatNumber(metrics.sale.ignore)}</span>
                                <span className="text-muted-foreground text-[10px]">Göz Ardı</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-red-500 font-medium">{formatNumber(metrics.sale.error)}</span>
                                <span className="text-muted-foreground text-[10px]">Hata</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-purple-500 font-medium">{formatNumber(metrics.sale.created)}</span>
                                <span className="text-muted-foreground text-[10px]">Oluşturuldu</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Other Documents Summary */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium flex items-center">
                            <Database className="h-4 w-4 mr-1 text-blue-500" />
                            Diğer Belgeler
                        </h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {loading ? '...' : formatNumber(metrics.other.total)}
                        </Badge>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex gap-1">
                            <div className="h-2 rounded-full bg-blue-500" style={{ width: `${otherPercentages.processing}%` }}></div>
                            <div className="h-2 rounded-full bg-green-500" style={{ width: `${otherPercentages.completed}%` }}></div>
                            <div className="h-2 rounded-full bg-gray-300" style={{ width: `${otherPercentages.ignore}%` }}></div>
                            <div className="h-2 rounded-full bg-red-500" style={{ width: `${otherPercentages.error}%` }}></div>
                            <div className="h-2 rounded-full bg-purple-500" style={{ width: `${otherPercentages.created}%` }}></div>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-1 text-xs">
                            <div className="flex flex-col items-center">
                                <span className="text-blue-500 font-medium">{formatNumber(metrics.other.processing)}</span>
                                <span className="text-muted-foreground text-[10px]">İşleniyor</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-green-500 font-medium">{formatNumber(metrics.other.completed)}</span>
                                <span className="text-muted-foreground text-[10px]">Tamamlandı</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-gray-500 font-medium">{formatNumber(metrics.other.ignore)}</span>
                                <span className="text-muted-foreground text-[10px]">Göz Ardı</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-red-500 font-medium">{formatNumber(metrics.other.error)}</span>
                                <span className="text-muted-foreground text-[10px]">Hata</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-purple-500 font-medium">{formatNumber(metrics.other.created)}</span>
                                <span className="text-muted-foreground text-[10px]">Oluşturuldu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full flex items-center justify-center py-1 rounded-none rounded-b-lg border-t">
                        <span className="text-xs text-muted-foreground">Detaylı Metrikler</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Toplam Metrikler - Detaylı Görünüm</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium border-b pb-2">Satış Belgeleri</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <DetailMetricItem 
                                    title="İşleniyor" 
                                    icon={<Clock className="h-4 w-4 text-blue-500" />}
                                    count={metrics.sale.processing}
                                    loading={loading}
                                />
                                <DetailMetricItem 
                                    title="Tamamlandı" 
                                    icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    count={metrics.sale.completed}
                                    loading={loading}
                                />
                                <DetailMetricItem 
                                    title="Göz Ardı" 
                                    icon={<EyeOff className="h-4 w-4 text-gray-500" />}
                                    count={metrics.sale.ignore}
                                    loading={loading}
                                />
                                <DetailMetricItem 
                                    title="Hata" 
                                    icon={<XCircle className="h-4 w-4 text-red-500" />}
                                    count={metrics.sale.error}
                                    loading={loading}
                                />
                                <DetailMetricItem 
                                    title="Oluşturuldu" 
                                    icon={<AlertCircle className="h-4 w-4 text-purple-500" />}
                                    count={metrics.sale.created}
                                    loading={loading}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium border-b pb-2">Diğer Belgeler</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <DetailMetricItem 
                                    title="İşleniyor" 
                                    icon={<Clock className="h-4 w-4 text-blue-500" />}
                                    count={metrics.other.processing}
                                    loading={loading}
                                />
                                <DetailMetricItem 
                                    title="Tamamlandı" 
                                    icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                                    count={metrics.other.completed}
                                    loading={loading}
                                />
                                <DetailMetricItem 
                                    title="Göz Ardı" 
                                    icon={<EyeOff className="h-4 w-4 text-gray-500" />}
                                    count={metrics.other.ignore}
                                    loading={loading}
                                />
                                <DetailMetricItem 
                                    title="Hata" 
                                    icon={<XCircle className="h-4 w-4 text-red-500" />}
                                    count={metrics.other.error}
                                    loading={loading}
                                />
                                <DetailMetricItem 
                                    title="Oluşturuldu" 
                                    icon={<AlertCircle className="h-4 w-4 text-purple-500" />}
                                    count={metrics.other.created}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
