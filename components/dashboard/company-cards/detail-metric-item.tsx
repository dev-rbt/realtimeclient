import { formatNumber, formatSizeToMB } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

interface DetailMetricItemProps {
    icon: React.ReactNode;
    label: string;
    count: number | undefined;
    size: number | undefined;
    loading: boolean;
    bgColor: string;
    textColor: string;
  }
  
  function DetailMetricItem({ icon, label, count, size, loading, bgColor, textColor }: DetailMetricItemProps) {
    return (
      <div className={`flex justify-between items-center p-3 ${bgColor} rounded-lg`}>
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <div className="text-right">
          {loading ? (
            <RefreshCw className={`h-5 w-5 ${textColor} animate-spin`} />
          ) : (
            <>
              <p className="text-lg font-bold">{formatNumber(count)}</p>
              <p className="text-sm text-muted-foreground">{formatSizeToMB(size)}MB</p>
            </>
          )}
        </div>
      </div>
    );
  }

  export default DetailMetricItem;