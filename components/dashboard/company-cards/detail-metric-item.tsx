import { formatNumber, formatSizeToMB } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface DetailMetricItemProps {
    icon: React.ReactNode;
    title: string;
    count: number | undefined;
    size?: number | undefined;
    loading: boolean;
    bgColor?: string;
    textColor?: string;
}
  
function DetailMetricItem({ icon, title, count, size, loading, bgColor = "bg-card", textColor = "text-foreground" }: DetailMetricItemProps) {
  return (
    <div className={`flex justify-between items-center p-3 ${bgColor} border rounded-lg shadow-sm`}>
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <span className={`font-medium text-sm ${textColor}`}>{title}</span>
      </div>
      <div className="text-right">
        {loading ? (
          <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <>
            <p className={`text-base font-semibold ${textColor}`}>{formatNumber(count)}</p>
            {size !== undefined && (
              <p className="text-xs text-muted-foreground">{formatSizeToMB(size)}MB</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DetailMetricItem;