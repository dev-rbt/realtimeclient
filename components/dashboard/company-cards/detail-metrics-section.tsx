import { Card } from "@/components/ui/card";
import DetailMetricItem from "./detail-metric-item";
import { AlertCircle, CheckCircle2, Clock, Database, EyeOff, XCircle } from "lucide-react";
import { CategoryMetrics } from "@/lib/types";


interface DetailMetricsSectionProps {
    title: string;
    metrics: CategoryMetrics;
}

function DetailMetricsSection({ title, metrics }: DetailMetricsSectionProps) {
    return (
        <Card className="p-4">
            <h3 className="text-lg font-bold text-blue-700 mb-3">{title}</h3>
            <div className="space-y-2">
                <DetailMetricItem
                    icon={<Clock className="h-5 w-5 text-orange-500" />}
                    label="İşlenen"
                    count={metrics.processing.data?.count}
                    size={metrics.processing.data?.size}
                    loading={metrics.processing.loading}
                    bgColor="bg-orange-50"
                    textColor="text-orange-500"
                />
                <DetailMetricItem
                    icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                    label="Başarılı"
                    count={metrics.completed.data?.count}
                    size={metrics.completed.data?.size}
                    loading={metrics.completed.loading}
                    bgColor="bg-green-50"
                    textColor="text-green-500"
                />
                <DetailMetricItem
                    icon={<EyeOff className="h-5 w-5 text-blue-500" />}
                    label="Yoksayılan"
                    count={metrics.ignore.data?.count}
                    size={metrics.ignore.data?.size}
                    loading={metrics.ignore.loading}
                    bgColor="bg-blue-50"
                    textColor="text-blue-500"
                />
                <DetailMetricItem
                    icon={<XCircle className="h-5 w-5 text-red-500" />}
                    label="Hatalı"
                    count={metrics.error.data?.count}
                    size={metrics.error.data?.size}
                    loading={metrics.error.loading}
                    bgColor="bg-red-50"
                    textColor="text-red-500"
                />
                <DetailMetricItem
                    icon={<AlertCircle className="h-5 w-5 text-purple-500" />}
                    label="Kuyrukta Bekleyen"
                    count={metrics.created.data?.count}
                    size={metrics.created.data?.size}
                    loading={metrics.created.loading}
                    bgColor="bg-purple-50"
                    textColor="text-purple-500"
                />
                <DetailMetricItem
                    icon={<Database className="h-5 w-5 text-gray-700" />}
                    label="Toplam"
                    count={metrics.total.count}
                    size={metrics.total.size}
                    loading={false}
                    bgColor="bg-gray-100"
                    textColor="text-gray-700"
                />
            </div>
        </Card>
    );
}

export default DetailMetricsSection;