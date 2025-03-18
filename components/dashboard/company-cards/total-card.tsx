import { Card } from "@/components/ui/card";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, RefreshCw, Clock, CheckCircle2, EyeOff, XCircle, AlertCircle, Database } from "lucide-react";
import { useMemo } from "react";
import DetailMetricItem from "./detail-metric-item";
import MetricItem from "./metric-item";
import { Button } from "@/components/ui/button";
import { TenantMetrics } from "@/lib/types";

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
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-1.5 rounded-full">
                                <BarChart3 className="h-5 w-5 text-blue-700" />
                            </div>
                            <h3 className="text-lg font-bold text-blue-800">Toplam Metrikler</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                refreshMetrics();
                            }}
                            title="Yenile"
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-semibold text-blue-700 mb-1">Satış Belgeleri</h4>
                            <div className="grid grid-cols-2 gap-1.5 text-sm">
                                <MetricItem
                                    icon={<Clock className="h-3.5 w-3.5 text-orange-500" />}
                                    label="İşlenen"
                                    value={totalMetrics.sale.processing.count}
                                    loading={loading}
                                    bgColor="bg-gradient-to-r from-orange-50 to-transparent"
                                    textColor="text-orange-600"
                                />
                                <MetricItem
                                    icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                    label="Başarılı"
                                    value={totalMetrics.sale.completed.count}
                                    loading={loading}
                                    bgColor="bg-gradient-to-r from-green-50 to-transparent"
                                    textColor="text-green-600"
                                />
                                <MetricItem
                                    icon={<EyeOff className="h-3.5 w-3.5 text-blue-500" />}
                                    label="Yoksayılan"
                                    value={totalMetrics.sale.ignore.count}
                                    loading={loading}
                                    bgColor="bg-gradient-to-r from-blue-50 to-transparent"
                                    textColor="text-blue-600"
                                />
                                <MetricItem
                                    icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                                    label="Hatalı"
                                    value={totalMetrics.sale.error.count}
                                    loading={loading}
                                    bgColor="bg-gradient-to-r from-red-50 to-transparent"
                                    textColor="text-red-600"
                                />
                                <MetricItem
                                    icon={<AlertCircle className="h-3.5 w-3.5 text-purple-500" />}
                                    label="Kuyrukta"
                                    value={totalMetrics.sale.created.count}
                                    loading={loading}
                                    bgColor="bg-gradient-to-r from-purple-50 to-transparent"
                                    textColor="text-purple-600"
                                />
                                <MetricItem
                                    icon={<Database className="h-3.5 w-3.5 text-gray-700" />}
                                    label="Toplam"
                                    value={totalMetrics.sale.total.count}
                                    loading={false}
                                    bgColor="bg-gradient-to-r from-gray-50 to-transparent"
                                    textColor="text-gray-700"
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-blue-700 mb-1">Diğer Belgeler</h4>
                            <div className="grid grid-cols-2 gap-1.5 text-sm">
                                <MetricItem
                                    icon={<Clock className="h-3.5 w-3.5 text-orange-500" />}
                                    label="İşlenen"
                                    value={totalMetrics.other.processing.count}
                                    loading={loading}
                                    bgColor="bg-gradient-to-r from-orange-50 to-transparent"
                                    textColor="text-orange-600"
                                />
                                <MetricItem
                                    icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                    label="Başarılı"
                                    value={totalMetrics.other.completed.count}
                                    loading={loading}
                                    bgColor="bg-gradient-to-r from-green-50 to-transparent"
                                    textColor="text-green-600"
                                />
                                <MetricItem
                                    icon={<EyeOff className="h-3.5 w-3.5 text-blue-500" />}
                                    label="Yoksayılan"
                                    value={totalMetrics.other.ignore.count}
                                    loading={loading}
                                    bgColor="bg-gradient-to-r from-blue-50 to-transparent"
                                    textColor="text-blue-600"
                                />
                                <MetricItem
                                    icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                                    label="Hatalı"
                                    value={totalMetrics.other.error.count}
                                    loading={loading}
                                    bgColor="bg-gradient-to-r from-red-50 to-transparent"
                                    textColor="text-red-600"
                                />
                                <MetricItem
                                    icon={<AlertCircle className="h-3.5 w-3.5 text-purple-500" />}
                                    label="Kuyrukta"
                                    value={totalMetrics.other.created.count}
                                    loading={loading}
                                    bgColor="bg-gradient-to-r from-purple-50 to-transparent"
                                    textColor="text-purple-600"
                                />
                                <MetricItem
                                    icon={<Database className="h-3.5 w-3.5 text-gray-700" />}
                                    label="Toplam"
                                    value={totalMetrics.other.total.count}
                                    loading={false}
                                    bgColor="bg-gradient-to-r from-gray-50 to-transparent"
                                    textColor="text-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </DialogTrigger>

            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-700" />
                        Tüm Firmalar İçin Toplam Metrikler
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Card className="p-4">
                        <h3 className="text-lg font-bold text-blue-700 mb-3">Satış Belgeleri</h3>
                        <div className="space-y-2">
                            <DetailMetricItem
                                icon={<Clock className="h-5 w-5 text-orange-500" />}
                                label="İşlenen"
                                count={totalMetrics.sale.processing.count}
                                size={totalMetrics.sale.processing.size}
                                loading={loading}
                                bgColor="bg-orange-50"
                                textColor="text-orange-500"
                            />
                            <DetailMetricItem
                                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                                label="Başarılı"
                                count={totalMetrics.sale.completed.count}
                                size={totalMetrics.sale.completed.size}
                                loading={loading}
                                bgColor="bg-green-50"
                                textColor="text-green-500"
                            />
                            <DetailMetricItem
                                icon={<EyeOff className="h-5 w-5 text-blue-500" />}
                                label="Yoksayılan"
                                count={totalMetrics.sale.ignore.count}
                                size={totalMetrics.sale.ignore.size}
                                loading={loading}
                                bgColor="bg-blue-50"
                                textColor="text-blue-500"
                            />
                            <DetailMetricItem
                                icon={<XCircle className="h-5 w-5 text-red-500" />}
                                label="Hatalı"
                                count={totalMetrics.sale.error.count}
                                size={totalMetrics.sale.error.size}
                                loading={loading}
                                bgColor="bg-red-50"
                                textColor="text-red-500"
                            />
                            <DetailMetricItem
                                icon={<AlertCircle className="h-5 w-5 text-purple-500" />}
                                label="Kuyrukta"
                                count={totalMetrics.sale.created.count}
                                size={totalMetrics.sale.created.size}
                                loading={loading}
                                bgColor="bg-purple-50"
                                textColor="text-purple-500"
                            />
                            <DetailMetricItem
                                icon={<Database className="h-5 w-5 text-gray-700" />}
                                label="Toplam"
                                count={totalMetrics.sale.total.count}
                                size={totalMetrics.sale.total.size}
                                loading={false}
                                bgColor="bg-gray-50"
                                textColor="text-gray-700"
                            />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h3 className="text-lg font-bold text-blue-700 mb-3">Diğer Belgeler</h3>
                        <div className="space-y-2">
                            <DetailMetricItem
                                icon={<Clock className="h-5 w-5 text-orange-500" />}
                                label="İşlenen"
                                count={totalMetrics.other.processing.count}
                                size={totalMetrics.other.processing.size}
                                loading={loading}
                                bgColor="bg-orange-50"
                                textColor="text-orange-500"
                            />
                            <DetailMetricItem
                                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                                label="Başarılı"
                                count={totalMetrics.other.completed.count}
                                size={totalMetrics.other.completed.size}
                                loading={loading}
                                bgColor="bg-green-50"
                                textColor="text-green-500"
                            />
                            <DetailMetricItem
                                icon={<EyeOff className="h-5 w-5 text-blue-500" />}
                                label="Yoksayılan"
                                count={totalMetrics.other.ignore.count}
                                size={totalMetrics.other.ignore.size}
                                loading={loading}
                                bgColor="bg-blue-50"
                                textColor="text-blue-500"
                            />
                            <DetailMetricItem
                                icon={<XCircle className="h-5 w-5 text-red-500" />}
                                label="Hatalı"
                                count={totalMetrics.other.error.count}
                                size={totalMetrics.other.error.size}
                                loading={loading}
                                bgColor="bg-red-50"
                                textColor="text-red-500"
                            />
                            <DetailMetricItem
                                icon={<AlertCircle className="h-5 w-5 text-purple-500" />}
                                label="Kuyrukta"
                                count={totalMetrics.other.created.count}
                                size={totalMetrics.other.created.size}
                                loading={loading}
                                bgColor="bg-purple-50"
                                textColor="text-purple-500"
                            />
                            <DetailMetricItem
                                icon={<Database className="h-5 w-5 text-gray-700" />}
                                label="Toplam"
                                count={totalMetrics.other.total.count}
                                size={totalMetrics.other.total.size}
                                loading={false}
                                bgColor="bg-gray-50"
                                textColor="text-gray-700"
                            />
                        </div>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default TotalCard;
