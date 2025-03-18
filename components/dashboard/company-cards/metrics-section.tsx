import { Clock, CheckCircle2, EyeOff, XCircle, AlertCircle, Database } from "lucide-react";
import MetricItem from "./metric-item";
import { CategoryMetrics } from "@/lib/types";

interface MetricsSectionProps {
    title: string;
    metrics: CategoryMetrics;
}

function MetricsSection({ title, metrics }: MetricsSectionProps) {
    return (
        <div className="mt-2">
            <h4 className="text-sm font-semibold text-blue-700 mb-1">{title}</h4>
            <div className="grid grid-cols-2 gap-1.5 text-sm">
                <MetricItem
                    icon={<Clock className="h-3.5 w-3.5 text-orange-500" />}
                    label="İşlenen"
                    value={metrics.processing.data?.count}
                    loading={metrics.processing.loading}
                    bgColor="bg-gradient-to-r from-orange-50 to-transparent"
                    textColor="text-orange-600"
                />
                <MetricItem
                    icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                    label="Başarılı"
                    value={metrics.completed.data?.count}
                    loading={metrics.completed.loading}
                    bgColor="bg-gradient-to-r from-green-50 to-transparent"
                    textColor="text-green-600"
                />
                <MetricItem
                    icon={<EyeOff className="h-3.5 w-3.5 text-blue-500" />}
                    label="Yoksayılan"
                    value={metrics.ignore.data?.count}
                    loading={metrics.ignore.loading}
                    bgColor="bg-gradient-to-r from-blue-50 to-transparent"
                    textColor="text-blue-600"
                />
                <MetricItem
                    icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                    label="Hatalı"
                    value={metrics.error.data?.count}
                    loading={metrics.error.loading}
                    bgColor="bg-gradient-to-r from-red-50 to-transparent"
                    textColor="text-red-600"
                />
                <MetricItem
                    icon={<AlertCircle className="h-3.5 w-3.5 text-purple-500" />}
                    label="Kuyrukta"
                    value={metrics.created.data?.count}
                    loading={metrics.created.loading}
                    bgColor="bg-gradient-to-r from-purple-50 to-transparent"
                    textColor="text-purple-600"
                />
                <MetricItem
                    icon={<Database className="h-3.5 w-3.5 text-gray-700" />}
                    label="Toplam"
                    value={metrics.total.count}
                    loading={false}
                    bgColor="bg-gradient-to-r from-gray-50 to-transparent"
                    textColor="text-gray-700"
                />
            </div>
        </div>
    );
}

export default MetricsSection;