import { MetricData, TenantInfo, TenantMetrics } from "@/lib/types";
import { useEffect, useState } from "react";
import useApi from "./use-api";


function useMetricsData() {
    const [searchQuery, setSearchQuery] = useState("");
    const [tenants, setTenants] = useState<TenantInfo[]>([]);
    const [tenantMetrics, setTenantMetrics] = useState<Record<string, TenantMetrics>>({});
    const [loading, setLoading] = useState(true);
    const api = useApi();

    const fetchTenants = async () => {
        try {
            const response = await api.get<TenantInfo[]>('/system/tenants');
            setTenants(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching tenants:', error);
            return [];
        }
    };

    const fetchMetricData = async (tenantId: string, endpoint: string): Promise<MetricData | null> => {
        try {
            const response = await api.get(endpoint);

            if (typeof response.data === 'number') {
                return {
                    count: response.data,
                    size: 0
                };
            }

            if (response.data && typeof response.data === 'object' && 'count' in response.data) {
                return response.data as MetricData;
            }

            console.error(`Unexpected response format from ${endpoint}:`, response.data);
            return { count: 0, size: 0 };
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
        }
    };

    const initializeTenantMetrics = (tenantId: string) => {
        setTenantMetrics(prev => ({
            ...prev,
            [tenantId]: {
                sale: {
                    processing: { data: null, loading: true },
                    completed: { data: null, loading: true },
                    ignore: { data: null, loading: true },
                    error: { data: null, loading: true },
                    created: { data: null, loading: true },
                    total: { count: 0, size: 0 }
                },
                other: {
                    processing: { data: null, loading: true },
                    completed: { data: null, loading: true },
                    ignore: { data: null, loading: true },
                    error: { data: null, loading: true },
                    created: { data: null, loading: true },
                    total: { count: 0, size: 0 }
                }
            }
        }));
    };

    const updateTenantMetric = (tenantId: string, category: 'sale' | 'other', status: 'processing' | 'completed' | 'ignore' | 'error' | 'created', data: MetricData | null) => {
        setTenantMetrics(prev => {
            const tenant = prev[tenantId] || {
                sale: {
                    processing: { data: null, loading: false },
                    completed: { data: null, loading: false },
                    ignore: { data: null, loading: false },
                    error: { data: null, loading: false },
                    created: { data: null, loading: false },
                    total: { count: 0, size: 0 }
                },
                other: {
                    processing: { data: null, loading: false },
                    completed: { data: null, loading: false },
                    ignore: { data: null, loading: false },
                    error: { data: null, loading: false },
                    created: { data: null, loading: false },
                    total: { count: 0, size: 0 }
                }
            };

            const updatedTenant = {
                ...tenant,
                [category]: {
                    ...tenant[category],
                    [status]: { data, loading: false }
                }
            };

            const categoryData = updatedTenant[category];
            const total = {
                count: (categoryData.processing.data?.count || 0) +
                    (categoryData.completed.data?.count || 0) +
                    (categoryData.ignore.data?.count || 0) +
                    (categoryData.error.data?.count || 0) +
                    (categoryData.created.data?.count || 0),
                size: (categoryData.processing.data?.size || 0) +
                    (categoryData.completed.data?.size || 0) +
                    (categoryData.ignore.data?.size || 0) +
                    (categoryData.error.data?.size || 0) +
                    (categoryData.created.data?.size || 0)
            };

            updatedTenant[category].total = total;

            return {
                ...prev,
                [tenantId]: updatedTenant
            };
        });
    };

    const fetchTenantMetrics = async (tenantId: string) => {
        initializeTenantMetrics(tenantId);

        fetchMetricData(tenantId, `/system/tenant/metrics/onlySale/byStatus/${tenantId}/Processing`)
            .then(data => updateTenantMetric(tenantId, 'sale', 'processing', data));

        fetchMetricData(tenantId, `/system/tenant/metrics/onlySale/byStatus/${tenantId}/Completed`)
            .then(data => updateTenantMetric(tenantId, 'sale', 'completed', data));

        fetchMetricData(tenantId, `/system/tenant/metrics/onlySale/byStatus/${tenantId}/Ignore`)
            .then(data => updateTenantMetric(tenantId, 'sale', 'ignore', data));

        fetchMetricData(tenantId, `/system/tenant/metrics/onlySale/byStatus/${tenantId}/Error`)
            .then(data => updateTenantMetric(tenantId, 'sale', 'error', data));

        fetchMetricData(tenantId, `/system/tenant/metrics/onlySale/byStatus/${tenantId}/Created`)
            .then(data => updateTenantMetric(tenantId, 'sale', 'created', data));

        fetchMetricData(tenantId, `/system/tenant/metrics/others/byStatus/${tenantId}/Processing`)
            .then(data => updateTenantMetric(tenantId, 'other', 'processing', data));

        fetchMetricData(tenantId, `/system/tenant/metrics/others/byStatus/${tenantId}/Completed`)
            .then(data => updateTenantMetric(tenantId, 'other', 'completed', data));

        fetchMetricData(tenantId, `/system/tenant/metrics/others/byStatus/${tenantId}/Ignore`)
            .then(data => updateTenantMetric(tenantId, 'other', 'ignore', data));

        fetchMetricData(tenantId, `/system/tenant/metrics/others/byStatus/${tenantId}/Error`)
            .then(data => updateTenantMetric(tenantId, 'other', 'error', data));

        fetchMetricData(tenantId, `/system/tenant/metrics/others/byStatus/${tenantId}/Created`)
            .then(data => updateTenantMetric(tenantId, 'other', 'created', data));
    };

    const fetchAllMetrics = async () => {
        setLoading(true);
        const tenantList = await fetchTenants();

        for (const tenant of tenantList) {
            fetchTenantMetrics(tenant.tenantId);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchAllMetrics();

        const interval = setInterval(fetchAllMetrics, 60000);

        return () => clearInterval(interval);
    }, []);

    const filteredTenants = tenants.filter((tenant) =>
        tenant.tenantId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
        searchQuery,
        setSearchQuery,
        tenants: filteredTenants,
        tenantMetrics,
        loading,
        fetchAllMetrics,
        fetchTenantMetrics
    };
}

export default useMetricsData;
