import { formatNumber } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface DarkMetricItemProps {
    icon: React.ReactNode;
    label: string;
    value: number | undefined;
    loading: boolean;
}

function DarkMetricItem({ icon, label, value, loading }: DarkMetricItemProps) {
    return (
        <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 p-2 rounded-lg transition-colors">
            <div className="bg-white/20 p-1.5 rounded-full shadow-sm flex-shrink-0">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white/80 truncate">{label}</p>
                {loading ? (
                    <RefreshCw className="h-4 w-4 text-white animate-spin" />
                ) : (
                    <p className="text-base sm:text-lg font-bold text-white truncate">{formatNumber(value)}</p>
                )}
            </div>
        </div>
    );
}

export default DarkMetricItem;
