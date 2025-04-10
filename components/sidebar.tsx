"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BarChart3,
  Database,
  Search,
  Server,
  Settings,
  Building2,
  FileText,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ activeTab, onTabChange, collapsed, setCollapsed }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
      
      // Auto-collapse sidebar on mobile by default
      if (isMobileView && !collapsed) {
        setCollapsed(true);
      }
    };

    // Check on mount
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [setCollapsed, collapsed]);

  // Close sidebar when clicking a nav item on mobile
  const handleNavItemClick = (value: string) => {
    onTabChange(value);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const navItems = [
    {
      name: "Genel Bakış",
      icon: <LayoutDashboard className="h-5 w-5" />,
      value: "overview",
    },
    {
      name: "Veri Analizi",
      icon: <Search className="h-5 w-5" />,
      value: "analyse",
    },
    {
      name: "Şubeler",
      icon: <Building2 className="h-5 w-5" />,
      value: "branches",
    },
    {
      name: "Sorgular",
      icon: <FileText className="h-5 w-5" />,
      value: "queries",
    },
    {
      name: "Veritabanları",
      icon: <Database className="h-5 w-5" />,
      value: "databases",
    },
    {
      name: "Sistem Metrikleri",
      icon: <BarChart3 className="h-5 w-5" />,
      value: "metrics",
      badge: "Yeni",
    },
    {
      name: "Ayarlar",
      icon: <Settings className="h-5 w-5" />,
      value: "settings",
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 flex flex-col h-full bg-card border-r transition-all duration-300 ease-in-out",
          collapsed ? "w-[70px] -translate-x-full lg:translate-x-0" : isMobile ? "w-[280px]" : "w-[240px]",
          isMobile && !collapsed ? "shadow-xl" : ""
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <span className="font-semibold">RobotPOS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto", isMobile && "hover:bg-destructive/10")}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <TooltipProvider key={item.value} delayDuration={collapsed ? 100 : 1000}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start transition-colors hover:bg-accent/80",
                        activeTab === item.value && "bg-accent text-accent-foreground font-medium"
                      )}
                      onClick={() => handleNavItemClick(item.value)}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        {!collapsed && (
                          <span className="flex-1 text-left">{item.name}</span>
                        )}
                        {!collapsed && item.badge && (
                          <Badge variant="outline" className="ml-auto bg-primary/10 text-primary text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t">
          <TooltipProvider delayDuration={collapsed ? 100 : 1000}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={collapsed ? "icon" : "default"}
                  className="w-full justify-start"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">Açık Tema</span>}
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">Koyu Tema</span>}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  {theme === "dark" ? "Açık Tema" : "Koyu Tema"}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Mobile toggle button */}
      {isMobile && collapsed && (
        <Button
          variant="default"
          size="icon"
          className="fixed left-4 top-4 z-50 lg:hidden bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-200 rounded-full h-12 w-12"
          onClick={() => setCollapsed(false)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}
