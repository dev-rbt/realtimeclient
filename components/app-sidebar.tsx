"use client"

import * as React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"

interface AppSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function AppSidebar({ activeTab = "overview", onTabChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  
  // Tab değişikliğini işle
  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  }

  return (
    <Sidebar 
      activeTab={activeTab}
      onTabChange={handleTabChange}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    />
  )
}
