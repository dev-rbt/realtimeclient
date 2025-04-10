import { formatNumber, formatSizeToMB } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface DetailMetricItemProps {
    icon: React.ReactNode;
    title: string;
    count: number | undefined;
    size: number | undefined;
    loading: boolean;
}
  
function DetailMetricItem({ icon, title, count, size, loading }: DetailMetricItemProps) {
  return (
    <div className="flex justify-between items-center p-3 bg-card border rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <span className="font-medium text-sm">{title}</span>
      </div>
      <div className="text-right">
        {loading ? (
          <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <>
            <p className="text-base font-semibold">{formatNumber(count)}</p>
            <p className="text-xs text-muted-foreground">{formatSizeToMB(size)}MB</p>
          </>
        )}
      </div>
    </div>
  );
}

export default DetailMetricItem;