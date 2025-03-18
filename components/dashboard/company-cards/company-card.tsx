import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatNumber } from "@/lib/utils";
import { Building2, RefreshCw } from "lucide-react";
import MetricsSection from "./metrics-section";
import DetailMetricsSection from "./detail-metrics-section";
import { TenantInfo, TenantMetrics } from "@/lib/types";

interface CompanyCardProps {
    tenant: TenantInfo;
    metrics: TenantMetrics;
    refreshMetrics: (tenantId: string) => void;
}

function CompanyCard({ tenant, metrics, refreshMetrics }: CompanyCardProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="relative overflow-hidden bg-white shadow hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className=" text-blue-600/80">Firma Kodu</p>
                                    <h3 className="text-lg font-bold text-blue-700">{tenant.tenantId}</h3>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="bg-green-100 px-2 py-1 rounded">
                                    <span className="font-medium text-green-700">{formatNumber(tenant.activeBranches)} Aktif</span>
                                </div>
                                <div className="bg-red-100 px-2 py-1 rounded">
                                    <span className="font-medium text-red-700">{formatNumber(tenant.passiveBranches)} Pasif</span>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={(e) => { e.stopPropagation(); refreshMetrics(tenant.tenantId); }}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Yenile
                                </Button>
                            </div>
                        </div>

                        <div className="border-t pt-2">
                            <MetricsSection title="Satış" metrics={metrics.sale} />
                            <MetricsSection title="Diğer Veriler" metrics={metrics.other} />
                        </div>
                    </div>
                </Card>
            </DialogTrigger>

            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{tenant.tenantId} Detaylı Bilgiler</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailMetricsSection title="Satış Metrikleri" metrics={metrics.sale} />
                    <DetailMetricsSection title="Diğer Veri Metrikleri" metrics={metrics.other} />
                </div>

                <div className="flex justify-end mt-4">
                    <Button
                        variant="outline"
                        onClick={() => refreshMetrics(tenant.tenantId)}
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


export default CompanyCard;