import { formatNumber } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface MetricItemProps {
    icon: React.ReactNode;
    label: string;
    value: number | undefined;
    loading: boolean;
    bgColor: string;
    textColor: string;
}

function MetricItem({ icon, label, value, loading, bgColor, textColor }: MetricItemProps) {
    return (
        <div className={`flex items-center gap-1.5 sm:gap-2 ${bgColor} p-1.5 rounded-l-full hover:brightness-95 transition-colors`}>
            <div className="bg-white/80 p-1 rounded-full shadow-sm flex-shrink-0">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className={`text-xs font-medium ${textColor}/80 truncate`}>{label}</p>
                {loading ? (
                    <RefreshCw className={`h-4 w-4 ${textColor} animate-spin`} />
                ) : (
                    <p className={`text-base sm:text-lg font-bold ${textColor} truncate`}>{formatNumber(value)}</p>
                )}
            </div>
        </div>
    );
}

export default MetricItem;