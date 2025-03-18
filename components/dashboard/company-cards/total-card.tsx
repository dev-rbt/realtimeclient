import { Card } from "@/components/ui/card";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, RefreshCw, Clock, CheckCircle2, EyeOff, XCircle, AlertCircle, Database, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import DetailMetricItem from "./detail-metric-item";
import MetricItem from "./metric-item";
import { Button } from "@/components/ui/button";
import { TenantMetrics } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface TotalCardProps {
    tenantMetrics: Record<string, TenantMetrics>;
    loading: boolean;
    refreshMetrics: () => void;
}

function TotalCard({ tenantMetrics, loading, refreshMetrics }: TotalCardProps) {
    const totalMetrics = useMemo(() => {
        // Create separate empty category objects for sale and other
        const emptySaleCategory = {
            processing: { count: 0, size: 0 },
            completed: { count: 0, size: 0 },
            ignore: { count: 0, size: 0 },
            error: { count: 0, size: 0 },
            created: { count: 0, size: 0 },
            total: { count: 0, size: 0 }
        };

        const emptyOtherCategory = {
            processing: { count: 0, size: 0 },
            completed: { count: 0, size: 0 },
            ignore: { count: 0, size: 0 },
            error: { count: 0, size: 0 },
            created: { count: 0, size: 0 },
            total: { count: 0, size: 0 }
        };

        const totals = {
            sale: emptySaleCategory,
            other: emptyOtherCategory
        };

        Object.values(tenantMetrics).forEach(metric => {
            // Sum up sale metrics
            totals.sale.processing.count += metric.sale.processing.data?.count || 0;
            totals.sale.processing.size += metric.sale.processing.data?.size || 0;

            totals.sale.completed.count += metric.sale.completed.data?.count || 0;
            totals.sale.completed.size += metric.sale.completed.data?.size || 0;

            totals.sale.ignore.count += metric.sale.ignore.data?.count || 0;
            totals.sale.ignore.size += metric.sale.ignore.data?.size || 0;

            totals.sale.error.count += metric.sale.error.data?.count || 0;
            totals.sale.error.size += metric.sale.error.data?.size || 0;

            totals.sale.created.count += metric.sale.created.data?.count || 0;
            totals.sale.created.size += metric.sale.created.data?.size || 0;

            // Sum up other metrics
            totals.other.processing.count += metric.other.processing.data?.count || 0;
            totals.other.processing.size += metric.other.processing.data?.size || 0;

            totals.other.completed.count += metric.other.completed.data?.count || 0;
            totals.other.completed.size += metric.other.completed.data?.size || 0;

            totals.other.ignore.count += metric.other.ignore.data?.count || 0;
            totals.other.ignore.size += metric.other.ignore.data?.size || 0;

            totals.other.error.count += metric.other.error.data?.count || 0;
            totals.other.error.size += metric.other.error.data?.size || 0;

            totals.other.created.count += metric.other.created.data?.count || 0;
            totals.other.created.size += metric.other.created.data?.size || 0;
        });

        // Calculate total counts and sizes
        totals.sale.total.count =
            totals.sale.processing.count +
            totals.sale.completed.count +
            totals.sale.ignore.count +
            totals.sale.error.count +
            totals.sale.created.count;

        totals.sale.total.size =
            totals.sale.processing.size +
            totals.sale.completed.size +
            totals.sale.ignore.size +
            totals.sale.error.size +
            totals.sale.created.size;

        totals.other.total.count =
            totals.other.processing.count +
            totals.other.completed.count +
            totals.other.ignore.count +
            totals.other.error.count +
            totals.other.created.count;

        totals.other.total.size =
            totals.other.processing.size +
            totals.other.completed.size +
            totals.other.ignore.size +
            totals.other.error.size +
            totals.other.created.size;

        return totals;
    }, [tenantMetrics]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="relative overflow-hidden bg-white shadow hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-blue-700">Toplam Metrikler</h3>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    refreshMetrics();
                                }}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Yenile
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2 border-b border-blue-100 pb-2">
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-medium text-blue-700">Satış Belgeleri</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Kuyrukta</p>
                                        <p className="text-lg font-bold text-purple-600">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.sale.created.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">İşlenen</p>
                                        <p className="text-lg font-bold text-blue-700">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.sale.processing.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Başarılı</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.sale.completed.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Hatalı</p>
                                        <p className="text-lg font-bold text-red-600">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.sale.error.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Yoksayılan</p>
                                        <p className="text-lg font-bold text-gray-600">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.sale.ignore.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Toplam</p>
                                        <p className="text-lg font-bold text-indigo-600">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.sale.total.count)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2 border-b border-purple-100 pb-2">
                                    <Database className="h-4 w-4 text-purple-600" />
                                    <h4 className="font-medium text-purple-700">Diğer Belgeler</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Kuyrukta</p>
                                        <p className="text-lg font-bold text-purple-600">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.other.created.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">İşlenen</p>
                                        <p className="text-lg font-bold text-blue-700">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.other.processing.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Başarılı</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.other.completed.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Hatalı</p>
                                        <p className="text-lg font-bold text-red-600">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.other.error.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Yoksayılan</p>
                                        <p className="text-lg font-bold text-gray-600">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.other.ignore.count)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-2 shadow-sm">
                                        <p className="text-xs text-gray-500 mb-1">Toplam</p>
                                        <p className="text-lg font-bold text-indigo-600">
                                            {loading ? 
                                                <RefreshCw className="h-4 w-4 animate-spin" /> : 
                                                formatNumber(totalMetrics.other.total.count)}
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
                    <DialogTitle>Toplam Metrikler</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-blue-800 mb-3 pb-2 border-b border-blue-100">Satış Belgeleri</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <DetailMetricItem
                                icon={<Clock className="h-5 w-5 text-orange-500" />}
                                label="İşlenen"
                                count={totalMetrics.sale.processing.count}
                                size={totalMetrics.sale.processing.size}
                                loading={loading}
                                bgColor="bg-white"
                                textColor="text-blue-700"
                            />
                            <DetailMetricItem
                                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                                label="Başarılı"
                                count={totalMetrics.sale.completed.count}
                                size={totalMetrics.sale.completed.size}
                                loading={loading}
                                bgColor="bg-white"
                                textColor="text-green-600"
                            />
                            <DetailMetricItem
                                icon={<EyeOff className="h-5 w-5 text-blue-500" />}
                                label="Yoksayılan"
                                count={totalMetrics.sale.ignore.count}
                                size={totalMetrics.sale.ignore.size}
                                loading={loading}
                                bgColor="bg-white"
                                textColor="text-gray-600"
                            />
                            <DetailMetricItem
                                icon={<XCircle className="h-5 w-5 text-red-500" />}
                                label="Hatalı"
                                count={totalMetrics.sale.error.count}
                                size={totalMetrics.sale.error.size}
                                loading={loading}
                                bgColor="bg-white"
                                textColor="text-red-600"
                            />
                            <DetailMetricItem
                                icon={<AlertCircle className="h-5 w-5 text-purple-500" />}
                                label="Kuyrukta"
                                count={totalMetrics.sale.created.count}
                                size={totalMetrics.sale.created.size}
                                loading={loading}
                                bgColor="bg-white"
                                textColor="text-purple-600"
                            />
                            <DetailMetricItem
                                icon={<Database className="h-5 w-5 text-indigo-600" />}
                                label="Toplam"
                                count={totalMetrics.sale.total.count}
                                size={totalMetrics.sale.total.size}
                                loading={false}
                                bgColor="bg-white"
                                textColor="text-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-purple-800 mb-3 pb-2 border-b border-purple-100">Diğer Belgeler</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <DetailMetricItem
                                icon={<Clock className="h-5 w-5 text-orange-500" />}
                                label="İşlenen"
                                count={totalMetrics.other.processing.count}
                                size={totalMetrics.other.processing.size}
                                loading={loading}
                                bgColor="bg-white"
                                textColor="text-blue-700"
                            />
                            <DetailMetricItem
                                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                                label="Başarılı"
                                count={totalMetrics.other.completed.count}
                                size={totalMetrics.other.completed.size}
                                loading={loading}
                                bgColor="bg-white"
                                textColor="text-green-600"
                            />
                            <DetailMetricItem
                                icon={<EyeOff className="h-5 w-5 text-blue-500" />}
                                label="Yoksayılan"
                                count={totalMetrics.other.ignore.count}
                                size={totalMetrics.other.ignore.size}
                                loading={loading}
                                bgColor="bg-white"
                                textColor="text-gray-600"
                            />
                            <DetailMetricItem
                                icon={<XCircle className="h-5 w-5 text-red-500" />}
                                label="Hatalı"
                                count={totalMetrics.other.error.count}
                                size={totalMetrics.other.error.size}
                                loading={loading}
                                bgColor="bg-white"
                                textColor="text-red-600"
                            />
                            <DetailMetricItem
                                icon={<AlertCircle className="h-5 w-5 text-purple-500" />}
                                label="Kuyrukta"
                                count={totalMetrics.other.created.count}
                                size={totalMetrics.other.created.size}
                                loading={loading}
                                bgColor="bg-white"
                                textColor="text-purple-600"
                            />
                            <DetailMetricItem
                                icon={<Database className="h-5 w-5 text-indigo-600" />}
                                label="Toplam"
                                count={totalMetrics.other.total.count}
                                size={totalMetrics.other.total.size}
                                loading={false}
                                bgColor="bg-white"
                                textColor="text-indigo-600"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        variant="outline"
                        onClick={() => refreshMetrics()}
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

export default TotalCard;
