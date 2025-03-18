import { Clock, CheckCircle2, EyeOff, XCircle, AlertCircle } from "lucide-react";
import DarkMetricItem from "./dark-metric-item";
import { CategoryMetrics } from "@/lib/types";

interface DarkMetricsSectionProps {
    title: string;
    metrics: CategoryMetrics;
}

function DarkMetricsSection({ title, metrics }: DarkMetricsSectionProps) {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <DarkMetricItem
                    icon={<Clock className="h-3.5 w-3.5 text-white" />}
                    label="İşlenen"
                    value={metrics.processing.data?.count}
                    loading={metrics.processing.loading}
                />
                <DarkMetricItem
                    icon={<CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    label="Başarılı"
                    value={metrics.completed.data?.count}
                    loading={metrics.completed.loading}
                />
                <DarkMetricItem
                    icon={<EyeOff className="h-3.5 w-3.5 text-white" />}
                    label="Yoksayılan"
                    value={metrics.ignore.data?.count}
                    loading={metrics.ignore.loading}
                />
                <DarkMetricItem
                    icon={<XCircle className="h-3.5 w-3.5 text-white" />}
                    label="Hatalı"
                    value={metrics.error.data?.count}
                    loading={metrics.error.loading}
                />
                <DarkMetricItem
                    icon={<AlertCircle className="h-3.5 w-3.5 text-white" />}
                    label="Kuyrukta"
                    value={metrics.created.data?.count}
                    loading={metrics.created.loading}
                />
            </div>
        </div>
    );
}

export default DarkMetricsSection;
