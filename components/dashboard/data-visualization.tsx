import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon, BarChart3Icon, LineChartIcon, PieChartIcon } from "lucide-react";
import { Badge } from '@/components/ui/badge';

// Types for the data
interface SalesData {
  date: string;
  amount: number;
}

interface OrdersData {
  date: string;
  count: number;
}

interface CategoryData {
  category: string;
  sales: number;
  color: string;
}

interface DataVisualizationProps {
  salesData: SalesData[];
  ordersData: OrdersData[];
  categoryData: CategoryData[];
  isLoading: boolean;
}

export function DataVisualization({ salesData, ordersData, categoryData, isLoading }: DataVisualizationProps) {
  // Add client-side only state
  const [isClient, setIsClient] = useState(false);
  
  // Use useEffect to update state after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate total sales
  const totalSales = salesData.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate total orders
  const totalOrders = ordersData.reduce((sum, item) => sum + item.count, 0);
  
  // Calculate sales trend (comparing last two periods)
  const lastSale = salesData[salesData.length - 1]?.amount || 0;
  const previousSale = salesData[salesData.length - 2]?.amount || 0;
  const salesTrend = previousSale > 0 ? ((lastSale - previousSale) / previousSale) * 100 : 0;
  
  // Calculate orders trend
  const lastOrder = ordersData[ordersData.length - 1]?.count || 0;
  const previousOrder = ordersData[ordersData.length - 2]?.count || 0;
  const ordersTrend = previousOrder > 0 ? ((lastOrder - previousOrder) / previousOrder) * 100 : 0;

  // Format sales data for charts - use empty strings for dates during SSR
  const formattedSalesData = salesData.map(item => ({
    name: isClient ? item.date : '',
    value: item.amount
  }));

  // Format orders data for charts - use empty strings for dates during SSR
  const formattedOrdersData = ordersData.map(item => ({
    name: isClient ? item.date : '',
    value: item.count
  }));

  // Format category data for pie chart
  const formattedCategoryData = categoryData.map(item => ({
    id: item.category,
    label: item.category,
    value: item.sales,
    color: item.color
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Veri Görselleştirme</h2>
        <Tabs defaultValue="sales" className="w-[300px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales" className="flex items-center gap-1">
              <BarChart3Icon className="h-4 w-4" />
              <span className="hidden sm:inline">Satışlar</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1">
              <LineChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Siparişler</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Kategoriler</span>
            </TabsTrigger>
          </TabsList>

          {/* Sales Tab Content */}
          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sales Overview Card */}
              <Card className="border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardDescription className="text-sm font-medium">
                      Toplam Satış
                    </CardDescription>
                    <Badge 
                      variant={salesTrend >= 0 ? "outline" : "destructive"} 
                      className={`${salesTrend >= 0 ? "bg-green-500/10 text-green-500" : ""}`}
                    >
                      {salesTrend >= 0 ? (
                        <ArrowUpIcon className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownIcon className="mr-1 h-3 w-3" />
                      )}
                      {Math.abs(salesTrend).toFixed(1)}%
                    </Badge>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-32 mt-2" />
                  ) : (
                    <CardTitle className="text-2xl font-bold mt-2">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalSales)}
                    </CardTitle>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] mt-2">
                    {isLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <BarChart 
                        data={formattedSalesData}
                        tooltipFormatter={(value: number) => 
                          new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
                        }
                        colors={["#10b981"]}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sales Details Card */}
              <Card className="border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardDescription className="text-sm font-medium">
                      Satış Detayları
                    </CardDescription>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      Son 7 Gün
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {salesData.slice(-5).reverse().map((item, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-border pb-2">
                          <div>
                            <p className="font-medium">{isClient ? item.date : ''}</p>
                            <p className="text-sm text-muted-foreground">
                              {isClient ? (index === 0 ? "Bugün" : index === 1 ? "Dün" : `${index} gün önce`) : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.amount)}
                            </p>
                            {index < salesData.length - 1 && (
                              <p className={`text-xs flex items-center justify-end ${
                                item.amount > salesData[salesData.length - 2 - index]?.amount 
                                  ? "text-green-500" 
                                  : "text-destructive"
                              }`}>
                                {item.amount > salesData[salesData.length - 2 - index]?.amount ? (
                                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                                ) : (
                                  <TrendingDownIcon className="mr-1 h-3 w-3" />
                                )}
                                {Math.abs(
                                  ((item.amount - (salesData[salesData.length - 2 - index]?.amount || 0)) / 
                                  (salesData[salesData.length - 2 - index]?.amount || 1)) * 100
                                ).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab Content */}
          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Orders Overview Card */}
              <Card className="border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardDescription className="text-sm font-medium">
                      Toplam Sipariş
                    </CardDescription>
                    <Badge 
                      variant={ordersTrend >= 0 ? "outline" : "destructive"} 
                      className={`${ordersTrend >= 0 ? "bg-blue-500/10 text-blue-500" : ""}`}
                    >
                      {ordersTrend >= 0 ? (
                        <ArrowUpIcon className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownIcon className="mr-1 h-3 w-3" />
                      )}
                      {Math.abs(ordersTrend).toFixed(1)}%
                    </Badge>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-32 mt-2" />
                  ) : (
                    <CardTitle className="text-2xl font-bold mt-2">
                      {totalOrders.toLocaleString('tr-TR')} Adet
                    </CardTitle>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] mt-2">
                    {isLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <LineChart 
                        data={formattedOrdersData}
                        tooltipFormatter={(value: number) => `${value} adet`}
                        colors={["#3b82f6"]}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Orders Details Card */}
              <Card className="border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardDescription className="text-sm font-medium">
                      Sipariş Detayları
                    </CardDescription>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      Son 7 Gün
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ordersData.slice(-5).reverse().map((item, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-border pb-2">
                          <div>
                            <p className="font-medium">{isClient ? item.date : ''}</p>
                            <p className="text-sm text-muted-foreground">
                              {isClient ? (index === 0 ? "Bugün" : index === 1 ? "Dün" : `${index} gün önce`) : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {item.count ? item.count.toLocaleString('tr-TR') : '0'} Adet
                            </p>
                            {index < ordersData.length - 1 && (
                              <p className={`text-xs flex items-center justify-end ${
                                item.count > ordersData[ordersData.length - 2 - index]?.count 
                                  ? "text-green-500" 
                                  : "text-destructive"
                              }`}>
                                {item.count > ordersData[ordersData.length - 2 - index]?.count ? (
                                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                                ) : (
                                  <TrendingDownIcon className="mr-1 h-3 w-3" />
                                )}
                                {Math.abs(
                                  ((item.count - (ordersData[ordersData.length - 2 - index]?.count || 0)) / 
                                  (ordersData[ordersData.length - 2 - index]?.count || 1)) * 100
                                ).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab Content */}
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Categories Chart Card */}
              <Card className="border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardDescription className="text-sm font-medium">
                      Kategori Dağılımı
                    </CardDescription>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                      {categoryData.length} Kategori
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold mt-2">
                    Satış Kategorileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] mt-2">
                    {isLoading ? (
                      <Skeleton className="h-full w-full rounded-full" />
                    ) : (
                      <PieChart 
                        data={formattedCategoryData}
                        tooltipFormatter={(value: number) => 
                          new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
                        }
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Categories Details Card */}
              <Card className="border-none shadow-md bg-gradient-to-br from-card/80 to-card hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardDescription className="text-sm font-medium">
                      Kategori Detayları
                    </CardDescription>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                      Tüm Zamanlar
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categoryData.sort((a, b) => b.sales - a.sales).map((item, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-border pb-2">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: item.color }}
                            />
                            <div>
                              <p className="font-medium">{item.category}</p>
                              <p className="text-sm text-muted-foreground">
                                {((item.sales / totalSales) * 100).toFixed(1)}% toplam
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.sales)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
